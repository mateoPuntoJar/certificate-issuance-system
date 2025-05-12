import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CentroService {
  private centrosSource = new BehaviorSubject<string[]>([]);
  centros$ = this.centrosSource.asObservable();

  private seleccionSource = new BehaviorSubject<string[]>([]);
  seleccion$ = this.seleccionSource.asObservable();

  setCentros(centros: string[]) {
    this.centrosSource.next(centros);
  }

  setSeleccion(seleccion: string[]) {
    this.seleccionSource.next(seleccion);
  }
}
