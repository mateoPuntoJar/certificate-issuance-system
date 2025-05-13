import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../supabase/auth.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardGuard implements CanActivate, CanActivateChild {

  constructor(private auth: AuthService, private router: Router) {}

  /**
   * Protege la ruta padre /dashboard
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isAuthenticated = this.auth.isAuthenticated();
    const rol = this.auth.userRol;

    // Si no está autenticado o no tiene un rol válido, redirige al login
    if (!isAuthenticated || !['superadmin', 'admin', 'alumno', 'invitado'].includes(rol)) {
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }

  /**
   * Protege las rutas hijas de /dashboard
   */
  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isAuthenticated = this.auth.isAuthenticated();
    const rol = this.auth.userRol;
    const url = state.url;

    if (!isAuthenticated) {
      this.router.navigate(['/']);
      return false;
    }

    // Rutas exclusivas para admin
    const adminOnlyRoutes = [
      '/dashboard/admin',
      '/dashboard/registrar-centro',
      '/dashboard/registrar-usuario',
    ];

    if (adminOnlyRoutes.includes(url) && rol !== 'admin' && rol !== 'superadmin') {
      this.router.navigate(['/']);
      return false;
    }

    // Resto de rutas (accesibles solo por alumno o invitado)
    if (!adminOnlyRoutes.includes(url) && !['alumno', 'invitado'].includes(rol)) {
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}
