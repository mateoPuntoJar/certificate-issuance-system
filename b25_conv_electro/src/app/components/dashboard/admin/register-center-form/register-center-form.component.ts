import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from '../../../../supabase/supabase.service';

@Component({
  selector: 'app-register-center-form',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './register-center-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class RegisterCenterFormComponent {
  form: FormGroup;
  successMessage = false;
  provinciasEspana = [
    "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila", "Badajoz", "Barcelona",
    "Burgos", "Cáceres", "Cádiz", "Cantabria", "Castellón", "Ciudad Real", "Córdoba", "Cuenca",
    "Gerona", "Granada", "Guadalajara", "Guipúzcoa", "Huelva", "Huesca", "Islas Baleares", "Jaén",
    "La Coruña", "La Rioja", "Las Palmas", "León", "Lérida", "Lugo", "Madrid", "Málaga", "Murcia",
    "Navarra", "Orense", "Palencia", "Pontevedra", "Salamanca", "Santa Cruz de Tenerife", "Segovia",
    "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo", "Valencia", "Valladolid", "Vizcaya",
    "Zamora", "Zaragoza"
  ];


  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private supabase: SupabaseService
  ) {
    this.form = this.fb.group({
      provincia: ['', [Validators.required]],
      centro: ['', [Validators.required, Validators.minLength(6)]],
      adminName: ['', [Validators.required, Validators.minLength(6)]],
      adminEmail: ['', [Validators.required, Validators.email]],
      adminPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  resetForm() {
    this.form.reset({ provincia: '', centro: '', adminName: '', adminEmail: '', adminPassword: '', });
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
