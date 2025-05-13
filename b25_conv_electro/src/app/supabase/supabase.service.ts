import { Component, Injectable } from '@angular/core';
import { supabase } from './config/init-supabase';
import { Centro} from '../components/dashboard/admin/admin.component';
import { BehaviorSubject, from, Observable } from 'rxjs';
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

  private centroSeleccionadoSubject = new BehaviorSubject<string>("");
//Metodo para que se puedan suscribir los componenetes.*
public centroSeleccionado$ = this.centroSeleccionadoSubject.asObservable();
//Obtener los estudiantes filtrados por el centro*
async getEstudiantesPorCentro(centro: string) {
try {
    // Primero obtenemos los estudiantes
    const { data: estudiantes, error: estudiantesError } = await this.client
      .from('usuarios')
      .select('*')
      .eq('centro', centro);

    if (estudiantesError) throw estudiantesError;

    // Luego obtenemos el nombre del centro
    const { data: centroData, error: centroError } = await this.client
      .from('centros')
      .select('nombre')
      .eq('id_centro', centro)
      .single();

    if (centroError) throw centroError;

    // Asignamos el nombre del centro a cada estudiante
    const estudiantesConCentro = estudiantes.map(estudiante => ({
      ...estudiante,
      centro_nombre: centroData.nombre,  // Agregamos el nombre del centro a cada estudiante
    }));

    return estudiantesConCentro;

  } catch (error) {
    console.error('Error al obtener estudiantes o centro:', error);
    throw error;
  }
}

async getCentros(){
try{
const {data ,error} = await this.client
.from("centros")
.select("*")
if(error) throw error;
console.log(data)
return data
}catch(error){
console.error("Error al obtener los centros", error);
throw error
}
}


// Método para establecer la categoría seleccionada
seleccionarCentro(centro: string) {
this.centroSeleccionadoSubject.next(centro);
}
// Método para obtener la categoría actualmente seleccionada
getCentroSeleccionado(): string {
return this.centroSeleccionadoSubject.getValue();
}

  // Genera una URL firmada temporalmente para acceder a un archivo almacenado en el bucket
  async getSignedUrl(path: string, expiresInSeconds: number = 60): Promise<string | null> {
    const { data, error } = await this.client.storage
      .from('documentos')
      .createSignedUrl(path, expiresInSeconds);
    return error ? null : data.signedUrl;
  }

  //Update estados de documentos 
  updateDocumentStatus(value : string, id : string){
    return from(supabase.
      from('documentos_subidos')
      .update({estado_verificacion : value})
      .eq('id_documento', id)
      .select()
    )
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
        .select(`uid,nombre, 
          correo,
          rol,
          fecha_registro,
          centro,
          centros (id_centro, 
          nombre)`
        )
    );
  } 

  /*   getAllStudents(): Observable<any> {
    return from(
      supabase
        .from('usuarios')
        .select('*')
        );
  }
 */
    getAdminStudents(centro : string): Observable<any> {
    return from(
      supabase
        .from('usuarios')
        .select('*')
        .eq('centro', centro)
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

