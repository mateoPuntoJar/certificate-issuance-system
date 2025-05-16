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
  constructor(private auth: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isAuthenticated = this.auth.isAuthenticated();
    const rol = this.auth.userRol;

    if (!isAuthenticated || !['superadmin', 'admin', 'alumno', 'invitado'].includes(rol)) {
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isAuthenticated = this.auth.isAuthenticated();
    const rol = this.auth.userRol;
    const url = state.url;

    if (!isAuthenticated) {
      this.router.navigate(['/']);
      return false;
    }

    const superAdminOnlyRoute = ['/dashboard/registrar-centro'];
    const adminAndSuperadminRoute = [
      '/dashboard/admin',
      '/dashboard/registrar-usuario'
    ];
    const guestOnlyRoute = ['/dashboard/register-guest'];

    if (superAdminOnlyRoute.includes(url) && rol !== 'superadmin') {
      this.router.navigate(['/']);
      return false;
    }

    if (adminAndSuperadminRoute.includes(url) && !['admin', 'superadmin'].includes(rol)) {
      this.router.navigate(['/']);
      return false;
    }

    if (guestOnlyRoute.includes(url) && rol !== 'invitado') {
      this.router.navigate(['/']);
      return false;
    }

    // Otras rutas generales para alumno o invitado
    if (
      !superAdminOnlyRoute.includes(url) &&
      !adminAndSuperadminRoute.includes(url) &&
      !guestOnlyRoute.includes(url) &&
      !['alumno', 'invitado'].includes(rol)
    ) {
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}
