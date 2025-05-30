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
        centro: ['', esSuperadmin ? [Validators.required] : [] ],    // Solo si el rol es superadmin
        userName: ['', [Validators.required, Validators.minLength(6)]],
        userEmail: ['', [Validators.required, Validators.email]],
        userPassword: ['', [Validators.required, Validators.minLength(6)]],
        userPasswordConfirm: [''], // Sin validadores individuales
      },
      {
        validators: matchPasswords('userPassword', 'userPasswordConfirm'),
      }
    );

    this.form.get('provincia')?.valueChanges.subscribe((provincia) => {
      this.obtenerCentros(provincia);
    });
  }

  centrosDisponibles: any[] = [];


  ngOnInit(): void {
    this.userRole = this.authService.userRol;

    this.cargarProvinciasDesdeCentros();
  }

   async obtenerCentros(provincia: string) {
    const { data, error } = await this.supabase.client
      .from('centros')
      .select('id_centro, nombre')
      .eq('provincia', provincia);

    if (!error) {
      this.centrosDisponibles = data || [];
      this.form.get('centro')?.reset();
    } else {
      console.error('Error al obtener centros:', error.message);
      this.centrosDisponibles = [];
    }
  }

  // Resetea el formulario y deja los inputs vacíos
  resetForm() {
    this.form.reset({ userName: '', userEmail: '', userPassword: '', userPasswordConfirm: '', provincia: '', centro: '' });
    this.centrosDisponibles = [];
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

    const adminCenter = await this.getAdminCenter();

    const { userName, userEmail, userPassword, centro } = this.form.value;

    try {
      const centroARegistrar =  this.authService.userRol === 'superadmin' ? centro : adminCenter
      await this.supabase.createUser(
        userEmail,
        userPassword,
        userName,
        'alumno',
        centroARegistrar
      );

      this.successMessage = true;
      this.resetForm();
    } catch (error: any) {
      // Error capturado, no se necesita acción adicional
    } finally {
      this.isLoading = false;
       this.cdr.detectChanges();
    }
  }


  async getAdminCenter(): Promise<string | undefined> {
    const session = await this.supabase.client.auth.getSession();

  const userId = session.data.session?.user?.id;

  if (!userId) {
    console.error('No hay usuario autenticado');
    return;
  }

  const { data, error } = await this.supabase.client
    .from('usuarios')
    .select('centro')
    .eq('uid', userId)
    .single();

  if (error) {
    console.error('Error al obtener el centro del usuario:', error.message);
    return;
  }

  return data?.centro ?? null;
}

async existeUsuarioPorCorreo(correo: string): Promise<boolean> {
  const { data, error } = await this.supabase.client
    .from('usuarios')
    .select('id') // Solo seleccionamos el ID por eficiencia
    .eq('correo', correo)
    .maybeSingle(); // Usa maybeSingle para evitar excepción si no hay resultados

  if (error) {
    console.error('Error al verificar existencia del usuario:', error.message);
    return false;
  }

  return !!data; // Devuelve true si se encontró el usuario
}
}
