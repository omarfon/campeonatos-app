export type TipoTarjeta = 'amarilla' | 'roja_directa' | 'doble_amarilla';
export type TipoSancion = 'deportiva' | 'economica';
export type EstadoSancion = 'activa' | 'cumplida' | 'apelada' | 'revocada';

export interface Tarjeta {
  id: string;
  encuentroId: string;
  participanteId: string;
  equipoId: string;
  tipo: TipoTarjeta;
  minuto: number;
  motivo: string;
}

export interface Sancion {
  id: string;
  participanteId: string;
  equipoId?: string;
  campeonatoId: string;
  tipo: TipoSancion;
  estado: EstadoSancion;
  descripcion: string;
  fechasInhabilitacion: number;
  montoEconomico?: number;
  fechaInicio: string;
  fechaFin?: string;
  tarjetaIds: string[];
}

export interface ResolucionComision {
  id: string;
  sancionId: string;
  fecha: string;
  resolucion: string;
  miembrosComision: string[];
  dictamen: 'confirmada' | 'reducida' | 'revocada' | 'ampliada';
}
