import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-status',
  imports: [CommonModule],
  templateUrl: './status.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusComponent {
  status: 'enviado' | 'pendiente' | 'aprobado' | 'suspendido' = 'enviado';
  comentarioAdmin: string = 'Por favor, adjunta también tu certificado de manipulador de alimentos.';
}
