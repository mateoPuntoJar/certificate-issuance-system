import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from '../../../../supabase/supabase.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-register-center-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './register-center-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterCenterFormComponent {
  form: FormGroup;
  successMessage: boolean = false;
  isLoading: boolean = false;
  provinciasEspana = [
    'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila', 'Badajoz', 'Barcelona',
    'Burgos', 'Cáceres', 'Cádiz', 'Cantabria', 'Castellón', 'Ciudad Real', 'Córdoba', 'Cuenca',
    'Gerona', 'Granada', 'Guadalajara', 'Guipúzcoa', 'Huelva', 'Huesca', 'Islas Baleares', 'Jaén',
    'La Coruña', 'La Rioja', 'Las Palmas', 'León', 'Lérida', 'Lugo', 'Madrid', 'Málaga', 'Murcia',
    'Navarra', 'Orense', 'Palencia', 'Pontevedra', 'Salamanca', 'Santa Cruz de Tenerife', 'Segovia',
    'Sevilla', 'Soria', 'Tarragona', 'Teruel', 'Toledo', 'Valencia', 'Valladolid', 'Vizcaya',
    'Zamora','Zaragoza'
  ];

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private supabase: SupabaseService
  ) {
    this.form = this.fb.group({
      provincia: ['', [Validators.required]],
      centro: ['', [Validators.required, Validators.minLength(6)]],
      adminName: ['', [Validators.required, Validators.minLength(6)]],
      adminEmail: ['', [Validators.required, Validators.email]],
      adminPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // Resetear el formulario y dejar los inputs vacíos
  resetForm() {
    this.form.reset({
      provincia: '',
      centro: '',
      adminName: '',
      adminEmail: '',
      adminPassword: '',
    });
  }

  // Registrar a un usuario de tipo administrador en la tabla usuarios
  public async registrarUsuarioAdministrador(
    nombre: string,
    correo: string,
    password: string,
    centroId: string
  ): Promise<string> {
    try {
      // Primero registra al usuario en Supabase
      const { data, error: signUpError } = await this.supabase.auth.signUp({
        email: correo,
        password: password,
      });

      if (signUpError || !data?.user) {
        throw new Error(
          `Error al registrar el usuario: ${
            signUpError?.message || 'Usuario no encontrado'
          }`
        );
      }

      const uid = data.user.id;

      // Inserta el nuevo usuario en la tabla 'usuarios'
      const { error: insertError } = await this.supabase.client
        .from('usuarios')
        .insert({
          uid,
          nombre,
          correo,
          centro: centroId,
          rol: 'admin',
        });

      if (insertError) {
        throw new Error(
          `Error al insertar el usuario en la base de datos: ${insertError.message}`
        );
      }

      return uid;
    } catch (error: any) {
      throw new Error(`Error en el proceso de registro: ${error.message}`);
    }
  }

  // Insertar un nuevo registro en la tabla centros
  public async insertarCentro(
    centroId: string,
    nombre: string,
    provincia: string,
    uidUsuario: string | null
  ): Promise<string> {
    try {
      const { data, error } = await this.supabase.client
        .from('centros')
        .insert({
          id_centro: centroId,
          nombre,
          provincia,
          uid_usuario: uidUsuario,
        })
        .select('id_centro')
        .single();

      if (error) {
        console.error('Error al insertar el centro:', error.message);
        throw error;
      }

      return data.id_centro;
    } catch (error: any) {
      console.error('Error al insertar centro:', error?.message || error);
      throw error;
    }
  }

  // Actualizar el registro insertado en la tabla centros con el UID del usuario administrador
  public async actualizarUidCentro(
    centroId: string,
    uidUsuario: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase.client
        .from('centros')
        .update({ uid_usuario: uidUsuario })
        .eq('id_centro', centroId);

      if (error) {
        console.error(
          `Error al actualizar UID del centro ${centroId}:`,
          error.message
        );
        throw error;
      }
    } catch (error: any) {
      console.error(
        'Excepción al actualizar UID del centro:',
        error?.message || error
      );
      throw error;
    }
  }

  /**
   * Maneja el envío del formulario de registro del centro y del administrador.
   *
   * Valida el formulario.
   * Genera un ID único para el centro.
   * Inserta el centro en la base de datos.
   * Registra al usuario administrador en Supabase Auth y en la tabla 'usuarios'.
   * Actualiza el centro con el UID del administrador.
   * Muestra un mensaje de éxito y resetea el formulario.
   */
  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      // Obtiene los valores del formulario
      const nombreCentro = this.form.value.centro;
      const provincia = this.form.value.provincia;
      const nombreAdmin = this.form.value.adminName;
      const correoAdmin = this.form.value.adminEmail;
      const passwordAdmin = this.form.value.adminPassword;

      // Genera un ID único para el centro
      const centroId = uuidv4();

      try {
        this.isLoading = true;

        // Inserta el centro sin UID
        const idCentro = await this.insertarCentro(
          centroId,
          nombreCentro,
          provincia,
          null
        );

        // Registra al administrador y obtener su UID
        const uidUsuario = await this.registrarUsuarioAdministrador(
          nombreAdmin,
          correoAdmin,
          passwordAdmin,
          idCentro
        );

        // Actualiza el centro con el UID del administrador
        await this.actualizarUidCentro(idCentro, uidUsuario);

        // Muestra mensaje de éxito y resetea el formulario
        this.successMessage = true;
        this.resetForm();
      } catch (error) {
        console.error('Error en el proceso de registro:', error);
      } finally {
        this.isLoading = false;
      }
    } else {
      this.form.markAllAsTouched();
    }
  }
}
