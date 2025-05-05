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
    const { data } = await this.supabase.client.auth.getSession();
    const uid = data.session?.user?.id;
    if (uid) await this.loadDocs(uid);

    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      const newUid = session?.user?.id;
      if (newUid && this.uploadedDocs.length === 0) this.loadDocs(newUid);
    });
  }

  async loadDocs(uid: string) {
    const { data } = await this.supabase.client
      .from('documentos_subidos')
      .select('*')
      .eq('uid_usuario', uid);
    if (data) this.uploadedDocs = data;

    this.cdr.detectChanges();
  }

  async onSubmit() {
    if (this.form.invalid) return this.form.markAllAsTouched();

    const file = this.form.value.documentos[0];
    const session = await this.supabase.client.auth.getSession();
    const uid = session.data.session?.user.id;
    if (!file || !uid) return;

    const filePath = `${uid}/${file.name}`;
    const { error: uploadError } = await this.supabase.client.storage
      .from('documentos')
      .upload(filePath, file, { contentType: file.type, upsert: true });
    if (uploadError) return;

    const url = this.supabase.client.storage.from('documentos').getPublicUrl(filePath).data?.publicUrl;
    if (!url) return;

    const ext = file.name.split('.').pop()?.toLowerCase() || 'desconocido';

    const documentTypeLabel =
      this.form.value.tipoTitulacion === 'reglada'
        ? 'Titulación Académica Reglada'
        : 'Certificado Profesional';

    await this.supabase.insertDocument({
      uid_usuario: uid,
      tipo_documento: documentTypeLabel,
      nombre_titulacion: this.form.value.titulo,
      nombre_archivo: file.name,
      formato_documento: ext,
      fecha_subida: new Date(),
      estado_verificacion: 'enviado',
    });

    await this.supabase.insertProfileStudent(
      uid,
      this.form.value.tipoTitulacion,
      file.name,
      this.form.value.experiencia
    );

    await this.loadDocs(uid);

    const update: any = {
      ...(this.form.value.experiencia && { experiencia_laboral: this.form.value.experiencia }),
      ...(this.form.value.titulo && { titulo_academico: this.form.value.titulo }),
    };
    if (this.form.value.tipoTitulacion === 'certificado') {
      update.certificado_profesionalidad = this.form.value.titulo;
    }
    if (Object.keys(update).length) {
      await this.supabase.client
        .from('perfiles_alumnos')
        .update(update)
        .eq('uid_usuario', uid);
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
