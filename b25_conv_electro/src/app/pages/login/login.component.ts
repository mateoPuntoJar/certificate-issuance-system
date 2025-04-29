import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms'
import { AuthService } from '../../supabase/auth.service';

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

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const {email, password} = this.loginForm.value;

      this.auth.login(email, password).catch(error => {
          console.error('Login error:', error.message);

          alert('El email o la contraseña son incorrectos');
        }
      );
    } else {
      // Muestra errores si los hay
      this.loginForm.markAllAsTouched();
    }
  }

  guestLogin() {
    this.auth.login('usuario@invitado.com', '123456').catch(error => {
      console.error('Login error:', error.message);

      alert('El email o la contraseña son incorrectos');
    }
  );
  }
}
