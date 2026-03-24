import { CondicionCliente } from './tarifa.model';

// ──── Tipos de beneficio ────

export type TipoBeneficio =
  | 'descuento_porcentaje'  // ej. 35% sobre tarifa base
  | 'tarifa_neta'           // precio fijo negociado
  | 'tarifa_socio';         // aplica la tarifa de "socio" a qui no lo es

export const TIPO_BENEFICIO_LABELS: Record<TipoBeneficio, string> = {
  descuento_porcentaje: 'Descuento Porcentual',
  tarifa_neta: 'Tarifa Neta Negociada',
  tarifa_socio: 'Tarifa de Socio (como si fuera socio)',
};

// ──── Regla de beneficio dentro de un convenio ────

/**
 * Cada convenio puede tener distintas reglas según la condición institucional
 * del colaborador (ya es socio, o es no-socio, etc.).
 */
export interface ReglaBeneficio {
  id: string;
  condicionCliente: CondicionCliente;
  tipo: TipoBeneficio;
  /**
   * Si tipo = 'descuento_porcentaje': valor entre 0 y 100 (%)
   * Si tipo = 'tarifa_neta': monto en soles
   * Si tipo = 'tarifa_socio': ignorado (el motor usa la tarifa de socio)
   */
  valor: number;
  /** Si se define, el beneficio aplica solo a estos cursos; vacío = todos */
  cursoIds: string[];
}

// ──── Convenio institucional ────

export type EstadoConvenio = 'activo' | 'vencido' | 'suspendido';

export const ESTADO_CONVENIO_LABELS: Record<EstadoConvenio, string> = {
  activo: 'Activo',
  vencido: 'Vencido',
  suspendido: 'Suspendido',
};

export interface Convenio {
  id: string;
  nombre: string;
  /** Nombre de la empresa/institución (ej. "Royal", "Colegio La Unión") */
  empresa: string;
  descripcion?: string;
  fechaInicio: string;  // YYYY-MM-DD
  fechaFin: string;     // YYYY-MM-DD
  reglasBeneficios: ReglaBeneficio[];
  /**
   * false = los descuentos del convenio NO son acumulables con campañas
   * activas; el sistema elige el más beneficioso para el alumno.
   */
  acumularConCampana: boolean;
  estado: EstadoConvenio;
  contactoNombre?: string;
  contactoEmail?: string;
  creadoEn: string;
}

// ──── Beneficiario registrado en un convenio ────

export interface BeneficiarioConvenio {
  id: string;
  convenioId: string;
  socioId: string;
  nombreSocio: string;
  dniSocio: string;
  /** Condición bajo la que accede al beneficio */
  condicionEnConvenio: CondicionCliente;
  fechaRegistro: string;
  activo: boolean;
  observaciones?: string;
}
