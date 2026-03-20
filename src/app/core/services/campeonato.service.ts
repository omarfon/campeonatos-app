import { Injectable, signal, computed } from '@angular/core';
import {
  Campeonato,
  CalendarioEvento,
  EstadoCampeonato,
  HistorialEstado,
  TRANSICIONES_ESTADO,
  PARAMETROS_DEFAULT,
  FechaBloqueada,
} from '../models/campeonato.model';

const MOCK_CAMPEONATOS: Campeonato[] = [
  {
    id: 'camp-1',
    nombre: 'Campeonato Interno 2026',
    tipo: 'interno',
    modalidad: 'interno_cerrado',
    estructura: 'apertura_clausura',
    estado: 'en_ejecucion',
    anio: 2026,
    periodo: '1er semestre',
    observaciones: 'Campeonato interno anual para socios del club',
    disciplinaIds: ['disc-futbol', 'disc-voley'],
    reglasGenerales: [
      { id: 'r1', nombre: 'Puntos por victoria', descripcion: 'Cantidad de puntos otorgados al equipo ganador', valor: '3' },
      { id: 'r2', nombre: 'Puntos por empate', descripcion: 'Cantidad de puntos otorgados a ambos equipos', valor: '1' },
    ],
    fechaInicio: '2026-03-01',
    fechaFin: '2026-06-30',
    fechaInicioInscripcion: '2026-01-15',
    fechaFinInscripcion: '2026-02-28',
    diasHabilesCompetencia: [1, 2, 3, 4, 5, 6],
    fechasBloqueadas: [
      { id: 'fb-1', fecha: '2026-04-02', motivo: 'Feriado nacional', tipo: 'evento' },
    ],
    calendario: [
      { id: 'cal-1', campeonatoId: 'camp-1', titulo: 'Inicio Apertura', fecha: '2026-03-01', tipo: 'inicio_fase' },
      { id: 'cal-2', campeonatoId: 'camp-1', titulo: 'Fin Apertura', fecha: '2026-06-30', tipo: 'fin_fase' },
    ],
    parametros: { ...PARAMETROS_DEFAULT, maxDisciplinas: 5, permitirInvitados: false },
    publicado: true,
    fechaPublicacion: '2026-01-10',
    publicacionAutomatica: false,
    descripcion: 'Campeonato interno anual para socios del club',
    historialEstados: [
      { estado: 'borrador', fecha: '2026-01-01' },
      { estado: 'programado', fecha: '2026-01-15' },
      { estado: 'en_ejecucion', fecha: '2026-03-01' },
    ],
    creadoEn: '2026-01-01T00:00:00Z',
    actualizadoEn: '2026-03-01T00:00:00Z',
  },
  {
    id: 'camp-2',
    nombre: 'Copa Abierta Verano 2026',
    tipo: 'abierto',
    modalidad: 'abierto',
    estructura: 'unico',
    estado: 'borrador',
    anio: 2026,
    observaciones: 'Copa abierta con participación de equipos externos',
    disciplinaIds: ['disc-futbol', 'disc-basquet'],
    reglasGenerales: [],
    fechaInicio: '2026-07-01',
    fechaFin: '2026-09-30',
    fechaInicioInscripcion: '2026-05-01',
    fechaFinInscripcion: '2026-06-15',
    diasHabilesCompetencia: [6, 0],
    fechasBloqueadas: [],
    calendario: [],
    parametros: { ...PARAMETROS_DEFAULT, permitirInvitados: true },
    publicado: false,
    publicacionAutomatica: true,
    fechaProgramadaPublicacion: '2026-04-15',
    descripcion: 'Copa abierta con participación de equipos externos',
    historialEstados: [{ estado: 'borrador', fecha: '2026-01-20' }],
    creadoEn: '2026-01-20T00:00:00Z',
    actualizadoEn: '2026-01-20T00:00:00Z',
  },
  {
    id: 'camp-3',
    nombre: 'Liga Interna de Fútbol 2025',
    tipo: 'interno',
    modalidad: 'interno_cerrado',
    estructura: 'apertura_clausura',
    estado: 'finalizado',
    anio: 2025,
    periodo: '2do semestre',
    observaciones: 'Liga finalizada con éxito',
    disciplinaIds: ['disc-futbol'],
    reglasGenerales: [
      { id: 'r3-1', nombre: 'Puntos por victoria', descripcion: 'Puntos al ganador', valor: '3' },
    ],
    fechaInicio: '2025-07-01',
    fechaFin: '2025-12-15',
    diasHabilesCompetencia: [6, 0],
    fechasBloqueadas: [],
    calendario: [],
    parametros: { ...PARAMETROS_DEFAULT },
    publicado: true,
    fechaPublicacion: '2025-06-15',
    publicacionAutomatica: false,
    descripcion: 'Liga interna de fútbol para socios, temporada 2do semestre 2025',
    historialEstados: [
      { estado: 'borrador', fecha: '2025-05-01' },
      { estado: 'programado', fecha: '2025-06-01' },
      { estado: 'en_ejecucion', fecha: '2025-07-01' },
      { estado: 'finalizado', fecha: '2025-12-15' },
    ],
    creadoEn: '2025-05-01T00:00:00Z',
    actualizadoEn: '2025-12-15T00:00:00Z',
  },
  {
    id: 'camp-4',
    nombre: 'Torneo Relámpago de Vóley',
    tipo: 'abierto',
    modalidad: 'abierto',
    estructura: 'unico',
    estado: 'programado',
    anio: 2026,
    periodo: '1er semestre',
    disciplinaIds: ['disc-voley'],
    reglasGenerales: [
      { id: 'r4-1', nombre: 'Sets para ganar', descripcion: 'Sets necesarios', valor: '2' },
    ],
    fechaInicio: '2026-04-10',
    fechaFin: '2026-04-12',
    diasHabilesCompetencia: [5, 6, 0],
    fechasBloqueadas: [],
    calendario: [],
    parametros: { ...PARAMETROS_DEFAULT, permitirInvitados: true, duracionMaximaDias: 3 },
    publicado: true,
    fechaPublicacion: '2026-03-01',
    publicacionAutomatica: false,
    descripcion: 'Torneo relámpago de vóley de 3 días con equipos invitados',
    historialEstados: [
      { estado: 'borrador', fecha: '2026-02-15' },
      { estado: 'programado', fecha: '2026-03-01' },
    ],
    creadoEn: '2026-02-15T00:00:00Z',
    actualizadoEn: '2026-03-01T00:00:00Z',
  },
  {
    id: 'camp-5',
    nombre: 'Copa Navidad Multideportiva 2025',
    tipo: 'interno',
    modalidad: 'interno_invitados',
    estructura: 'fases_especiales',
    estado: 'finalizado',
    anio: 2025,
    periodo: 'Diciembre',
    observaciones: 'Evento especial de fin de año con invitados',
    disciplinaIds: ['disc-futbol', 'disc-voley', 'disc-basquet'],
    reglasGenerales: [],
    fechaInicio: '2025-12-01',
    fechaFin: '2025-12-23',
    diasHabilesCompetencia: [6, 0],
    fechasBloqueadas: [
      { id: 'fb-5', fecha: '2025-12-25', motivo: 'Navidad', tipo: 'evento' },
    ],
    calendario: [],
    parametros: { ...PARAMETROS_DEFAULT, permitirInvitados: true },
    publicado: true,
    fechaPublicacion: '2025-11-01',
    publicacionAutomatica: false,
    descripcion: 'Copa navideña multideportiva con equipos invitados de clubes amigos',
    historialEstados: [
      { estado: 'borrador', fecha: '2025-10-01' },
      { estado: 'programado', fecha: '2025-11-01' },
      { estado: 'en_ejecucion', fecha: '2025-12-01' },
      { estado: 'finalizado', fecha: '2025-12-23' },
    ],
    creadoEn: '2025-10-01T00:00:00Z',
    actualizadoEn: '2025-12-23T00:00:00Z',
  },
  {
    id: 'camp-6',
    nombre: 'Intercolegial de Básquet 2026',
    tipo: 'abierto',
    modalidad: 'abierto',
    estructura: 'fases_especiales',
    estado: 'en_ejecucion',
    anio: 2026,
    periodo: '1er semestre',
    disciplinaIds: ['disc-basquet'],
    reglasGenerales: [
      { id: 'r6-1', nombre: 'Cuartos por partido', descripcion: 'Cantidad de cuartos', valor: '4' },
      { id: 'r6-2', nombre: 'Minutos por cuarto', descripcion: 'Duración', valor: '8' },
    ],
    fechaInicio: '2026-02-15',
    fechaFin: '2026-05-30',
    diasHabilesCompetencia: [3, 5, 6],
    fechasBloqueadas: [],
    calendario: [],
    parametros: { ...PARAMETROS_DEFAULT, permitirInvitados: true, maxDisciplinas: 1 },
    publicado: true,
    fechaPublicacion: '2026-01-20',
    publicacionAutomatica: false,
    descripcion: 'Torneo intercolegial de básquet con fase de grupos y eliminación directa',
    historialEstados: [
      { estado: 'borrador', fecha: '2026-01-05' },
      { estado: 'programado', fecha: '2026-01-20' },
      { estado: 'en_ejecucion', fecha: '2026-02-15' },
    ],
    creadoEn: '2026-01-05T00:00:00Z',
    actualizadoEn: '2026-02-15T00:00:00Z',
  },
  {
    id: 'camp-7',
    nombre: 'Campeonato de Atletismo 2026',
    tipo: 'abierto',
    modalidad: 'abierto',
    estructura: 'unico',
    estado: 'programado',
    anio: 2026,
    periodo: '2do semestre',
    disciplinaIds: ['disc-atletismo'],
    reglasGenerales: [],
    fechaInicio: '2026-08-01',
    fechaFin: '2026-08-15',
    diasHabilesCompetencia: [6, 0],
    fechasBloqueadas: [],
    calendario: [],
    parametros: { ...PARAMETROS_DEFAULT, maxDisciplinas: 1 },
    publicado: false,
    publicacionAutomatica: true,
    fechaProgramadaPublicacion: '2026-06-01',
    descripcion: 'Campeonato abierto de atletismo con pruebas de pista y campo',
    historialEstados: [
      { estado: 'borrador', fecha: '2026-03-01' },
      { estado: 'programado', fecha: '2026-03-15' },
    ],
    creadoEn: '2026-03-01T00:00:00Z',
    actualizadoEn: '2026-03-15T00:00:00Z',
  },
  {
    id: 'camp-8',
    nombre: 'Liga Juvenil de Fútbol 2026',
    tipo: 'interno',
    modalidad: 'interno_cerrado',
    estructura: 'apertura_clausura',
    estado: 'borrador',
    anio: 2026,
    periodo: '2do semestre',
    observaciones: 'Liga para categorías juveniles sub-16 y sub-18',
    disciplinaIds: ['disc-futbol'],
    reglasGenerales: [
      { id: 'r8-1', nombre: 'Puntos por victoria', descripcion: 'Puntos al ganador', valor: '3' },
      { id: 'r8-2', nombre: 'Edad máxima', descripcion: 'Edad máxima de jugadores', valor: '18' },
    ],
    fechaInicio: '2026-08-01',
    fechaFin: '2026-11-30',
    diasHabilesCompetencia: [6],
    fechasBloqueadas: [],
    calendario: [],
    parametros: { ...PARAMETROS_DEFAULT },
    publicado: false,
    publicacionAutomatica: false,
    descripcion: 'Liga juvenil interna para categorías sub-16 y sub-18',
    historialEstados: [{ estado: 'borrador', fecha: '2026-03-10' }],
    creadoEn: '2026-03-10T00:00:00Z',
    actualizadoEn: '2026-03-10T00:00:00Z',
  },
  {
    id: 'camp-9',
    nombre: 'Torneo Interclubes Verano 2025',
    tipo: 'abierto',
    modalidad: 'abierto',
    estructura: 'fases_especiales',
    estado: 'finalizado',
    anio: 2025,
    periodo: '1er trimestre',
    disciplinaIds: ['disc-futbol', 'disc-voley'],
    reglasGenerales: [],
    fechaInicio: '2025-01-15',
    fechaFin: '2025-03-30',
    diasHabilesCompetencia: [6, 0],
    fechasBloqueadas: [],
    calendario: [],
    parametros: { ...PARAMETROS_DEFAULT, permitirInvitados: true },
    publicado: true,
    fechaPublicacion: '2024-12-20',
    publicacionAutomatica: false,
    descripcion: 'Torneo de verano interclubes con fútbol y vóley',
    historialEstados: [
      { estado: 'borrador', fecha: '2024-12-01' },
      { estado: 'programado', fecha: '2024-12-20' },
      { estado: 'en_ejecucion', fecha: '2025-01-15' },
      { estado: 'finalizado', fecha: '2025-03-30' },
    ],
    creadoEn: '2024-12-01T00:00:00Z',
    actualizadoEn: '2025-03-30T00:00:00Z',
  },
  {
    id: 'camp-10',
    nombre: 'Copa Aniversario del Club 2026',
    tipo: 'interno',
    modalidad: 'interno_invitados',
    estructura: 'unico',
    estado: 'suspendido',
    anio: 2026,
    periodo: '1er semestre',
    observaciones: 'Suspendido por refacciones en la sede principal',
    disciplinaIds: ['disc-futbol', 'disc-basquet', 'disc-atletismo'],
    reglasGenerales: [],
    fechaInicio: '2026-03-20',
    fechaFin: '2026-04-20',
    diasHabilesCompetencia: [1, 2, 3, 4, 5, 6, 0],
    fechasBloqueadas: [],
    calendario: [],
    parametros: { ...PARAMETROS_DEFAULT, permitirInvitados: true },
    publicado: true,
    fechaPublicacion: '2026-02-01',
    publicacionAutomatica: false,
    motivoSuspension: 'Refacciones en sede principal',
    descripcion: 'Copa especial por el aniversario del club, multideportiva',
    historialEstados: [
      { estado: 'borrador', fecha: '2026-01-10' },
      { estado: 'programado', fecha: '2026-02-01' },
      { estado: 'en_ejecucion', fecha: '2026-03-20' },
      { estado: 'suspendido', fecha: '2026-03-25', motivo: 'Refacciones en sede principal' },
    ],
    creadoEn: '2026-01-10T00:00:00Z',
    actualizadoEn: '2026-03-25T00:00:00Z',
  },
  {
    id: 'camp-11',
    nombre: 'Torneo de Vóley Playa 2026',
    tipo: 'abierto',
    modalidad: 'abierto',
    estructura: 'unico',
    estado: 'borrador',
    anio: 2026,
    periodo: '2do semestre',
    disciplinaIds: ['disc-voley'],
    reglasGenerales: [
      { id: 'r11-1', nombre: 'Sets para ganar', descripcion: 'Sets necesarios', valor: '2' },
      { id: 'r11-2', nombre: 'Jugadores por equipo', descripcion: 'Duplas', valor: '2' },
    ],
    fechaInicio: '2026-09-01',
    fechaFin: '2026-09-15',
    diasHabilesCompetencia: [6, 0],
    fechasBloqueadas: [],
    calendario: [],
    parametros: { ...PARAMETROS_DEFAULT, permitirInvitados: true, duracionMaximaDias: 15 },
    publicado: false,
    publicacionAutomatica: false,
    descripcion: 'Torneo de vóley playa abierto en la sede del lago',
    historialEstados: [{ estado: 'borrador', fecha: '2026-03-12' }],
    creadoEn: '2026-03-12T00:00:00Z',
    actualizadoEn: '2026-03-12T00:00:00Z',
  },
  {
    id: 'camp-12',
    nombre: 'Liga Master Fútbol +35',
    tipo: 'interno',
    modalidad: 'interno_invitados',
    estructura: 'apertura_clausura',
    estado: 'en_ejecucion',
    anio: 2026,
    periodo: '1er semestre',
    observaciones: 'Liga para veteranos mayores de 35 años',
    disciplinaIds: ['disc-futbol'],
    reglasGenerales: [
      { id: 'r12-1', nombre: 'Edad mínima', descripcion: 'Edad mínima de jugadores', valor: '35' },
      { id: 'r12-2', nombre: 'Puntos por victoria', descripcion: 'Puntos al ganador', valor: '3' },
    ],
    fechaInicio: '2026-03-01',
    fechaFin: '2026-06-15',
    diasHabilesCompetencia: [0],
    fechasBloqueadas: [],
    calendario: [],
    parametros: { ...PARAMETROS_DEFAULT, permitirInvitados: true },
    publicado: true,
    fechaPublicacion: '2026-02-10',
    publicacionAutomatica: false,
    requiereDeclaracionSalud: true,
    descripcion: 'Liga de fútbol para veteranos mayores de 35 años con invitados',
    historialEstados: [
      { estado: 'borrador', fecha: '2026-01-15' },
      { estado: 'programado', fecha: '2026-02-10' },
      { estado: 'en_ejecucion', fecha: '2026-03-01' },
    ],
    creadoEn: '2026-01-15T00:00:00Z',
    actualizadoEn: '2026-03-01T00:00:00Z',
  },
];

@Injectable({ providedIn: 'root' })
export class CampeonatoService {
  private readonly _items = signal<Campeonato[]>(MOCK_CAMPEONATOS);
  readonly items = this._items.asReadonly();

  // ──── Selectores por estado ────

  readonly enEjecucion = computed(() => this._items().filter((c) => c.estado === 'en_ejecucion'));
  readonly borradores = computed(() => this._items().filter((c) => c.estado === 'borrador'));
  readonly programados = computed(() => this._items().filter((c) => c.estado === 'programado'));
  readonly finalizados = computed(() => this._items().filter((c) => c.estado === 'finalizado'));
  readonly anulados = computed(() => this._items().filter((c) => c.estado === 'anulado'));
  readonly suspendidos = computed(() => this._items().filter((c) => c.estado === 'suspendido'));

  // ──── Reportes ────

  porAnio(anio: number): Campeonato[] {
    return this._items().filter((c) => c.anio === anio);
  }

  activos(): Campeonato[] {
    return this._items().filter((c) => c.estado === 'en_ejecucion' || c.estado === 'programado');
  }

  historialPorDisciplina(disciplinaId: string): Campeonato[] {
    return this._items().filter((c) => c.disciplinaIds.includes(disciplinaId));
  }

  suspendidosYAnulados(): Campeonato[] {
    return this._items().filter((c) => c.estado === 'suspendido' || c.estado === 'anulado');
  }

  // ──── CRUD ────

  getById(id: string): Campeonato | undefined {
    return this._items().find((c) => c.id === id);
  }

  create(item: Omit<Campeonato, 'id' | 'estado' | 'publicado' | 'historialEstados' | 'creadoEn' | 'actualizadoEn'>): void {
    const now = new Date().toISOString();
    const newItem: Campeonato = {
      ...item,
      id: crypto.randomUUID(),
      estado: 'borrador',
      publicado: false,
      historialEstados: [{ estado: 'borrador', fecha: now }],
      creadoEn: now,
      actualizadoEn: now,
    };
    this._items.update((items) => [...items, newItem]);
  }

  update(id: string, changes: Partial<Campeonato>): void {
    this._items.update((items) =>
      items.map((i) =>
        i.id === id ? { ...i, ...changes, actualizadoEn: new Date().toISOString() } : i
      )
    );
  }

  delete(id: string): void {
    this._items.update((items) => items.filter((i) => i.id !== id));
  }

  // ──── Máquina de estados ────

  puedeTransicionar(campeonatoId: string, nuevoEstado: EstadoCampeonato): boolean {
    const camp = this.getById(campeonatoId);
    if (!camp) return false;
    return TRANSICIONES_ESTADO[camp.estado].includes(nuevoEstado);
  }

  transicionesDisponibles(campeonatoId: string): EstadoCampeonato[] {
    const camp = this.getById(campeonatoId);
    if (!camp) return [];
    return TRANSICIONES_ESTADO[camp.estado];
  }

  /** Regla de negocio: no iniciar sin disciplinas */
  private validarIniciar(camp: Campeonato): string | null {
    if (camp.disciplinaIds.length === 0) {
      return 'No se puede iniciar un campeonato sin disciplinas asociadas.';
    }
    return null;
  }

  cambiarEstado(campeonatoId: string, nuevoEstado: EstadoCampeonato, motivo?: string): string | true {
    if (!this.puedeTransicionar(campeonatoId, nuevoEstado)) {
      return 'Transición de estado no permitida.';
    }
    const camp = this.getById(campeonatoId)!;

    // Regla: no se puede iniciar sin disciplinas
    if (nuevoEstado === 'en_ejecucion') {
      const err = this.validarIniciar(camp);
      if (err) return err;
    }

    // Regla: finalizado no puede reabrirse
    if (camp.estado === 'finalizado') {
      return 'Un campeonato finalizado no puede reabrirse.';
    }

    const now = new Date().toISOString();
    const nuevoHistorial: HistorialEstado = { estado: nuevoEstado, fecha: now, motivo };

    this._items.update((items) =>
      items.map((c) => {
        if (c.id !== campeonatoId) return c;
        const updates: Partial<Campeonato> = {
          estado: nuevoEstado,
          historialEstados: [...c.historialEstados, nuevoHistorial],
          actualizadoEn: now,
        };
        if (nuevoEstado === 'finalizado') updates.fechaCierre = now;
        if (nuevoEstado === 'anulado') {
          updates.fechaAnulacion = now;
          updates.motivoAnulacion = motivo;
        }
        if (nuevoEstado === 'suspendido') updates.motivoSuspension = motivo;
        return { ...c, ...updates };
      })
    );
    return true;
  }

  // ──── Publicación ────

  publicar(campeonatoId: string): boolean {
    const camp = this.getById(campeonatoId);
    if (!camp || camp.publicado) return false;
    this.update(campeonatoId, {
      publicado: true,
      fechaPublicacion: new Date().toISOString(),
    });
    return true;
  }

  despublicar(campeonatoId: string): boolean {
    const camp = this.getById(campeonatoId);
    if (!camp || !camp.publicado) return false;
    this.update(campeonatoId, {
      publicado: false,
      fechaPublicacion: undefined,
    });
    return true;
  }

  // ──── Cierre y Anulación ────

  cerrar(campeonatoId: string, motivo?: string): string | true {
    return this.cambiarEstado(campeonatoId, 'finalizado', motivo);
  }

  anular(campeonatoId: string, motivo?: string): string | true {
    return this.cambiarEstado(campeonatoId, 'anulado', motivo);
  }

  // ──── Calendario ────

  addCalendarioEvento(
    campeonatoId: string,
    evento: Omit<CalendarioEvento, 'id' | 'campeonatoId'>
  ): void {
    const newEvento: CalendarioEvento = {
      ...evento,
      id: crypto.randomUUID(),
      campeonatoId,
    };
    this._items.update((items) =>
      items.map((c) =>
        c.id === campeonatoId ? { ...c, calendario: [...c.calendario, newEvento] } : c
      )
    );
  }

  removeCalendarioEvento(campeonatoId: string, eventoId: string): void {
    this._items.update((items) =>
      items.map((c) =>
        c.id === campeonatoId
          ? { ...c, calendario: c.calendario.filter((e) => e.id !== eventoId) }
          : c
      )
    );
  }

  // ──── Fechas bloqueadas ────

  addFechaBloqueada(campeonatoId: string, fb: Omit<FechaBloqueada, 'id'>): void {
    const nueva: FechaBloqueada = { ...fb, id: crypto.randomUUID() };
    this._items.update((items) =>
      items.map((c) =>
        c.id === campeonatoId ? { ...c, fechasBloqueadas: [...c.fechasBloqueadas, nueva] } : c
      )
    );
  }

  removeFechaBloqueada(campeonatoId: string, fbId: string): void {
    this._items.update((items) =>
      items.map((c) =>
        c.id === campeonatoId
          ? { ...c, fechasBloqueadas: c.fechasBloqueadas.filter((f) => f.id !== fbId) }
          : c
      )
    );
  }

  // ──── Validaciones de solapamiento ────

  verificarSolapamiento(
    fechaInicio: string,
    fechaFin: string,
    excluirId?: string
  ): Campeonato[] {
    return this._items().filter((c) => {
      if (excluirId && c.id === excluirId) return false;
      if (c.estado === 'anulado' || c.estado === 'finalizado') return false;
      return c.fechaInicio <= fechaFin && c.fechaFin >= fechaInicio;
    });
  }
}
