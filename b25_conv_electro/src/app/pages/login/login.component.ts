import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms'
import { AuthService } from '../../supabase/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async ngOnInit() {
    // Restaura sesión si la hay
    await this.auth.restoreSession();

    // Redirige si hay sesión activa
    if (this.auth.isAuthenticated()) {
      this.auth.redirecTo();
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const {email, password} = this.loginForm.value;

      this.auth.login(email, password).catch(error => {
        console.warn('Login fallido:', error?.message || 'Usuario inválido');
        this.snackBar.open('El email o la contraseña son incorrectos', 'Cerrar', {
          duration: 3000,
        });
      });
    } else {
      // Muestra errores si los hay
      this.loginForm.markAllAsTouched();
    }
  }

  guestLogin() {
    this.auth.login('usuario@invitado.com', '123456').catch(error => {
      console.warn('Login de invitado fallido:', error?.message || 'Error al entrar como invitado');
      this.snackBar.open('Error al intentar entrar como invitado', 'Cerrar', {
        duration: 3000,
      });
    });
  }
}
