import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.banner.component.html',
})
export class NotificationBannerComponent {
  // Simulacion de notificaciones sin leer
  notificacionesPendientes = 0;
}
