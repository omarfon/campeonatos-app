export interface Socio {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  email?: string;
  telefono?: string;
  fechaNacimiento?: string;
  direccion?: string;
  estado: EstadoSocio;
  fechaAlta: string;
  fechaBaja?: string;
  observaciones?: string;
}

export type EstadoSocio = 'activo' | 'inactivo' | 'suspendido';

export const ESTADO_SOCIO_LABELS: Record<EstadoSocio, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  suspendido: 'Suspendido',
};
