import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StudentMenuComponent } from '../../shared/components/student-menu/student-menu.component';
import { RouterOutlet } from '@angular/router';
import { NotificationBannerComponent } from '../../shared/components/notifications-banner/notifications.banner.component';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, StudentMenuComponent, NotificationBannerComponent, RouterOutlet],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent { }
