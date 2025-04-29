import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StudentMenuComponent } from '../../shared/components/student-menu/student-menu.component';
import { AdminComponent, User } from '../../components/dashboard/admin/admin.component';
import { AdminMenuComponent } from "../../shared/components/admin-menu/admin-menu.component";
import { NotificationBannerComponent } from '../../shared/components/notifications-banner/notifications.banner.component';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, StudentMenuComponent, AdminComponent, AdminMenuComponent, NotificationBannerComponent,],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent { 
  estudiantes: User[] = [
  ];
}