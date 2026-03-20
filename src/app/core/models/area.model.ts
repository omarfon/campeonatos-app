export type TipoArea =
  | 'cancha_futbol'
  | 'cancha_voley'
  | 'cancha_basquet'
  | 'piscina'
  | 'pista_atletismo'
  | 'gimnasio'
  | 'multiproposito'
  | 'otro';

export type EstadoArea = 'disponible' | 'ocupada' | 'en_mantenimiento' | 'fuera_de_servicio';

export interface Area {
  id: string;
  nombre: string;
  tipo: TipoArea;
  sedeId?: string;
  descripcion?: string;
  superficie?: string;
  capacidad?: number;
  dimensiones?: string;
  techada: boolean;
  iluminacion: boolean;
  estado: EstadoArea;
}

export const TIPO_AREA_LABELS: Record<TipoArea, string> = {
  cancha_futbol: 'Cancha de fútbol',
  cancha_voley: 'Cancha de vóley',
  cancha_basquet: 'Cancha de básquet',
  piscina: 'Piscina',
  pista_atletismo: 'Pista de atletismo',
  gimnasio: 'Gimnasio',
  multiproposito: 'Multipropósito',
  otro: 'Otro',
};

export const ESTADO_AREA_LABELS: Record<EstadoArea, string> = {
  disponible: 'Disponible',
  ocupada: 'Ocupada',
  en_mantenimiento: 'En mantenimiento',
  fuera_de_servicio: 'Fuera de servicio',
};
