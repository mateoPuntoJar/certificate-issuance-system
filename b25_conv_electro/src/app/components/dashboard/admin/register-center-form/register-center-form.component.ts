import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { SupabaseService } from '../../../../supabase/supabase.service';
import { v4 as uuidv4 } from 'uuid';

/**
 * Validador de grupo: devuelve error { passwordsMismatch: true }
 * si los dos campos no coinciden.
 */
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
  centroDuplicado: boolean = false;
  correoDuplicado: boolean = false;
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
    this.form = this.fb.group(
      {
        provincia: ['', [Validators.required]],
        centro: ['', [Validators.required, Validators.minLength(6)]],
        adminName: ['', [Validators.required, Validators.minLength(6)]],
        adminEmail: ['', [Validators.required, Validators.email]],
        adminPassword: ['', [Validators.required, Validators.minLength(6)]],
        adminPasswordConfirm: [''],
      },
      {
        validators: matchPasswords('adminPassword', 'adminPasswordConfirm'),
      }
    );
  }

  // Resetear el formulario y dejar los inputs vacíos
  resetForm() {
    this.form.reset({
      provincia: '',
      centro: '',
      adminName: '',
      adminEmail: '',
      adminPassword: '',
      adminPasswordConfirm: ''
    });
  }

    /**
   * Inserta un nuevo centro educativo en la tabla 'centros'.
   *
   * - Comprueba si ya existe un centro con el mismo nombre y provincia.
   * - Si no existe, crea un nuevo registro con el UID del usuario administrador (puede ser null al principio).
   *
   * @param {string} centroId - ID único que se usará para el nuevo centro.
   * @param {string} nombre - Nombre del centro.
   * @param {string} provincia - Provincia donde se ubica el centro.
   * @param {string | null} uidUsuario - UID del usuario administrador asociado (puede ser null inicialmente).
   * @returns {Promise<string>} El ID del centro insertado.
   * @throws {Error} Si ya existe un centro duplicado o falla la inserción.
   */
  public async insertarCentro(
    centroId: string,
    nombre: string,
    provincia: string,
    uidUsuario: string | null
  ): Promise<string> {
    try {
      // Verificar si ya existe un centro con el mismo nombre y provincia
      const { data: centrosExistentes, error: selectError } = await this.supabase.client
        .from('centros')
        .select('id_centro')
        .eq('nombre', nombre)
        .eq('provincia', provincia);

      if (selectError) {
        throw selectError;
      }

      if (centrosExistentes && centrosExistentes.length > 0) {
      this.centroDuplicado = true;
      throw new Error('Centro ya registrado');
      }

      // Si no existe, continúa con el proceso de insertado
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
        throw error;
      }

      return data.id_centro;
    } catch (error: any) {
      throw error;
    }
  }

    /**
   * Actualiza el campo `uid_usuario` de un centro con el UID del administrador asociado.
   *
   * - Busca el centro por `id_centro` y actualiza su `uid_usuario`.
   *
   * @param {string} centroId - ID del centro que se quiere actualizar.
   * @param {string} uidUsuario - UID del usuario administrador que se asignará al centro.
   * @returns {Promise<void>} No devuelve nada si la operación es exitosa.
   * @throws {Error} Si ocurre un error durante la actualización.
   */
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
      throw error;
      }
    } catch (error: any) {
      throw error;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      // Obtener los valores del formulario
      const nombreCentro = this.form.value.centro;
      const provincia = this.form.value.provincia;
      const nombreAdmin = this.form.value.adminName;
      const correoAdmin = this.form.value.adminEmail;
      const passwordAdmin = this.form.value.adminPassword;

      // Generar un ID único para el centro
      const centroId = uuidv4();

      // Resetear estados de error
      this.centroDuplicado = false;
      this.correoDuplicado = false;

      try {
        this.isLoading = true;

        // Comprobar si el correo ya está registrado
        const { data: usuariosExistentes, error: errorCorreo } = await this.supabase.client
          .from('usuarios')
          .select('uid')
          .eq('correo', correoAdmin)
          .maybeSingle();

        if (errorCorreo) {
          throw new Error('Error al comprobar existencia del correo');
        }

        if (usuariosExistentes) {
          this.correoDuplicado = true;
          return;
        }

        // Insertar el centro (sin UID aún)
        const idCentro = await this.insertarCentro(
          centroId,
          nombreCentro,
          provincia,
          null
        );

        // Registrar al administrador y obtener su UID
        await this.supabase.createUser(correoAdmin, passwordAdmin, nombreAdmin, 'admin', centroId);

        const { data, error } = await this.supabase.client
          .from('usuarios')
          .select('uid')
          .eq('correo', correoAdmin)
          .single();

        const idAdmin = data && 'uid' in data ? data.uid : null;

        if (error || !idAdmin) {
          throw new Error('No se pudo obtener el ID del admin');
        }

        // Actualizar el centro con el UID del administrador
        await this.actualizarUidCentro(idCentro, idAdmin);

        this.successMessage = true;
        this.resetForm();
      } catch (error: any) {

        if (error?.message === 'Centro ya registrado') {
          this.centroDuplicado = true;
        }

        if (error?.message?.includes('correo')) {
          this.correoDuplicado = true;
        }
      } finally {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    } else {
      this.form.markAllAsTouched();
    }
  }
}
