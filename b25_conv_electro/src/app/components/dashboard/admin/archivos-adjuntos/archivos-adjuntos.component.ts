import { Component, Input, OnInit } from '@angular/core';
import { SupabaseService } from '../../../../supabase/supabase.service';


@Component({
  selector: 'app-archivos-adjuntos',
  imports: [],
  templateUrl: './archivos-adjuntos.component.html',
})
export class ArchivosAdjuntosComponent implements OnInit{

  ngOnInit(): void {
    this.showDocuments(this.id_user);

  }
  constructor( private supabase : SupabaseService){}

  @Input() id_user !: string;

  documents : any;

  showDocuments(id : string){
    this.supabase.showDocuments(id).subscribe({
      next:(response) =>{
        this.documents = response.data
      },
      error: (error)=>{
        alert("IMPOSIBLE OBTENER DOCUMENTOS")
      }
    })

  }
}
