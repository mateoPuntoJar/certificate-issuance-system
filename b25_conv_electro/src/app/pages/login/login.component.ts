import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LogInComponent } from "../../components/login/log-in/log-in.component";
import { CheckInComponent } from "../../components/login/check-in/check-in.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LogInComponent, CheckInComponent],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent { }
