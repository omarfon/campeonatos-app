import { Injectable, signal } from '@angular/core';
import { Sede, Campo } from '../models/sede.model';

const MOCK_SEDES: Sede[] = [
  {
    id: 'sede-1',
    nombre: 'Complejo Deportivo Central',
    direccion: 'Av. Principal 1200',
    telefono: '011-4555-1234',
    email: 'central@deportes.com',
    estado: 'activa',
    campos: [
      { id: 'campo-1', sedeId: 'sede-1', nombre: 'Cancha Principal', disciplinaIds: ['disc-futbol'], capacidad: 500, superficie: 'césped natural' },
      { id: 'campo-2', sedeId: 'sede-1', nombre: 'Cancha Auxiliar', disciplinaIds: ['disc-futbol'], capacidad: 200, superficie: 'césped sintético' },
      { id: 'campo-3', sedeId: 'sede-1', nombre: 'Cancha de Vóley', disciplinaIds: ['disc-voley'], capacidad: 150, superficie: 'arena' },
    ],
  },
  {
    id: 'sede-2',
    nombre: 'Polideportivo Norte',
    direccion: 'Calle Norte 450',
    telefono: '011-4555-5678',
    estado: 'activa',
    campos: [
      { id: 'campo-4', sedeId: 'sede-2', nombre: 'Campo Norte 1', disciplinaIds: ['disc-futbol', 'disc-basquet'], capacidad: 300 },
    ],
  },
  {
    id: 'sede-3',
    nombre: 'Estadio Sur',
    direccion: 'Av. del Sur 890',
    estado: 'en_mantenimiento',
    campos: [],
  },
];

@Injectable({ providedIn: 'root' })
export class SedeService {
  private readonly _items = signal<Sede[]>(MOCK_SEDES);
  readonly items = this._items.asReadonly();

  getById(id: string): Sede | undefined {
    return this._items().find((s) => s.id === id);
  }

  getCampoById(id: string): Campo | undefined {
    for (const sede of this._items()) {
      const campo = sede.campos.find((c) => c.id === id);
      if (campo) return campo;
    }
    return undefined;
  }

  getCamposBySede(sedeId: string): Campo[] {
    return this.getById(sedeId)?.campos ?? [];
  }

  getCamposByDisciplina(disciplinaId: string): Campo[] {
    return this._items().flatMap((s) =>
      s.campos.filter((c) => c.disciplinaIds.includes(disciplinaId))
    );
  }

  create(item: Omit<Sede, 'id' | 'campos'>): void {
    this._items.update((items) => [
      ...items,
      { ...item, id: crypto.randomUUID(), campos: [] },
    ]);
  }

  update(id: string, changes: Partial<Omit<Sede, 'campos'>>): void {
    this._items.update((items) =>
      items.map((i) => (i.id === id ? { ...i, ...changes } : i))
    );
  }

  delete(id: string): void {
    this._items.update((items) => items.filter((i) => i.id !== id));
  }

  addCampo(sedeId: string, campo: Omit<Campo, 'id' | 'sedeId'>): void {
    const newCampo: Campo = { ...campo, id: crypto.randomUUID(), sedeId };
    this._items.update((items) =>
      items.map((s) =>
        s.id === sedeId ? { ...s, campos: [...s.campos, newCampo] } : s
      )
    );
  }

  updateCampo(sedeId: string, campoId: string, changes: Partial<Campo>): void {
    this._items.update((items) =>
      items.map((s) =>
        s.id === sedeId
          ? { ...s, campos: s.campos.map((c) => (c.id === campoId ? { ...c, ...changes } : c)) }
          : s
      )
    );
  }

  removeCampo(sedeId: string, campoId: string): void {
    this._items.update((items) =>
      items.map((s) =>
        s.id === sedeId
          ? { ...s, campos: s.campos.filter((c) => c.id !== campoId) }
          : s
      )
    );
  }
}
