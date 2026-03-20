import { Injectable, signal } from '@angular/core';
import { Area } from '../models/area.model';

const MOCK_AREAS: Area[] = [
  {
    id: 'area-1',
    nombre: 'Cancha Principal',
    tipo: 'cancha_futbol',
    sedeId: 'sede-1',
    descripcion: 'Cancha de fútbol 11 con césped natural',
    superficie: 'césped natural',
    capacidad: 500,
    dimensiones: '105m x 68m',
    techada: false,
    iluminacion: true,
    estado: 'disponible',
  },
  {
    id: 'area-2',
    nombre: 'Cancha de Vóley',
    tipo: 'cancha_voley',
    sedeId: 'sede-1',
    descripcion: 'Cancha de vóley de arena',
    superficie: 'arena',
    capacidad: 150,
    dimensiones: '18m x 9m',
    techada: false,
    iluminacion: true,
    estado: 'disponible',
  },
  {
    id: 'area-3',
    nombre: 'Piscina Olímpica',
    tipo: 'piscina',
    sedeId: 'sede-2',
    descripcion: 'Piscina de 50 metros con 8 carriles',
    dimensiones: '50m x 25m',
    capacidad: 200,
    techada: true,
    iluminacion: true,
    estado: 'disponible',
  },
  {
    id: 'area-4',
    nombre: 'Pista de Atletismo',
    tipo: 'pista_atletismo',
    sedeId: 'sede-1',
    descripcion: 'Pista sintética de 400 metros',
    superficie: 'tartán sintético',
    dimensiones: '400m',
    techada: false,
    iluminacion: false,
    estado: 'en_mantenimiento',
  },
  {
    id: 'area-5',
    nombre: 'Gimnasio Central',
    tipo: 'gimnasio',
    sedeId: 'sede-2',
    descripcion: 'Gimnasio cubierto multiuso',
    capacidad: 100,
    techada: true,
    iluminacion: true,
    estado: 'disponible',
  },
];

@Injectable({ providedIn: 'root' })
export class AreaService {
  private readonly _items = signal<Area[]>(MOCK_AREAS);
  readonly items = this._items.asReadonly();

  getById(id: string): Area | undefined {
    return this._items().find((a) => a.id === id);
  }

  create(item: Omit<Area, 'id'>): void {
    this._items.update((items) => [...items, { ...item, id: crypto.randomUUID() }]);
  }

  update(id: string, changes: Partial<Area>): void {
    this._items.update((items) =>
      items.map((i) => (i.id === id ? { ...i, ...changes } : i))
    );
  }

  delete(id: string): void {
    this._items.update((items) => items.filter((i) => i.id !== id));
  }
}
