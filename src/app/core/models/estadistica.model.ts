export interface TablaPosiciones {
  campeonatoId: string;
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
  campeonatoId: string;
  campeonatoNombre: string;
  temporada: string;
  equipoCampeonId: string;
  equipoCampeonNombre: string;
  goleadorId?: string;
  goleadorNombre?: string;
  mejorFairPlayId?: string;
}
