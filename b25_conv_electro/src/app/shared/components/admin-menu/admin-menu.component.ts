import { Component } from '@angular/core';
import { AuthService } from '../../../supabase/auth.service';
import { SupabaseService } from '../../../supabase/supabase.service';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-menu',
  imports: [RouterLink, RouterModule],
  templateUrl: './admin-menu.component.html',
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
