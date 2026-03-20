import { Injectable, signal } from '@angular/core';
import { Socio } from '../models/socio.model';

const MOCK_SOCIOS: Socio[] = [
  {
    id: 'socio-1',
    nombre: 'Carlos',
    apellido: 'García',
    dni: '30123456',
    email: 'carlos.garcia@email.com',
    telefono: '011-4555-0001',
    fechaNacimiento: '1990-05-15',
    direccion: 'Calle Falsa 123',
    estado: 'activo',
    fechaAlta: '2024-01-10',
  },
  {
    id: 'socio-2',
    nombre: 'María',
    apellido: 'López',
    dni: '31234567',
    email: 'maria.lopez@email.com',
    telefono: '011-4555-0002',
    fechaNacimiento: '1988-11-22',
    estado: 'activo',
    fechaAlta: '2024-02-05',
  },
  {
    id: 'socio-3',
    nombre: 'Roberto',
    apellido: 'Martínez',
    dni: '32345678',
    email: 'r.martinez@email.com',
    estado: 'suspendido',
    fechaAlta: '2023-06-20',
    observaciones: 'Suspendido por falta de pago',
  },
  {
    id: 'socio-4',
    nombre: 'Ana',
    apellido: 'Fernández',
    dni: '33456789',
    telefono: '011-4555-0004',
    estado: 'inactivo',
    fechaAlta: '2023-01-15',
    fechaBaja: '2024-12-01',
  },
];

@Injectable({ providedIn: 'root' })
export class SocioService {
  private readonly _items = signal<Socio[]>(MOCK_SOCIOS);
  readonly items = this._items.asReadonly();

  getById(id: string): Socio | undefined {
    return this._items().find((s) => s.id === id);
  }

  create(item: Omit<Socio, 'id'>): void {
    this._items.update((items) => [...items, { ...item, id: crypto.randomUUID() }]);
  }

  update(id: string, changes: Partial<Socio>): void {
    this._items.update((items) =>
      items.map((i) => (i.id === id ? { ...i, ...changes } : i))
    );
  }

  delete(id: string): void {
    this._items.update((items) => items.filter((i) => i.id !== id));
  }
}
