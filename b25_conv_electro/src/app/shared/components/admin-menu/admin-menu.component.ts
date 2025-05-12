import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../supabase/auth.service';
import { SupabaseService } from '../../../supabase/supabase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { supabase } from '../../../supabase/config/init-supabase';
import { ChangeDetectorRef } from '@angular/core';
import { DataSharingService} from '../../services/shared.services';
@Component({
  selector: 'app-admin-menu',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-menu.component.html',
})
export class AdminMenuComponent implements OnInit{
  centros: any[] = [];
  centroSeleccionado: string = ""
  error: string | null = null;
  constructor(
    private authService: AuthService,
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef,
    private centroService : DataSharingService
  ) {}

 
  ngOnInit(): void {
    this.loadCentros();

    this.centroService.centroSeleccionado$.subscribe(
      centro=>{
        this.centroSeleccionado = centro;
      }
    )
  }
  logout() {
    this.authService.signOut();
  }

  async loadCentros(){
    try{
      this.centros = await this.centroService.getCentros();
      console.log(this.centros)

      if (this.centros.length > 0 && !this.centroSeleccionado) {
        this.centroService.seleccionarCentro(this.centros[0].id_centro)
      } 
    }catch(error){
      this.error = "no se puede cargar los centros"
    }
  }

  seleccionarCentro(centro: string) {
    this.centroService.seleccionarCentro(centro);
  }




}

