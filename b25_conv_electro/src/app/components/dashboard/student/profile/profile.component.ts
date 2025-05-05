import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SupabaseService } from '../../../../supabase/supabase.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  nombre = '';
  email = '';
  enviados: string[] = [];
  pendientes: string[] = [];
  aprobados: string[] = [];
  rechazados: string[] = [];

  constructor(
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const sessionResult = await this.supabase.client.auth.getSession();
    const uid = sessionResult.data.session?.user.id;
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

    if (docs) {
      this.enviados = docs
        .filter((d: any) => d.estado_verificacion === 'enviado')
        .map((d: any) => d.nombre_titulacion);

      this.pendientes = docs
        .filter((d: any) => d.estado_verificacion === 'pendiente')
        .map((d: any) => d.nombre_titulacion);

      this.aprobados = docs
        .filter((d: any) => d.estado_verificacion === 'aprobado')
        .map((d: any) => d.nombre_titulacion);

      this.rechazados = docs
        .filter((d: any) => d.estado_verificacion === 'rechazado')
        .map((d: any) => d.nombre_titulacion);
    }

    this.cdr.detectChanges();
  }
}

