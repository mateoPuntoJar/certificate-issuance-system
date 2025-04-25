import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule, CommonModule],
  selector: 'app-form',
  templateUrl: './form.component.html',
})
export class FormComponent {
  form: FormGroup;
  mensajeExito = false;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.form = this.fb.group({
      tipoTitulacion: ['', Validators.required],
      titulo: ['', Validators.required],
      experiencia: [''],
      documentos: [null, Validators.required]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      // Simula envío a la base de datos
      console.log('Datos del formulario:', this.form.value);

      this.mensajeExito = true;

      this.form.reset({
        tipoTitulacion: '',
        titulo: '',
        experiencia: '',
        documentos: null
      });

      // Limpia visualmente el input de archivos
      this.fileInput.nativeElement.value = '';

      setTimeout(() => {
        this.mensajeExito = false;
        this.cdr.detectChanges();
      }, 5000);
    } else {
      this.form.markAllAsTouched();
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files && files.length > 0) {
      this.form.patchValue({ documentos: files });
      this.form.get('documentos')?.markAsTouched();
    }
  }

  resetForm() {
    this.form.reset({
      tipoTitulacion: '',
      titulo: '',
      experiencia: '',
      documentos: null
    });

    this.fileInput.nativeElement.value = '';
  }
}
