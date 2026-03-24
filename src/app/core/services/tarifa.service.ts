import { Injectable, inject, signal, computed } from '@angular/core';
import {
  Tarifa,
  CampanaPromo,
  CondicionCliente,
  ResultadoCalculo,
} from '../models/tarifa.model';
import { AcademiaService } from './academia.service';

// ──── Mock: Tarifas base ────

const MOCK_TARIFAS: Tarifa[] = [
  // ── Tenis de Mesa ──
  {
    id: 'tar-001',
    nombre: 'Tenis de Mesa · 2x/sem · Socio',
    cursoId: 'cur-tenis-mesa',
    frecuenciaSemanal: 2,
    condicionCliente: 'socio',
    monto: 120,
    montoMatricula: 30,
    vigente: true,
    prioridad: 10,
    creadoEn: '2026-01-10',
  },
  {
    id: 'tar-002',
    nombre: 'Tenis de Mesa · 2x/sem · No Socio',
    cursoId: 'cur-tenis-mesa',
    frecuenciaSemanal: 2,
    condicionCliente: 'no_socio',
    monto: 180,
    montoMatricula: 30,
    vigente: true,
    prioridad: 10,
    creadoEn: '2026-01-10',
  },
  {
    id: 'tar-003',
    nombre: 'Tenis de Mesa · 3x/sem · Socio',
    cursoId: 'cur-tenis-mesa',
    frecuenciaSemanal: 3,
    condicionCliente: 'socio',
    monto: 150,
    montoMatricula: 30,
    vigente: true,
    prioridad: 10,
    creadoEn: '2026-01-10',
  },
  {
    id: 'tar-004',
    nombre: 'Tenis de Mesa · 3x/sem · No Socio',
    cursoId: 'cur-tenis-mesa',
    frecuenciaSemanal: 3,
    condicionCliente: 'no_socio',
    monto: 220,
    montoMatricula: 30,
    vigente: true,
    prioridad: 10,
    creadoEn: '2026-01-10',
  },
  // ── Natación ──
  {
    id: 'tar-005',
    nombre: 'Natación · Cualquier frec. · Socio',
    cursoId: 'cur-natacion',
    condicionCliente: 'socio',
    monto: 140,
    montoMatricula: 25,
    vigente: true,
    prioridad: 8,
    creadoEn: '2026-01-10',
  },
  {
    id: 'tar-006',
    nombre: 'Natación · Cualquier frec. · No Socio',
    cursoId: 'cur-natacion',
    condicionCliente: 'no_socio',
    monto: 200,
    montoMatricula: 25,
    vigente: true,
    prioridad: 8,
    creadoEn: '2026-01-10',
  },
  // ── Regla general por defecto (fallback) ──
  {
    id: 'tar-099',
    nombre: 'Tarifa General · Socio (fallback)',
    condicionCliente: 'socio',
    monto: 100,
    vigente: true,
    prioridad: 1,
    observaciones: 'Regla de último recurso para socios sin tarifa específica.',
    creadoEn: '2026-01-01',
  },
  {
    id: 'tar-100',
    nombre: 'Tarifa General · No Socio (fallback)',
    condicionCliente: 'no_socio',
    monto: 160,
    vigente: true,
    prioridad: 1,
    observaciones: 'Regla de último recurso para no socios sin tarifa específica.',
    creadoEn: '2026-01-01',
  },
];

// ──── Mock: Campañas Promo ────

const MOCK_CAMPANAS: CampanaPromo[] = [
  {
    id: 'camp-001',
    nombre: 'Campaña Verano 2026',
    descripcion: 'Precio especial de verano para todos los cursos durante febrero.',
    fechaInicio: '2026-02-01',
    fechaFin: '2026-02-28',
    tarifaIds: ['tar-001', 'tar-005'],
    montoPromo: 90,
    activa: false, // ya venció
    creadoEn: '2026-01-20',
  },
  {
    id: 'camp-002',
    nombre: 'Campaña Mes de la Madre – Natación',
    descripcion: 'Precio especial en Natación durante mayo.',
    fechaInicio: '2026-05-01',
    fechaFin: '2026-05-31',
    tarifaIds: ['tar-005', 'tar-006'],
    montoPromo: 120,
    condicionCliente: undefined,
    activa: true,
    creadoEn: '2026-03-01',
  },
];

let _nextTarifaNum = MOCK_TARIFAS.length + 1;
let _nextCampanaNum = MOCK_CAMPANAS.length + 1;

@Injectable({ providedIn: 'root' })
export class TarifaService {
  private readonly academiaService = inject(AcademiaService);

  private readonly _tarifas = signal<Tarifa[]>(MOCK_TARIFAS);
  private readonly _campanas = signal<CampanaPromo[]>(MOCK_CAMPANAS);

  readonly tarifas = this._tarifas.asReadonly();
  readonly campanas = this._campanas.asReadonly();

  readonly tarifasVigentes = computed(() =>
    this._tarifas().filter((t) => t.vigente).sort((a, b) => b.prioridad - a.prioridad),
  );

  readonly campanasActivas = computed(() => {
    const hoy = new Date().toISOString().slice(0, 10);
    return this._campanas().filter(
      (c) => c.activa && c.fechaInicio <= hoy && c.fechaFin >= hoy,
    );
  });

  // ──── CRUD Tarifas ────

  crearTarifa(data: Omit<Tarifa, 'id' | 'creadoEn'>): Tarifa {
    const nueva: Tarifa = {
      ...data,
      id: `tar-${String(_nextTarifaNum++).padStart(3, '0')}`,
      creadoEn: new Date().toISOString().slice(0, 10),
    };
    this._tarifas.update((t) => [...t, nueva]);
    return nueva;
  }

  actualizarTarifa(id: string, changes: Partial<Tarifa>): void {
    this._tarifas.update((ts) =>
      ts.map((t) => (t.id === id ? { ...t, ...changes } : t)),
    );
  }

  toggleVigencia(id: string): void {
    this._tarifas.update((ts) =>
      ts.map((t) => (t.id === id ? { ...t, vigente: !t.vigente } : t)),
    );
  }

  // ──── CRUD Campañas ────

  crearCampana(data: Omit<CampanaPromo, 'id' | 'creadoEn'>): CampanaPromo {
    const nueva: CampanaPromo = {
      ...data,
      id: `camp-${String(_nextCampanaNum++).padStart(3, '0')}`,
      creadoEn: new Date().toISOString().slice(0, 10),
    };
    this._campanas.update((c) => [...c, nueva]);
    return nueva;
  }

  actualizarCampana(id: string, changes: Partial<CampanaPromo>): void {
    this._campanas.update((cs) =>
      cs.map((c) => (c.id === id ? { ...c, ...changes } : c)),
    );
  }

  // ──── Motor de Match ────

  /**
   * Calcula el precio exacto para una clase + condición de cliente.
   * Selecciona la tarifa más específica vigente (mayor prioridad) y luego
   * la campaña activa que apliqua.
   */
  calcularPrecio(
    claseId: string,
    condicion: CondicionCliente,
    hoy?: string,
  ): ResultadoCalculo {
    const fecha = hoy ?? new Date().toISOString().slice(0, 10);
    const clase = this.academiaService.getClaseById(claseId);

    const tarifaMatch = this._buscarTarifa(
      clase?.cursoId,
      clase?.categoriaEdadId,
      clase?.frecuenciaSemanal,
      condicion,
    );

    if (!tarifaMatch) {
      return {
        tarifaAplicada: null,
        campanaAplicada: null,
        montoBase: 0,
        montoPromo: null,
        montoCobrar: 0,
        montoMatricula: 0,
        campanaDesplazada: false,
      };
    }

    const campana = this._buscarCampana(tarifaMatch, fecha);
    const montoBase = tarifaMatch.monto;
    const montoPromo = campana ? campana.montoPromo : null;

    return {
      tarifaAplicada: tarifaMatch,
      campanaAplicada: campana,
      montoBase,
      montoPromo,
      montoCobrar: montoPromo !== null ? montoPromo : montoBase,
      montoMatricula: tarifaMatch.montoMatricula ?? 0,
      campanaDesplazada: false,
    };
  }

  /** Aplica el descuento de un convenio sobre el resultado base */
  aplicarConvenio(
    base: ResultadoCalculo,
    tipo: 'descuento_porcentaje' | 'tarifa_neta' | 'tarifa_socio',
    valor: number,
    acumularConCampana: boolean,
  ): ResultadoCalculo {
    let montoCobrar: number;
    let campanaDesplazada = false;

    if (tipo === 'descuento_porcentaje') {
      montoCobrar = +(base.montoBase * (1 - valor / 100)).toFixed(2);
    } else if (tipo === 'tarifa_neta') {
      montoCobrar = valor;
    } else {
      // tarifa_socio: buscar tarifa equivalente pero condicion='socio'
      montoCobrar = base.montoBase; // simplificación — motor real haría re-match
    }

    // Determinar qué es mejor para el alumno si no acumula
    if (!acumularConCampana && base.campanaAplicada) {
      const montoConCampana = base.montoPromo!;
      if (montoConCampana <= montoCobrar) {
        // Campaña es mejor o igual → la campaña gana, convenio no aplica
        return base;
      } else {
        // Convenio es mejor → descartamos campaña
        campanaDesplazada = true;
      }
    }

    return {
      ...base,
      montoCobrar,
      campanaDesplazada,
    };
  }

  // ──── Privados ────

  private _buscarTarifa(
    cursoId: string | undefined,
    categoriaEdadId: string | undefined,
    frecuenciaSemanal: number | undefined,
    condicion: CondicionCliente,
  ): Tarifa | null {
    const candidatas = this._tarifas()
      .filter((t) => t.vigente && t.condicionCliente === condicion)
      .filter(
        (t) =>
          (t.cursoId === undefined || t.cursoId === cursoId) &&
          (t.categoriaEdadId === undefined || t.categoriaEdadId === categoriaEdadId) &&
          (t.frecuenciaSemanal === undefined || t.frecuenciaSemanal === frecuenciaSemanal),
      )
      .sort((a, b) => b.prioridad - a.prioridad);

    return candidatas[0] ?? null;
  }

  private _buscarCampana(tarifa: Tarifa, fecha: string): CampanaPromo | null {
    const activas = this._campanas().filter(
      (c) =>
        c.activa &&
        c.fechaInicio <= fecha &&
        c.fechaFin >= fecha &&
        (c.tarifaIds.length === 0 || c.tarifaIds.includes(tarifa.id)) &&
        (c.condicionCliente === undefined ||
          c.condicionCliente === tarifa.condicionCliente),
    );
    // Elegir la más barata (mejor para el cliente)
    if (activas.length === 0) return null;
    return activas.reduce((best, c) => (c.montoPromo < best.montoPromo ? c : best));
  }
}
