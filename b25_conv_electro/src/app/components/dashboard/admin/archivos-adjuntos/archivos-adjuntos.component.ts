import { Component, Input, input, OnInit } from '@angular/core';
import { SupabaseService } from '../../../../supabase/supabase.service';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-archivos-adjuntos',
  imports: [],
  templateUrl: './archivos-adjuntos.component.html',
})
export class ArchivosAdjuntosComponent implements OnInit{

  ngOnInit(): void {
    this.showDocuments(this.id_user);

  }
  constructor( private supabase : SupabaseService, private cdr: ChangeDetectorRef){}

  @Input() id_user !: string;

  documents : any;

  showDocuments(id : string){
    this.supabase.showDocuments(id).subscribe({
      next:(response) =>{
        this.documents = response.data
        this.cdr.detectChanges();
      },
      error: (err)=>{
        alert("IMPOSIBLE OBTENER DOCUMENTOS")
      }
    })

  }
}
