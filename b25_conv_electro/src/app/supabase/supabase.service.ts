import { Injectable } from '@angular/core';
import { supabase } from './config/init-supabase';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  constructor() {}

  get client() {
    return supabase;
  }

  getAllStudents(): Observable<any> {
    return from(
      supabase
        .from('usuarios')  // Asegúrate de que esta es la tabla correcta
        .select('*')
    );
  }

  sendNotification(id_usuario: string,mensaje: string){
    return from(supabase.
      from("notificaciones")
    .insert([
      {uid_usuario: id_usuario,mensaje : mensaje}
    ]). select()
  )
  }

  showDocuments(id_usuario : string){
    return from(supabase.
      from("documentos_subidos")
      .select("*")
      .eq('uid_usuario',id_usuario)
    )
  }



}