import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SancionService } from '../../core/services/sancion.service';
import { EquipoService } from '../../core/services/equipo.service';
import { EncuentroService } from '../../core/services/encuentro.service';
import { CampeonatoService } from '../../core/services/campeonato.service';

@Component({
  selector: 'app-sancion-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Sanciones y Comisión de Justicia</h2>
          <p class="text-slate-500 mt-1">Tarjetas, sanciones e inhabilitaciones</p>
        </div>
        <div class="flex gap-2">
          <a routerLink="tarjeta" class="inline-flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
            + Tarjeta
          </a>
          <a routerLink="sancion" class="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
            + Sanción
          </a>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 bg-slate-100 rounded-lg p-1">
        <button
          class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors"
          [class]="activeTab() === 'tarjetas' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'"
          (click)="activeTab.set('tarjetas')"
        >Tarjetas ({{ tarjetas().length }})</button>
        <button
          class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors"
          [class]="activeTab() === 'sanciones' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'"
          (click)="activeTab.set('sanciones')"
        >Sanciones ({{ sanciones().length }})</button>
        <button
          class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors"
          [class]="activeTab() === 'resoluciones' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'"
          (click)="activeTab.set('resoluciones')"
        >Resoluciones ({{ resoluciones().length }})</button>
      </div>

      <!-- Tarjetas -->
      @if (activeTab() === 'tarjetas') {
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-50 border-b">
                  <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Tipo</th>
                  <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Jugador</th>
                  <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Equipo</th>
                  <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Minuto</th>
                  <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Motivo</th>
                  <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Encuentro</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (t of tarjetas(); track t.id) {
                  <tr class="hover:bg-slate-50">
                    <td class="px-6 py-3">
                      @switch (t.tipo) {
                        @case ('amarilla') {
                          <span class="inline-block w-5 h-7 bg-yellow-400 rounded-sm" title="Amarilla"></span>
                        }
                        @case ('roja_directa') {
                          <span class="inline-block w-5 h-7 bg-red-600 rounded-sm" title="Roja directa"></span>
                        }
                        @case ('doble_amarilla') {
                          <span class="inline-flex gap-0.5" title="Doble amarilla">
                            <span class="inline-block w-4 h-6 bg-yellow-400 rounded-sm"></span>
                            <span class="inline-block w-4 h-6 bg-red-600 rounded-sm"></span>
                          </span>
                        }
                      }
                    </td>
                    <td class="px-6 py-3 font-medium">{{ getParticipanteNombre(t.participanteId) }}</td>
                    <td class="px-6 py-3 text-slate-600">{{ getEquipoNombre(t.equipoId) }}</td>
                    <td class="px-6 py-3 font-mono">{{ t.minuto }}'</td>
                    <td class="px-6 py-3 text-slate-600">{{ t.motivo }}</td>
                    <td class="px-6 py-3 text-sm text-slate-500">{{ getEncuentroInfo(t.encuentroId) }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-slate-400">No hay tarjetas registradas</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Sanciones -->
      @if (activeTab() === 'sanciones') {
        <div class="space-y-3">
          @for (s of sanciones(); track s.id) {
            <div class="bg-white rounded-xl shadow-sm p-5">
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-3">
                    <span class="text-xs px-2.5 py-0.5 rounded-full font-medium"
                      [class]="s.tipo === 'deportiva' ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'">
                      {{ s.tipo }}
                    </span>
                    <span class="text-xs px-2.5 py-0.5 rounded-full font-medium"
                      [class]="sancionEstadoClasses[s.estado]">
                      {{ s.estado }}
                    </span>
                  </div>
                  <p class="font-medium text-slate-900 mt-2">{{ getParticipanteNombre(s.participanteId) }}</p>
                  <p class="text-sm text-slate-600 mt-1">{{ s.descripcion }}</p>
                </div>
                <div class="text-right text-sm">
                  <p class="text-slate-500">{{ s.fechaInicio }} — {{ s.fechaFin ?? 'Indefinido' }}</p>
                  @if (s.fechasInhabilitacion > 0) {
                    <p class="text-red-600 font-medium">{{ s.fechasInhabilitacion }} fecha(s)</p>
                  }
                  @if (s.montoEconomico) {
                    <p class="text-purple-600 font-medium">\${{ s.montoEconomico }}</p>
                  }
                </div>
              </div>
              <div class="mt-3 pt-3 border-t flex gap-3">
                <a [routerLink]="['resolucion']" [queryParams]="{sancionId: s.id}"
                  class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Agregar resolución</a>
              </div>
            </div>
          } @empty {
            <div class="text-center py-12 text-slate-400 bg-white rounded-xl shadow-sm">
              No hay sanciones registradas
            </div>
          }
        </div>
      }

      <!-- Resoluciones -->
      @if (activeTab() === 'resoluciones') {
        <div class="space-y-3">
          @for (r of resoluciones(); track r.id) {
            <div class="bg-white rounded-xl shadow-sm p-5">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-xs px-2.5 py-0.5 rounded-full font-medium"
                  [class]="dictamenClasses[r.dictamen]">
                  {{ r.dictamen }}
                </span>
                <span class="text-sm text-slate-500">{{ r.fecha }}</span>
              </div>
              <p class="text-slate-700">{{ r.resolucion }}</p>
              <p class="text-xs text-slate-400 mt-2">Comisión: {{ r.miembrosComision.join(', ') }}</p>
            </div>
          } @empty {
            <div class="text-center py-12 text-slate-400 bg-white rounded-xl shadow-sm">
              No hay resoluciones registradas
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class SancionListComponent {
  private readonly sancionService = inject(SancionService);
  private readonly equipoService = inject(EquipoService);
  private readonly encuentroService = inject(EncuentroService);

  protected readonly activeTab = signal<'tarjetas' | 'sanciones' | 'resoluciones'>('tarjetas');
  protected readonly tarjetas = this.sancionService.tarjetas;
  protected readonly sanciones = this.sancionService.sanciones;
  protected readonly resoluciones = this.sancionService.resoluciones;

  protected readonly sancionEstadoClasses: Record<string, string> = {
    activa: 'bg-red-100 text-red-800',
    cumplida: 'bg-slate-100 text-slate-800',
    apelada: 'bg-yellow-100 text-yellow-800',
    revocada: 'bg-green-100 text-green-800',
  };

  protected readonly dictamenClasses: Record<string, string> = {
    confirmada: 'bg-red-100 text-red-800',
    reducida: 'bg-yellow-100 text-yellow-800',
    revocada: 'bg-green-100 text-green-800',
    ampliada: 'bg-purple-100 text-purple-800',
  };

  protected getParticipanteNombre(id: string): string {
    const p = this.equipoService.getParticipante(id);
    return p ? `${p.apellido}, ${p.nombre}` : id;
  }

  protected getEquipoNombre(id: string): string {
    return this.equipoService.getEquipoById(id)?.nombre ?? id;
  }

  protected getEncuentroInfo(id: string): string {
    const enc = this.encuentroService.getById(id);
    if (!enc) return id;
    return `F${enc.numeroFecha}`;
  }
}
