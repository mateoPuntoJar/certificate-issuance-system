import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../supabase/auth.service'; // ← Usa AuthService

@Component({
  selector: 'app-student-menu',
  imports: [RouterLink, RouterModule, NgIf],
  templateUrl: './student-menu.component.html',
})
export class StudentMenuComponent {
  notificacionesPendientes = 3;

  constructor(private authService: AuthService) {}

  logout() {
    this.authService.signOut();
  }
}
