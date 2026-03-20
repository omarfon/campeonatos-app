import { Injectable, signal } from '@angular/core';
import { Resultado, GolesDetalle } from '../models/resultado.model';

const MOCK_RESULTADOS: Resultado[] = [
  {
    id: 'res-1',
    encuentroId: 'enc-1',
    golesLocal: 2,
    golesVisitante: 1,
    tiempoExtra: false,
    estado: 'oficial',
    observaciones: 'Partido sin incidentes',
  },
  {
    id: 'res-2',
    encuentroId: 'enc-2',
    golesLocal: 0,
    golesVisitante: 0,
    tiempoExtra: false,
    estado: 'oficial',
  },
];

const MOCK_GOLES: GolesDetalle[] = [
  { id: 'g-1', resultadoId: 'res-1', participanteId: 'p-2', equipoId: 'eq-1', minuto: 23, tipo: 'normal' },
  { id: 'g-2', resultadoId: 'res-1', participanteId: 'p-1', equipoId: 'eq-1', minuto: 67, tipo: 'tiro_libre' },
  { id: 'g-3', resultadoId: 'res-1', participanteId: 'p-4', equipoId: 'eq-2', minuto: 45, tipo: 'penal' },
];

@Injectable({ providedIn: 'root' })
export class ResultadoService {
  private readonly _resultados = signal<Resultado[]>(MOCK_RESULTADOS);
  private readonly _goles = signal<GolesDetalle[]>(MOCK_GOLES);

  readonly resultados = this._resultados.asReadonly();
  readonly goles = this._goles.asReadonly();

  getByEncuentro(encuentroId: string): Resultado | undefined {
    return this._resultados().find((r) => r.encuentroId === encuentroId);
  }

  getById(id: string): Resultado | undefined {
    return this._resultados().find((r) => r.id === id);
  }

  getGolesByResultado(resultadoId: string): GolesDetalle[] {
    return this._goles().filter((g) => g.resultadoId === resultadoId);
  }

  create(item: Omit<Resultado, 'id'>): void {
    this._resultados.update((items) => [...items, { ...item, id: crypto.randomUUID() }]);
  }

  update(id: string, changes: Partial<Resultado>): void {
    this._resultados.update((items) =>
      items.map((i) => (i.id === id ? { ...i, ...changes } : i))
    );
  }

  cerrarPartido(id: string, cerradoPor: string): void {
    this.update(id, {
      estado: 'cerrado',
      fechaCierre: new Date().toISOString(),
      cerradoPor,
    });
  }

  addGol(gol: Omit<GolesDetalle, 'id'>): void {
    this._goles.update((items) => [...items, { ...gol, id: crypto.randomUUID() }]);
  }

  removeGol(id: string): void {
    this._goles.update((items) => items.filter((g) => g.id !== id));
  }
}
