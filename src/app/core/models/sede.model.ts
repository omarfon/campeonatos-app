export type EstadoSede = 'activa' | 'inactiva' | 'en_mantenimiento';

export interface Sede {
  id: string;
  nombre: string;
  direccion: string;
  telefono?: string;
  email?: string;
  estado: EstadoSede;
  campos: Campo[];
}

export interface Campo {
  id: string;
  sedeId: string;
  nombre: string;
  disciplinaIds: string[];
  capacidad?: number;
  superficie?: string;
}

export const ESTADO_SEDE_LABELS: Record<EstadoSede, string> = {
  activa: 'Activa',
  inactiva: 'Inactiva',
  en_mantenimiento: 'En mantenimiento',
};
