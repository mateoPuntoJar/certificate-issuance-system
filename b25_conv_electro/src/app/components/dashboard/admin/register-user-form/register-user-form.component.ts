import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { SupabaseService } from '../../../../supabase/supabase.service';
import { AuthService } from '../../../../supabase/auth.service';
import { CommonModule } from '@angular/common';

export function matchPasswords(
  passwordKey: string,
  confirmKey: string
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const pass = group.get(passwordKey)?.value;
    const confirm = group.get(confirmKey)?.value;
    return pass === confirm ? null : { passwordsMismatch: true };
  };
}

@Component({
  selector: 'app-register-user-form',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './register-user-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterUserFormComponent {
  form: FormGroup;
  successMessage = false;
  isLoading = false;
  emailError: boolean = false;
  userRole: string = '';
  provinciasDisponibles: string[] = [];
  provinciasEspana = [
    'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila', 'Badajoz', 'Barcelona',
    'Burgos', 'Cáceres', 'Cádiz', 'Cantabria','Castellón','Ciudad Real', 'Córdoba', 'Cuenca',
    'Gerona', 'Granada', 'Guadalajara', 'Guipúzcoa', 'Huelva', 'Huesca', 'Islas Baleares', 'Jaén',
    'La Coruña', 'La Rioja','Las Palmas', 'León', 'Lérida', 'Lugo', 'Madrid', 'Málaga', 'Murcia',
    'Navarra', 'Orense', 'Palencia', 'Pontevedra', 'Salamanca', 'Santa Cruz de Tenerife', 'Segovia',
    'Sevilla', 'Soria', 'Tarragona', 'Teruel', 'Toledo', 'Valencia', 'Valladolid', 'Vizcaya',
    'Zamora',
    'Zaragoza',
  ];

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private supabase: SupabaseService,
    private authService: AuthService
  ) {
    // Determinar si el rol del usuario actual es superadmin
    const esSuperadmin = this.authService.userRol === 'superadmin';

    this.form = this.fb.group(
      {
        provincia: ['', esSuperadmin ? [Validators.required] : [] ],    // Solo si el rol es superadmin
        userName: ['', [Validators.required, Validators.minLength(6)]],
        userEmail: ['', [Validators.required, Validators.email]],
        userPassword: ['', [Validators.required, Validators.minLength(6)]],
        userPasswordConfirm: [''], // Sin validadores individuales
      },
      {
        validators: matchPasswords('userPassword', 'userPasswordConfirm'),
      }
    );
  }

  ngOnInit(): void {
    this.userRole = this.authService.userRol;
    this.cargarProvinciasDesdeCentros();
  }

  // Resetea el formulario y deja los inputs vacíos
  resetForm() {
    this.form.reset({ userName: '', userEmail: '', userPassword: '' });
  }

  /**
   * Carga las provincias disponibles desde la tabla 'centros' en la base de datos.
   *
   * Obtiene todas las provincias registradas en los centros, elimina duplicados
   * y las ordena alfabéticamente para ser usadas en un select dinámico.
   *
   * Asigna la lista resultante a la propiedad `provinciasDisponibles` del componente.
   *
   * @returns {Promise<void>} Promise que se resuelve cuando termina la carga o en caso de error.
   */
  async cargarProvinciasDesdeCentros(): Promise<void> {
  try {
    const { data, error } = await this.supabase.client
      .from('centros')
      .select('provincia');

    if (error) {
      return;
    }

    const provinciasUnicas = Array.from(
      new Set(data.map((centro: any) => centro.provincia))
    );

    // Ordena según el orden definido en provinciasEspana
    this.provinciasDisponibles = this.provinciasEspana.filter(prov =>
      provinciasUnicas.includes(prov)
    );

    this.cdr.detectChanges();
  } catch (err) {
    // Error capturado, no se necesita acción adicional
  }
}

  /**
   *
   * Registra un nuevo alumno tanto en Supabase Auth como en la tabla 'usuarios'.
   *
   * Registra al usuario en Supabase Auth.
   * Inserta al usuario en la tabla 'usuarios' con rol 'alumno' y el centro asociado al administrador actual.
   *
   * @param nombre - Nombre del alumno
   * @param email - Correo electrónico del alumno
   * @param password - Contraseña del alumno
   * @param provincia - Provincia del centro en el que queremos registrar al alumno en caso de que exista
   * @returns booleano que indica si el registro fue exitoso
   */
  async registrarAlumno(nombre: string, email: string, password: string, provincia?: string): Promise<true | false | string> {
  try {
    // Comprobar si el email ya está registrado en la tabla 'usuarios'
    const { data: existingUser, error: existingUserError } = await this.supabase.client
      .from('usuarios')
      .select('uid')
      .eq('correo', email)
      .maybeSingle();

    if (existingUserError && existingUserError.code !== 'PGRST116') {
      return false;
    }

    if (existingUser) {
      // Si el email ya existe, devuelve un mensaje y detiene la ejecución del método
      return 'El correo ya está registrado. Inicia sesión o usa otro correo.';
    }

    // Si no existe, continua con registro en Supabase Auth
    const { data: signUpData, error: signUpError } = await this.supabase.auth.signUp({ email, password });

    if (signUpError) {
      return false;
    }

    const uid = signUpData.user?.id;
    if (!uid) {
      return false;
    }

    // Conseguir idCentro según rol y provincia
    let idCentro: string | null = null;

    if (this.authService.userRol === 'superadmin') {
      if (!provincia) {
        return false;
      }

      const { data: centroData, error: centroError } = await this.supabase.client
        .from('centros')
        .select('id_centro')
        .eq('provincia', provincia)
        .single();

      if (centroError || !centroData) {
        return false;
      }

      idCentro = centroData.id_centro;
    } else {
      idCentro = this.authService.userCentro;
    }

    // Insertar usuario en tabla 'usuarios'
    const { error: insertError } = await this.supabase.client
      .from('usuarios')
      .insert({
        uid,
        nombre,
        correo: email,
        centro: idCentro,
        rol: 'alumno',
      });

    if (insertError) {
      return false;
    }

    return true;
  } catch (error: any) {
    return false;
  }
}

  /**
   * Maneja el envío del formulario de registro del alumno.
   *
   * Valida el formulario.
   * Obtiene los valores de nombre, email, contraseña y provincia en caso del superadmin.
   * Llama al método 'registrarAlumno' para registrar al alumno en Supabase Auth y en la tabla 'alumnos'.
   * Muestra un mensaje de éxito y resetea el formulario.
   */
  async onSubmit(): Promise<void> {
    // Comprueba que el formulario sea válido
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    // Reinicia errores previos
    this.emailError = false;
    this.form.get('userEmail')?.setErrors(null);

    this.isLoading = true;

    const { userName, userEmail, userPassword, provincia } = this.form.value;

    try {
      const registrado = await this.registrarAlumno(
        userName,
        userEmail,
        userPassword,
        this.authService.userRol === 'superadmin' ? provincia : undefined
      );

      if (registrado === true) {
        this.successMessage = true;
        this.resetForm();
      } else if (typeof registrado === 'string') {
        this.emailError = true;

        this.form.get('userEmail')?.setErrors({ emailDuplicado: true });

        this.form.get('userEmail')?.markAsTouched();

      }
    } catch (error: any) {
      // Error capturado, no se necesita acción adicional
    } finally {
      this.isLoading = false;
       this.cdr.detectChanges();
    }
  }
}
