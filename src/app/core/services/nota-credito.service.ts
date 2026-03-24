import { Injectable, signal, computed } from '@angular/core';
import {
  NotaCredito,
  AplicacionNotaCredito,
  EstadoNotaCredito,
  OrigenNotaCredito,
} from '../models/nota-credito.model';

// ──── Mock Data ────────────────────────────────────────────────

const MOCK_NOTAS: NotaCredito[] = [
  {
    id: 'nc-001',
    numero: 'NC-2026-001',
    socioId: 'socio-2',
    nombreSocio: 'López, Ana',
    origen: 'recuperacion_diferida',
    origenId: 'rec-003',
    descripcionOrigen: 'Recuperación diferida — Karate Niños Blanco (sesión 25/03/2026)',
    monto: 6.75,
    saldoDisponible: 6.75,
    estado: 'activa',
    fechaEmision: '2026-03-20',
    aplicaciones: [],
  },
  {
    id: 'nc-002',
    numero: 'NC-2026-002',
    socioId: 'socio-2',
    nombreSocio: 'López, Ana',
    origen: 'retiro_parcial',
    origenId: 'ret-001',
    descripcionOrigen: 'Retiro Parcial — Karate Infantil (4 de 16 sesiones tomadas)',
    monto: 66,
    saldoDisponible: 66,
    estado: 'activa',
    fechaEmision: '2026-03-08',
    aplicaciones: [],
  },
];

// ──── Servicio ─────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class NotaCreditoService {
  private _counter = 3;
  private readonly _notas = signal<NotaCredito[]>(MOCK_NOTAS);

  readonly notas = this._notas.asReadonly();

  readonly totalActivas = computed(
    () =>
      this._notas().filter(
        (nc) => nc.estado === 'activa' || nc.estado === 'aplicada_parcial',
      ).length,
  );

  readonly saldoTotalDisponible = computed(() =>
    this._notas()
      .filter((nc) => nc.estado === 'activa' || nc.estado === 'aplicada_parcial')
      .reduce((acc, nc) => acc + nc.saldoDisponible, 0),
  );

  getById(id: string): NotaCredito | undefined {
    return this._notas().find((nc) => nc.id === id);
  }

  getNotasBySocio(socioId: string): NotaCredito[] {
    return this._notas().filter((nc) => nc.socioId === socioId);
  }

  crear(data: {
    socioId: string;
    nombreSocio: string;
    origen: OrigenNotaCredito;
    origenId: string;
    descripcionOrigen: string;
    monto: number;
    observaciones?: string;
  }): NotaCredito {
    const numero = `NC-2026-${String(this._counter++).padStart(3, '0')}`;
    const nueva: NotaCredito = {
      id: `nc-${Date.now()}`,
      numero,
      ...data,
      saldoDisponible: data.monto,
      estado: 'activa',
      fechaEmision: new Date().toISOString().slice(0, 10),
      aplicaciones: [],
    };
    this._notas.update((list) => [...list, nueva]);
    return nueva;
  }

  aplicar(ncId: string, aplicacion: Omit<AplicacionNotaCredito, 'id'>): void {
    this._notas.update((list) =>
      list.map((nc) => {
        if (nc.id !== ncId) return nc;
        const nuevoSaldo = Number((nc.saldoDisponible - aplicacion.monto).toFixed(2));
        const nuevaAplicacion: AplicacionNotaCredito = {
          ...aplicacion,
          id: `aplic-${Date.now()}`,
        };
        const estado: EstadoNotaCredito = nuevoSaldo <= 0 ? 'aplicada_total' : 'aplicada_parcial';
        return {
          ...nc,
          saldoDisponible: Math.max(nuevoSaldo, 0),
          estado,
          aplicaciones: [...nc.aplicaciones, nuevaAplicacion],
        };
      }),
    );
  }

  anular(id: string): void {
    this._notas.update((list) =>
      list.map((nc) => (nc.id === id ? { ...nc, estado: 'anulada' as EstadoNotaCredito } : nc)),
    );
  }
}
