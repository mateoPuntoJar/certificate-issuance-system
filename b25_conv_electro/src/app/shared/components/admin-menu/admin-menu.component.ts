import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../supabase/auth.service';
import { SupabaseService } from '../../../supabase/supabase.service';
import { RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { supabase } from '../../../supabase/config/init-supabase';
import { ChangeDetectorRef } from '@angular/core';
import { get } from 'http';

@Component({
  selector: 'app-admin-menu', 
  standalone: true,
  imports: [RouterLink, RouterModule, CommonModule,FormsModule],
  templateUrl: './admin-menu.component.html',
})
export class AdminMenuComponent implements OnInit{
   centros: any[] = [];
  centroSeleccionado: string = ""
  error: string | null = null;
  constructor(
    private authService: AuthService,
    private supabase: SupabaseService,
     private cdr: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.getRol();
     this.loadCentros();

    this.supabase.centroSeleccionado$.subscribe(
      centro=>{
        this.centroSeleccionado = centro;
      }
    )
  }

  rol = ""

  getRol()
{
  this.rol = this.authService.userRol;
    return this.rol;
}
  logout() {
    this.authService.signOut();
  }

  async loadCentros(){
    try{
      this.centros = await this.supabase.getCentros();
      console.log(this.centros)
      if (this.centros.length > 0 && !this.centroSeleccionado) {
        this.supabase.seleccionarCentro(this.centros[0].id_centro)
      } 
    }catch(error){
      this.error = "no se puede cargar los centros"
    }
  }

  seleccionarCentro(centro: string) {
    this.supabase.seleccionarCentro(centro);
  }
}
