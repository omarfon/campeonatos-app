import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ReporteService } from '../../core/services/reporte.service';
import { CampeonatoService } from '../../core/services/campeonato.service';
import { DisciplinaService } from '../../core/services/disciplina.service';
import { EstadisticaService } from '../../core/services/estadistica.service';
import { TipoReporte, FiltroReporte, Reporte } from '../../core/models/reporte.model';

@Component({
  selector: 'app-reporte-generator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-900">Generador de Reportes</h2>
        <p class="text-slate-500 mt-1">Fichas técnicas, estadísticas y reportes exportables</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Formulario -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Configurar Reporte</h3>
          <form [formGroup]="form" (ngSubmit)="generar()" class="space-y-4">
            <div>
              <label for="titulo" class="block text-sm font-medium text-slate-700 mb-1">Título</label>
              <input id="titulo" formControlName="titulo" type="text"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            <div>
              <label for="tipo" class="block text-sm font-medium text-slate-700 mb-1">Tipo de reporte</label>
              <select id="tipo" formControlName="tipo"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="campeonato">Campeonato</option>
                <option value="disciplina">Disciplina</option>
                <option value="jugador">Jugador</option>
                <option value="equipo">Equipo</option>
              </select>
            </div>

            <div>
              <label for="campeonato" class="block text-sm font-medium text-slate-700 mb-1">Campeonato</label>
              <select id="campeonato" formControlName="campeonatoId"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Todos</option>
                @for (camp of campeonatos(); track camp.id) {
                  <option [value]="camp.id">{{ camp.nombre }}</option>
                }
              </select>
            </div>

            <div>
              <label for="disciplina" class="block text-sm font-medium text-slate-700 mb-1">Disciplina</label>
              <select id="disciplina" formControlName="disciplinaId"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Todas</option>
                @for (disc of disciplinas(); track disc.id) {
                  <option [value]="disc.id">{{ disc.nombre }}</option>
                }
              </select>
            </div>

            <button type="submit"
              class="w-full bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Generar Reporte
            </button>
          </form>
        </div>

        <!-- Preview / Historial -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Preview -->
          @if (selectedReport()) {
            <div class="bg-white rounded-xl shadow-sm p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-slate-900">{{ selectedReport()!.titulo }}</h3>
                <span class="text-xs px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">{{ selectedReport()!.tipo }}</span>
              </div>
              <div class="bg-slate-50 rounded-lg p-4 text-sm">
                <pre class="text-slate-700 whitespace-pre-wrap">{{ formatDatos(selectedReport()!.datos) }}</pre>
              </div>
              <div class="mt-4 flex gap-3">
                <button (click)="exportar(selectedReport()!, 'pdf')" class="text-sm bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors">
                  Exportar PDF
                </button>
                <button (click)="exportar(selectedReport()!, 'csv')" class="text-sm bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors">
                  Exportar CSV
                </button>
              </div>
            </div>
          }

          <!-- Historial de reportes -->
          <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b">
              <h3 class="text-lg font-semibold text-slate-900">Historial de Reportes</h3>
            </div>
            <div class="divide-y divide-slate-100">
              @for (r of reportes(); track r.id) {
                <div class="px-6 py-4 hover:bg-slate-50 flex items-center justify-between">
                  <div>
                    <p class="font-medium text-slate-900">{{ r.titulo }}</p>
                    <p class="text-sm text-slate-500">{{ r.tipo }} · {{ r.fechaGeneracion }}</p>
                  </div>
                  <div class="flex items-center gap-3">
                    <button (click)="selectReport(r)" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Ver</button>
                    <button (click)="eliminar(r.id)" class="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
                  </div>
                </div>
              } @empty {
                <div class="px-6 py-8 text-center text-slate-400">
                  No hay reportes generados
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ReporteGeneratorComponent {
  private readonly fb = inject(FormBuilder);
  private readonly reporteService = inject(ReporteService);
  private readonly campeonatoService = inject(CampeonatoService);
  private readonly disciplinaService = inject(DisciplinaService);
  private readonly estadisticaService = inject(EstadisticaService);

  protected readonly campeonatos = this.campeonatoService.items;
  protected readonly disciplinas = this.disciplinaService.items;
  protected readonly reportes = this.reporteService.reportes;
  protected readonly selectedReport = signal<Reporte | null>(null);

  readonly form = this.fb.nonNullable.group({
    titulo: [''],
    tipo: ['campeonato' as TipoReporte],
    campeonatoId: [''],
    disciplinaId: [''],
  });

  protected generar(): void {
    const value = this.form.getRawValue();
    const titulo = value.titulo || `Reporte de ${value.tipo}`;
    const filtros: FiltroReporte = {
      tipo: value.tipo,
      campeonatoId: value.campeonatoId || undefined,
      disciplinaId: value.disciplinaId || undefined,
    };

    let datos: unknown;
    if (value.tipo === 'campeonato' && value.campeonatoId && value.disciplinaId) {
      datos = {
        posiciones: this.estadisticaService.calcularTablaPosiciones(value.campeonatoId, value.disciplinaId).posiciones,
        goleadores: this.estadisticaService.calcularGoleadores(value.campeonatoId, value.disciplinaId),
      };
    } else if (value.tipo === 'campeonato' && value.campeonatoId) {
      datos = { amonestados: this.estadisticaService.calcularAmonestados(value.campeonatoId) };
    } else {
      datos = { mensaje: 'Reporte generado exitosamente', fecha: new Date().toISOString() };
    }

    const reporte = this.reporteService.generarReporte(titulo, filtros, datos);
    this.selectedReport.set(reporte);
  }

  protected selectReport(r: Reporte): void {
    this.selectedReport.set(r);
  }

  protected eliminar(id: string): void {
    this.reporteService.delete(id);
    if (this.selectedReport()?.id === id) {
      this.selectedReport.set(null);
    }
  }

  protected exportar(reporte: Reporte, formato: 'pdf' | 'csv'): void {
    this.reporteService.exportar(reporte, formato);
  }

  protected formatDatos(datos: unknown): string {
    return JSON.stringify(datos, null, 2);
  }
}
