import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UpperCasePipe } from '@angular/common';
import { ResultadoService } from '../../core/services/resultado.service';
import { EncuentroService } from '../../core/services/encuentro.service';
import { EquipoService } from '../../core/services/equipo.service';

@Component({
  selector: 'app-resultado-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UpperCasePipe],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Registro de Resultados</h2>
          <p class="text-slate-500 mt-1">Scores, penales y cierres de partido</p>
        </div>
        <a [routerLink]="['/', { outlets: { primary: ['gestion', 'resultados'], panel: ['gestion', 'resultados', 'nuevo'] } }]" class="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          <span aria-hidden="true">+</span> Registrar Resultado
        </a>
      </div>

      <!-- Encuentros con resultado -->
      <div class="space-y-3">
        @for (item of resultadosConInfo(); track item.resultado.id) {
          <div class="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div class="flex items-center gap-6">
                <div class="text-right">
                  <p class="font-semibold text-slate-900 text-lg">{{ item.localNombre }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-3xl font-bold text-slate-900 w-10 text-right">{{ item.resultado.golesLocal }}</span>
                  <span class="text-slate-400 text-lg">-</span>
                  <span class="text-3xl font-bold text-slate-900 w-10">{{ item.resultado.golesVisitante }}</span>
                </div>
                <div>
                  <p class="font-semibold text-slate-900 text-lg">{{ item.visitanteNombre }}</p>
                </div>
              </div>
              <div class="flex flex-col items-end gap-1">
                <span class="text-xs px-2.5 py-0.5 rounded-full font-medium"
                  [class]="item.resultado.estado === 'cerrado' ? 'bg-slate-100 text-slate-800' : item.resultado.estado === 'oficial' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
                  {{ item.resultado.estado | uppercase }}
                </span>
                @if (item.resultado.tiempoExtra) {
                  <span class="text-xs text-orange-600">Tiempo extra</span>
                }
                @if (item.resultado.penalesLocal != null) {
                  <span class="text-xs text-purple-600">Penales: {{ item.resultado.penalesLocal }} - {{ item.resultado.penalesVisitante }}</span>
                }
              </div>
            </div>

            @if (item.goles.length > 0) {
              <div class="mt-4 pt-3 border-t">
                <p class="text-xs text-slate-400 uppercase font-semibold mb-2">Goles</p>
                <div class="flex flex-wrap gap-2">
                  @for (gol of item.goles; track gol.id) {
                    <span class="inline-flex items-center gap-1 bg-slate-100 rounded-full px-3 py-1 text-xs">
                      <span class="font-medium">{{ getParticipanteNombre(gol.participanteId) }}</span>
                      <span class="text-slate-400">{{ gol.minuto }}'</span>
                      @if (gol.tipo !== 'normal') {
                        <span class="text-slate-500">({{ gol.tipo }})</span>
                      }
                    </span>
                  }
                </div>
              </div>
            }

            <div class="mt-3 flex gap-3">
              <a [routerLink]="[item.resultado.id, 'editar']" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Editar</a>
              @if (item.resultado.estado !== 'cerrado') {
                <button (click)="cerrarPartido(item.resultado.id)" class="text-green-600 hover:text-green-800 text-sm font-medium">Cerrar partido</button>
              }
            </div>
          </div>
        } @empty {
          <div class="text-center py-12 text-slate-400 bg-white rounded-xl shadow-sm">
            No hay resultados registrados
          </div>
        }
      </div>

      <!-- Encuentros sin resultado -->
      @if (encuentrosSinResultado().length > 0) {
        <div>
          <h3 class="text-lg font-semibold text-slate-900 mb-3">Encuentros sin resultado</h3>
          <div class="space-y-2">
            @for (enc of encuentrosSinResultado(); track enc.id) {
              <div class="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="font-medium">{{ getEquipoNombre(enc.equipoLocalId) }}</span>
                  <span class="text-slate-400">vs</span>
                  <span class="font-medium">{{ getEquipoNombre(enc.equipoVisitanteId) }}</span>
                  <span class="text-sm text-slate-500">— Fecha {{ enc.numeroFecha }}</span>
                </div>
                <a [routerLink]="['/', { outlets: { primary: ['gestion', 'resultados'], panel: ['gestion', 'resultados', 'nuevo'] } }]" [queryParams]="{encuentroId: enc.id}"
                  class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Registrar</a>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class ResultadoListComponent {
  private readonly resultadoService = inject(ResultadoService);
  private readonly encuentroService = inject(EncuentroService);
  private readonly equipoService = inject(EquipoService);

  protected readonly resultadosConInfo = computed(() => {
    return this.resultadoService.resultados().map((resultado) => {
      const encuentro = this.encuentroService.getById(resultado.encuentroId);
      const goles = this.resultadoService.getGolesByResultado(resultado.id);
      return {
        resultado,
        localNombre: encuentro ? this.equipoService.getEquipoById(encuentro.equipoLocalId)?.nombre ?? 'Desconocido' : 'Desconocido',
        visitanteNombre: encuentro ? this.equipoService.getEquipoById(encuentro.equipoVisitanteId)?.nombre ?? 'Desconocido' : 'Desconocido',
        goles,
      };
    });
  });

  protected readonly encuentrosSinResultado = computed(() => {
    const resultadoEncuentros = new Set(this.resultadoService.resultados().map((r) => r.encuentroId));
    return this.encuentroService.encuentros().filter(
      (e) => !resultadoEncuentros.has(e.id) && e.estado === 'finalizado'
    );
  });

  protected getEquipoNombre(id: string): string {
    return this.equipoService.getEquipoById(id)?.nombre ?? 'Desconocido';
  }

  protected getParticipanteNombre(id: string): string {
    const p = this.equipoService.getParticipante(id);
    return p ? `${p.apellido}` : id;
  }

  protected cerrarPartido(id: string): void {
    if (confirm('¿Cerrar este partido? No podrá modificarse.')) {
      this.resultadoService.cerrarPartido(id, 'admin');
    }
  }
}
