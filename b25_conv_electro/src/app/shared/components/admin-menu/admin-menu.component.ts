import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../../supabase/auth.service';
import { SupabaseService } from '../../../supabase/supabase.service';
import { RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterModule],
  templateUrl: './admin-menu.component.html',
})
export class AdminMenuComponent implements OnInit {
  centros: any[] = [];
  centroSeleccionado: string = '';
  error: string | null = null;
  userRole: string = '';

  constructor(
    private authService: AuthService,
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.userRol;
    this.loadCentros();

    this.supabase.centroSeleccionado$.subscribe(centro => {
      this.centroSeleccionado = centro;
    });
  }

  logout() {
    this.authService.signOut();
  }

  async loadCentros() {
    try {
      this.centros = await this.supabase.getCentros();

      // Si no hay valor aún, establecer vacío para ver todos
      if (!this.centroSeleccionado) {
        this.supabase.seleccionarCentro('');
      }

      this.cdr.detectChanges();
    } catch (error) {
      this.error = 'No se pueden cargar los centros';
    }
  }

  seleccionarCentro(centro: string) {
    this.supabase.seleccionarCentro(centro || '');
  }
}
