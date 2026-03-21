import { Injectable, signal, computed } from '@angular/core';
import { Tarjeta, Sancion, ResolucionComision } from '../models/sancion.model';

const MOCK_TARJETAS: Tarjeta[] = [
  { id: 't-1', encuentroId: 'enc-1', participanteId: 'p-4', equipoId: 'eq-2', tipo: 'amarilla', minuto: 30, motivo: 'Falta táctica' },
  { id: 't-2', encuentroId: 'enc-1', participanteId: 'p-6', equipoId: 'eq-2', tipo: 'roja_directa', minuto: 55, motivo: 'Agresión a rival' },
  { id: 't-3', encuentroId: 'enc-1', participanteId: 'p-1', equipoId: 'eq-1', tipo: 'amarilla', minuto: 70, motivo: 'Juego brusco' },
  { id: 't-4', encuentroId: 'enc-2', participanteId: 'p-124', equipoId: 'eq-3', tipo: 'amarilla', minuto: 25, motivo: 'Falta táctica' },
  { id: 't-5', encuentroId: 'enc-2', participanteId: 'p-124', equipoId: 'eq-3', tipo: 'doble_amarilla', minuto: 68, motivo: 'Reiteración de faltas' },
];

const MOCK_SANCIONES: Sancion[] = [
  {
    id: 's-1',
    participanteId: 'p-6',
    equipoId: 'eq-2',
    competenciaId: 'camp-1',
    tipo: 'deportiva',
    estado: 'activa',
    descripcion: 'Suspensión por roja directa - agresión',
    fechasInhabilitacion: 3,
    fechaInicio: '2026-03-16',
    fechaFin: '2026-04-05',
    tarjetaIds: ['t-2'],
  },
  {
    id: 's-2',
    participanteId: 'p-124',
    equipoId: 'eq-3',
    competenciaId: 'camp-1',
    tipo: 'deportiva',
    estado: 'activa',
    descripcion: 'Suspensión por doble amarilla',
    fechasInhabilitacion: 1,
    fechaInicio: '2026-03-16',
    fechaFin: '2026-03-22',
    tarjetaIds: ['t-4', 't-5'],
  },
];

const MOCK_RESOLUCIONES: ResolucionComision[] = [];

@Injectable({ providedIn: 'root' })
export class SancionService {
  private readonly _tarjetas = signal<Tarjeta[]>(MOCK_TARJETAS);
  private readonly _sanciones = signal<Sancion[]>(MOCK_SANCIONES);
  private readonly _resoluciones = signal<ResolucionComision[]>(MOCK_RESOLUCIONES);

  readonly tarjetas = this._tarjetas.asReadonly();
  readonly sanciones = this._sanciones.asReadonly();
  readonly resoluciones = this._resoluciones.asReadonly();

  readonly sancionesActivas = computed(() =>
    this._sanciones().filter((s) => s.estado === 'activa')
  );

  getTarjetasByEncuentro(encuentroId: string): Tarjeta[] {
    return this._tarjetas().filter((t) => t.encuentroId === encuentroId);
  }

  getTarjetasByParticipante(participanteId: string): Tarjeta[] {
    return this._tarjetas().filter((t) => t.participanteId === participanteId);
  }

  getSancionesByParticipante(participanteId: string): Sancion[] {
    return this._sanciones().filter((s) => s.participanteId === participanteId);
  }

  getSancionesByCompetencia(competenciaId: string): Sancion[] {
    return this._sanciones().filter((s) => s.competenciaId === competenciaId);
  }

  addTarjeta(tarjeta: Omit<Tarjeta, 'id'>): void {
    this._tarjetas.update((items) => [...items, { ...tarjeta, id: crypto.randomUUID() }]);
  }

  createSancion(sancion: Omit<Sancion, 'id'>): void {
    this._sanciones.update((items) => [...items, { ...sancion, id: crypto.randomUUID() }]);
  }

  updateSancion(id: string, changes: Partial<Sancion>): void {
    this._sanciones.update((items) =>
      items.map((s) => (s.id === id ? { ...s, ...changes } : s))
    );
  }

  addResolucion(resolucion: Omit<ResolucionComision, 'id'>): void {
    const newRes: ResolucionComision = { ...resolucion, id: crypto.randomUUID() };
    this._resoluciones.update((items) => [...items, newRes]);

    const sancion = this._sanciones().find((s) => s.id === resolucion.sancionId);
    if (sancion) {
      const estadoMap: Record<string, Sancion['estado']> = {
        confirmada: 'activa',
        reducida: 'activa',
        revocada: 'revocada',
        ampliada: 'activa',
      };
      this.updateSancion(resolucion.sancionId, {
        estado: estadoMap[resolucion.dictamen] ?? sancion.estado,
      });
    }
  }

  getResolucionesBySancion(sancionId: string): ResolucionComision[] {
    return this._resoluciones().filter((r) => r.sancionId === sancionId);
  }

  contarAmarillasByParticipante(participanteId: string): number {
    return this._tarjetas().filter(
      (t) => t.participanteId === participanteId && t.tipo === 'amarilla'
    ).length;
  }

  contarRojasByParticipante(participanteId: string): number {
    return this._tarjetas().filter(
      (t) => t.participanteId === participanteId && (t.tipo === 'roja_directa' || t.tipo === 'doble_amarilla')
    ).length;
  }
}
