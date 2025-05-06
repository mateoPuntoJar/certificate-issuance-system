import { Injectable } from '@angular/core';
import { supabase } from './config/init-supabase';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  constructor() { }

  // Getter que devuelve la instancia del cliente Supabase
  get client() {
    return supabase;
  }

  // Obtiene todos los registros de una tabla específica de la base de datos
  async getAllFromTable(table: string) {
    return this.client.from(table).select('*');
  }

  // Sube un archivo al bucket de almacenamiento 'documentos' en Supabase
  async uploadFile(file: File, path: string) {
    return this.client.storage
      .from('documentos')
      .upload(path, file, {
        contentType: file.type,
        upsert: true, // Sobrescribe el archivo si ya existe
      });
  }

  // Inserta un nuevo registro en la tabla 'documentos_subidos' con los metadatos del archivo
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

  // Genera una URL firmada temporalmente para acceder a un archivo almacenado en el bucket
  async getSignedUrl(path: string, expiresInSeconds: number = 60): Promise<string | null> {
    const { data, error } = await this.client.storage
      .from('documentos')
      .createSignedUrl(path, expiresInSeconds);
    return error ? null : data.signedUrl;
  }

  // Inserta o actualiza el perfil de un alumno en la tabla 'perfiles_alumnos'
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

  //Listar Notificaciones 
  getAllNotification(id : string):Observable<any>{
    return  from(supabase
    .from('notificaciones')
    .select('*')
    .eq('uid_usuario', id)
  );
  }

  // Recupera todos los registros de la tabla 'documentos_subidos'
  async getAllDocuments() {
    return this.client
      .from('documentos_subidos')
      .select('*');
  }

  // Obtiene todos los usuarios registrados en la tabla 'usuarios'
  getAllStudents(): Observable<any> {
    return from(
      supabase
        .from('usuarios')
        .select('*')
    );
  }

  // Envía una notificación a un usuario insertando un nuevo registro en la tabla 'notificaciones'
  sendNotification(id_usuario: string, mensaje: string) {
    return from(
      supabase
        .from('notificaciones')
        .insert([
          { uid_usuario: id_usuario, mensaje: mensaje }
        ])
        .select()
    );
  }

  // Recupera todos los documentos subidos por un usuario específico
  showDocuments(id_usuario: string) {
    return from(
      supabase
        .from('documentos_subidos')
        .select('*')
        .eq('uid_usuario', id_usuario)
    );
  }
}
