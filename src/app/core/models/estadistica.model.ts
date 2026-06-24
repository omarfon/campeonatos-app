export interface TablaPosiciones {
  competenciaId: string;
  disciplinaId: string;
  posiciones: PosicionEquipo[];
}

export interface PosicionEquipo {
  equipoId: string;
  equipoNombre: string;
  partidosJugados: number;
  ganados: number;
  empatados: number;
  perdidos: number;
  golesAFavor: number;
  golesEnContra: number;
  diferenciaGoles: number;
  puntos: number;
  fairPlay: number;
  posicion: number;
}

export interface Goleador {
  participanteId: string;
  nombre: string;
  apellido: string;
  equipoId: string;
  equipoNombre: string;
  goles: number;
  penales: number;
  asistencias: number;
}

export interface EstadisticaAmonestado {
  participanteId: string;
  nombre: string;
  apellido: string;
  equipoId: string;
  equipoNombre: string;
  amarillas: number;
  rojas: number;
  dobleAmarilla: number;
  fechasSancionado: number;
}

export interface RankingHistorico {
  competenciaId: string;
  competenciaNombre: string;
  temporada: string;
  equipoCampeonId: string;
  equipoCampeonNombre: string;
  goleadorId?: string;
  goleadorNombre?: string;
  mejorFairPlayId?: string;
}

export interface ResumenCompetencia {
  competenciaId: string;
  competenciaNombre: string;
  estado: string;
  totalEquipos: number;
  partidosJugados: number;
  totalGoles: number;
  liderNombre: string;
  topGoleadorNombre: string;
  topGoleadorGoles: number;
}
