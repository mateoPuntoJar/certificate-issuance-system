import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { StudentMenuComponent } from '../../shared/components/student-menu/student-menu.component';
import { AdminComponent, User } from '../../components/dashboard/admin/admin.component';
import { AdminMenuComponent } from "../../shared/components/admin-menu/admin-menu.component";
import { RouterOutlet } from '@angular/router';
import { NotificationBannerComponent } from '../../shared/components/notifications-banner/notifications.banner.component';
import { AuthService } from '../../supabase/auth.service';
import { Router } from 'express';
import { get } from 'http';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, StudentMenuComponent, AdminComponent, AdminMenuComponent, NotificationBannerComponent,RouterOutlet],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})


export class DashboardComponent  implements OnInit{ 
  constructor(public authService : AuthService){}
  ngOnInit(): void {
    this.getRol();
  }
  
  rol : string = ""
  
  
  async getRol(){
    this.rol = await this.authService.userRol
    return this.rol
  }
  

  estudiantes: User[] = [
  ];

}