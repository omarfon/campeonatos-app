import { Injectable, signal, computed } from '@angular/core';
import {
  Encuentro,
  Llave,
  FechaCompetencia,
  Sede,
  Campo,
  Arbitro,
  EstadoEncuentro,
  FaseEncuentro,
  MotivoReprogramacion,
  MotivoWalkover,
  MotivoSuspension,
  HistorialEstadoEncuentro,
  ParametrosEncuentro,
  TRANSICIONES_ESTADO_ENCUENTRO,
  PARAMETROS_ENCUENTRO_DEFAULT,
} from '../models/encuentro.model';

// ──── Mock data ────

const MOCK_SEDES: Sede[] = [
  {
    id: 'sede-1',
    nombre: 'Complejo Deportivo Central',
    direccion: 'Av. Principal 1200',
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
    campos: [
      { id: 'campo-4', sedeId: 'sede-2', nombre: 'Campo Norte 1', disciplinaIds: ['disc-futbol', 'disc-basquet'], capacidad: 300 },
    ],
  },
];

const MOCK_ARBITROS: Arbitro[] = [
  { id: 'arb-1', nombre: 'Carlos', apellido: 'Pérez', disciplinaIds: ['disc-futbol'] },
  { id: 'arb-2', nombre: 'María', apellido: 'Gómez', disciplinaIds: ['disc-futbol', 'disc-voley'] },
  { id: 'arb-3', nombre: 'Juan', apellido: 'López', disciplinaIds: ['disc-basquet'] },
];

const now = '2026-01-15T00:00:00Z';

const MOCK_ENCUENTROS: Encuentro[] = [
  {
    id: 'enc-1',
    campeonatoId: 'camp-1',
    disciplinaId: 'disc-futbol',
    fase: 'fase_grupos',
    grupo: 'A',
    numeroFecha: 1,
    equipoLocalId: 'eq-1',
    equipoVisitanteId: 'eq-2',
    fechaHora: '2026-03-15T15:00:00',
    sedeId: 'sede-1',
    campoId: 'campo-1',
    arbitroId: 'arb-1',
    estado: 'finalizado',
    cantidadReprogramaciones: 0,
    historialEstados: [
      { estado: 'borrador', fecha: now },
      { estado: 'programado', fecha: now },
      { estado: 'en_curso', fecha: '2026-03-15T15:00:00' },
      { estado: 'finalizado', fecha: '2026-03-15T16:30:00' },
    ],
    creadoEn: now,
    actualizadoEn: '2026-03-15T16:30:00',
  },
  {
    id: 'enc-2',
    campeonatoId: 'camp-1',
    disciplinaId: 'disc-futbol',
    fase: 'fase_grupos',
    grupo: 'A',
    numeroFecha: 1,
    equipoLocalId: 'eq-3',
    equipoVisitanteId: 'eq-4',
    fechaHora: '2026-03-15T17:00:00',
    sedeId: 'sede-1',
    campoId: 'campo-2',
    arbitroId: 'arb-2',
    estado: 'finalizado',
    cantidadReprogramaciones: 0,
    historialEstados: [
      { estado: 'borrador', fecha: now },
      { estado: 'programado', fecha: now },
      { estado: 'en_curso', fecha: '2026-03-15T17:00:00' },
      { estado: 'finalizado', fecha: '2026-03-15T18:30:00' },
    ],
    creadoEn: now,
    actualizadoEn: '2026-03-15T18:30:00',
  },
  {
    id: 'enc-3',
    campeonatoId: 'camp-1',
    disciplinaId: 'disc-futbol',
    fase: 'fase_grupos',
    grupo: 'B',
    numeroFecha: 2,
    equipoLocalId: 'eq-1',
    equipoVisitanteId: 'eq-3',
    fechaHora: '2026-03-22T15:00:00',
    sedeId: 'sede-1',
    campoId: 'campo-1',
    arbitroId: 'arb-1',
    estado: 'programado',
    cantidadReprogramaciones: 0,
    historialEstados: [
      { estado: 'borrador', fecha: now },
      { estado: 'programado', fecha: now },
    ],
    creadoEn: now,
    actualizadoEn: now,
  },
  {
    id: 'enc-4',
    campeonatoId: 'camp-1',
    disciplinaId: 'disc-futbol',
    fase: 'fase_grupos',
    grupo: 'B',
    numeroFecha: 2,
    equipoLocalId: 'eq-2',
    equipoVisitanteId: 'eq-4',
    fechaHora: '2026-03-22T17:00:00',
    sedeId: 'sede-1',
    campoId: 'campo-2',
    arbitroId: 'arb-2',
    estado: 'programado',
    cantidadReprogramaciones: 0,
    historialEstados: [
      { estado: 'borrador', fecha: now },
      { estado: 'programado', fecha: now },
    ],
    creadoEn: now,
    actualizadoEn: now,
  },
  // ── camp-3 (finalizado) ──
  {
    id: 'enc-5',
    campeonatoId: 'camp-3',
    disciplinaId: 'disc-futbol',
    fase: 'fase_grupos',
    grupo: 'A',
    numeroFecha: 1,
    equipoLocalId: 'eq-5',
    equipoVisitanteId: 'eq-6',
    fechaHora: '2025-08-10T15:00:00',
    sedeId: 'sede-1',
    campoId: 'campo-1',
    arbitroId: 'arb-1',
    estado: 'finalizado',
    cantidadReprogramaciones: 0,
    historialEstados: [
      { estado: 'borrador', fecha: '2025-07-01' },
      { estado: 'programado', fecha: '2025-07-15' },
      { estado: 'en_curso', fecha: '2025-08-10T15:00:00' },
      { estado: 'finalizado', fecha: '2025-08-10T16:30:00' },
    ],
    creadoEn: '2025-07-01',
    actualizadoEn: '2025-08-10T16:30:00',
  },
  {
    id: 'enc-6',
    campeonatoId: 'camp-3',
    disciplinaId: 'disc-futbol',
    fase: 'fase_grupos',
    grupo: 'A',
    numeroFecha: 1,
    equipoLocalId: 'eq-7',
    equipoVisitanteId: 'eq-8',
    fechaHora: '2025-08-10T17:00:00',
    sedeId: 'sede-1',
    campoId: 'campo-2',
    arbitroId: 'arb-2',
    estado: 'finalizado',
    cantidadReprogramaciones: 0,
    historialEstados: [
      { estado: 'borrador', fecha: '2025-07-01' },
      { estado: 'programado', fecha: '2025-07-15' },
      { estado: 'en_curso', fecha: '2025-08-10T17:00:00' },
      { estado: 'finalizado', fecha: '2025-08-10T18:30:00' },
    ],
    creadoEn: '2025-07-01',
    actualizadoEn: '2025-08-10T18:30:00',
  },
  {
    id: 'enc-7',
    campeonatoId: 'camp-3',
    disciplinaId: 'disc-futbol',
    fase: 'fase_grupos',
    grupo: 'A',
    numeroFecha: 2,
    equipoLocalId: 'eq-5',
    equipoVisitanteId: 'eq-7',
    fechaHora: '2025-08-17T15:00:00',
    sedeId: 'sede-1',
    campoId: 'campo-1',
    arbitroId: 'arb-1',
    estado: 'finalizado',
    cantidadReprogramaciones: 0,
    historialEstados: [
      { estado: 'borrador', fecha: '2025-07-01' },
      { estado: 'programado', fecha: '2025-07-15' },
      { estado: 'en_curso', fecha: '2025-08-17T15:00:00' },
      { estado: 'finalizado', fecha: '2025-08-17T16:30:00' },
    ],
    creadoEn: '2025-07-01',
    actualizadoEn: '2025-08-17T16:30:00',
  },
  {
    id: 'enc-8',
    campeonatoId: 'camp-3',
    disciplinaId: 'disc-futbol',
    fase: 'fase_grupos',
    grupo: 'A',
    numeroFecha: 2,
    equipoLocalId: 'eq-6',
    equipoVisitanteId: 'eq-8',
    fechaHora: '2025-08-17T17:00:00',
    sedeId: 'sede-2',
    campoId: 'campo-4',
    arbitroId: 'arb-2',
    estado: 'finalizado',
    cantidadReprogramaciones: 0,
    historialEstados: [
      { estado: 'borrador', fecha: '2025-07-01' },
      { estado: 'programado', fecha: '2025-07-15' },
      { estado: 'en_curso', fecha: '2025-08-17T17:00:00' },
      { estado: 'finalizado', fecha: '2025-08-17T18:30:00' },
    ],
    creadoEn: '2025-07-01',
    actualizadoEn: '2025-08-17T18:30:00',
  },
  {
    id: 'enc-9',
    campeonatoId: 'camp-3',
    disciplinaId: 'disc-futbol',
    fase: 'semifinal',
    numeroFecha: 3,
    equipoLocalId: 'eq-5',
    equipoVisitanteId: 'eq-8',
    fechaHora: '2025-08-24T16:00:00',
    sedeId: 'sede-1',
    campoId: 'campo-1',
    arbitroId: 'arb-1',
    estado: 'finalizado',
    cantidadReprogramaciones: 0,
    historialEstados: [
      { estado: 'borrador', fecha: '2025-07-01' },
      { estado: 'programado', fecha: '2025-08-17' },
      { estado: 'en_curso', fecha: '2025-08-24T16:00:00' },
      { estado: 'finalizado', fecha: '2025-08-24T17:30:00' },
    ],
    creadoEn: '2025-07-01',
    actualizadoEn: '2025-08-24T17:30:00',
  },
  // ── camp-6 (en_ejecucion, basquet) ──
  {
    id: 'enc-10',
    campeonatoId: 'camp-6',
    disciplinaId: 'disc-basquet',
    fase: 'fase_grupos',
    grupo: 'A',
    numeroFecha: 1,
    equipoLocalId: 'eq-9',
    equipoVisitanteId: 'eq-10',
    fechaHora: '2025-10-05T18:00:00',
    sedeId: 'sede-2',
    campoId: 'campo-4',
    arbitroId: 'arb-3',
    estado: 'finalizado',
    cantidadReprogramaciones: 0,
    historialEstados: [
      { estado: 'borrador', fecha: '2025-09-01' },
      { estado: 'programado', fecha: '2025-09-15' },
      { estado: 'en_curso', fecha: '2025-10-05T18:00:00' },
      { estado: 'finalizado', fecha: '2025-10-05T19:30:00' },
    ],
    creadoEn: '2025-09-01',
    actualizadoEn: '2025-10-05T19:30:00',
  },
  {
    id: 'enc-11',
    campeonatoId: 'camp-6',
    disciplinaId: 'disc-basquet',
    fase: 'fase_grupos',
    grupo: 'A',
    numeroFecha: 2,
    equipoLocalId: 'eq-10',
    equipoVisitanteId: 'eq-9',
    fechaHora: '2025-10-12T18:00:00',
    sedeId: 'sede-2',
    campoId: 'campo-4',
    arbitroId: 'arb-3',
    estado: 'programado',
    cantidadReprogramaciones: 0,
    historialEstados: [
      { estado: 'borrador', fecha: '2025-09-01' },
      { estado: 'programado', fecha: '2025-09-15' },
    ],
    creadoEn: '2025-09-01',
    actualizadoEn: '2025-09-15',
  },
  // ── camp-12 (en_ejecucion, futbol) ──
  {
    id: 'enc-12',
    campeonatoId: 'camp-12',
    disciplinaId: 'disc-futbol',
    fase: 'fase_grupos',
    grupo: 'A',
    numeroFecha: 1,
    equipoLocalId: 'eq-11',
    equipoVisitanteId: 'eq-12',
    fechaHora: '2026-06-01T16:00:00',
    sedeId: 'sede-1',
    campoId: 'campo-1',
    arbitroId: 'arb-1',
    estado: 'programado',
    cantidadReprogramaciones: 0,
    historialEstados: [
      { estado: 'borrador', fecha: '2026-05-01' },
      { estado: 'programado', fecha: '2026-05-15' },
    ],
    creadoEn: '2026-05-01',
    actualizadoEn: '2026-05-15',
  },
  {
    id: 'enc-13',
    campeonatoId: 'camp-12',
    disciplinaId: 'disc-futbol',
    fase: 'fase_grupos',
    grupo: 'A',
    numeroFecha: 2,
    equipoLocalId: 'eq-12',
    equipoVisitanteId: 'eq-11',
    fechaHora: '2026-06-08T16:00:00',
    sedeId: 'sede-1',
    campoId: 'campo-2',
    arbitroId: 'arb-2',
    estado: 'programado',
    cantidadReprogramaciones: 0,
    historialEstados: [
      { estado: 'borrador', fecha: '2026-05-01' },
      { estado: 'programado', fecha: '2026-05-15' },
    ],
    creadoEn: '2026-05-01',
    actualizadoEn: '2026-05-15',
  },
];

const MOCK_FECHAS: FechaCompetencia[] = [
  { id: 'fecha-1', campeonatoId: 'camp-1', numero: 1, fecha: '2026-03-15', encuentroIds: ['enc-1', 'enc-2'], estado: 'completada' },
  { id: 'fecha-2', campeonatoId: 'camp-1', numero: 2, fecha: '2026-03-22', encuentroIds: ['enc-3', 'enc-4'], estado: 'pendiente' },
  { id: 'fecha-3', campeonatoId: 'camp-3', numero: 1, fecha: '2025-08-10', encuentroIds: ['enc-5', 'enc-6'], estado: 'completada' },
  { id: 'fecha-4', campeonatoId: 'camp-3', numero: 2, fecha: '2025-08-17', encuentroIds: ['enc-7', 'enc-8'], estado: 'completada' },
  { id: 'fecha-5', campeonatoId: 'camp-3', numero: 3, fecha: '2025-08-24', encuentroIds: ['enc-9'], estado: 'completada' },
  { id: 'fecha-6', campeonatoId: 'camp-6', numero: 1, fecha: '2025-10-05', encuentroIds: ['enc-10'], estado: 'completada' },
  { id: 'fecha-7', campeonatoId: 'camp-6', numero: 2, fecha: '2025-10-12', encuentroIds: ['enc-11'], estado: 'pendiente' },
  { id: 'fecha-8', campeonatoId: 'camp-12', numero: 1, fecha: '2026-06-01', encuentroIds: ['enc-12'], estado: 'pendiente' },
  { id: 'fecha-9', campeonatoId: 'camp-12', numero: 2, fecha: '2026-06-08', encuentroIds: ['enc-13'], estado: 'pendiente' },
];

const MOCK_LLAVES: Llave[] = [];

@Injectable({ providedIn: 'root' })
export class EncuentroService {
  private readonly _encuentros = signal<Encuentro[]>(MOCK_ENCUENTROS);
  private readonly _fechas = signal<FechaCompetencia[]>(MOCK_FECHAS);
  private readonly _llaves = signal<Llave[]>(MOCK_LLAVES);
  private readonly _sedes = signal<Sede[]>(MOCK_SEDES);
  private readonly _arbitros = signal<Arbitro[]>(MOCK_ARBITROS);
  private readonly _parametros = signal<ParametrosEncuentro>(PARAMETROS_ENCUENTRO_DEFAULT);

  readonly encuentros = this._encuentros.asReadonly();
  readonly fechas = this._fechas.asReadonly();
  readonly llaves = this._llaves.asReadonly();
  readonly sedes = this._sedes.asReadonly();
  readonly arbitros = this._arbitros.asReadonly();
  readonly parametros = this._parametros.asReadonly();

  // ──── Selectores por estado ────

  readonly programados = computed(() => this._encuentros().filter((e) => e.estado === 'programado'));
  readonly enCurso = computed(() => this._encuentros().filter((e) => e.estado === 'en_curso'));
  readonly finalizados = computed(() => this._encuentros().filter((e) => e.estado === 'finalizado'));
  readonly suspendidos = computed(() => this._encuentros().filter((e) => e.estado === 'suspendido'));
  readonly reprogramados = computed(() => this._encuentros().filter((e) => e.estado === 'reprogramado'));
  readonly walkovers = computed(() => this._encuentros().filter((e) => e.estado === 'walkover'));

  // ──── Queries ────

  getById(id: string): Encuentro | undefined {
    return this._encuentros().find((e) => e.id === id);
  }

  getByCampeonato(campeonatoId: string): Encuentro[] {
    return this._encuentros().filter((e) => e.campeonatoId === campeonatoId);
  }

  getByFecha(numeroFecha: number, campeonatoId: string): Encuentro[] {
    return this._encuentros().filter(
      (e) => e.numeroFecha === numeroFecha && e.campeonatoId === campeonatoId
    );
  }

  getByFase(fase: FaseEncuentro, campeonatoId: string): Encuentro[] {
    return this._encuentros().filter(
      (e) => e.fase === fase && e.campeonatoId === campeonatoId
    );
  }

  getByEquipo(equipoId: string): Encuentro[] {
    return this._encuentros().filter(
      (e) => e.equipoLocalId === equipoId || e.equipoVisitanteId === equipoId
    );
  }

  getBySede(sedeId: string): Encuentro[] {
    return this._encuentros().filter((e) => e.sedeId === sedeId);
  }

  getByCampo(campoId: string): Encuentro[] {
    return this._encuentros().filter((e) => e.campoId === campoId);
  }

  getByArbitro(arbitroId: string): Encuentro[] {
    return this._encuentros().filter((e) => e.arbitroId === arbitroId);
  }

  getSedeById(id: string): Sede | undefined {
    return this._sedes().find((s) => s.id === id);
  }

  getCampoById(id: string): Campo | undefined {
    for (const sede of this._sedes()) {
      const campo = sede.campos.find((c) => c.id === id);
      if (campo) return campo;
    }
    return undefined;
  }

  getArbitroById(id: string): Arbitro | undefined {
    return this._arbitros().find((a) => a.id === id);
  }

  getCamposBySede(sedeId: string): Campo[] {
    return this.getSedeById(sedeId)?.campos ?? [];
  }

  getCamposByDisciplina(disciplinaId: string): Campo[] {
    return this._sedes().flatMap((s) =>
      s.campos.filter((c) => c.disciplinaIds.includes(disciplinaId))
    );
  }

  getArbitrosByDisciplina(disciplinaId: string): Arbitro[] {
    return this._arbitros().filter((a) => a.disciplinaIds.includes(disciplinaId));
  }

  getFechasByCampeonato(campeonatoId: string): FechaCompetencia[] {
    return this._fechas().filter((f) => f.campeonatoId === campeonatoId);
  }

  getLlavesByCampeonato(campeonatoId: string): Llave[] {
    return this._llaves().filter((l) => l.campeonatoId === campeonatoId);
  }

  // ──── CRUD ────

  create(item: Omit<Encuentro, 'id' | 'historialEstados' | 'cantidadReprogramaciones' | 'creadoEn' | 'actualizadoEn'>): string | true {
    const validation = this.validarCreacion(item);
    if (validation) return validation;

    const ts = new Date().toISOString();
    const newItem: Encuentro = {
      ...item,
      id: crypto.randomUUID(),
      cantidadReprogramaciones: 0,
      historialEstados: [{ estado: item.estado ?? 'borrador', fecha: ts }],
      creadoEn: ts,
      actualizadoEn: ts,
    };
    this._encuentros.update((items) => [...items, newItem]);
    return true;
  }

  update(id: string, changes: Partial<Encuentro>): void {
    this._encuentros.update((items) =>
      items.map((i) =>
        i.id === id ? { ...i, ...changes, actualizadoEn: new Date().toISOString() } : i
      )
    );
  }

  delete(id: string): string | true {
    const enc = this.getById(id);
    if (!enc) return 'Encuentro no encontrado.';
    if (enc.estado === 'en_curso' || enc.estado === 'finalizado') {
      return 'No se puede eliminar un encuentro en curso o finalizado.';
    }
    this._encuentros.update((items) => items.filter((i) => i.id !== id));
    return true;
  }

  // ──── Máquina de estados ────

  puedeTransicionar(encuentroId: string, nuevoEstado: EstadoEncuentro): boolean {
    const enc = this.getById(encuentroId);
    if (!enc) return false;
    return TRANSICIONES_ESTADO_ENCUENTRO[enc.estado].includes(nuevoEstado);
  }

  transicionesDisponibles(encuentroId: string): EstadoEncuentro[] {
    const enc = this.getById(encuentroId);
    if (!enc) return [];
    return TRANSICIONES_ESTADO_ENCUENTRO[enc.estado];
  }

  cambiarEstado(encuentroId: string, nuevoEstado: EstadoEncuentro, motivo?: string): string | true {
    if (!this.puedeTransicionar(encuentroId, nuevoEstado)) {
      return 'Transición de estado no permitida.';
    }
    const enc = this.getById(encuentroId)!;
    const ts = new Date().toISOString();
    const nuevoHistorial: HistorialEstadoEncuentro = { estado: nuevoEstado, fecha: ts, motivo };

    const updates: Partial<Encuentro> = {
      estado: nuevoEstado,
      historialEstados: [...enc.historialEstados, nuevoHistorial],
      actualizadoEn: ts,
    };

    this._encuentros.update((items) =>
      items.map((e) => (e.id === encuentroId ? { ...e, ...updates } : e))
    );
    return true;
  }

  // ──── Reprogramación ────

  reprogramar(
    id: string,
    nuevaFechaHora: string,
    motivo: MotivoReprogramacion,
    detalle?: string
  ): string | true {
    const enc = this.getById(id);
    if (!enc) return 'Encuentro no encontrado.';

    const params = this._parametros();
    if (!params.permitirReprogramacion) return 'Las reprogramaciones no están permitidas.';
    if (enc.cantidadReprogramaciones >= params.maxReprogramaciones) {
      return `Se alcanzó el máximo de ${params.maxReprogramaciones} reprogramaciones.`;
    }

    if (!this.puedeTransicionar(id, 'reprogramado')) {
      return 'No se puede reprogramar en el estado actual.';
    }

    const conflicto = this.verificarConflictoCampo(enc.campoId, nuevaFechaHora, id);
    if (conflicto) return conflicto;

    const ts = new Date().toISOString();
    this._encuentros.update((items) =>
      items.map((e) => {
        if (e.id !== id) return e;
        return {
          ...e,
          estado: 'reprogramado' as EstadoEncuentro,
          fechaOriginal: e.fechaOriginal ?? e.fechaHora,
          fechaHora: nuevaFechaHora,
          motivoReprogramacion: motivo,
          detalleReprogramacion: detalle,
          cantidadReprogramaciones: e.cantidadReprogramaciones + 1,
          historialEstados: [...e.historialEstados, { estado: 'reprogramado' as EstadoEncuentro, fecha: ts, motivo: detalle ?? motivo }],
          actualizadoEn: ts,
        };
      })
    );
    return true;
  }

  // ──── Walkover ────

  registrarWalkover(
    id: string,
    equipoGanadorId: string,
    motivo: MotivoWalkover,
    detalle?: string
  ): string | true {
    const enc = this.getById(id);
    if (!enc) return 'Encuentro no encontrado.';
    if (!this.puedeTransicionar(id, 'walkover')) {
      return 'No se puede registrar walkover en el estado actual.';
    }
    if (equipoGanadorId !== enc.equipoLocalId && equipoGanadorId !== enc.equipoVisitanteId) {
      return 'El equipo ganador debe ser uno de los participantes del encuentro.';
    }

    const ts = new Date().toISOString();
    this._encuentros.update((items) =>
      items.map((e) => {
        if (e.id !== id) return e;
        return {
          ...e,
          estado: 'walkover' as EstadoEncuentro,
          walkoverEquipoId: equipoGanadorId,
          motivoWalkover: motivo,
          observaciones: detalle ?? e.observaciones,
          historialEstados: [...e.historialEstados, { estado: 'walkover' as EstadoEncuentro, fecha: ts, motivo: detalle ?? motivo }],
          actualizadoEn: ts,
        };
      })
    );
    return true;
  }

  // ──── Suspensión ────

  suspender(id: string, motivo: MotivoSuspension, detalle?: string): string | true {
    const enc = this.getById(id);
    if (!enc) return 'Encuentro no encontrado.';
    if (!this.puedeTransicionar(id, 'suspendido')) {
      return 'No se puede suspender en el estado actual.';
    }

    const ts = new Date().toISOString();
    this._encuentros.update((items) =>
      items.map((e) => {
        if (e.id !== id) return e;
        return {
          ...e,
          estado: 'suspendido' as EstadoEncuentro,
          motivoSuspension: motivo,
          detalleSuspension: detalle,
          historialEstados: [...e.historialEstados, { estado: 'suspendido' as EstadoEncuentro, fecha: ts, motivo: detalle ?? motivo }],
          actualizadoEn: ts,
        };
      })
    );
    return true;
  }

  // ──── Validaciones ────

  private validarCreacion(item: Partial<Encuentro>): string | null {
    if (item.equipoLocalId === item.equipoVisitanteId) {
      return 'Un equipo no puede jugar contra sí mismo.';
    }
    if (item.campoId && item.fechaHora) {
      const conflicto = this.verificarConflictoCampo(item.campoId, item.fechaHora);
      if (conflicto) return conflicto;
    }
    if (item.fechaHora) {
      const conflictoLocal = this.verificarConflictoEquipo(item.equipoLocalId!, item.fechaHora);
      if (conflictoLocal) return conflictoLocal;
      const conflictoVisitante = this.verificarConflictoEquipo(item.equipoVisitanteId!, item.fechaHora);
      if (conflictoVisitante) return conflictoVisitante;
    }
    return null;
  }

  verificarConflictoCampo(campoId: string | undefined, fechaHora: string, excludeId?: string): string | null {
    if (!campoId) return null;
    const params = this._parametros();
    const nuevaHora = new Date(fechaHora).getTime();
    const duracionMs = (params.duracionMinutos + params.tiempoEntreEncuentrosMinutos) * 60 * 1000;

    const conflictos = this._encuentros().filter((e) => {
      if (e.id === excludeId) return false;
      if (e.campoId !== campoId) return false;
      if (e.estado === 'cancelado' || e.estado === 'walkover') return false;
      const encHora = new Date(e.fechaHora).getTime();
      return Math.abs(nuevaHora - encHora) < duracionMs;
    });

    if (conflictos.length > 0) {
      return 'Conflicto de horario: el campo ya tiene un encuentro programado en ese horario.';
    }
    return null;
  }

  verificarConflictoEquipo(equipoId: string, fechaHora: string, excludeId?: string): string | null {
    const params = this._parametros();
    const nuevaHora = new Date(fechaHora).getTime();
    const duracionMs = (params.duracionMinutos + params.tiempoEntreEncuentrosMinutos) * 60 * 1000;

    const conflictos = this._encuentros().filter((e) => {
      if (e.id === excludeId) return false;
      if (e.equipoLocalId !== equipoId && e.equipoVisitanteId !== equipoId) return false;
      if (e.estado === 'cancelado' || e.estado === 'walkover') return false;
      const encHora = new Date(e.fechaHora).getTime();
      return Math.abs(nuevaHora - encHora) < duracionMs;
    });

    if (conflictos.length > 0) {
      return 'Conflicto de horario: el equipo ya tiene un encuentro programado en ese horario.';
    }
    return null;
  }

  verificarHorarioPermitido(hora: string): string | null {
    const params = this._parametros();
    const time = hora.includes('T') ? hora.split('T')[1]!.substring(0, 5) : hora.substring(0, 5);
    if (time < params.horaInicioPermitida || time > params.horaFinPermitida) {
      return `El horario debe estar entre ${params.horaInicioPermitida} y ${params.horaFinPermitida}.`;
    }
    return null;
  }

  // ──── Generación de Fixture (Round-Robin) ────

  generarFixture(
    campeonatoId: string,
    disciplinaId: string,
    equipoIds: string[],
    fechaInicio: string
  ): { encuentros: number; fechas: number } | string {
    if (equipoIds.length < 2) return 'Se necesitan al menos 2 equipos para generar encuentros.';

    const existentes = this.getByCampeonato(campeonatoId);
    if (existentes.length > 0) return 'Ya existen encuentros para este campeonato.';

    const teams = [...equipoIds];
    if (teams.length % 2 !== 0) teams.push('__BYE__');

    const totalTeams = teams.length;
    const numRounds = totalTeams - 1;
    const ts = new Date().toISOString();
    const startDate = new Date(fechaInicio);
    const newEncuentros: Encuentro[] = [];
    const newFechas: FechaCompetencia[] = [];

    for (let round = 0; round < numRounds; round++) {
      const roundDate = new Date(startDate);
      roundDate.setDate(roundDate.getDate() + round * 7);
      const fechaStr = roundDate.toISOString().split('T')[0]!;
      const encounterIds: string[] = [];

      for (let i = 0; i < totalTeams / 2; i++) {
        const home = teams[i]!;
        const away = teams[totalTeams - 1 - i]!;
        if (home === '__BYE__' || away === '__BYE__') continue;

        const encId = crypto.randomUUID();
        encounterIds.push(encId);

        const hour = 15 + (encounterIds.length - 1) * 2;
        const fechaHora = `${fechaStr}T${String(hour).padStart(2, '0')}:00:00`;

        newEncuentros.push({
          id: encId,
          campeonatoId,
          disciplinaId,
          fase: 'fase_grupos',
          numeroFecha: round + 1,
          grupo: 'A',
          equipoLocalId: home,
          equipoVisitanteId: away,
          fechaHora,
          sedeId: 'sede-1',
          estado: 'programado',
          cantidadReprogramaciones: 0,
          historialEstados: [
            { estado: 'borrador', fecha: ts },
            { estado: 'programado', fecha: ts },
          ],
          creadoEn: ts,
          actualizadoEn: ts,
        });
      }

      newFechas.push({
        id: crypto.randomUUID(),
        campeonatoId,
        numero: round + 1,
        fecha: fechaStr,
        encuentroIds: encounterIds,
        estado: 'pendiente',
      });

      // Circle method rotation: fix teams[0], shift rest right by 1
      const last = teams.pop()!;
      teams.splice(1, 0, last);
    }

    this._encuentros.update(items => [...items, ...newEncuentros]);
    this._fechas.update(items => [...items, ...newFechas]);

    return { encuentros: newEncuentros.length, fechas: newFechas.length };
  }

  // ──── Reportes ────

  resumenPorCampeonato(campeonatoId: string): {
    total: number;
    porEstado: Record<string, number>;
    porFase: Record<string, number>;
  } {
    const encs = this.getByCampeonato(campeonatoId);
    const porEstado: Record<string, number> = {};
    const porFase: Record<string, number> = {};

    for (const enc of encs) {
      porEstado[enc.estado] = (porEstado[enc.estado] ?? 0) + 1;
      porFase[enc.fase] = (porFase[enc.fase] ?? 0) + 1;
    }

    return { total: encs.length, porEstado, porFase };
  }

  encuentrosDelDia(fecha: string): Encuentro[] {
    const dia = fecha.split('T')[0];
    return this._encuentros().filter((e) => e.fechaHora.startsWith(dia!));
  }

  // ──── Parámetros ────

  actualizarParametros(cambios: Partial<ParametrosEncuentro>): void {
    this._parametros.update((p) => ({ ...p, ...cambios }));
  }
}
