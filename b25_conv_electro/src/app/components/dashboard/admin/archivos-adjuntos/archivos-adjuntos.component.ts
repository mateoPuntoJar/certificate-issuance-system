import { Component, Input, OnInit } from '@angular/core';
import { SupabaseService } from '../../../../supabase/supabase.service';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-archivos-adjuntos',
  imports: [FormsModule, CommonModule],
  templateUrl: './archivos-adjuntos.component.html',
})
export class ArchivosAdjuntosComponent implements OnInit {
  loading = true;

  @Input() id_user!: string;
  @Output() documentoEliminado = new EventEmitter<string>();

  documents: any;

  constructor(
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.showDocuments(this.id_user);
  }

  showDocuments(id: string) {
    this.loading = true;
    this.supabase.showDocuments(id).subscribe({
      next: (response) => {
        this.documents = response.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert('IMPOSIBLE OBTENER DOCUMENTOS');
      },
    });
  }

  changeDocumentStatus(value: string, id_documento: string) {
    this.supabase.updateDocumentStatus(value, id_documento).subscribe({
      next: () => this.insertNotification(this.id_user, id_documento, value),
      error: () => alert('ERROR AL ACTUALIZAR EL DOCUMENTO'),
    });
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

  async deleteFile(doc: any) {
    const confirmado = confirm('¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer.');
    if (!confirmado) return;

    const { success } = await this.supabase.deleteDocument(doc.nombre_archivo, this.id_user, doc.id_documento);
    if (success) {
      this.documentoEliminado.emit('Documento eliminado correctamente.');
      this.showDocuments(this.id_user);
    } else {
      alert('❌ Error al eliminar el documento');
    }
  }

  insertNotification(uid_usuario: string, id_documento: string, estado: string) {
    let mensaje = '';

    if (estado.toLowerCase() === 'pendiente') {
      mensaje = 'Su documento ha sido enviado correctamente. Será evaluado y se le notificará si ha sido aprobado o rechazado.';
    } else if (estado.toLowerCase() === 'aprobado') {
      mensaje = '¡Enhorabuena! Su documento ha sido aprobado.';
    } else if (estado.toLowerCase() === 'rechazado') {
      mensaje = 'Su documento ha sido rechazado. Revise los detalles y vuelva a subirlo si es necesario.';
    } else {
      mensaje = `El estado de su documento ha cambiado a: ${estado}.`;
    }

    const fecha_notificacion = new Date().toISOString();

    this.supabase.client.from('notificaciones').upsert([
      {
        uid_usuario,
        id_documento,
        mensaje,
        fecha_notificacion,
        leido: false,
      },
    ], {
      onConflict: 'uid_usuario,id_documento',
    }).then(({ error }) => {
      if (error) console.error('Error insertando notificación:', error);
    });
  }
}

