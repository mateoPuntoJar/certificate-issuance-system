import { Component, EventEmitter, input, Output } from '@angular/core';
import { User } from '../../../dashboard/admin/admin.component';
import { FormAdminComponent } from '../form-admin/form-admin.component';
import { Router } from '@angular/router';
import { ArchivosAdjuntosComponent } from "../archivos-adjuntos/archivos-adjuntos.component";
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-single-student',
  imports: [FormAdminComponent, ArchivosAdjuntosComponent, CommonModule],
  templateUrl: './single-student.component.html',
})
export class SingleStudentComponent {
  mensajeEliminacion: string | null = null;

  selectedUser = input.required<User>();
  @Output() close = new EventEmitter<void>();

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  onClose() {
    this.close.emit();
  }

  mostrarMensaje(mensaje: string) {
    this.mensajeEliminacion = mensaje;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.mensajeEliminacion = null;
      this.cdr.detectChanges();
    }, 4000);
  }
}
