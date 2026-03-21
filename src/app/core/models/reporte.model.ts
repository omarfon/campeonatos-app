export type TipoReporte = 'competencia' | 'disciplina' | 'jugador' | 'equipo';
export type FormatoExportacion = 'pdf' | 'excel' | 'csv';

export interface FiltroReporte {
  tipo: TipoReporte;
  competenciaId?: string;
  disciplinaId?: string;
  equipoId?: string;
  participanteId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface Reporte {
  id: string;
  titulo: string;
  tipo: TipoReporte;
  filtros: FiltroReporte;
  fechaGeneracion: string;
  datos: unknown;
}
