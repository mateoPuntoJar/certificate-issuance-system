import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SingleStudentComponent } from '../../single-student/single-student.component';


export interface User{
  id: number;
  name : string,
  email: string;
  estado: string;
  locacion: string;
}

@Component({
  selector: 'app-admin',
  imports: [CommonModule, SingleStudentComponent,],
  templateUrl: './admin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class AdminComponent {
  selectedUser: User = {
    id: 0,
    name: '',
    email: '',
    estado: '',
    locacion: ''
  };
showModal = false;

openDetails(user: User) {
  this.selectedUser = user;
  this.showModal = true;
}

closeDetails() {
  this.showModal = false;
  this.selectedUser = {
    id: 0,
    name: '',
    email: '',
    estado: '',
    locacion: ''
  };
}


  public user = input.required<User[]>();
 }
