// ──── Condición del cliente ────
export type CondicionCliente =
  | 'socio'
  | 'dependiente'
  | 'no_socio'
  | 'trabajador';

export const CONDICION_CLIENTE_LABELS: Record<CondicionCliente, string> = {
  socio: 'Socio',
  dependiente: 'Dependiente de Socio',
  no_socio: 'No Socio / Particular',
  trabajador: 'Trabajador AELU',
};

// ──── Tarifa (regla de precio base) ────

/**
 * Una Tarifa define el precio base para una combinación específica de variables.
 * El motor de matching consiste en hallar la regla más específica que aplique
 * para una matrícula dada (clase + socio).
 *
 * El orden de especificidad (de más general a más específica):
 *   rubroId → cursoId → categoriaEdadId → frecuenciaSemanal
 *
 * El campo `prioridad` permite desempatar reglas de igual cobertura.
 */
export interface Tarifa {
  id: string;
  nombre: string;
  /** Si se omite, aplica a todos los rubros */
  rubroId?: string;
  /** Si se omite, aplica a todos los cursos del rubro */
  cursoId?: string;
  /** Si se omite, aplica a cualquier categoría de edad */
  categoriaEdadId?: string;
  /** Si se omite, aplica a cualquier frecuencia */
  frecuenciaSemanal?: number;
  condicionCliente: CondicionCliente;
  /** Precio mensual o por programa */
  monto: number;
  /** Derecho de matrícula (opcional) */
  montoMatricula?: number;
  vigente: boolean;
  /** Prioridad para el matching: mayor número = se evalúa primero */
  prioridad: number;
  observaciones?: string;
  creadoEn: string;
}

// ──── Campaña Promocional ────

/**
 * Una Campaña sobreescribe el precio base de tarifas específicas
 * durante un rango de fechas concreto.
 */
export interface CampanaPromo {
  id: string;
  nombre: string;
  descripcion?: string;
  fechaInicio: string;   // YYYY-MM-DD
  fechaFin: string;      // YYYY-MM-DD
  /** Aplica solo a estas tarifas; vacío = aplica a todas las vigentes */
  tarifaIds: string[];
  montoPromo: number;
  /** Filtro adicional por curso (opcional, para campañas por disciplina) */
  cursoId?: string;
  /** Filtro adicional por condición de cliente */
  condicionCliente?: CondicionCliente;
  activa: boolean;
  creadoEn: string;
}

// ──── Resultado del match de precios ────

export interface ResultadoCalculo {
  tarifaAplicada: Tarifa | null;
  campanaAplicada: CampanaPromo | null;
  montoBase: number;
  montoPromo: number | null;
  montoCobrar: number;
  montoMatricula: number;
  /** true si existe una campaña activa pero fue desplazada por un convenio */
  campanaDesplazada: boolean;
}

// ──── Labels y constantes ────

export const FRECUENCIA_LABELS: Record<number, string> = {
  1: '1 vez / semana',
  2: '2 veces / semana',
  3: '3 veces / semana',
  4: '4 veces / semana',
  5: '5 veces / semana',
};
