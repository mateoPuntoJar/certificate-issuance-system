import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SupabaseService } from '../../../../supabase/supabase.service';
import { NgFor, NgIf } from '@angular/common';
import { NotificationBannerComponent } from '../../../../shared/components/notifications-banner/notifications.banner.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgIf, NgFor, NotificationBannerComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  nombre = '';
  email = '';
  enviados: string[] = [];
  pendientes: string[] = [];
  aprobados: string[] = [];
  rechazados: string[] = [];
  loading = true;

  constructor(
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const uid = (await this.supabase.client.auth.getSession()).data.session?.user.id;
    if (!uid) return;

    const { data: usuarios } = await this.supabase.getAllFromTable('usuarios');
    const usuario = usuarios?.find((u: any) => u.uid === uid);
    if (!usuario) return;

    this.nombre = usuario.nombre || 'Sin nombre';
    this.email = usuario.correo || 'Sin correo';

    const { data: docs } = await this.supabase.client
      .from('documentos_subidos')
      .select('nombre_titulacion, estado_verificacion')
      .eq('uid_usuario', uid);

    const filtrar = (estado: string) =>
      docs?.filter((d) => d.estado_verificacion === estado).map((d) => d.nombre_titulacion) || [];

    this.enviados = filtrar('enviado');
    this.pendientes = filtrar('pendiente');
    this.aprobados = filtrar('aprobado');
    this.rechazados = filtrar('rechazado');

    this.loading = false;
    this.cdr.detectChanges();
  }
}
