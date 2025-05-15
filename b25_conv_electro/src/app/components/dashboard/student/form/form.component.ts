import { Component, ElementRef, ViewChild, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../../supabase/supabase.service';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './form.component.html',
})
export class FormComponent implements OnInit {
  form: FormGroup;
  successMessage = false;
  uploadedDocs: any[] = [];
  loading = true;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private supabase: SupabaseService
  ) {
    this.form = this.fb.group({
      tipoTitulacion: ['', Validators.required],
      titulo: ['', Validators.required],
      experiencia: [''],
      documentos: [null, Validators.required],
    });
  }

  async ngOnInit() {
    const uid = (await this.supabase.client.auth.getSession()).data.session?.user?.id;
    if (uid) await this.loadDocs(uid);

    this.supabase.client.auth.onAuthStateChange((_e, session) => {
      const newUid = session?.user?.id;
      if (newUid && !this.uploadedDocs.length) this.loadDocs(newUid);
    });
  }

  async loadDocs(uid: string) {
    this.loading = true;
    const { data } = await this.supabase.client
      .from('documentos_subidos')
      .select('*')
      .eq('uid_usuario', uid);

    this.uploadedDocs = data || [];
    this.loading = false;
    this.cdr.detectChanges();
  }

  async onSubmit() {
    if (this.form.invalid) return this.form.markAllAsTouched();

    const file = this.form.value.documentos[0];
    const uid = (await this.supabase.client.auth.getSession()).data.session?.user?.id;
    if (!file || !uid) return;

    const filePath = `${uid}/${file.name}`;
    const { error: uploadError } = await this.supabase.client.storage
      .from('documentos')
      .upload(filePath, file, { contentType: file.type, upsert: true });
    if (uploadError) return;

    const ext = file.name.split('.').pop()?.toLowerCase() || 'desconocido';
    const tipo = this.form.value.tipoTitulacion;
    const nombre = this.form.value.titulo;
    const docLabel = tipo === 'reglada' ? 'Titulación Académica Reglada' : 'Certificado Profesional';

    await this.supabase.insertDocument({
      uid_usuario: uid,
      tipo_documento: docLabel,
      nombre_titulacion: nombre,
      nombre_archivo: file.name,
      formato_documento: ext,
      fecha_subida: new Date(),
      estado_verificacion: 'enviado',
    });

    await this.supabase.insertProfileStudent(uid, tipo, file.name, this.form.value.experiencia);

    const update: any = {
      ...(this.form.value.experiencia && { experiencia_laboral: this.form.value.experiencia }),
      ...(nombre && { titulo_academico: nombre }),
      ...(tipo === 'certificado' && { certificado_profesionalidad: nombre }),
    };

    if (Object.keys(update).length) {
      await this.supabase.client.from('perfiles_alumnos').update(update).eq('uid_usuario', uid);
    }

    await this.loadDocs(uid);
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
    this.form.reset({ tipoTitulacion: '', titulo: '', experiencia: '', documentos: null });
    this.fileInput.nativeElement.value = '';
  }

  async downloadFile(doc: any) {
    const path = `${doc.uid_usuario}/${doc.nombre_archivo}`;
    const signedUrl = await this.supabase.getSignedUrl(path);
    if (!signedUrl) return;

    const response = await fetch(signedUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = doc.nombre_archivo;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
