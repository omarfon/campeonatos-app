export type TipoTramite =
  | 'nueva_afiliacion'
  | 'cambio_condicion'
  | 'suspension_viaje'
  | 'suspension_salud'
  | 'baja_renuncia'
  | 'alta_dependiente'
  | 'baja_dependiente'
  | 'habilidad_diferente'
  | 'reactivacion';

export type EstadoSolicitud =
  | 'borrador'
  | 'enviada'
  | 'en_evaluacion'
  | 'aprobada'
  | 'rechazada'
  | 'anulada';

export interface DocumentoAdjunto {
  id: string;
  nombre: string;
  tipo: string;
  url: string;
  cargadoEn: string;
  cargadoPor: string;
}

export interface AuditoriaEntrada {
  accion: string;
  usuario: string;
  fechaHora: string;
  observacion?: string;
}

export interface SolicitudSocietaria {
  id: string;
  socioId: string;
  tipo: TipoTramite;
  estado: EstadoSolicitud;
  fechaCreacion: string;
  fechaUltimaAccion: string;
  descripcion: string;
  documentos: DocumentoAdjunto[];
  auditoria: AuditoriaEntrada[];
  motivoRechazo?: string;
  observaciones?: string;
  operador?: string;
  evaluador?: string;
  aprobador?: string;
  vigenciaInicio?: string;
  vigenciaFin?: string;
  dependienteId?: string;
}

export const TIPO_TRAMITE_LABELS: Record<TipoTramite, string> = {
  nueva_afiliacion: 'Nueva Afiliación',
  cambio_condicion: 'Cambio de Condición',
  suspension_viaje: 'Suspensión por Viaje',
  suspension_salud: 'Suspensión por Salud',
  baja_renuncia: 'Baja / Renuncia',
  alta_dependiente: 'Alta de Dependiente',
  baja_dependiente: 'Baja de Dependiente',
  habilidad_diferente: 'Habilidad Diferente',
  reactivacion: 'Reactivación',
};

export const ESTADO_SOLICITUD_LABELS: Record<EstadoSolicitud, string> = {
  borrador: 'Borrador',
  enviada: 'Enviada',
  en_evaluacion: 'En Evaluación',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  anulada: 'Anulada',
};

export const ESTADO_SOLICITUD_CLASSES: Record<EstadoSolicitud, string> = {
  borrador: 'bg-slate-100 text-slate-600',
  enviada: 'bg-blue-100 text-blue-700',
  en_evaluacion: 'bg-amber-100 text-amber-700',
  aprobada: 'bg-green-100 text-green-700',
  rechazada: 'bg-red-100 text-red-700',
  anulada: 'bg-slate-100 text-slate-500',
};
