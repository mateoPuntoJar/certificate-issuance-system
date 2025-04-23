import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms'

@Component({
  selector: 'app-log-in',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './log-in.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogInComponent {
  private fb = inject(FormBuilder);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Formulario enviado: ', this.loginForm.value);
      //Crear llamada al servicio de Supabase aquí
    } else {
      // Muestra errores si los hay
      this.loginForm.markAllAsTouched();
    }
  }
}
