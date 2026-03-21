// ──── Tipos base ────

export type FaseEncuentro =
  | 'fase_grupos'
  | 'octavos'
  | 'cuartos'
  | 'semifinal'
  | 'final'
  | 'tercer_puesto';

export type EstadoEncuentro =
  | 'borrador'
  | 'programado'
  | 'en_curso'
  | 'finalizado'
  | 'suspendido'
  | 'reprogramado'
  | 'walkover'
  | 'cancelado';

export type MotivoReprogramacion =
  | 'clima'
  | 'seguridad'
  | 'campo_no_disponible'
  | 'solicitud_equipo'
  | 'fuerza_mayor'
  | 'otro';

export type MotivoWalkover =
  | 'inasistencia'
  | 'minimo_jugadores'
  | 'documentacion'
  | 'indisciplina'
  | 'otro';

export type MotivoSuspension =
  | 'clima'
  | 'seguridad'
  | 'incidentes'
  | 'falta_luz'
  | 'campo_danado'
  | 'otro';

// ──── Interfaces auxiliares ────

export interface Sede {
  id: string;
  nombre: string;
  direccion: string;
  campos: Campo[];
}

export interface Campo {
  id: string;
  sedeId: string;
  nombre: string;
  disciplinaIds: string[];
  capacidad?: number;
  superficie?: string;
}

export interface Arbitro {
  id: string;
  nombre: string;
  apellido: string;
  disciplinaIds: string[];
}

export interface HistorialEstadoEncuentro {
  estado: EstadoEncuentro;
  fecha: string;
  motivo?: string;
  usuario?: string;
}

// ──── Parámetros configurables ────

export interface ParametrosEncuentro {
  duracionMinutos: number;
  tiempoEntreEncuentrosMinutos: number;
  maxEncuentrosPorDia: number;
  maxEncuentrosPorEquipoPorDia: number;
  horaInicioPermitida: string;
  horaFinPermitida: string;
  permitirReprogramacion: boolean;
  maxReprogramaciones: number;
  diasAnticipacionMinima: number;
}

// ──── Entidad principal ────

export interface Encuentro {
  id: string;
  competenciaId: string;
  disciplinaId: string;
  fase: FaseEncuentro;
  numeroFecha: number;
  grupo?: string;
  llaveId?: string;
  equipoLocalId: string;
  equipoVisitanteId: string;
  fechaHora: string;
  sedeId?: string;
  campoId?: string;
  arbitroId?: string;
  estado: EstadoEncuentro;
  motivoReprogramacion?: MotivoReprogramacion;
  detalleReprogramacion?: string;
  fechaOriginal?: string;
  cantidadReprogramaciones: number;
  walkoverEquipoId?: string;
  motivoWalkover?: MotivoWalkover;
  motivoSuspension?: MotivoSuspension;
  detalleSuspension?: string;
  observaciones?: string;
  historialEstados: HistorialEstadoEncuentro[];
  creadoEn: string;
  actualizadoEn: string;
}

// ──── Llaves y fases ────

export interface Llave {
  id: string;
  competenciaId: string;
  disciplinaId: string;
  fase: FaseEncuentro;
  ronda: number;
  posicion: number;
  encuentroId?: string;
  llaveGanadorSiguienteId?: string;
  llavePerdedorSiguienteId?: string;
}

export interface FechaCompetencia {
  id: string;
  competenciaId: string;
  numero: number;
  fecha: string;
  encuentroIds: string[];
  estado: 'pendiente' | 'en_curso' | 'completada';
}

// ──── Constantes ────

export const PARAMETROS_ENCUENTRO_DEFAULT: ParametrosEncuentro = {
  duracionMinutos: 90,
  tiempoEntreEncuentrosMinutos: 30,
  maxEncuentrosPorDia: 8,
  maxEncuentrosPorEquipoPorDia: 1,
  horaInicioPermitida: '08:00',
  horaFinPermitida: '22:00',
  permitirReprogramacion: true,
  maxReprogramaciones: 2,
  diasAnticipacionMinima: 2,
};

export const TRANSICIONES_ESTADO_ENCUENTRO: Record<EstadoEncuentro, EstadoEncuentro[]> = {
  borrador: ['programado', 'cancelado'],
  programado: ['en_curso', 'reprogramado', 'suspendido', 'walkover', 'cancelado'],
  en_curso: ['finalizado', 'suspendido'],
  finalizado: [],
  suspendido: ['programado', 'reprogramado', 'cancelado'],
  reprogramado: ['programado', 'cancelado'],
  walkover: [],
  cancelado: [],
};

export const ESTADO_ENCUENTRO_LABELS: Record<EstadoEncuentro, string> = {
  borrador: 'Borrador',
  programado: 'Programado',
  en_curso: 'En curso',
  finalizado: 'Finalizado',
  suspendido: 'Suspendido',
  reprogramado: 'Reprogramado',
  walkover: 'Walkover',
  cancelado: 'Cancelado',
};

export const FASE_LABELS: Record<FaseEncuentro, string> = {
  fase_grupos: 'Fase de grupos',
  octavos: 'Octavos de final',
  cuartos: 'Cuartos de final',
  semifinal: 'Semifinal',
  final: 'Final',
  tercer_puesto: 'Tercer puesto',
};

export const MOTIVO_REPROGRAMACION_LABELS: Record<MotivoReprogramacion, string> = {
  clima: 'Condiciones climáticas',
  seguridad: 'Seguridad',
  campo_no_disponible: 'Campo no disponible',
  solicitud_equipo: 'Solicitud de equipo',
  fuerza_mayor: 'Fuerza mayor',
  otro: 'Otro',
};

export const MOTIVO_WALKOVER_LABELS: Record<MotivoWalkover, string> = {
  inasistencia: 'Inasistencia',
  minimo_jugadores: 'Mínimo de jugadores',
  documentacion: 'Documentación irregular',
  indisciplina: 'Indisciplina',
  otro: 'Otro',
};

export const MOTIVO_SUSPENSION_LABELS: Record<MotivoSuspension, string> = {
  clima: 'Condiciones climáticas',
  seguridad: 'Seguridad',
  incidentes: 'Incidentes',
  falta_luz: 'Falta de iluminación',
  campo_danado: 'Campo dañado',
  otro: 'Otro',
};
