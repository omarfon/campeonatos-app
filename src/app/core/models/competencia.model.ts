import type { FaseEncuentro } from './encuentro.model';

// ──── Tipos base ────

export type TipoCompetencia = 'interno' | 'abierto';

export type ModalidadCompetencia = 'interno_cerrado' | 'interno_invitados' | 'abierto';

export type EstructuraCompetencia = 'unico' | 'apertura_clausura' | 'fases_especiales';

export type EstadoCompetencia =
  | 'borrador'
  | 'programado'
  | 'en_ejecucion'
  | 'suspendido'
  | 'finalizado'
  | 'anulado';

export type TipoFechaBloqueada = 'evento' | 'elecciones' | 'mantenimiento' | 'otro';

// ──── Interfaces auxiliares ────

export interface ReglaGeneral {
  id: string;
  nombre: string;
  descripcion: string;
  valor: string;
}

export interface HistorialEstado {
  estado: EstadoCompetencia;
  fecha: string;
  motivo?: string;
}

export interface FechaBloqueada {
  id: string;
  fecha: string;
  motivo: string;
  tipo: TipoFechaBloqueada;
}

export interface ParametrosCompetencia {
  maxDisciplinas: number;
  permitirInvitados: boolean;
  permitirReapertura: boolean;
  duracionMaximaDias: number;
  permitirSimultaneos: boolean;
}

export interface CalendarioEvento {
  id: string;
  competenciaId: string;
  titulo: string;
  fecha: string;
  tipo: 'inicio_fase' | 'fin_fase' | 'fecha_limite' | 'evento';
}

export interface DisciplinaCompetenciaConfig {
  disciplinaId: string;
  fases: FaseEncuentro[];
}

// ──── Entidad principal ────

export interface Competencia {
  id: string;
  nombre: string;
  tipo: TipoCompetencia;
  modalidad: ModalidadCompetencia;
  estructura: EstructuraCompetencia;
  estado: EstadoCompetencia;
  anio: number;
  periodo?: string;
  observaciones?: string;

  disciplinaIds: string[];
  disciplinasConfig?: DisciplinaCompetenciaConfig[];
  reglasGenerales: ReglaGeneral[];

  // Calendario y vigencia
  fechaInicio: string;
  fechaFin: string;
  fechaInicioInscripcion?: string;
  fechaFinInscripcion?: string;
  diasHabilesCompetencia: number[]; // 0=Dom, 1=Lun ... 6=Sáb
  fechasBloqueadas: FechaBloqueada[];
  calendario: CalendarioEvento[];

  // Parámetros
  parametros: ParametrosCompetencia;

  // Publicación
  publicado: boolean;
  fechaPublicacion?: string;
  publicacionAutomatica: boolean;
  fechaProgramadaPublicacion?: string;

  // Cierre y anulación
  fechaCierre?: string;
  fechaAnulacion?: string;
  motivoCierre?: string;
  motivoAnulacion?: string;
  motivoSuspension?: string;

  // Requisitos especiales
  requiereDeclaracionSalud?: boolean;

  // Metadata
  descripcion?: string;
  historialEstados: HistorialEstado[];
  creadoEn: string;
  actualizadoEn: string;
}

// ──── Constantes ────

export const PARAMETROS_DEFAULT: ParametrosCompetencia = {
  maxDisciplinas: 10,
  permitirInvitados: false,
  permitirReapertura: false,
  duracionMaximaDias: 365,
  permitirSimultaneos: true,
};

/** Transiciones válidas de estado */
export const TRANSICIONES_ESTADO: Record<EstadoCompetencia, EstadoCompetencia[]> = {
  borrador: ['programado', 'anulado'],
  programado: ['en_ejecucion', 'suspendido', 'anulado'],
  en_ejecucion: ['finalizado', 'suspendido'],
  suspendido: ['programado', 'en_ejecucion', 'anulado'],
  finalizado: [],
  anulado: [],
};

/** Labels legibles para cada estado */
export const ESTADO_LABELS: Record<EstadoCompetencia, string> = {
  borrador: 'Borrador',
  programado: 'Programado',
  en_ejecucion: 'En ejecución',
  suspendido: 'Suspendido',
  finalizado: 'Finalizado',
  anulado: 'Anulado',
};

export const TIPO_LABELS: Record<TipoCompetencia, string> = {
  interno: 'Interno',
  abierto: 'Abierto',
};

export const MODALIDAD_LABELS: Record<ModalidadCompetencia, string> = {
  interno_cerrado: 'Interno cerrado',
  interno_invitados: 'Interno con invitados',
  abierto: 'Abierto',
};

export const ESTRUCTURA_LABELS: Record<EstructuraCompetencia, string> = {
  unico: 'Torneo único',
  apertura_clausura: 'Apertura / Clausura',
  fases_especiales: 'Fases especiales',
};

export const DIAS_SEMANA_LABELS: Record<number, string> = {
  0: 'Dom',
  1: 'Lun',
  2: 'Mar',
  3: 'Mié',
  4: 'Jue',
  5: 'Vie',
  6: 'Sáb',
};
