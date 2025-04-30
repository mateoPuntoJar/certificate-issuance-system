import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LimitWordsPipe } from './limit-words.pipe';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, LimitWordsPipe],
  templateUrl: './notifications.component.html',
})
export class NotificationsComponent {
  notifications = [
    {
      id: 1,
      titulo: 'Certificado validado',
      mensaje:
        '¡Tu solicitud ha sido aprobada por el administrador! Esto significa que el proceso ha sido validado y podrás continuar con el siguiente paso, que ahora está disponible para ti.',
      fecha: '23 de abril, 14:32',
      leido: false,
    },
    {
      id: 2,
      titulo: 'Documentos pendientes',
      mensaje: 'Faltan documentos por subir en tu perfil',
      fecha: '22 de abril, 10:15',
      leido: true,
    },
    {
      id: 3,
      titulo: 'Perfil actualizado',
      mensaje: 'Se guardaron los últimos cambios en tu perfil',
      fecha: '21 de abril, 18:50',
      leido: false,
    },
  ];

  // Variables para el control del modal
  modalOpen = false;
  selectedNotification: any;

  // Función para abrir el modal con los detalles de la notificación
  openModal(notification: any) {
    this.selectedNotification = notification;
    this.modalOpen = true;
    notification.leido = true;
  }

  // Función para cerrar el modal
  closeModal() {
    this.modalOpen = false;
    this.selectedNotification = null;
  }

  // Función para el trackBy en el ngFor (optimiza la renderización)
  trackByNotificationId(index: number, notification: any) {
    return notification.id;
  }

  filtro: 'todas' | 'no-leidas' = 'todas';

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
    this.notifications.forEach((n) => (n.leido = true));
  }
}
