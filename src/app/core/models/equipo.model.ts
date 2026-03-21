export type TipoParticipante = 'socio' | 'invitado';
export type EstadoElegibilidad = 'elegible' | 'no_elegible' | 'suspendido' | 'transferido';

export interface Equipo {
  id: string;
  nombre: string;
  competenciaId: string;
  disciplinaId: string;
  participantes: Participante[];
  delegadoId?: string;
}

export interface Participante {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  tipo: TipoParticipante;
  equipoId: string;
  elegibilidad: EstadoElegibilidad;
  fechaRegistro: string;
  numeroCamiseta?: number;
  posicion?: string;
  deudaPendiente?: boolean;
  declaracionJuradaSalud?: boolean;
}

export interface Transferencia {
  id: string;
  participanteId: string;
  equipoOrigenId: string;
  equipoDestinoId: string;
  fecha: string;
  motivo: string;
  aprobada: boolean;
}

export interface HistorialParticipante {
  id: string;
  participanteId: string;
  competenciaId: string;
  equipoId: string;
  temporada: string;
  goles: number;
  tarjetasAmarillas: number;
  tarjetasRojas: number;
  partidosJugados: number;
}
