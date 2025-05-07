import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, OnInit } from '@angular/core';
import { SupabaseService } from '../../../supabase/supabase.service';
import { ChangeDetectorRef } from '@angular/core';
import { SingleStudentComponent } from './single-student/single-student.component';


export interface User{
  uid: string;
  nombre : string,
  correo: string;
  rol: string;
  fecha_registro: string;
  centro: string;
}

@Component({
  selector: 'app-admin',
  imports: [CommonModule, SingleStudentComponent],
  templateUrl: './admin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class AdminComponent  implements OnInit{
  loading = true;

  constructor( private supabase : SupabaseService, private cdr: ChangeDetectorRef){}

  ngOnInit(): void {
    this.allStudent();
  }
  public usuario : User[] = [];

  selectedUser: User = {
    uid: "",
    nombre : "",
    correo: "",
    rol: "",
    fecha_registro: "",
    centro: ""
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
    centro : ""
  };
}

allStudent(){
  this.supabase.getAllStudents().subscribe({
    next:(respuesta) =>{
      this.loading = true;
      this.usuario = respuesta.data
      this.loading = false;
      this.cdr.detectChanges();
      console.log(this.usuario)
    },
    error: ( error)=>{
      alert('NO SE ENCONTRARON ESTUDIANTES')
    }
  })
}



}



