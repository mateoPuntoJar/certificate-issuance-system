import { Component } from '@angular/core';
import { AuthService } from '../../../supabase/auth.service';
import { SupabaseService } from '../../../supabase/supabase.service';

@Component({
  selector: 'app-admin-menu',
  imports: [],
  templateUrl: './admin-menu.component.html',
  styleUrl: './admin-menu.component.css'
})
export class AdminMenuComponent {
  constructor(
    private authService: AuthService,
    private supabase: SupabaseService
  ) {}

  logout() {
    this.authService.signOut();
  }
}
