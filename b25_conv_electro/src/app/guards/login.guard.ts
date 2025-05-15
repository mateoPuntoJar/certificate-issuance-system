import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../supabase/auth.service';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    const rol = this.auth.userRol;

    if (rol === 'admin' || rol === 'superadmin') {
      this.router.navigate(['/dashboard/admin']);
      return false;
    } else if (rol === 'alumno') {
      this.router.navigate(['/dashboard/profile']);
      return false;
    } else if (rol === 'invitado') {
      this.router.navigate(['/dashboard/register-guest']);
      return false;
    }

    return true;
  }
}
