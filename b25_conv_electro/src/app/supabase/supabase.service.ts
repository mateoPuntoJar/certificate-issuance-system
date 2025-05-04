import { Injectable } from '@angular/core';
import { supabase } from './config/init-supabase';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  constructor() { }

  get client() {
    return supabase;
  }

  // Devuelve todos los registros de una tabla específica
  async getAllFromTable(table: string) {
    return this.client.from(table).select('*');
  }

  // Sube un archivo al bucket de almacenamiento
  async uploadFile(file: File, path: string) {
    return this.client.storage
      .from('documentos')
      .upload(path, file, {
        contentType: file.type,
        upsert: true,
      });
  }

  // Inserta los registros en tabla documentos_subidos
  async insertDocument(data: {
    uid_usuario: string;
    tipo_documento: string;
    nombre_titulacion: string;
    nombre_archivo: string;
    formato_documento: string;
    fecha_subida: Date;
    estado_verificacion: string;
  }) {
    const { data: urlData } = this.client.storage
      .from('documentos')
      .getPublicUrl(`${data.uid_usuario}/${data.nombre_archivo}`);

    return this.client.from('documentos_subidos').insert({
      uid_usuario: data.uid_usuario,
      tipo_documento: data.tipo_documento,
      nombre_titulacion: data.nombre_titulacion,
      nombre_archivo: data.nombre_archivo,
      url_documento: urlData?.publicUrl || '',
      formato_documento: data.formato_documento,
      fecha_subida: data.fecha_subida,
      estado_verificacion: data.estado_verificacion,
    });
  }

  // Genera una URL firmada temporal para un archivo del bucket
  async getSignedUrl(path: string, expiresInSeconds: number = 60): Promise<string | null> {
    const { data, error } = await this.client.storage
      .from('documentos')
      .createSignedUrl(path, expiresInSeconds);
    return error ? null : data.signedUrl;
  }

  // Inserta o actualiza el perfil del alumno en la tabla perfiles_alumnoset
  async insertProfileStudent(uid: string, tipo: string, fileName: string, experiencia: string) {
    const profileData: any = {
      uid_usuario: uid,
      experiencia_laboral: experiencia?.trim() || null,
    };

    if (tipo === 'reglada') profileData.titulo_academico = fileName;
    if (tipo === 'certificado') profileData.certificado_profesionalidad = fileName;

    return this.client
      .from('perfiles_alumnos')
      .upsert(profileData, { onConflict: 'uid_usuario' });
  }

  // Obtiene todos los documentos subidos por los usuarios
  async getAllDocuments() {
    return this.client
      .from('documentos_subidos')
      .select('*');
  }
}
