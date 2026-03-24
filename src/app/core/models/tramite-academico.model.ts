export type TipoTramiteAcademico =
  | 'constancia_matricula'
  | 'cambio_clase'
  | 'cambio_nivel'
  | 'baja_curso'
  | 'certificado_notas'
  | 'reclamo_asistencia'
  | 'solicitud_evaluacion'
  | 'cambio_datos';

export type EstadoTramiteAcademico =
  | 'borrador'
  | 'enviada'
  | 'en_revision'
  | 'aprobada'
  | 'rechazada'
  | 'anulada';

export interface AuditoriaEntradaAcademica {
  accion: string;
  usuario: string;
  fechaHora: string;
  observacion?: string;
}

export interface TramiteAcademico {
  id: string;
  alumnoNombre: string;
  alumnoDni: string;
  matriculaId?: string;
  cursoNombre?: string;
  tipo: TipoTramiteAcademico;
  estado: EstadoTramiteAcademico;
  fechaCreacion: string;
  fechaUltimaAccion: string;
  descripcion: string;
  observaciones?: string;
  motivoRechazo?: string;
  operador?: string;
  evaluador?: string;
  auditoria: AuditoriaEntradaAcademica[];
}

export const TIPO_TRAMITE_ACADEMICO_LABELS: Record<TipoTramiteAcademico, string> = {
  constancia_matricula: 'Constancia de Matrícula',
  cambio_clase: 'Cambio de Clase / Horario',
  cambio_nivel: 'Cambio de Nivel',
  baja_curso: 'Baja de Curso',
  certificado_notas: 'Certificado de Notas / Logros',
  reclamo_asistencia: 'Reclamo de Asistencia',
  solicitud_evaluacion: 'Solicitud de Evaluación de Nivel',
  cambio_datos: 'Actualización de Datos',
};

export const ESTADO_TRAMITE_ACADEMICO_LABELS: Record<EstadoTramiteAcademico, string> = {
  borrador: 'Borrador',
  enviada: 'Enviada',
  en_revision: 'En Revisión',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  anulada: 'Anulada',
};

export const ESTADO_TRAMITE_ACADEMICO_CLASSES: Record<EstadoTramiteAcademico, string> = {
  borrador: 'bg-slate-100 text-slate-600',
  enviada: 'bg-blue-100 text-blue-700',
  en_revision: 'bg-amber-100 text-amber-700',
  aprobada: 'bg-green-100 text-green-700',
  rechazada: 'bg-red-100 text-red-700',
  anulada: 'bg-slate-200 text-slate-500',
};
