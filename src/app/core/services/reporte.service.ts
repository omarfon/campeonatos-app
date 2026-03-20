import { Injectable, signal } from '@angular/core';
import { Reporte, FiltroReporte, FormatoExportacion } from '../models/reporte.model';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly _reportes = signal<Reporte[]>([]);
  readonly reportes = this._reportes.asReadonly();

  generarReporte(titulo: string, filtros: FiltroReporte, datos: unknown): Reporte {
    const reporte: Reporte = {
      id: crypto.randomUUID(),
      titulo,
      tipo: filtros.tipo,
      filtros,
      fechaGeneracion: new Date().toISOString(),
      datos,
    };
    this._reportes.update((items) => [reporte, ...items]);
    return reporte;
  }

  getById(id: string): Reporte | undefined {
    return this._reportes().find((r) => r.id === id);
  }

  delete(id: string): void {
    this._reportes.update((items) => items.filter((r) => r.id !== id));
  }

  exportar(reporte: Reporte, formato: FormatoExportacion): void {
    const contenido = JSON.stringify(reporte.datos, null, 2);
    const blob = new Blob([contenido], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reporte.titulo.replace(/\s+/g, '_')}.${formato === 'csv' ? 'csv' : 'json'}`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
