import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { SupabaseService } from '../../../../supabase/supabase.service';
import { AuthService } from '../../../../supabase/auth.service';
import { FormControl,ReactiveFormsModule } from '@angular/forms';
import { User } from '../admin.component';
@Component({
  selector: 'app-form-admin',
  imports: [ReactiveFormsModule],
  templateUrl: './form-admin.component.html',
  styleUrl: './form-admin.component.css'
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
      next: () => {
        this.mensaje.reset();
      },
      error: (err) => console.error('Error al enviar', err)
    });
  }
  

}
