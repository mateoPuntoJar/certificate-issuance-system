import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public user: any = null;

  constructor(
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

  // Iniciar sesión
  async login(email: string, password: string): Promise<void> {
    const { data, error } =
      await this.supabaseService.client.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      throw error;
    }

    this.user = data.user;

    // Redirigir al dashboard
    await this.router.navigate(['/dashboard']);
  }

  // Cerrar sesión
  async signOut(): Promise<void> {
    await this.supabaseService.client.auth.signOut();
    this.user = null;
    await this.router.navigate(['']);
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return !!this.user;
  }

  // Verificar si es administrador
  isAdmin(): boolean {
    return this.user?.rol === 'admin';
  }

  // Verificar si es alumno
  isUser(): boolean {
    return this.user?.rol === 'alumno';
  }
}
