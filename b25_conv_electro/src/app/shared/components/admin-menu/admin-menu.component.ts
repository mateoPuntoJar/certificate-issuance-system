import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../supabase/auth.service';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-menu',
  standalone: true,
  imports: [ CommonModule, RouterLink, RouterModule ],
  templateUrl: './admin-menu.component.html',
})
export class AdminMenuComponent implements OnInit {
  userRole: string = '';

  constructor(
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.userRole = this.authService.userRol;
  }

  logout() {
    this.authService.signOut();
  }
}
