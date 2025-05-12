import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Centro } from '../../components/dashboard/admin/admin.component';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class DataSharingService {


  private centroSeleccionadoSubject = new BehaviorSubject<string>("");
  //Metodo para que se puedan suscribir los componenetes.
  public centroSeleccionado$ = this.centroSeleccionadoSubject.asObservable();



  constructor( private supabase : SupabaseService){}

  //Obtener los centros
  async getCentros(){
    try{
      const {data ,error} = await this.supabase.client
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

  //Obtener los estudiantes filtrados por el centro
  async getEstudiantesPorCentro(centro: string) {
    try {
      const { data, error } = await this.supabase.client
        .from('usuarios')
        .select('*')
        .eq('centro', centro);
      
      if (error) throw error;
      
      console.log(data)
      return data;
    } catch (error) {
      console.error('Error al obtener estudiantes:', error);
      throw error;
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
}
