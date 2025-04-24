import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  nombre = 'Marta García López';
  email = 'usuario@medac.com';
}
