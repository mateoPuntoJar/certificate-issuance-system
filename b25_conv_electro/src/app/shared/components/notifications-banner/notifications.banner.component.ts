import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../supabase/supabase.service';

@Component({
  selector: 'app-notifications-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.banner.component.html',
})
export class NotificationBannerComponent implements OnInit {
  notificacionesPendientes = 0;

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    const user = await this.supabase.client.auth.getUser();
    const uid = user?.data?.user?.id;
    if (!uid) return;

    const { data, error } = await this.supabase.client
      .from('notificaciones')
      .select('leido')
      .eq('uid_usuario', uid)
      .eq('leido', false); // solo no leídas

    if (!error && data) {
      this.notificacionesPendientes = data.length;
    }
  }
}
