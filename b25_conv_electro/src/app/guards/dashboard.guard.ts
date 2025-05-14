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

    // Ruta exclusiva para admin
    const adminOnlyRoute = [
      '/dashboard/registrar-usuario'
    ];

    if (adminOnlyRoute.includes(url) && rol !== 'admin') {
      this.router.navigate(['/']);
      return false;
    }

    // Ruta exclusiva para superadmin
    const superAdminOnlyRoute = [
      '/dashboard/registrar-centro'
    ];

    if (superAdminOnlyRoute.includes(url) && rol !== 'superadmin') {
      this.router.navigate(['/']);
      return false;
    }

    // Ruta compartida por admin y superadmin
    const adminAndSuperadminRoute = [
      '/dashboard/admin'
    ];

    if (adminAndSuperadminRoute.includes(url) && !['admin', 'superadmin'].includes(rol)) {
    this.router.navigate(['/']);
    return false;
  }

    // Rutas generales (no protegidas por rol): solo para alumno o invitado
    if (
      !adminOnlyRoute.includes(url) &&
      !superAdminOnlyRoute.includes(url) &&
      !adminAndSuperadminRoute.includes(url) &&
      !['alumno', 'invitado'].includes(rol)
    ) {
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}
