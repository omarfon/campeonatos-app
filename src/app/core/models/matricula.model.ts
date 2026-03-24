// ──── Tipos de Estado ────

export type EstadoMatricula =
  | 'reservada'
  | 'pendiente_pago'
  | 'pagada'
  | 'confirmada'
  | 'anulada'
  | 'retirada';

export type TipoMatricula = 'nueva' | 'renovacion' | 'cambio_clase' | 'reingreso';

export type CanalMatricula = 'ventanilla' | 'portal';

export type EstadoPago = 'pendiente' | 'parcial' | 'pagado' | 'anulado';

export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia' | 'convenio';

export type TipoDescuento = 'hermanos' | 'pronto_pago' | 'convenio' | 'campana' | 'cofinanciamiento';

export type MotivoAnulacion = 'solicitud_alumno' | 'falta_pago' | 'sancion' | 'error_administrativo';

export type MotivoRetiro = 'voluntario' | 'medico' | 'viaje' | 'otro';

// ──── Labels ────

export const ESTADO_MATRICULA_LABELS: Record<EstadoMatricula, string> = {
  reservada: 'Reservada',
  pendiente_pago: 'Pendiente de Pago',
  pagada: 'Pagada',
  confirmada: 'Confirmada',
  anulada: 'Anulada',
  retirada: 'Retirada',
};

export const TIPO_MATRICULA_LABELS: Record<TipoMatricula, string> = {
  nueva: 'Nueva',
  renovacion: 'Renovación',
  cambio_clase: 'Cambio de Clase',
  reingreso: 'Reingreso',
};

export const CANAL_MATRICULA_LABELS: Record<CanalMatricula, string> = {
  ventanilla: 'Ventanilla',
  portal: 'Portal Web',
};

export const METODO_PAGO_LABELS: Record<MetodoPago, string> = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
  convenio: 'Convenio',
};

// ──── Persona Relacionada (apoderado/contacto) ────

export interface PersonaRelacionada {
  nombre: string;
  apellido: string;
  parentesco: string;
  dni: string;
  telefono: string;
  email?: string;
  esApoderado: boolean;
}

// ──── Ficha del Alumno ampliada ────

export interface FichaAlumno {
  socioId: string;
  personasRelacionadas: PersonaRelacionada[];
  condicionMedica?: string;
  certificadoMedicoVigente: boolean;
  certificadoMedicoVencimiento?: string;
  declaracionJuradaFirmada: boolean;
  observaciones?: string;
}

// ──── Descuento aplicado ────

export interface DescuentoAplicado {
  tipo: TipoDescuento;
  descripcion: string;
  porcentaje: number;
}

// ──── Pago ────

export interface PagoMatricula {
  id: string;
  matriculaId: string;
  monto: number;
  metodo: MetodoPago;
  fecha: string;
  referencia?: string;
  observaciones?: string;
}

// ──── Matrícula ────

export interface Matricula {
  id: string;
  socioId: string;
  claseId: string;
  tipo: TipoMatricula;
  canal: CanalMatricula;
  estado: EstadoMatricula;
  fechaRegistro: string;
  fechaConfirmacion?: string;
  fechaAnulacion?: string;
  fechaRetiro?: string;
  motivoAnulacion?: MotivoAnulacion;
  motivoRetiro?: MotivoRetiro;
  tarifaBase: number;
  descuentos: DescuentoAplicado[];
  montoFinal: number;
  pagos: PagoMatricula[];
  estadoPago: EstadoPago;
  reservaExpira?: string;
  observaciones?: string;
  creadoPor: string;
  modificadoPor?: string;
}

// ──── Vacante Info ────

export interface VacanteInfo {
  claseId: string;
  totalVacantes: number;
  ocupadas: number;
  reservadas: number;
  disponibles: number;
}

// ──── Resultado de Validación ────

export interface ValidacionMatriculaDetalle {
  permitido: boolean;
  mensajes: string[];
  edadSocio?: number;
  vacantesDisponibles?: number;
  tarifaSugerida?: number;
  descuentosSugeridos?: DescuentoAplicado[];
}

// ──── Historial Académico ────

export interface HistorialAcademico {
  socioId: string;
  cursoId: string;
  cursoNombre: string;
  claseId: string;
  periodo: string;
  estado: EstadoMatricula;
  fechaInicio: string;
  fechaFin?: string;
}
