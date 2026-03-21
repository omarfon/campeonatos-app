import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DisciplinaService } from '../../core/services/disciplina.service';

@Component({
  selector: 'app-disciplina-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Disciplinas Deportivas</h2>
          <p class="text-slate-500 mt-1">Configuración de deportes y sus reglas</p>
        </div>
        <a [routerLink]="['/', { outlets: { primary: ['maestros', 'disciplinas'], panel: ['maestros', 'disciplinas', 'nueva'] } }]" class="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          <span aria-hidden="true">+</span> Nueva Disciplina
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (disc of disciplinas(); track disc.id) {
          <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between">
              <div>
                <a [routerLink]="[disc.id]" class="text-lg font-semibold text-indigo-600 hover:text-indigo-800">
                  {{ disc.nombre }}
                </a>
                <p class="text-sm text-slate-500 mt-1">{{ disc.descripcion }}</p>
              </div>
              <span class="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono">{{ disc.tipoPlanilla }}</span>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p class="text-slate-400">Jugadores</p>
                <p class="font-medium">{{ disc.minJugadoresPorEquipo }} - {{ disc.maxJugadoresPorEquipo }}</p>
              </div>
              <div>
                <p class="text-slate-400">Duración</p>
                <p class="font-medium">{{ disc.duracionPartidoMinutos ? disc.duracionPartidoMinutos + ' min' : 'Variable' }}</p>
              </div>
              <div>
                <p class="text-slate-400">Tiempo extra</p>
                <p class="font-medium">{{ disc.tiemposExtra ? 'Sí' : 'No' }}</p>
              </div>
              <div>
                <p class="text-slate-400">Penales</p>
                <p class="font-medium">{{ disc.penales ? 'Sí' : 'No' }}</p>
              </div>
            </div>

            <div class="mt-4 pt-4 border-t flex items-center justify-between">
              <span class="text-xs text-slate-400">{{ disc.reglas.length }} regla(s)</span>
              <div class="flex gap-2">
                <a [routerLink]="[disc.id, 'editar']" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Editar</a>
                <button (click)="eliminar(disc.id)" class="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
              </div>
            </div>
          </div>
        } @empty {
          <div class="col-span-full text-center py-12 text-slate-400">
            No hay disciplinas configuradas
          </div>
        }
      </div>
    </div>
  `,
})
export class DisciplinaListComponent {
  private readonly disciplinaService = inject(DisciplinaService);
  protected readonly disciplinas = this.disciplinaService.items;

  protected eliminar(id: string): void {
    if (confirm('¿Está seguro de eliminar esta disciplina?')) {
      this.disciplinaService.delete(id);
    }
  }
}
