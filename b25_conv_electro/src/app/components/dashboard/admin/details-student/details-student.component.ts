import { Component, OnInit } from '@angular/core';
import { User } from '../dashboard/admin/admin.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-details-student',
  imports: [],
  templateUrl: './details-student.component.html',
  styleUrl: './details-student.component.css'
})
export class DetailsStudentComponent implements OnInit {
  idRec: string = "";
  seleccion?: User; // Inicialmente undefined

  estudiantes: User[] = [
    {
      id: 1,
      name: "Laura García",
      email: "laura.garcia@email.com",
      estado: "Activo",
      locacion: "Madrid"
    },
    {
      id: 2,
      name: "Carlos Pérez",
      email: "carlos.perez@email.com",
      estado: "Inactivo",
      locacion: "Barcelona"
    },
    {
      id: 3,
      name: "Ana Martínez",
      email: "ana.martinez@email.com",
      estado: "Activo",
      locacion: "Valencia"
    },
    {
      id: 4,
      name: "Jorge López",
      email: "jorge.lopez@email.com",
      estado: "Activo",
      locacion: "Sevilla"
    },
    {
      id: 5,
      name: "Lucía Fernández",
      email: "lucia.fernandez@email.com",
      estado: "Inactivo",
      locacion: "Bilbao"
    }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.idRec = params.get('id') || '';
      
      if (this.idRec) {
        const id = parseInt(this.idRec);
        // Buscar el estudiante por id, no por índice
        this.seleccion = this.estudiantes.find(est => est.id === id);
        
        if (!this.seleccion) {
          console.error(`Estudiante con ID ${id} no encontrado`);
        }
      }
    });
  }
}