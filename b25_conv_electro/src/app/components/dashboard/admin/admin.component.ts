import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, OnInit } from '@angular/core';
import { SingleStudentComponent } from './single-student/single-student.component';
import { SupabaseService } from '../../../supabase/supabase.service';


export interface User{
  uid: string;
  nombre : string,
  correo: string;
  rol: string;
  fecha_registro: string;
}

@Component({
  selector: 'app-admin',
  imports: [CommonModule, SingleStudentComponent,],
  templateUrl: './admin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class AdminComponent  implements OnInit{

  constructor( private supabase : SupabaseService){}

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
  };
}

allStudent(){
  this.supabase.getAllStudents().subscribe({
    next:(respuesta) =>{
      this.usuario = respuesta.data
      console.log(this.usuario)
    },
    error: ( error)=>{
      alert('NO SE ENCONTRARON ESTUDIANTES')
    }
  }) 
}  

}

 
