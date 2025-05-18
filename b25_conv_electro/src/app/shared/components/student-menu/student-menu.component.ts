import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { RouterLink, RouterModule, Router } from '@angular/router';
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
    private supabase: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    // Verificar si hay sesión al iniciar el componente
    this.supabase.client.auth.getSession().then(({ data, error }) => {
      if (!data.session) {
        this.router.navigate(['']);
      }
    });

    // Escuchar los cambios de sesión
    this.supabase.client.auth.onAuthStateChange((event, session) => {
      if (!session) {
        this.router.navigate(['']);
      }
    });

    const { data } = await this.supabase.client.auth.getUser();
    const uid = data?.user?.id;
    if (!uid) return;

    const { data: notifs } = await this.supabase.client
      .from('notificaciones')
      .select('leido')
      .eq('uid_usuario', uid);

    this.notificacionesPendientes = notifs?.filter(n => !n.leido).length || 0;
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    try {
      await this.authService.signOut();
    } catch (error: any) {
      // Error ignorado, no se interrumpe el flujo aunque ocurra un error al cerrar sesión
    }
  }
}
