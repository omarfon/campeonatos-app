export type TipoPlanilla = 'voley' | 'futbol' | 'atletismo' | 'basquet' | 'general';

export interface Disciplina {
  id: string;
  nombre: string;
  descripcion?: string;
  tipoPlanilla: TipoPlanilla;
  reglas: ReglaDisciplina[];
  maxJugadoresPorEquipo: number;
  minJugadoresPorEquipo: number;
  duracionPartidoMinutos?: number;
  tiemposExtra: boolean;
  penales: boolean;
}

export interface ReglaDisciplina {
  id: string;
  disciplinaId: string;
  nombre: string;
  descripcion: string;
  valor: string;
}
