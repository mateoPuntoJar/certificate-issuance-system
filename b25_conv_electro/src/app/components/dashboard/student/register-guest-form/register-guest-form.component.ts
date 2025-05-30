import { Component, ElementRef, ViewChild, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../../supabase/supabase.service';
import { Router, RouterModule } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, RouterModule],
  templateUrl: './register-guest-form.component.html',
})
export class RegisterGuestFormComponent implements OnInit {
  form: FormGroup;
  successMessage = false;
  loading = true;
  centros: any[] = [];
  id_invitado: string = uuidv4();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private supabase: SupabaseService,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      provincia: ['', Validators.required],
      centro: ['', Validators.required],
      tipoTitulacion: ['', Validators.required],
      titulo: ['', Validators.required],
      experiencia: [''],
      documentos: [null, Validators.required],
      aceptaPolitica: [false, Validators.requiredTrue]
    });

    this.form.get('provincia')?.valueChanges.subscribe((provincia) => {
      this.obtenerCentros(provincia);
    });

  }

  centrosDisponibles: any[] = [];
  provincias: string[] = [];

  async ngOnInit() {
    this.centros = await this.supabase.getCentros();
    this.provincias = [...new Set(this.centros.map(c => c.provincia))];
  }

     async obtenerCentros(provincia: string) {
    const { data, error } = await this.supabase.client
      .from('centros')
      .select('id_centro, nombre')
      .eq('provincia', provincia);

    if (!error) {
      this.centrosDisponibles = data || [];
      this.form.get('centro')?.reset();
    } else {
      console.error('Error al obtener centros:', error.message);
      this.centrosDisponibles = [];
    }
  }


  async onSubmit() {
    if (this.form.invalid) return this.form.markAllAsTouched();

    const file = this.form.value.documentos[0];
    if (!file) return;

    const filePath = `${this.id_invitado}/${file.name}`;

    const { error: uploadError } = await this.supabase.client.storage
      .from('documentos')
      .upload(filePath, file, { contentType: file.type, upsert: true });

    if (uploadError) return;

    const ext = file.name.split('.').pop()?.toLowerCase() || 'desconocido';
    const tipo = this.form.value.tipoTitulacion;
    const docLabel = tipo === 'reglada' ? 'Titulación Académica Reglada' : 'Certificado Profesional';

    const { data: signed, error: signedError } = await this.supabase.client.storage
      .from('documentos')
      .createSignedUrl(filePath, 3600);

    if (signedError) return;

    await this.supabase.insertProfileGuest({
      id_invitado: this.id_invitado,
      nombre: this.form.value.nombre,
      apellidos: this.form.value.apellidos,
      correo: this.form.value.correo,
      telefono: this.form.value.telefono,
      centro: this.form.value.centro,
      tipo_titulacion: this.form.value.tipoTitulacion,
      nombre_titulacion: this.form.value.titulo,
      experiencia: this.form.value.experiencia || null,
      acepta_politica: true
    });

    await this.supabase.client.from('documentos_subidos').insert({
      id_invitado: this.id_invitado,
      uid_usuario: null,
      tipo_documento: docLabel,
      nombre_titulacion: this.form.value.titulo,
      nombre_archivo: file.name,
      url_documento: signed?.signedUrl || '',
      formato_documento: ext,
      fecha_subida: new Date(),
      estado_verificacion: 'enviado'
    });

    this.successMessage = true;
    this.resetForm();

    setTimeout(() => {
      this.successMessage = false;
      this.cdr.detectChanges();
    }, 5000);
  }

  onFileChange(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files?.length) {
      this.form.patchValue({ documentos: files });
      this.form.get('documentos')?.markAsTouched();
    }
  }

  resetForm() {
    this.form.reset({
      nombre: '',
      apellidos: '',
      correo: '',
      telefono: '',
      centro: '',
      tipoTitulacion: '',
      titulo: '',
      experiencia: '',
      documentos: null,
      aceptaPolitica: false
    });
    this.fileInput.nativeElement.value = '';
    this.id_invitado = uuidv4();
  }
}
