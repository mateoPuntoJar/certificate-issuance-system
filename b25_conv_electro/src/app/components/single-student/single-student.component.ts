import { Component, EventEmitter, input, Output } from '@angular/core';
import { User } from '../dashboard/admin/admin.component';
import { FormAdminComponent } from '../form-admin/form-admin.component';
import { Router } from '@angular/router';
/* import { AdminFormComponent } from '../admin-form/admin-form.component'; */

@Component({
  selector: 'app-single-student',
  imports: [FormAdminComponent],
  templateUrl: './single-student.component.html',
})
export class SingleStudentComponent {
  @Output() close = new EventEmitter<void>();
  constructor(private router: Router) { }

  onClose() {
    this.close.emit(); // notifica al padre
  }
  public selectedUser = input<User>();

  irADetalles(){
    const id = this.selectedUser()?.id;
    this.router.navigate(['dashboard/', id]);
  }

}
