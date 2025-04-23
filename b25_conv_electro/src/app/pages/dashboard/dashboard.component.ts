import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StudentMenuComponent } from '../../shared/components/student-menu/student-menu.component';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, StudentMenuComponent],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent { }
