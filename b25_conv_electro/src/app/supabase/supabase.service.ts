import { Injectable } from '@angular/core';
import { supabase } from './config/init-supabase';
import { BehaviorSubject, from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  constructor() { }

  get client() {
    return supabase;
  }

  get auth() {
    return supabase.auth;
  }

  async getAllFromTable(table: string) {
    return this.client.from(table).select('*');
  }

  async uploadFile(file: File, path: string) {
    return this.client.storage.from('documentos').upload(path, file, {
      contentType: file.type,
      upsert: true,
    });
  }

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

  async insertDocumentInvitado(data: {
    id_invitado: string;
    tipo_documento: string;
    nombre_titulacion: string;
    nombre_archivo: string;
    url_documento: string;
    formato_documento: string;
    fecha_subida: Date;
    estado_verificacion: string;
  }) {
    return this.client.from('documentos_subidos').insert({
      id_invitado: data.id_invitado,
      uid_usuario: null,
      tipo_documento: data.tipo_documento,
      nombre_titulacion: data.nombre_titulacion,
      nombre_archivo: data.nombre_archivo,
      url_documento: data.url_documento,
      formato_documento: data.formato_documento,
      fecha_subida: data.fecha_subida,
      estado_verificacion: data.estado_verificacion,
    });
  }

  private centroSeleccionadoSubject = new BehaviorSubject<string>('');
  public centroSeleccionado$ = this.centroSeleccionadoSubject.asObservable();

  async getEstudiantesPorCentro(centro: string) {
    try {
      const { data: estudiantes, error: estudiantesError } = await this.client
        .from('usuarios')
        .select('*')
        .eq('centro', centro);
      if (estudiantesError) throw estudiantesError;

      const { data: centroData, error: centroError } = await this.client
        .from('centros')
        .select('nombre')
        .eq('id_centro', centro)
        .single();
      if (centroError) throw centroError;

      return estudiantes.map((est) => ({
        ...est,
        centro_nombre: centroData.nombre,
      }));
    } catch (error) {
      console.error('Error al obtener estudiantes o centro:', error);
      throw error;
    }
  }

  async getCentros() {
    try {
      const { data, error } = await this.client.from('centros').select('*');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener los centros', error);
      throw error;
    }
  }

  seleccionarCentro(centro: string) {
    this.centroSeleccionadoSubject.next(centro);
  }

  getCentroSeleccionado(): string {
    return this.centroSeleccionadoSubject.getValue();
  }

  async getSignedUrl(
    path: string,
    expiresInSeconds: number = 60
  ): Promise<string | null> {
    const { data, error } = await this.client.storage
      .from('documentos')
      .createSignedUrl(path, expiresInSeconds);
    return error ? null : data.signedUrl;
  }

  updateDocumentStatus(value: string, id: string) {
    return from(
      supabase
        .from('documentos_subidos')
        .update({ estado_verificacion: value })
        .eq('id_documento', id)
        .select()
    );
  }

  async insertProfileStudent(
    uid: string,
    tipo: string,
    fileName: string,
    experiencia: string
  ) {
    const profileData: any = {
      uid_usuario: uid,
      experiencia_laboral: experiencia?.trim() || null,
    };
    if (tipo === 'reglada') profileData.titulo_academico = fileName;
    if (tipo === 'certificado')
      profileData.certificado_profesionalidad = fileName;

    return this.client
      .from('perfiles_alumnos')
      .upsert(profileData, { onConflict: 'uid_usuario' });
  }

  getAllNotification(id: string): Observable<any> {
    return from(
      supabase.from('notificaciones').select('*').eq('uid_usuario', id)
    );
  }

  async getAllDocuments() {
    return this.client.from('documentos_subidos').select('*');
  }

  getAllStudents(): Observable<any> {
    return from(
      supabase
        .from('usuarios')
        .select(
          `uid,nombre,correo,rol,fecha_registro,centro,centros (id_centro,nombre)`
        )
    );
  }

  getAdminStudents(centro: string): Observable<any> {
    return from(supabase.from('usuarios').select('*').eq('centro', centro));
  }

  sendNotification(id_usuario: string, mensaje: string) {
    return from(
      supabase
        .from('notificaciones')
        .insert([{ uid_usuario: id_usuario, mensaje }])
        .select()
    );
  }

  showDocuments(id_usuario: string) {
    return from(
      supabase
        .from('documentos_subidos')
        .select('*')
        .eq('uid_usuario', id_usuario)
    );
  }

  async insertProfileGuest(data: {
    id_invitado: string;
    nombre: string;
    apellidos: string;
    correo: string;
    telefono: string;
    centro: string;
    tipo_titulacion: string;
    nombre_titulacion: string;
    experiencia?: string;
    acepta_politica: boolean;
  }) {
    return this.client.from('perfiles_invitados').insert({
      ...data,
      fecha_registro: new Date(),
    });
  }

  async createUser(
    email: string,
    password: string,
    nombre: string,
    rol: string,
    centro: string
  ): Promise<void> {
    await supabase.functions.invoke('create-user', {
      body: {
        email,
        password,
        nombre,
        rol,
        centro,
      },
    });
  }

  async deleteDocument(nombreArchivo: string, uid: string, id_documento: number) {
    const { error: bucketError } = await this.client.storage
      .from('documentos')
      .remove([`${uid}/${nombreArchivo}`]);

    if (bucketError) {
      console.error('Error al borrar del bucket:', bucketError);
      return { success: false };
    }

    const { error: dbError } = await this.client
      .from('documentos_subidos')
      .delete()
      .eq('id_documento', id_documento);

    if (dbError) {
      console.error('Error al borrar en documentos_subidos:', dbError);
      return { success: false };
    }

    const { data: perfiles, error: perfilError } = await this.client
      .from('perfiles_alumnos')
      .select('titulo_academico, certificado_profesionalidad')
      .eq('uid_usuario', uid);

    if (perfilError) {
      console.error('Error al consultar perfil:', perfilError);
      return { success: false };
    }

    const perfil = perfiles?.[0];

    if (perfil) {
      const updates: any = {};
      if (perfil.titulo_academico === nombreArchivo) updates.titulo_academico = null;
      if (perfil.certificado_profesionalidad === nombreArchivo) updates.certificado_profesionalidad = null;

      if (Object.keys(updates).length > 0) {
        await this.client.from('perfiles_alumnos').update(updates).eq('uid_usuario', uid);
      }
    }

    return { success: true };
  }
}
