// ──── Tipos ───────────────────────────────────────────────────

export type EstadoRetiro = 'borrador' | 'pendiente_aprobacion' | 'procesado' | 'cancelado';

export type TipoRetiro = 'parcial' | 'total';

export type ResponsabilidadRetiro = 'cliente' | 'institucion';

export type FormaDevolucion = 'nota_credito' | 'efectivo' | 'transferencia';

// ──── Labels ──────────────────────────────────────────────────

export const ESTADO_RETIRO_LABELS: Record<EstadoRetiro, string> = {
  borrador: 'Borrador',
  pendiente_aprobacion: 'Pend. Aprobación',
  procesado: 'Procesado',
  cancelado: 'Cancelado',
};

export const TIPO_RETIRO_LABELS: Record<TipoRetiro, string> = {
  parcial: 'Retiro Parcial',
  total: 'Anulación Total',
};

export const RESPONSABILIDAD_RETIRO_LABELS: Record<ResponsabilidadRetiro, string> = {
  cliente: 'Por motivos del cliente',
  institucion: 'Por responsabilidad de AELU',
};

export const FORMA_DEVOLUCION_LABELS: Record<FormaDevolucion, string> = {
  nota_credito: 'Nota de Crédito',
  efectivo: 'Efectivo por Caja',
  transferencia: 'Transferencia Bancaria',
};

// ──── Cálculo de prorrateo ─────────────────────────────────────

export interface CalculoRetiro {
  totalSesiones: number;
  sesionesAsistidas: number;
  sesionesPendientes: number;
  costoTotalPagado: number;
  costoPorSesion: number;
  costoSesionesAsistidas: number;
  saldoSesionesPendientes: number;
  aplicaGastoAdministrativo: boolean;
  gastoAdministrativo: number;
  montoNotaCredito: number;
}

// ──── Retiro ──────────────────────────────────────────────────

export interface Retiro {
  id: string;
  matriculaId: string;
  socioId: string;
  nombreSocio: string;
  cursoNombre: string;
  claseNombre: string;
  tipo: TipoRetiro;
  responsabilidad: ResponsabilidadRetiro;
  motivoRetiro: string;
  documentoJustificante?: string;
  calculo: CalculoRetiro;
  notaCreditoId?: string;
  formaDevolucion: FormaDevolucion;
  /** Si aplica, el docente verá el monto reducido en su liquidación mensual */
  impactoLiquidacionDocente: boolean;
  estado: EstadoRetiro;
  procesadoPor: string;
  fechaProcesamiento: string;
  observaciones?: string;
}

// ──── Configuración parametrizable de Gasto Administrativo ───

export interface ConfiguracionGastoAdmin {
  tipo: 'porcentaje' | 'monto_fijo';
  valor: number;
}

export const DEFAULT_GASTO_ADMIN: ConfiguracionGastoAdmin = {
  tipo: 'monto_fijo',
  valor: 15,
};
