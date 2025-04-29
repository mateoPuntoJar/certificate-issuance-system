import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { ProfileComponent } from './components/dashboard/student/profile/profile.component';
import { StatusComponent } from './components/dashboard/student/status/status.component';
import { FormComponent } from './components/dashboard/student/form/form.component';

export const routes: Routes = [

  {
    path: '',
    component: LoginComponent,
  },

  {
    path: 'dashboard',
    component: DashboardComponent,
  },

  {
    path: 'notifications',
    component: NotificationsComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },


];
