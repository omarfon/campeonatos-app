import { TipoDocumento, RelacionDependiente, Sexo } from './socio.model';

/** Estados del workflow de aprobación de postulantes */
export type EstadoPostulante =
  | 'ingresado'
  | 'documentacion_pendiente'
  | 'documentacion_completa'
  | 'en_evaluacion'
  | 'aprobado'
  | 'rechazado';

export const ESTADO_POSTULANTE_LABELS: Record<EstadoPostulante, string> = {
  ingresado: 'Ingresado',
  documentacion_pendiente: 'Doc. Pendiente',
  documentacion_completa: 'Doc. Completa',
  en_evaluacion: 'En Evaluación',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
};

export const ESTADO_POSTULANTE_CLASSES: Record<EstadoPostulante, string> = {
  ingresado: 'bg-slate-100 text-slate-600',
  documentacion_pendiente: 'bg-amber-100 text-amber-700',
  documentacion_completa: 'bg-blue-100 text-blue-700',
  en_evaluacion: 'bg-purple-100 text-purple-700',
  aprobado: 'bg-green-100 text-green-700',
  rechazado: 'bg-red-100 text-red-700',
};

/** Pasos del workflow en orden */
export const WORKFLOW_STEPS: EstadoPostulante[] = [
  'ingresado',
  'documentacion_pendiente',
  'documentacion_completa',
  'en_evaluacion',
  'aprobado',
];

export interface HistorialWorkflow {
  estado: EstadoPostulante;
  fecha: string;
  operador: string;
  observacion?: string;
}

export interface DocumentoPostulante {
  id: string;
  nombre: string;
  tipo: 'dni_frente' | 'dni_dorso' | 'fotografia' | 'aval' | 'otro';
  cargadoEn: string;
}

export const TIPO_DOC_POSTULANTE_LABELS: Record<DocumentoPostulante['tipo'], string> = {
  dni_frente: 'DNI (frente)',
  dni_dorso: 'DNI (dorso)',
  fotografia: 'Fotografía',
  aval: 'Carta de aval',
  otro: 'Otro',
};

/** Estado de cada integrante del grupo familiar postulante */
export type EstadoDependientePostulante = 'pendiente' | 'aceptado' | 'rechazado';

export const ESTADO_DEP_POSTULANTE_LABELS: Record<EstadoDependientePostulante, string> = {
  pendiente: 'Pendiente',
  aceptado: 'Aceptado',
  rechazado: 'Rechazado',
};

export const ESTADO_DEP_POSTULANTE_CLASSES: Record<EstadoDependientePostulante, string> = {
  pendiente: 'bg-amber-100 text-amber-700',
  aceptado: 'bg-green-100 text-green-700',
  rechazado: 'bg-red-100 text-red-700',
};

export interface DependientePostulante {
  id: string;
  nombre: string;
  apellido: string;
  tipoDocumento: TipoDocumento;
  dni: string;
  fechaNacimiento?: string;
  relacion: RelacionDependiente;
  sexo?: Sexo;
  estado: EstadoDependientePostulante;
  motivoRechazo?: string;
}

export interface Postulante {
  id: string;
  /** Número correlativo visible */
  codigoPostulante?: string;
  nombre: string;
  apellido: string;
  tipoDocumento: TipoDocumento;
  dni: string;
  email?: string;
  telefono?: string;
  fechaNacimiento?: string;
  sexo?: 'masculino' | 'femenino' | 'otro';
  nacionalidad?: string;
  direccion?: string;
  /** Socio que avala al postulante (opcional) */
  avaladoPorSocioId?: string;
  /** Condición societaria deseada */
  condicionDeseada?: 'individual' | 'familiar' | 'transitorio_menor' | 'transitorio_mayor';
  estado: EstadoPostulante;
  historial: HistorialWorkflow[];
  documentos: DocumentoPostulante[];
  /** Integrantes del grupo familiar (solo condición familiar) */
  dependientesPostulantes?: DependientePostulante[];
  motivoRechazo?: string;
  observaciones?: string;
  /** Fecha de creación del registro */
  fechaIngreso: string;
  /** Si fue convertido a socio, el id del socio creado */
  socioConvertidoId?: string;
}
