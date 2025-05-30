import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { SupabaseService } from '../../../supabase/supabase.service';
import { SingleStudentComponent } from './single-student/single-student.component';
import { AuthService } from '../../../supabase/auth.service';

export interface User {
  uid: string;
  nombre: string;
  correo: string;
  rol: string;
  fecha_registro: string;
  centro_nombre: string;
  centro: string;
  centros: Centro;
}

export interface Centro {
  id_centro: string;
  nombre: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, SingleStudentComponent],
  templateUrl: './admin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent implements OnInit {
  centersMap: Record<string, string> = {};
  loading = true;
  error: string | null = null;
  usuario: User[] = [];
  rol = '';
  centro = '';
  showModal = false;

  selectedUser: User = {
    uid: '',
    nombre: '',
    correo: '',
    rol: '',
    fecha_registro: '',
    centro_nombre: '',
    centro: '',
    centros: {
      id_centro: '',
      nombre: '',
    },
  };

  constructor(
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.authService.restoreSession();

    this.rol = this.authService.userRol;
    this.centro = this.authService.userCentro;

    // Solo para superadmin: escucha cambios del centro seleccionado
    if (this.rol === 'superadmin') {
      this.getAllCenters();
      this.supabase.centroSeleccionado$.subscribe(async (centro) => {
        this.centro = centro;
        if (!centro) {
          await this.cargarTodosLosUsuarios();
        } else {
          await this.cargarUsuariosPorCentro(centro);
        }
      });

      // Carga inicial
      const centroActual = this.supabase.getCentroSeleccionado();
      if (!centroActual) {
        await this.cargarTodosLosUsuarios();
      } else {
        await this.cargarUsuariosPorCentro(centroActual);
      }
    } else if (this.rol === 'admin' && this.centro) {
      await this.cargarUsuariosPorCentro(this.centro);
    }

    this.cdr.detectChanges();
  }

  async cargarTodosLosUsuarios() {
    this.loading = true;
    try {
      const { data, error } = await this.supabase.client
        .from('usuarios')
        .select('uid, nombre, correo, rol, fecha_registro, centro');

      if (error) throw error;

      this.usuario = (data || []).map((u: any) => ({
        ...u,
        centro_nombre: '',
        centros: {
          id_centro: '',
          nombre: '',
        },
      }));
    } catch {
      this.error = 'Error al cargar todos los usuarios';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async cargarUsuariosPorCentro(centro: string) {
    this.loading = true;
    try {
      this.usuario = await this.supabase.getEstudiantesPorCentro(centro);
    } catch {
      this.error = 'Error al cargar usuarios del centro';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  openDetails(user: User) {
    this.selectedUser = user;
    this.showModal = true;
  }

  closeDetails() {
    this.showModal = false;
    this.selectedUser = {
      uid: '',
      nombre: '',
      correo: '',
      rol: '',
      fecha_registro: '',
      centro_nombre: '',
      centro: '',
      centros: {
        id_centro: '',
        nombre: '',
      },
    };
  }

  async getAllCenters() {
    let centers = await this.supabase.getCentros();
    this.centersMap = centers.reduce((acc, centro) => {
      acc[centro.id_centro] = centro.nombre;
      return acc;
    }, {} as Record<string, string>);
  }

  get estudiantes(): User[] {
    if (this.rol === 'superadmin') {
      return this.usuario; // Muestra todos los usuarios
    }
    return this.usuario.filter((u) => u.rol === 'alumno');
  }
}
