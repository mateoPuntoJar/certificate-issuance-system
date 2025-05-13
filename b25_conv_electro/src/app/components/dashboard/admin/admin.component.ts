import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, OnInit } from '@angular/core';
import { SupabaseService } from '../../../supabase/supabase.service';
import { ChangeDetectorRef } from '@angular/core';
import { DataSharingService} from '../../../shared/services/shared.services';
import { SingleStudentComponent } from './single-student/single-student.component';
import { Subscription } from 'rxjs';

export interface Centro {
  id: string;
  nombre: string;
}

export interface User{
  uid: string;
  nombre : string,
  correo: string;
  rol: string;
  fecha_registro: string;
  centro: string;
  centros: Centro;
}

@Component({
  selector: 'app-admin',
  imports: [CommonModule, SingleStudentComponent],
  templateUrl: './admin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class AdminComponent  implements OnInit{
  loading = false;
  error : string | null = null;
  private subscription: Subscription = new Subscription;


  constructor( private supabase : SupabaseService, private cdr: ChangeDetectorRef, private centroService : DataSharingService){}

  ngOnInit(): void {

    this.subscription = this.centroService.centroSeleccionado$.subscribe(
      centro =>{
        if(centro){
          this.cargarCentros(centro);
        }
      }
    );

    const centroActual = this.centroService.getCentroSeleccionado();
    if(centroActual){
      this.cargarCentros(centroActual);
    }
  
   /* this.allStudent();  */

  }
  public usuario : User[] = [];

  selectedUser: User = {
    uid: "",
    nombre : "",
    correo: "",
    rol: "",
    fecha_registro: "",
    centro: "",
    centros: {
      id : "",
      nombre: ""
    }
  };
showModal = false;




openDetails(user: User) {
  this.selectedUser = user;
  this.showModal = true;
}

closeDetails() {
  this.showModal = false;
  this.selectedUser = {
    uid: "",
    nombre : "",
    correo: "",
    rol: "",
    fecha_registro: "",
    centro: "",
    centros: {
      id : "",
      nombre: ""
    }
  };
}



async cargarCentros(centro: string) {
  this.loading = true;
  try {
    this.usuario = await this.centroService.getEstudiantesPorCentro(centro);
    this.loading = false;
    this.cdr.detectChanges();
  } catch (error) {
    this.error = 'Error al cargar los productos';
    this.loading = false;
  } 
}



allStudent(){
  this.loading = true;
  this.supabase.getAllStudents().subscribe({
    next:(respuesta) =>{
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



