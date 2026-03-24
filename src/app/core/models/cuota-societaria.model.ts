export type EstadoCuota = 'pendiente' | 'pagada' | 'vencida' | 'exonerada';
export type MetodoPago = 'efectivo' | 'transferencia' | 'tarjeta' | 'cheque';

export interface CuotaSocietaria {
  id: string;
  socioId: string;
  /** Formato YYYY-MM */
  periodo: string;
  monto: number;
  estado: EstadoCuota;
  fechaVencimiento: string;
  fechaPago?: string;
  metodoPago?: MetodoPago;
  referenciaPago?: string;
  operadorPago?: string;
  motivoExoneracion?: string;
  generadoEn: string;
}

export const ESTADO_CUOTA_LABELS: Record<EstadoCuota, string> = {
  pendiente: 'Pendiente',
  pagada: 'Pagada',
  vencida: 'Vencida',
  exonerada: 'Exonerada',
};

export const ESTADO_CUOTA_CLASSES: Record<EstadoCuota, string> = {
  pendiente: 'bg-amber-100 text-amber-700',
  pagada: 'bg-green-100 text-green-700',
  vencida: 'bg-red-100 text-red-700',
  exonerada: 'bg-purple-100 text-purple-700',
};

export const METODO_PAGO_LABELS: Record<MetodoPago, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  tarjeta: 'Tarjeta',
  cheque: 'Cheque',
};
