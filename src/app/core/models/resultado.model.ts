export type EstadoResultado = 'parcial' | 'oficial' | 'cerrado';

export interface Resultado {
  id: string;
  encuentroId: string;
  golesLocal: number;
  golesVisitante: number;
  penalesLocal?: number;
  penalesVisitante?: number;
  tiempoExtra: boolean;
  estado: EstadoResultado;
  observaciones?: string;
  fechaCierre?: string;
  cerradoPor?: string;
}

export interface GolesDetalle {
  id: string;
  resultadoId: string;
  participanteId: string;
  equipoId: string;
  minuto: number;
  tipo: 'normal' | 'penal' | 'autogol' | 'tiro_libre';
}
