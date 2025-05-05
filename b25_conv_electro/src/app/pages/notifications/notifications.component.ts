import { SupabaseService } from './../../supabase/supabase.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LimitWordsPipe } from './limit-words.pipe';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, LimitWordsPipe],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.css'],
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];
  filtro: 'todas' | 'no-leidas' = 'todas';

  modalOpen = false;
  selectedNotification: any;
  modalStyles = {};

  constructor(
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.loadNotifications();
  }

  async loadNotifications() {
    const user = await this.supabaseService.client.auth.getUser();
    const uid = user?.data?.user?.id;

    const { data, error } = await this.supabaseService.client
      .from('notificaciones')
      .select('*')
      .eq('uid_usuario', uid)
      .order('fecha_notificacion', { ascending: false });
    if (error) {
      console.error('Error cargando notificaciones:', error.message);
    } else {
      this.notifications = data.map((n) => ({
        id: n.id_notificacion,
        titulo: this.generarTitulo(n),
        mensaje: n.mensaje,
        fecha: this.formatearFecha(n.fecha_notificacion),
        leido: n.leido,
        supabaseRaw: n,
      }));
      this.cdr.detectChanges();
    }
  }

  generarTitulo(n: any) {
    if (n.id_documento) return 'Nuevo documento';
    return 'Notificación';
  }

  formatearFecha(fecha: string) {
    const f = new Date(fecha);
    return f.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  openModal(notification: any) {
    this.selectedNotification = notification;
    this.modalOpen = true;

    this.modalStyles = {
      animation: 'fadeInUp 0.4s ease-out forwards',
      opacity: '0',
    };

    notification.leido = true;

    this.supabaseService.client
      .from('notificaciones')
      .update({ leido: true })
      .eq('id_notificacion', notification.id)
      .then(({ error }) => {
        if (error) {
          console.error('Error al marcar como leída:', error.message);
        }
      });
  }

  closeModal() {
    this.modalOpen = false;
    this.selectedNotification = null;
  }

  trackByNotificationId(index: number, notification: any) {
    return notification.id;
  }

  notificacionesFiltradas() {
    if (this.filtro === 'no-leidas') {
      return this.notifications.filter((n) => !n.leido);
    }
    return this.notifications;
  }

  contarNoLeidas() {
    return this.notifications.filter((n) => !n.leido).length;
  }

  todasLeidas() {
    this.notifications.forEach((n) => {
      n.leido = true;
      this.supabaseService.client
        .from('notificaciones')
        .update({ leido: true })
        .eq('id_notificacion', n.id);
    });
  }
}
