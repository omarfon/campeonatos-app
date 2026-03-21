// ──── Tipos base ────

export type TipoRubro = 'deportivo' | 'musica' | 'cultural' | 'tecnologia';

export type TipoNomenclaturaNivel = 'general' | 'cultural_idiomas' | 'artes_marciales';

export type EstadoCurso = 'activo' | 'inactivo';

export type EstadoClase = 'abierta' | 'cerrada' | 'llena';

export type EstadoPrograma = 'activo' | 'inactivo' | 'finalizado';

export type EstadoMatriculaAcademica = 'activa' | 'bloqueada';

export type TipoPrograma = 'vacacional' | 'regular' | 'intensivo';

export type TipoHorarioClase = 'cerrado' | 'abierto';

export type TipoDuracionClase = 'finita' | 'continua';

export type TipoBloqueoInstitucional = 'feriado' | 'evento_interno';

export type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

// ──── Estructura Jerárquica (Árbol de Clasificación) ────

/** Nivel 1: Grandes Rubros */
export interface Rubro {
  id: string;
  nombre: string;
  tipo: TipoRubro;
  descripcion?: string;
  orden: number;
}

/** Nivel 2: Categoría dentro de un Rubro */
export interface CategoriaAcademica {
  id: string;
  rubroId: string;
  nombre: string;
  descripcion?: string;
  orden: number;
}

/** Nivel 2b: Subcategoría dentro de una Categoría */
export interface SubcategoriaAcademica {
  id: string;
  categoriaId: string;
  nombre: string;
  descripcion?: string;
  orden: number;
}

// ──── Ficha del Curso (Nivel 3) ────

export interface Curso {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  objetivos: string;
  rubroId: string;
  categoriaId: string;
  subcategoriaId?: string;
  publicoObjetivo?: string;
  requiereCertificadoMedico: boolean;
  edadCertificadoMedico?: number;
  requiereDeclaracionJurada: boolean;
  manejaLevels: boolean;
  tipoNomenclaturaNivel: TipoNomenclaturaNivel;
  estado: EstadoCurso;
}

// ──── Categorías por Edad ────

export interface CategoriaEdad {
  id: string;
  cursoId: string;
  nombre: string;
  edadMinima: number;
  edadMaxima: number;
  esUnica: boolean;
}

// ──── Niveles de Habilidad ────

export interface NivelHabilidad {
  id: string;
  cursoId: string;
  nombre: string;
  orden: number;
  requiereCertificado: boolean;
  descripcion?: string;
}

// ──── Docente y Ambiente ────

export interface Docente {
  id: string;
  nombre: string;
  apellido: string;
  especialidades: string[];
}

export interface Ambiente {
  id: string;
  nombre: string;
  zona: string;
  tipo: string;
  aforoFisico: number;
  aforoPedagogico: number;
  aforoComodin: number;
  capacidad: number;
}

// ──── Clase (Producto Final) ────

export interface HorarioClase {
  dia: DiaSemana;
  horaInicio: string;
  horaFin: string;
}

export interface SesionProgramadaClase {
  fecha: string;
  dia: DiaSemana;
  horaInicio: string;
  horaFin: string;
}

export interface Clase {
  id: string;
  cursoId: string;
  categoriaEdadId: string;
  nivelId?: string;
  ambienteId: string;
  docenteId: string;
  tipoHorario: TipoHorarioClase;
  horarios: HorarioClase[];
  frecuenciaSemanal?: number;
  tipoDuracion: TipoDuracionClase;
  fechaInicio?: string;
  fechaFin?: string;
  vacantes: number;
  matriculados: number;
  tarifaMensual?: number;
  tarifaMatricula?: number;
  estado: EstadoClase;
  periodo: string;
  sesionesProgramadas?: SesionProgramadaClase[];
}

export interface BloqueoInstitucional {
  id: string;
  fecha: string;
  tipo: TipoBloqueoInstitucional;
  motivo: string;
  zona?: string;
}

export interface ValidacionProgramacionClaseResultado {
  permitido: boolean;
  mensajes: string[];
  sesionesReplica: number;
}

// ──── Programa (Paquete Comercial) ────

export interface Programa {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: TipoPrograma;
  fechaInicio: string;
  fechaFin: string;
  cursoIds: string[];
  claseIds: string[];
  estado: EstadoPrograma;
}

export interface NivelAcreditadoSocio {
  id: string;
  socioId: string;
  cursoId: string;
  nivelId: string;
  fechaAcreditacion: string;
  observacion?: string;
}

export interface MatriculaAcademica {
  id: string;
  socioId: string;
  claseId: string;
  fechaRegistro: string;
  estado: EstadoMatriculaAcademica;
  observaciones?: string;
}

export interface ValidacionMatriculaResultado {
  permitido: boolean;
  mensajes: string[];
  edadSocio?: number;
  categoriaEdad?: CategoriaEdad;
  nivelRequerido?: NivelHabilidad;
  nivelAcreditado?: NivelHabilidad;
  vacantesDisponibles?: number;
}

// ──── Constantes ────

export const TIPO_RUBRO_LABELS: Record<TipoRubro, string> = {
  deportivo: 'Cursos Deportivos',
  musica: 'Cursos de Música',
  cultural: 'Cursos Culturales',
  tecnologia: 'Cursos de Tecnología',
};

export const TIPO_NOMENCLATURA_LABELS: Record<TipoNomenclaturaNivel, string> = {
  general: 'General (Principiante / Intermedio / Avanzado)',
  cultural_idiomas: 'Cultural / Idiomas (Básico 1, Básico 2, etc.)',
  artes_marciales: 'Artes Marciales (Grados / Cinturones)',
};

export const ESTADO_CURSO_LABELS: Record<EstadoCurso, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
};

export const ESTADO_CLASE_LABELS: Record<EstadoClase, string> = {
  abierta: 'Abierta',
  cerrada: 'Cerrada',
  llena: 'Llena',
};

export const ESTADO_PROGRAMA_LABELS: Record<EstadoPrograma, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  finalizado: 'Finalizado',
};

export const TIPO_PROGRAMA_LABELS: Record<TipoPrograma, string> = {
  vacacional: 'Vacacional',
  regular: 'Regular',
  intensivo: 'Intensivo',
};

export const TIPO_HORARIO_CLASE_LABELS: Record<TipoHorarioClase, string> = {
  cerrado: 'Horario cerrado',
  abierto: 'Horario abierto',
};

export const TIPO_DURACION_CLASE_LABELS: Record<TipoDuracionClase, string> = {
  finita: 'Duración finita',
  continua: 'Duración continua',
};

export const ESTADO_MATRICULA_LABELS: Record<EstadoMatriculaAcademica, string> = {
  activa: 'Activa',
  bloqueada: 'Bloqueada',
};

export const TIPO_BLOQUEO_INSTITUCIONAL_LABELS: Record<TipoBloqueoInstitucional, string> = {
  feriado: 'Feriado',
  evento_interno: 'Evento interno',
};

export const DIA_SEMANA_LABELS: Record<DiaSemana, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
};
