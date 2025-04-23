import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms'


@Component({
  selector: 'app-check-in',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './check-in.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckInComponent {
  private fb = inject(FormBuilder);

  checkinForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    name: ['', [Validators.required, Validators.minLength(10)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    if (this.checkinForm.valid) {
      console.log('Formulario enviado: ', this.checkinForm.value);
      //Crear llamada al servicio de Supabase aquí
    } else {
      // Muestra errores si los hay
      this.checkinForm.markAllAsTouched();
    }
  }

}
