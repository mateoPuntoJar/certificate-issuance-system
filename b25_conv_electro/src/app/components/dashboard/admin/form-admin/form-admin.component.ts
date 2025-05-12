import { Component, Input, input, OnInit, Output } from '@angular/core';
import { FormControl,ReactiveFormsModule } from '@angular/forms';
import { User } from '../../../dashboard/admin/admin.component';
import { SupabaseService } from '../../../../supabase/supabase.service';
import { AuthService } from '../../../../supabase/auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-form-admin',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './form-admin.component.html',
})
export class FormAdminComponent implements OnInit{
  loading = true;
  constructor( private supabase : SupabaseService, private auth : AuthService, private cdr : ChangeDetectorRef){}
ngOnInit(): void {
  this.loadComments();
}
    mensaje = new FormControl("");
    @Input() selectedUser !: User
    comments : any[] = [];

    sendNotification() {
    const msg = this.mensaje.value;
    if (!msg || msg.trim() === '') {
      console.warn('El mensaje está vacío o es inválido');
      return;
    }

    this.supabase.sendNotification(this.selectedUser.uid,msg).subscribe({
      next: () => {
        this.mensaje.reset();
        this.loadComments();
      },
      error: (err) => console.error('Error al enviar', err)
    });
  }

   loadComments(){
    this.supabase.getAllNotification(this.selectedUser.uid).subscribe({
      next: (response) => {
        this.loading = true;
        this.comments = response.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: ( err) => console.error("Error al buscar notificaciones")
    })

  }
}
