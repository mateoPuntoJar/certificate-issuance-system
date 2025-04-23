import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-student',
  imports: [],
  templateUrl: './student.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentComponent { }
