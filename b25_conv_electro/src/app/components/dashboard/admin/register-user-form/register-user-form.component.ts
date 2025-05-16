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
    this.form = this.fb.group(
      {
        provincia: ['', [Validators.required]],
        userName: ['', [Validators.required, Validators.minLength(6)]],
        userEmail: ['', [Validators.required, Validators.email]],
        userPassword: ['', [Validators.required, Validators.minLength(6)]],
        userPasswordConfirm: [''], // sin validadores individuales
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
      console.error('Error al cargar provincias desde centros:', error.message);
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
    console.error('Error inesperado al cargar provincias:', err);
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
  async registrarAlumno (nombre: string, email: string, password: string, provincia?: string): Promise<true | false | string> {
    try {
      // Crear el usuario en Supabase Auth
      const { data: signUpData, error: signUpError } =
        await this.supabase.auth.signUp({ email, password });

      if (signUpError) {
        console.error(
          'Error en Supabase Auth signUp:',
          signUpError.message,
          signUpError
        );
        return false;
      }

      const uid = signUpData.user?.id;
      if (!uid) {
        console.error('UID no obtenido después del registro en Auth.');
        return false;
      }

      let idCentro: string | null = null;

      if (this.authService.userRol === 'superadmin') {
        if (!provincia) {
          console.error('Provincia no proporcionada por el superadmin.');
          return false;
        }

        const { data: centroData, error: centroError } =
          await this.supabase.client
            .from('centros')
            .select('id_centro')
            .eq('provincia', provincia)
            .single();

        if (centroError || !centroData) {
          console.error(
            'Provincia no encontrada o error al obtener centro:',
            centroError?.message || 'No se encontró la provincia'
          );
          return false;
        }

        idCentro = centroData.id_centro;
      } else {
        idCentro = this.authService.userCentro;
      }

      // Inserta el alumno en la tabla 'usuarios'
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
        if (insertError.code === '23505') {
          console.error('El correo ya está registrado.');
          return 'El correo ya está registrado. Inicia sesión o inténtalo de nuevo.';
        }

        console.error(
          'Error al insertar en tabla usuarios:',
          insertError.message,
          insertError
        );
        return false;
      }

      return true;
    } catch (error: any) {
      console.error('Error al registrar alumno:', error?.message || error);
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

        console.warn(registrado);
      } else {
        console.warn(
          'Registro fallido: no se recibió respuesta esperada del método registrarAlumno().'
        );
      }
    } catch (error: any) {
      console.error('Error inesperado en el envío del formulario:', error);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }
}
