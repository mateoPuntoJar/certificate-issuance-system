import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../supabase/supabase.service';
import { AuthService } from '../../../../supabase/auth.service';
import { CommonModule } from '@angular/common';

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

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private supabase: SupabaseService,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(6)]],
      userEmail: ['', [Validators.required, Validators.email]],
      userPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // Resetea el formulario y deja los inputs vacíos
  resetForm() {
    this.form.reset({ userName: '', userEmail: '', userPassword: '' });
  }

    /**
   * Registra un nuevo alumno tanto en Supabase Auth como en la tabla 'usuarios'.
   *
   * Registra al usuario en Supabase Auth.
   * Inserta al usuario en la tabla 'usuarios' con rol 'alumno' y el centro asociado al administrador actual.
   *
   * @param nombre - Nombre del alumno
   * @param email - Correo electrónico del alumno
   * @param password - Contraseña del alumno
   * @returns booleano que indica si el registro fue exitoso
   */
  async registrarAlumno(nombre: string, email: string, password: string): Promise<true | false | string> {
  try {
    // Crear el usuario en Supabase Auth
    const { data: signUpData, error: signUpError } = await this.supabase.auth.signUp({ email, password });

    if (signUpError) {
      console.error('Error en Supabase Auth signUp:', signUpError.message, signUpError);
      return false;
    }

    const uid = signUpData.user?.id;
    if (!uid) {
      console.error('UID no obtenido después del registro en Auth.');
      return false;
    }

    // Insertar el alumno en la tabla 'usuarios'
    const { error: insertError } = await this.supabase.client.from('usuarios').insert({
      uid,
      nombre,
      correo: email,
      centro: this.authService.userCentro,
      rol: 'alumno',
    });

    // Captura el error de clave duplicada al intentar registrarse con un correo existente
    if (insertError) {
      if (insertError.code === '23505') {
        console.error('El correo ya está registrado.');
        return 'El correo ya está registrado. Inicia sesión o inténtalo de nuevo.';
      }

      console.error('Error al insertar en tabla usuarios:', insertError.message, insertError);
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
 * Obtiene los valores de nombre, email y contraseña.
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

  const { userName, userEmail, userPassword } = this.form.value;

  try {
    const registrado = await this.registrarAlumno(userName, userEmail, userPassword);

    if (registrado === true) {
      this.successMessage = true;
      this.resetForm();
    } else if (typeof registrado === 'string') {
      this.emailError = true;

      this.form.get('userEmail')?.setErrors({ emailDuplicado: true });

      this.form.get('userEmail')?.markAsTouched();

      console.warn(registrado);
    } else {
      console.warn('Registro fallido: no se recibió respuesta esperada del método registrarAlumno().');
    }
  } catch (error: any) {
    console.error('Error inesperado en el envío del formulario:', error);
  } finally {
    this.isLoading = false;
    this.cdr.markForCheck();
  }
}
}
