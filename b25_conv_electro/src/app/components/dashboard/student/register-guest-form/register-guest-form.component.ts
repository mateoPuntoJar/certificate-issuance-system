import { Component, ElementRef, ViewChild, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../../supabase/supabase.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../../supabase/auth.service';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './register-guest-form.component.html',
})
export class RegisterGuestFormComponent implements OnInit {
  form: FormGroup;
  successMessage = false;
  uploadedDocs: any[] = [];
  loading = true;
  rol: string = '';
  centros: any[] = [];

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private supabase: SupabaseService,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      centro: ['', Validators.required],
      tipoTitulacion: ['', Validators.required],
      titulo: ['', Validators.required],
      experiencia: [''],
      documentos: [null, Validators.required],
    });
  }

  async ngOnInit() {
    this.rol = this.auth.userRol;

    // Cargar centros para el select
    this.centros = await this.supabase.getCentros();

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

    // Insertar en tabla 'usuarios'
    await this.supabase.client.from('usuarios').upsert({
      uid: uid,
      nombre: this.form.value.nombre,
      correo: this.form.value.correo,
      rol: 'invitado',
      fecha_registro: new Date(),
      centro: this.form.value.centro // id_centro
    });

    // Subida del documento
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

    // Insertar o actualizar en perfiles_invitados
    await this.supabase.insertProfileGuest(uid, tipo, nombre, this.form.value.experiencia);

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
    this.form.reset({
      nombre: '',
      correo: '',
      centro: '',
      tipoTitulacion: '',
      titulo: '',
      experiencia: '',
      documentos: null,
    });
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
