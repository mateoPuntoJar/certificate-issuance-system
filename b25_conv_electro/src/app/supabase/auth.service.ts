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

    if (error || !data.user) {
      console.warn('Login fallido:', error?.message || 'Usuario inválido');
      await this.supabaseService.client.auth.signOut(); // Borra cualquier sesión mal puesta
      throw error || new Error('Usuario o contraseña incorrectos');
    }

    // Hace un select a la tabla usuarios con el usuario autenticado para averiguar el rol
    const {data: profileRol, error: profileError} = await this.supabaseService.client
      .from('usuarios')
      .select('rol')
      .eq('correo', data.user.email)
      .single()

    if (profileError || !profileRol) {
      throw profileError || new Error('No se pudo obtener el perfil del usuario');
    }

    this.user = data.user;

    // Redirigir al dashboard
    this.redirecTo(profileRol.rol);
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

  // Redirige a una página u otra según el rol del usuario
  redirecTo(rol: string): void {
    if(rol === 'admin') {
      this.router.navigate(['/dashboard/admin']);
    } else {
      this.router.navigate(['/dashboard/profile']);
    }
  }
}
