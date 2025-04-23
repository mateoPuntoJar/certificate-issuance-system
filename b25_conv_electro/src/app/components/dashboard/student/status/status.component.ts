import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-status',
  imports: [],
  templateUrl: './status.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusComponent { }
