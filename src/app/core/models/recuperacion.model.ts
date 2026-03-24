// ──── Tipos ───────────────────────────────────────────────────

export type EstadoRecuperacion =
  | 'pendiente_documentos'
  | 'en_evaluacion'
  | 'aprobada'
  | 'rechazada'
  | 'ejecutada'
  | 'diferida';

export type MotivoRecuperacion = 'salud' | 'laboral' | 'viaje_salud' | 'otro';

// ──── Labels ──────────────────────────────────────────────────

export const ESTADO_RECUPERACION_LABELS: Record<EstadoRecuperacion, string> = {
  pendiente_documentos: 'Pend. Documentos',
  en_evaluacion: 'En Evaluación',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  ejecutada: 'Ejecutada',
  diferida: 'Diferida (mes sig.)',
};

export const MOTIVO_RECUPERACION_LABELS: Record<MotivoRecuperacion, string> = {
  salud: 'Salud — Certificado médico',
  laboral: 'Laboral — Carta de empleador',
  viaje_salud: 'Viaje por motivo de salud',
  otro: 'Otro (con documentación)',
};

// ──── Interfaces ──────────────────────────────────────────────

export interface Recuperacion {
  id: string;
  /** Referencia a la matrícula del alumno */
  matriculaId: string;
  socioId: string;
  nombreSocio: string;
  disciplina: string;
  nivel: string;
  /** Clase en la que se produjo la inasistencia */
  claseOriginalId: string;
  nombreClaseOriginal: string;
  /** Fecha de la sesión específica a la que faltó */
  fechaSesionOriginal: string;
  // ── Justificación ──
  motivo: MotivoRecuperacion;
  /** Descripción del documento presentado por el alumno */
  documentoJustificante: string;
  /** Comentario del operador para revisión de la administración */
  comentario: string;
  // ── Evaluación administrativa ──
  estado: EstadoRecuperacion;
  evaluadoPor?: string;
  fechaEvaluacion?: string;
  motivoRechazo?: string;
  // ── Ejecución: clase de recuperación asignada ──
  /** Clase seleccionada para recuperar (mismo nivel/disciplina) */
  claseRecuperacionId?: string;
  nombreClaseRecuperacion?: string;
  fechaRecuperacion?: string;
  /** Indica si se descontó del aforo comodín de la clase asignada */
  aforoComodinDescontado: boolean;
  // ── Diferida al mes siguiente ──
  diferida: boolean;
  /** Nota de Crédito generada cuando la recuperación fue diferida */
  notaCreditoId?: string;
  // ── Auditoría ──
  registradoPor: string;
  fechaRegistro: string;
  observaciones?: string;
}
