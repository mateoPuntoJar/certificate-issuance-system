import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../supabase/auth.service';
import { SupabaseService } from '../../../supabase/supabase.service';

@Component({
  selector: 'app-student-menu',
  standalone: true,
  imports: [RouterLink, RouterModule, NgIf],
  templateUrl: './student-menu.component.html',
})
export class StudentMenuComponent implements OnInit {
  notificacionesPendientes = 0;

  constructor(
    private authService: AuthService,
    private supabase: SupabaseService
  ) {}

  async ngOnInit() {
    const { data } = await this.supabase.client.auth.getUser();
    const uid = data?.user?.id;
    if (!uid) return;

    const { data: notifs } = await this.supabase.client
      .from('notificaciones')
      .select('leido')
      .eq('uid_usuario', uid);

    this.notificacionesPendientes = notifs?.filter(n => !n.leido).length || 0;
  }

  logout() {
    this.authService.signOut();
  }
}
