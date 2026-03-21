export type CausalInhabilitacion =
  | 'deuda_pendiente'
  | 'falta_declaracion_salud'
  | 'suspension_tarjetas';

export const CAUSAL_INHABILITACION_LABELS: Record<CausalInhabilitacion, string> = {
  deuda_pendiente: 'Deuda pendiente (cuota de mantenimiento)',
  falta_declaracion_salud: 'Falta declaración jurada de salud',
  suspension_tarjetas: 'Suspensión por tarjetas',
};

export interface InhabilitacionJugador {
  participanteId: string;
  nombre: string;
  apellido: string;
  dni: string;
  equipoId: string;
  equipoNombre: string;
  numeroCamiseta?: number;
  posicion?: string;
  causales: CausalInhabilitacion[];
}

export interface ReportePrePartido {
  encuentroId: string;
  competenciaId: string;
  competenciaNombre: string;
  disciplinaNombre: string;
  fase: string;
  numeroFecha: number;
  equipoLocalId: string;
  equipoLocalNombre: string;
  equipoVisitanteId: string;
  equipoVisitanteNombre: string;
  fechaHora: string;
  sede?: string;
  campo?: string;
  arbitro?: string;
  fechaGeneracion: string;
  inhabilitadosLocal: InhabilitacionJugador[];
  inhabilitadosVisitante: InhabilitacionJugador[];
  habilitadosLocal: number;
  habilitadosVisitante: number;
  totalJugadoresLocal: number;
  totalJugadoresVisitante: number;
}
