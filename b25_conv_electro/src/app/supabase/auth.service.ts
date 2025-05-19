import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public user: any = null;
  public userRol: string= '';
  public userCentro : string = '';
  public appLoading = true;

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
      await this.supabaseService.client.auth.signOut(); // Borra cualquier sesión mal puesta
      throw error || new Error('Usuario o contraseña incorrectos');
    }

    // Hace un select a la tabla usuarios con el usuario autenticado para averiguar el rol
    const {data: profileRol, error: profileError} = await this.supabaseService.client
      .from('usuarios')
      .select('rol, centro')
      .eq('correo', data.user.email)
      .single()

    if (profileError || !profileRol) {
      throw profileError || new Error('No se pudo obtener el perfil del usuario');
    }

    this.user = data.user;
    this.userRol = profileRol.rol;
    this.userCentro = profileRol.centro;

    // Redirigir al dashboard
    this.redirecTo();
  }

  // Cerrar sesión
  async signOut(): Promise<void> {
    try {
      await this.supabaseService.client.auth.signOut();
    } catch (error: any) {
      // Error ignorado, puede que el token ya no sea válido
    } finally {
      this.user = null;
      this.userRol = '';
      this.userCentro = '';
      await this.router.navigate(['']);
    }
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return !!this.user;
  }

  // Redirige a una página u otra según el rol del usuario
  redirecTo(): void {
    if(this.userRol === 'admin' || this.userRol === 'superadmin') {
      this.router.navigate(['/dashboard/admin']);
    } else {
      this.router.navigate(['/dashboard/profile']);
    }
  }

  // Verifica si hay una sesión activa para volver a incluir las credenciales y el rol al usuario
  async restoreSession(): Promise<void> {
    const { data: { session } } = await this.supabaseService.client.auth.getSession();

    if (session?.user) {
      this.user = session.user;

      // Buscar el rol asociado al usuario en la tabla "usuarios"
      const { data: profileRol, error } = await this.supabaseService.client
        .from('usuarios')
        .select('rol, centro')
        .eq('correo', session.user.email)
        .single();

      if (!error && profileRol) {
        this.userRol = profileRol.rol;
        this.userCentro = profileRol.centro;
      } else {
        this.userRol = '';
        this.userCentro = '';
      }
    } else {
      this.user = null;
      this.userRol = '';
    }

    return;
  }
}
