import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { EquipoService } from '../../core/services/equipo.service';
import { CompetenciaService } from '../../core/services/competencia.service';
import { DisciplinaService } from '../../core/services/disciplina.service';

@Component({
  selector: 'app-equipo-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SlicePipe],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Equipos y Participantes</h2>
          <p class="text-slate-500 mt-1">Gestión de equipos, jugadores y elegibilidad</p>
        </div>
        <a [routerLink]="['/', { outlets: { primary: ['maestros', 'equipos'], panel: ['maestros', 'equipos', 'nuevo'] } }]" class="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          <span aria-hidden="true">+</span> Nuevo Equipo
        </a>
      </div>

      <!-- Filtro competencia -->
      <div class="flex flex-wrap gap-2">
        <button
          class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
          [class]="filtroCompetencia() === 'todos' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'"
          (click)="filtroCompetencia.set('todos')"
        >Todos</button>
        @for (camp of competencias(); track camp.id) {
          <button
            class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            [class]="filtroCompetencia() === camp.id ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'"
            (click)="filtroCompetencia.set(camp.id)"
          >{{ camp.nombre }}</button>
        }
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (equipo of filteredEquipos(); track equipo.id) {
          <div class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div class="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
              <a [routerLink]="[equipo.id]" class="text-lg font-bold text-white hover:underline">{{ equipo.nombre }}</a>
              <div class="flex gap-2 mt-1">
                <span class="text-indigo-200 text-xs">{{ getCompetenciaNombre(equipo.competenciaId) }}</span>
                <span class="text-indigo-300 text-xs">·</span>
                <span class="text-indigo-200 text-xs">{{ getDisciplinaNombre(equipo.disciplinaId) }}</span>
              </div>
            </div>
            <div class="p-4">
              <div class="flex items-center justify-between mb-3">
                <span class="text-sm text-slate-500">{{ equipo.participantes.length }} participante(s)</span>
                <div class="flex gap-1">
                  @for (p of equipo.participantes | slice:0:5; track p.id) {
                    <span class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600"
                      [title]="p.nombre + ' ' + p.apellido">
                      {{ p.nombre[0] }}{{ p.apellido[0] }}
                    </span>
                  }
                  @if (equipo.participantes.length > 5) {
                    <span class="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-xs font-medium text-slate-700">
                      +{{ equipo.participantes.length - 5 }}
                    </span>
                  }
                </div>
              </div>

              <div class="space-y-1">
                @for (p of equipo.participantes; track p.id) {
                  <div class="flex items-center justify-between text-sm py-1">
                    <div class="flex items-center gap-2">
                      @if (p.numeroCamiseta) {
                        <span class="text-xs bg-slate-100 text-slate-600 rounded w-6 h-6 flex items-center justify-center font-mono">{{ p.numeroCamiseta }}</span>
                      }
                      <span>{{ p.apellido }}, {{ p.nombre }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs px-1.5 py-0.5 rounded"
                        [class]="p.tipo === 'socio' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'">
                        {{ p.tipo }}
                      </span>
                      <span class="text-xs px-1.5 py-0.5 rounded"
                        [class]="elegibilidadClasses[p.elegibilidad]">
                        {{ p.elegibilidad }}
                      </span>
                    </div>
                  </div>
                }
              </div>

              <div class="mt-4 pt-3 border-t flex gap-3">
                <a [routerLink]="[equipo.id, 'editar']" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Editar</a>
                <button (click)="eliminar(equipo.id)" class="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
              </div>
            </div>
          </div>
        } @empty {
          <div class="col-span-full text-center py-12 text-slate-400">
            No hay equipos registrados
          </div>
        }
      </div>
    </div>
  `,
})
export class EquipoListComponent {
  private readonly equipoService = inject(EquipoService);
  private readonly competenciaService = inject(CompetenciaService);
  private readonly disciplinaService = inject(DisciplinaService);

  protected readonly competencias = this.competenciaService.items;
  protected readonly filtroCompetencia = signal<string>('todos');

  protected readonly filteredEquipos = computed(() => {
    const filtro = this.filtroCompetencia();
    const equipos = this.equipoService.equipos();
    return filtro === 'todos' ? equipos : equipos.filter((e) => e.competenciaId === filtro);
  });

  protected readonly elegibilidadClasses: Record<string, string> = {
    elegible: 'bg-green-100 text-green-700',
    no_elegible: 'bg-red-100 text-red-700',
    suspendido: 'bg-yellow-100 text-yellow-700',
    transferido: 'bg-purple-100 text-purple-700',
  };

  protected getCompetenciaNombre(id: string): string {
    return this.competenciaService.getById(id)?.nombre ?? id;
  }

  protected getDisciplinaNombre(id: string): string {
    return this.disciplinaService.getById(id)?.nombre ?? id;
  }

  protected eliminar(id: string): void {
    if (confirm('¿Está seguro de eliminar este equipo?')) {
      this.equipoService.deleteEquipo(id);
    }
  }
}
