import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SupabaseService } from '../../../../supabase/supabase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status.component.html',
})
export class StatusComponent implements OnInit {
  documentos: any[] = [];

  constructor(
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const { data } = await this.supabase.client.auth.getSession();
    const uid = data.session?.user?.id;
    if (uid) await this.loadDocs(uid);

    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      const newUid = session?.user?.id;
      if (newUid && this.documentos.length === 0) this.loadDocs(newUid);
    });
  }

  async loadDocs(uid: string) {
    const { data } = await this.supabase.client
      .from('documentos_subidos')
      .select('*')
      .eq('uid_usuario', uid);

    if (data) this.documentos = data;
    this.cdr.detectChanges();
  }
}
