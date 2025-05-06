import { Component, Input, input, Output } from '@angular/core';
import { FormControl,ReactiveFormsModule } from '@angular/forms';
import { User } from '../../../dashboard/admin/admin.component';
import { SupabaseService } from '../../../../supabase/supabase.service';
import { AuthService } from '../../../../supabase/auth.service';
@Component({
  selector: 'app-form-admin',
  imports: [ReactiveFormsModule,],
  templateUrl: './form-admin.component.html',
})
export class FormAdminComponent{
  constructor( private supabase : SupabaseService, private auth : AuthService){}


    mensaje = new FormControl("");
    @Input() selectedUser !: User
   sendNotification() {
    const msg = this.mensaje.value;
    if (!msg || msg.trim() === '') {
      console.warn('El mensaje está vacío o es inválido');
      return;
    }

    this.supabase.sendNotification(this.selectedUser.uid,msg).subscribe({
      next: () => {},
      error: (err) => console.error('Error al enviar', err)
    });
  }


}
