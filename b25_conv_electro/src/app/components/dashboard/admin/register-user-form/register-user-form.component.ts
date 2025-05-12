import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../supabase/supabase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-user-form',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './register-user-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterUserFormComponent {
  form: FormGroup;
  successMessage = false;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private supabase: SupabaseService
  ) {
    this.form = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(6)]],
      userEmail: ['', [Validators.required, Validators.email]],
      userPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  resetForm() {
    this.form.reset({ userName: '', userEmail: '', userPassword: '', });
  }

  onSubmit() {
    if (this.form.valid) {
      // Manuel, implementa aquí la lógica del formulario
      //
      //
      //
      //
      console.log(this.form.value);
      this.resetForm();

    } else {
      // Muestra errores si los hay
      this.form.markAllAsTouched();
    }
  }

}

