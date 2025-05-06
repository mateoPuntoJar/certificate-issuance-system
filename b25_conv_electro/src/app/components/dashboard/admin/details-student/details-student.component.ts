import { Component, OnInit } from '@angular/core';
import { User } from '../../../dashboard/admin/admin.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-details-student',
  imports: [],
  templateUrl: './details-student.component.html',
})
export class DetailsStudentComponent  {
  idRec: string = "";
  seleccion?: User; // Inicialmente undefined


  constructor(private route: ActivatedRoute) {}

}
