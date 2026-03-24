// ──── Tipos de Asistencia de Alumnos ────

export type EstadoAsistenciaAlumno = 'asistio' | 'no_asistio' | 'tardanza' | 'justificado';

export const ESTADO_ASISTENCIA_ALUMNO_LABELS: Record<EstadoAsistenciaAlumno, string> = {
  asistio: 'Asistió',
  no_asistio: 'No Asistió',
  tardanza: 'Tardanza',
  justificado: 'Justificado',
};

export const ESTADO_ASISTENCIA_ALUMNO_COLORS: Record<EstadoAsistenciaAlumno, string> = {
  asistio: 'bg-emerald-100 text-emerald-700',
  no_asistio: 'bg-red-100 text-red-700',
  tardanza: 'bg-amber-100 text-amber-700',
  justificado: 'bg-blue-100 text-blue-700',
};

// ──── Tipos de Incidencia ────

export type TipoIncidencia = 'infraestructura' | 'disciplina' | 'administrativo' | 'otro';

export const TIPO_INCIDENCIA_LABELS: Record<TipoIncidencia, string> = {
  infraestructura: 'Infraestructura',
  disciplina: 'Disciplina',
  administrativo: 'Administrativo',
  otro: 'Otro',
};

export const TIPO_INCIDENCIA_COLORS: Record<TipoIncidencia, string> = {
  infraestructura: 'bg-orange-100 text-orange-700',
  disciplina: 'bg-red-100 text-red-700',
  administrativo: 'bg-purple-100 text-purple-700',
  otro: 'bg-slate-100 text-slate-700',
};

// ──── Tipos de Control de Docente ────

export type EstadoAsistenciaDocente = 'presente' | 'ausente' | 'tardanza' | 'con_suplente';

export const ESTADO_ASISTENCIA_DOCENTE_LABELS: Record<EstadoAsistenciaDocente, string> = {
  presente: 'Presente',
  ausente: 'Ausente',
  tardanza: 'Tardanza',
  con_suplente: 'Con Suplente',
};

export const ESTADO_ASISTENCIA_DOCENTE_COLORS: Record<EstadoAsistenciaDocente, string> = {
  presente: 'bg-emerald-100 text-emerald-700',
  ausente: 'bg-red-100 text-red-700',
  tardanza: 'bg-amber-100 text-amber-700',
  con_suplente: 'bg-blue-100 text-blue-700',
};

// ──── Estado de Sesión ────

export type EstadoSesionAsistencia = 'pendiente' | 'tomada' | 'cancelada';

export const ESTADO_SESION_LABELS: Record<EstadoSesionAsistencia, string> = {
  pendiente: 'Pendiente',
  tomada: 'Tomada',
  cancelada: 'Cancelada',
};

// ──── Interfaces Principales ────

/** Una sesión de clase para la cual se toma asistencia */
export interface SesionAsistencia {
  id: string;
  claseId: string;
  fecha: string; // YYYY-MM-DD
  horaInicio: string;
  horaFin: string;
  horaRealInicio?: string;
  horaRealFin?: string;
  estado: EstadoSesionAsistencia;
  creadoEn: string;
}

/** Registro de asistencia de un alumno para una sesión */
export interface RegistroAsistenciaAlumno {
  id: string;
  sesionId: string;
  socioId: string;
  estado: EstadoAsistenciaAlumno;
  observaciones?: string;
}

/** Incidencia registrada en una sesión */
export interface IncidenciaClase {
  id: string;
  sesionId: string;
  tipo: TipoIncidencia;
  descripcion: string;
  socioIdsInvolucrados?: string[];
  creadoEn: string;
}

/** Lista de asistencia completa para una sesión (vista consolidada) */
export interface ListaAsistencia {
  sesion: SesionAsistencia;
  registros: RegistroAsistenciaAlumno[];
  incidencias: IncidenciaClase[];
  controlDocente?: ControlAsistenciaDocente;
}

/** Control de asistencia del docente, registrado por un controlador */
export interface ControlAsistenciaDocente {
  id: string;
  sesionId: string;
  docenteId: string;
  estado: EstadoAsistenciaDocente;
  minutosTardanza?: number;
  docenteSustitutoId?: string;
  controladorNombre?: string;
  observaciones?: string;
  fechaRegistro: string;
}
