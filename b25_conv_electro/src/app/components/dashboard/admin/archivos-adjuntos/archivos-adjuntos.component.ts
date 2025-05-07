import { Component, Input, input, NgModule, OnInit } from '@angular/core';
import { SupabaseService } from '../../../../supabase/supabase.service';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-archivos-adjuntos',
  imports: [FormsModule, CommonModule],
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

  changeDocumentStatus(value : string, id : string){
    this.supabase.updateDocumentStatus(value,id).subscribe({
      next: () =>{},
      error:(err)=>{
        alert("ERROR AL ACTUALIZAR EL DOCUMENTO")
      }
    })
  }

  onStatusChange(event: Event, id: string) {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value;
  
    this.changeDocumentStatus(value, id);
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
