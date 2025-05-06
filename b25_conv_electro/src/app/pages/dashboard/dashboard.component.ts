import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { StudentMenuComponent } from '../../shared/components/student-menu/student-menu.component';
import { AdminMenuComponent } from "../../shared/components/admin-menu/admin-menu.component";
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../supabase/auth.service';


@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, StudentMenuComponent, AdminMenuComponent, RouterOutlet],
  templateUrl: './dashboard.component.html',
})


export class DashboardComponent implements OnInit {
  constructor(public authService: AuthService) { }
  ngOnInit(): void {
    this.getRol();
  }

  rol: string = ""


  getRol() {
    return this.rol = this.authService.userRol;
  }
}
