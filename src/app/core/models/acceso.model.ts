import { CondicionInstitucional } from './socio.model';

// ──── Estado del Carnet ────

export type EstadoCarnet = 'activo' | 'inactivo' | 'bloqueado';

export const ESTADO_CARNET_LABELS: Record<EstadoCarnet, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  bloqueado: 'Bloqueado',
};

// ──── Tipo de Movimiento en Molinete ────

export type TipoAcceso = 'ingreso' | 'salida';

export const TIPO_ACCESO_LABELS: Record<TipoAcceso, string> = {
  ingreso: 'Ingreso',
  salida: 'Salida',
};

// ──── Resultado del Escaneo ────

export type ResultadoAcceso = 'permitido' | 'bloqueado' | 'alerta_tiempo';

export const RESULTADO_ACCESO_LABELS: Record<ResultadoAcceso, string> = {
  permitido: 'Permitido',
  bloqueado: 'Bloqueado',
  alerta_tiempo: 'Alerta de Tiempo',
};

export const RESULTADO_ACCESO_COLORS: Record<ResultadoAcceso, string> = {
  permitido: 'bg-emerald-100 text-emerald-700',
  bloqueado: 'bg-red-100 text-red-700',
  alerta_tiempo: 'bg-amber-100 text-amber-700',
};

// ──── Estado de Penalidad ────

export type EstadoPenalidad = 'pendiente' | 'pagada' | 'exonerada';

export const ESTADO_PENALIDAD_LABELS: Record<EstadoPenalidad, string> = {
  pendiente: 'Pendiente',
  pagada: 'Pagada',
  exonerada: 'Exonerada',
};

export const ESTADO_PENALIDAD_COLORS: Record<EstadoPenalidad, string> = {
  pendiente: 'bg-amber-100 text-amber-700',
  pagada: 'bg-emerald-100 text-emerald-700',
  exonerada: 'bg-blue-100 text-blue-700',
};

// ──── Interfaces Principales ────

/** Carnet de proximidad emitido al alumno matriculado */
export interface CarnetAcceso {
  id: string;
  socioId: string;
  codigoCarnet: string; // código único de proximidad
  claseIds: string[]; // clases para las que este carnet da acceso
  condicion: CondicionInstitucional;
  estado: EstadoCarnet;
  emitidoEn: string; // YYYY-MM-DD
  foto?: string; // URL o base64 (no usar con NgOptimizedImage si es base64)
}

/** Registro de paso por molinete */
export interface RegistroAcceso {
  id: string;
  carnetId: string;
  socioId: string;
  claseId?: string; // clase que justifica el ingreso/salida
  tipo: TipoAcceso;
  fechaHora: string; // ISO datetime
  resultado: ResultadoAcceso;
  motivoBloqueo?: string;
  derivadoPenalidad?: boolean;
  registradoPor?: string; // nombre del personal de seguridad
}

/** Penalidad por exceso de permanencia */
export interface PenalidadAcceso {
  id: string;
  registroAccesoId: string;
  socioId: string;
  minutosExcedidos: number;
  montoCalculado: number;
  estado: EstadoPenalidad;
  motivoExoneracion?: string;
  observaciones?: string;
  fechaRegistro: string;
  fechaResolucion?: string;
}

/** Parámetros globales del sistema de acceso */
export interface ConfiguracionAcceso {
  toleranciaIngresoMinutos: number; // minutos antes del inicio de clase
  toleranciaSalidaMinutos: number;  // minutos después del fin de clase
  montoMultaPorHoraFraccion: number; // monto en soles
  aplicarANoSocios: boolean;
  aplicarASocios: boolean;
}
