import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../supabase/supabase.service';
import { ChangeDetectorRef } from '@angular/core';
import { SingleStudentComponent } from './single-student/single-student.component';
import { Subscription } from 'rxjs';
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
  loading = true;
  error: string | null = null;
  private subscription: Subscription = new Subscription();
  rol = "";
  public usuario: User[] = [];

  selectedUser: User = {
    uid: "",
    nombre: "",
    correo: "",
    rol: "",
    fecha_registro: "",
    centro_nombre: "",
    centro: "",
    centros: {
      id_centro: "",
      nombre: ""
    }
  };
  showModal = false;
   id : string = "";
  centro: string = ""

  constructor(
    private supabase: SupabaseService, 
    private cdr: ChangeDetectorRef, 
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Obtener el rol primero
   
    this.rol = this.authService.userRol;
  this.centro = this.authService.userCentro;

    if (this.rol === "superadmin") {
    this.subscription = this.supabase.centroSeleccionado$.subscribe(centro => {
      if (centro) {
        this.cargarCentros(centro);
      }
    });

    const centroActual = this.supabase.getCentroSeleccionado();
    if (centroActual) {
      this.cargarCentros(centroActual);
    }
  } else if (this.rol === "admin") {
    if (this.centro) {
      this.cargarCentros(this.centro);
    }
  }
}


  getRol() {
   return this.rol = this.authService.userRol;
  
  }

  getCentro(){
    return this.centro = this.authService.userCentro;
  }

  openDetails(user: User) {
    this.selectedUser = user;
    this.showModal = true;
  }

  closeDetails() {
    this.showModal = false;
    this.selectedUser = {
      uid: "",
      nombre: "",
      correo: "",
      rol: "",
      fecha_registro: "",
      centro_nombre: "",
      centro: "",
      centros: {
        id_centro: "",
        nombre: ""
      }
    };
  }

  // Modificar
  async cargarCentros(centro: string) {
    this.loading = true;
    try {
      this.usuario = await this.supabase.getEstudiantesPorCentro(centro);
      console.log(this.usuario)
      this.loading = false;
      this.cdr.detectChanges();
    } catch (error) {
      this.error = 'Error al cargar los estudiantes';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  allStudent() {
  this.supabase.getAllStudents().subscribe({
    next:(respuesta) =>{
      this.loading = true;
      this.usuario = respuesta.data;
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: (error) => {
      alert('NO SE ENCONTRARON ESTUDIANTES');
      this.loading = false;
    }
  });
  }

}