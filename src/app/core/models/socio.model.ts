export type TipoDocumento = 'dni' | 'carnet_extranjeria' | 'pasaporte';
export type Sexo = 'masculino' | 'femenino' | 'otro';
export type CondicionInstitucional = 'socio' | 'dependiente' | 'no_socio';
export type CondicionSocietaria = 'individual' | 'familiar' | 'transitorio_menor' | 'transitorio_mayor';
export type RelacionApoderado = 'padre' | 'madre' | 'tutor_legal' | 'otro';
export type RelacionDependiente = 'hijo' | 'hija' | 'conyuge' | 'concubino' | 'otro';

export interface PersonaRelacionadaSocio {
  id: string;
  nombre: string;
  apellido: string;
  relacion: RelacionApoderado;
  dni?: string;
  telefono?: string;
  email?: string;
}

export interface DiscapacidadInfo {
  tieneDiscapacidad: boolean;
  tipo?: string;
  grado?: string;
  numeroConadis?: string;
}

export interface Dependiente {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento?: string;
  relacion: RelacionDependiente;
  condicion?: CondicionInstitucional;
  discapacidad?: DiscapacidadInfo;
  marcaProteccionPermanencia: boolean;
  estado: 'activo' | 'inactivo';
  fechaAlta: string;
  fechaBaja?: string;
}

export interface NivelAcademicoAlumno {
  id: string;
  disciplina: string;
  nivel: string;
  fechaOtorgado: string;
  certificadoPor?: string;
  observaciones?: string;
}

export interface Socio {
  id: string;
  codigoSocio?: string;
  nombre: string;
  apellido: string;
  tipoDocumento?: TipoDocumento;
  dni: string;
  sexo?: Sexo;
  nacionalidad?: string;
  email?: string;
  telefono?: string;
  fechaNacimiento?: string;
  direccion?: string;
  condicionInstitucional?: CondicionInstitucional;
  condicionSocietaria?: CondicionSocietaria;
  titularId?: string;
  dependientes?: Dependiente[];
  personasRelacionadas?: PersonaRelacionadaSocio[];
  discapacidad?: DiscapacidadInfo;
  historialNiveles?: NivelAcademicoAlumno[];
  estado: EstadoSocio;
  fechaAlta: string;
  fechaBaja?: string;
  observaciones?: string;
}

export type EstadoSocio = 'activo' | 'inactivo' | 'suspendido';

export const TIPO_DOCUMENTO_LABELS: Record<TipoDocumento, string> = {
  dni: 'DNI',
  carnet_extranjeria: 'Carnet de Extranjería',
  pasaporte: 'Pasaporte',
};

export const SEXO_LABELS: Record<Sexo, string> = {
  masculino: 'Masculino',
  femenino: 'Femenino',
  otro: 'Otro',
};

export const CONDICION_INSTITUCIONAL_LABELS: Record<CondicionInstitucional, string> = {
  socio: 'Socio',
  dependiente: 'Dependiente de Socio',
  no_socio: 'No Socio',
};

export const CONDICION_SOCIETARIA_LABELS: Record<CondicionSocietaria, string> = {
  individual: 'Individual',
  familiar: 'Familiar',
  transitorio_menor: 'Transitorio Menor',
  transitorio_mayor: 'Transitorio Mayor',
};

export const RELACION_APODERADO_LABELS: Record<RelacionApoderado, string> = {
  padre: 'Padre',
  madre: 'Madre',
  tutor_legal: 'Tutor Legal',
  otro: 'Otro',
};

export const RELACION_DEPENDIENTE_LABELS: Record<RelacionDependiente, string> = {
  hijo: 'Hijo',
  hija: 'Hija',
  conyuge: 'Cónyuge',
  concubino: 'Concubino/a',
  otro: 'Otro',
};

export const ESTADO_SOCIO_LABELS: Record<EstadoSocio, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  suspendido: 'Suspendido',
};
