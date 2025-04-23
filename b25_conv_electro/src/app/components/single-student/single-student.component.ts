import { Component, EventEmitter, input, Output } from '@angular/core';
import { User } from '../dashboard/admin/admin.component';

@Component({
  selector: 'app-single-student',
  imports: [],
  templateUrl: './single-student.component.html',
  styleUrl: './single-student.component.css'
})
export class SingleStudentComponent {
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit(); // notifica al padre
  }
  public selectedUser = input<User>();

}
