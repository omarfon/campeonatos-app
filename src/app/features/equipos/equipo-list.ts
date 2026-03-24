import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { EquipoService } from '../../core/services/equipo.service';
import { CompetenciaService } from '../../core/services/competencia.service';
import { confirmDialog } from '../../shared/confirm-dialog';
import { DisciplinaService } from '../../core/services/disciplina.service';

@Component({
  selector: 'app-equipo-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SlicePipe],
  template: `

    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-900">Equipos y Participantes</h2>
        <p class="text-slate-500 mt-1">Gestión de equipos, jugadores y elegibilidad</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <input
          type="text"
          class="input-modern w-full max-w-xs h-8 text-sm px-2 py-1"
          placeholder="Buscar equipo por nombre..."
          [value]="busquedaEquipo()"
          (input)="busquedaEquipo.set($any($event.target).value)"
          aria-label="Buscar equipo"
        />
        <input
          type="text"
          class="input-modern w-full max-w-xs h-8 text-sm px-2 py-1"
          placeholder="Buscar por jugador..."
          [value]="busquedaJugador()"
          (input)="busquedaJugador.set($any($event.target).value)"
          aria-label="Buscar jugador"
        />
        <select class="input-modern h-8 text-sm px-2 py-1 max-w-xs" [value]="filtroCompetencia()" (change)="filtroCompetencia.set($any($event.target).value)">
          <option value="">Todas las competencias</option>
          @for (camp of competencias; track camp.id) {
            <option [value]="camp.id">{{ camp.nombre }}</option>
          }
        </select>
        <select class="input-modern h-8 text-sm px-2 py-1 max-w-xs" [value]="filtroAnio()" (change)="filtroAnio.set($any($event.target).value)">
          <option value="">Todos los años</option>
          @for (anio of aniosDisponibles(); track anio) {
            <option [value]="anio">{{ anio }}</option>
          }
        </select>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (equipo of equiposFiltrados(); track equipo.id) {
          <div class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div class="bg-gradient-to-r from-brand to-brand-700 px-6 py-4">
              <a [routerLink]="[equipo.id]" class="text-lg font-bold text-white hover:underline">{{ equipo.nombre }}</a>
              <div class="flex gap-2 mt-1">
                <span class="text-slate-300 text-xs">{{ getCompetenciaNombre(equipo.competenciaId) }}</span>
                <span class="text-slate-400 text-xs">·</span>
                <span class="text-slate-300 text-xs">{{ getDisciplinaNombre(equipo.disciplinaId) }}</span>
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
                        [class]="p.tipo === 'socio' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'">
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

              <!-- Botones de acción eliminados -->
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
    protected readonly busquedaEquipo = signal('');
    protected readonly busquedaJugador = signal('');
    protected readonly filtroCompetencia = signal('');
    protected readonly filtroAnio = signal('');

    // Eliminado duplicado: competencias

    protected readonly aniosDisponibles = computed(() => {
      // Extrae los años únicos de las competencias
      const competencias = this.competenciaService.items();
      const anios = new Set<string>();
      for (const c of competencias) {
        if (c.anio) anios.add(c.anio.toString());
      }
      return Array.from(anios).sort();
    });

    protected readonly equiposFiltrados = computed(() => {
      const nombreEquipo = this.busquedaEquipo().toLowerCase().trim();
      const jugador = this.busquedaJugador().toLowerCase().trim();
      const competenciaId = this.filtroCompetencia();
      const anio = this.filtroAnio();
      let equipos = this.equipoService.equipos();
      if (nombreEquipo) {
        equipos = equipos.filter(e => e.nombre.toLowerCase().includes(nombreEquipo));
      }
      if (competenciaId) {
        equipos = equipos.filter(e => e.competenciaId === competenciaId);
      }
      if (anio) {
        // Buscar año en la competencia asociada
        equipos = equipos.filter(e => {
          const comp = this.competenciaService.getById(e.competenciaId);
          return comp && comp.anio && comp.anio.toString() === anio;
        });
      }
      if (jugador) {
        equipos = equipos.filter(e =>
          (e.participantes ?? []).some(p =>
            (p.nombre + ' ' + p.apellido).toLowerCase().includes(jugador)
          )
        );
      }
      return equipos;
    });

    // Helper para tipar participantes correctamente en el template
    protected participantesTyped(equipo: any): import('../../core/models/equipo.model').Participante[] {
      return (equipo.participantes ?? []) as import('../../core/models/equipo.model').Participante[];
    }
  private readonly equipoService = inject(EquipoService);
  private readonly competenciaService = inject(CompetenciaService);
  private readonly disciplinaService = inject(DisciplinaService);

  // Getter para competencias para evitar inicialización temprana
  protected get competencias() {
    return this.competenciaService.items();
  }

  // Eliminado duplicado: competencias y filtroCompetencia

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

  protected async eliminar(id: string): Promise<void> {
    const ok = await confirmDialog({ title: 'Eliminar equipo', text: '¿Está seguro de eliminar este equipo? Esta acción no se puede deshacer.' });
    if (ok) {
      this.equipoService.deleteEquipo(id);
    }
  }
}
