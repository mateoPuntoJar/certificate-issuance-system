import { SupabaseService } from './../../supabase/supabase.service';
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LimitWordsPipe } from './limit-words.pipe';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, LimitWordsPipe, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.css'],
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];
  filtro: 'todas' | 'no-leidas' = 'todas';

  modalOpen = false;
  selectedNotification: any;
  modalStyles = {};
  nombreUsuario: string = '';
  loading: boolean = true;

  constructor(
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    setTimeout(() => {
      this.loadUser();
      this.loadNotifications();
      this.loading = false;
    });
  }

  async loadNotifications() {
    const user = await this.supabaseService.client.auth.getUser();
    const uid = user?.data?.user?.id;

    const { data, error } = await this.supabaseService.client
      .from('notificaciones')
      .select(
        'id_notificacion, mensaje, fecha_notificacion, leido, id_documento'
      )
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
        documento: n.id_documento,
        supabaseId: n.id_notificacion,
      }));
      this.cdr.markForCheck();
    }
  }

  async loadUser() {
    const user = await this.supabaseService.client.auth.getUser();
    const uid = user?.data?.user?.id;
    const { data, error } = await this.supabaseService.client
      .from('usuarios')
      .select('nombre')
      .eq('uid', uid)
      .single();

    if (error) {
      console.error('Error cargando el nombre de usuario:', error.message);
    } else if (data) {
      this.nombreUsuario = data.nombre;
      this.cdr.markForCheck();
    }
  }

  generarTitulo(n: any) {
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

  async openModal(notification: any) {
    this.selectedNotification = notification;
    this.modalOpen = true;

    this.modalStyles = {
      animation: 'fadeInUp 0.4s ease-out forwards',
      opacity: '0',
    };

    // Actualiza el estado local para reflejar el cambio de 'leido'
    notification.leido = true;

    // Actualiza la lista de notificaciones también
    this.notifications = this.notifications.map((n) =>
      n.id === notification.id ? { ...n, leido: true } : n
    );

    console.log('Intentando marcar como leída:', notification);

    const { data, error } = await this.supabaseService.client
      .from('notificaciones')
      .update({ leido: true })
      .eq('id_notificacion', notification.id);

    if (error) {
      console.error('UPDATE error:', error);
    } else {
      console.log('Fila actualizada:', data);
    }
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
}
