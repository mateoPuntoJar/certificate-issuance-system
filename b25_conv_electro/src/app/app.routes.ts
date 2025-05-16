import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { ProfileComponent } from './components/dashboard/student/profile/profile.component';
import { StatusComponent } from './components/dashboard/student/status/status.component';
import { FormComponent } from './components/dashboard/student/form/form.component';
import { AdminComponent } from './components/dashboard/admin/admin.component';
import { LoginGuard } from './guards/login.guard';
import { DashboardGuard } from './guards/dashboard.guard';
import { RegisterUserFormComponent } from './components/dashboard/admin/register-user-form/register-user-form.component';
import { RegisterCenterFormComponent } from './components/dashboard/admin/register-center-form/register-center-form.component';
import { RegisterGuestFormComponent } from './components/dashboard/student/register-guest-form/register-guest-form.component';

export const routes: Routes = [
  {
    path: '',
    canActivate: [LoginGuard],
    component: LoginComponent,
  },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [DashboardGuard],
    canActivateChild: [DashboardGuard],
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', component: ProfileComponent },
      { path: 'form', component: FormComponent },
      { path: 'status', component: StatusComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'admin', component: AdminComponent },
      { path: 'registrar-centro', component: RegisterCenterFormComponent },
      { path: 'registrar-usuario', component: RegisterUserFormComponent },
    ],
  },
  {
    path: 'register-guest',
    component: RegisterGuestFormComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
