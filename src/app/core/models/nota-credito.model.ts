// ──── Tipos ───────────────────────────────────────────────────

export type EstadoNotaCredito =
  | 'activa'
  | 'aplicada_parcial'
  | 'aplicada_total'
  | 'vencida'
  | 'anulada';

export type OrigenNotaCredito =
  | 'retiro_parcial'
  | 'anulacion_total'
  | 'recuperacion_diferida'
  | 'ajuste_administrativo';

// ──── Labels ──────────────────────────────────────────────────

export const ESTADO_NC_LABELS: Record<EstadoNotaCredito, string> = {
  activa: 'Activa',
  aplicada_parcial: 'Aplicada Parcialmente',
  aplicada_total: 'Aplicada Totalmente',
  vencida: 'Vencida',
  anulada: 'Anulada',
};

export const ORIGEN_NC_LABELS: Record<OrigenNotaCredito, string> = {
  retiro_parcial: 'Retiro Parcial',
  anulacion_total: 'Anulación Total',
  recuperacion_diferida: 'Recuperación Diferida',
  ajuste_administrativo: 'Ajuste Administrativo',
};

// ──── Interfaces ──────────────────────────────────────────────

export interface AplicacionNotaCredito {
  id: string;
  matriculaId: string;
  cursoNombre: string;
  monto: number;
  fecha: string;
  aplicadoPor: string;
}

export interface NotaCredito {
  id: string;
  /** Ej: NC-2026-001 */
  numero: string;
  socioId: string;
  nombreSocio: string;
  origen: OrigenNotaCredito;
  /** ID del retiro o recuperación que originó esta nota */
  origenId: string;
  descripcionOrigen: string;
  monto: number;
  saldoDisponible: number;
  estado: EstadoNotaCredito;
  fechaEmision: string;
  fechaVencimiento?: string;
  aplicaciones: AplicacionNotaCredito[];
  observaciones?: string;
}
