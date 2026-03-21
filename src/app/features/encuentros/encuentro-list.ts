import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EncuentroService } from '../../core/services/encuentro.service';
import { EquipoService } from '../../core/services/equipo.service';
import { CompetenciaService } from '../../core/services/competencia.service';
import {
  EstadoEncuentro,
  FaseEncuentro,
  ESTADO_ENCUENTRO_LABELS,
  FASE_LABELS,
} from '../../core/models/encuentro.model';

@Component({
  selector: 'app-encuentro-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Hero header -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 p-8 text-white">
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2230%22%20height%3D%2230%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%2010h10V0%22%20fill%3D%22none%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.05)%22%2F%3E%3C%2Fsvg%3E')] opacity-50"></div>
        <div class="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 class="text-3xl font-bold tracking-tight">Programación de Encuentros</h2>
            <p class="text-indigo-100 mt-2">Gestión de fechas, fases, sedes y reprogramaciones</p>
          </div>
          <a [routerLink]="['/', { outlets: { primary: ['gestion', 'encuentros'], panel: ['gestion', 'encuentros', 'nuevo'] } }]" class="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-white/30 hover:scale-[1.02]">
            <span aria-hidden="true">+</span> Nuevo Encuentro
          </a>
        </div>

        <!-- Stats -->
        <div class="relative mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="rounded-xl bg-white/10 backdrop-blur-sm p-3 text-center">
            <p class="text-2xl font-bold">{{ stats().total }}</p>
            <p class="text-xs text-indigo-200">Total</p>
          </div>
          <div class="rounded-xl bg-white/10 backdrop-blur-sm p-3 text-center">
            <p class="text-2xl font-bold">{{ stats().programados }}</p>
            <p class="text-xs text-indigo-200">Programados</p>
          </div>
          <div class="rounded-xl bg-white/10 backdrop-blur-sm p-3 text-center">
            <p class="text-2xl font-bold">{{ stats().finalizados }}</p>
            <p class="text-xs text-indigo-200">Finalizados</p>
          </div>
          <div class="rounded-xl bg-white/10 backdrop-blur-sm p-3 text-center">
            <p class="text-2xl font-bold">{{ stats().reprogramados }}</p>
            <p class="text-xs text-indigo-200">Reprogramados</p>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="section-card">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex flex-wrap gap-2 flex-1">
            <button
              class="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
              [class]="filtroEstado() === 'todos' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
              (click)="filtroEstado.set('todos')"
            >Todos</button>
            @for (estado of estados; track estado.value) {
              <button
                class="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                [class]="filtroEstado() === estado.value ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                (click)="filtroEstado.set(estado.value)"
              >{{ estado.label }}</button>
            }
          </div>
          <div class="flex gap-2">
            <select
              class="input-modern text-sm py-1.5"
              [value]="filtroFase()"
              (change)="filtroFase.set($any($event.target).value)"
              aria-label="Filtrar por fase"
            >
              <option value="todas">Todas las fases</option>
              @for (f of fasesDisponibles; track f.value) {
                <option [value]="f.value">{{ f.label }}</option>
              }
            </select>
            <select
              class="input-modern text-sm py-1.5"
              [value]="filtroCompetencia()"
              (change)="filtroCompetencia.set($any($event.target).value)"
              aria-label="Filtrar por competencia"
            >
              <option value="todos">Todos los competencias</option>
              @for (camp of competencias(); track camp.id) {
                <option [value]="camp.id">{{ camp.nombre }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <!-- Encuentros por fecha -->
      @for (fecha of fechasAgrupadas(); track fecha.numero) {
        <div class="section-card !p-0 overflow-hidden card-hover">
          <div class="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-100">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                  {{ fecha.numero }}
                </div>
                <div>
                  <h3 class="font-semibold text-slate-800">Fecha {{ fecha.numero }}</h3>
                  <p class="text-xs text-slate-500">{{ fecha.fecha }} · {{ fecha.encuentros.length }} encuentro(s)</p>
                </div>
              </div>
            </div>
          </div>
          <div class="divide-y divide-slate-50">
            @for (enc of fecha.encuentros; track enc.id) {
              <div class="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div class="flex items-center gap-4 flex-1 min-w-0">
                    <div class="text-right w-28 sm:w-36 truncate">
                      <p class="font-semibold text-slate-900 truncate">{{ getEquipoNombre(enc.equipoLocalId) }}</p>
                      <p class="text-xs text-slate-400">Local</p>
                    </div>
                    <div class="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 min-w-[40px] text-center">
                      VS
                    </div>
                    <div class="w-28 sm:w-36 truncate">
                      <p class="font-semibold text-slate-900 truncate">{{ getEquipoNombre(enc.equipoVisitanteId) }}</p>
                      <p class="text-xs text-slate-400">Visitante</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 text-sm flex-shrink-0">
                    <div class="flex flex-col items-end gap-0.5">
                      <span class="text-slate-600 font-medium">{{ enc.fechaHora.split('T')[1]?.substring(0, 5) }}</span>
                      @if (enc.sedeId) {
                        <span class="text-xs text-slate-400">{{ getSedeNombre(enc.sedeId) }}</span>
                      }
                    </div>
                    <span class="text-xs px-2.5 py-1 rounded-full font-medium" [class]="estadoClasses[enc.estado]">
                      {{ estadoLabels[enc.estado] }}
                    </span>
                    @if (enc.fase !== 'fase_grupos') {
                      <span class="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">{{ faseLabels[enc.fase] }}</span>
                    }
                  </div>
                  <div class="flex gap-1 flex-shrink-0">
                    <a [routerLink]="[enc.id]" class="btn-ghost text-xs px-2.5 py-1">Ver</a>
                    @if (enc.estado === 'borrador' || enc.estado === 'programado') {
                      <a [routerLink]="[enc.id, 'editar']" class="btn-ghost text-xs px-2.5 py-1">Editar</a>
                    }
                  </div>
                </div>
                @if (enc.motivoReprogramacion) {
                  <p class="text-xs text-orange-600 mt-2 flex items-center gap-1">
                    <span aria-hidden="true">🔄</span> Reprogramado: {{ enc.detalleReprogramacion ?? enc.motivoReprogramacion }}
                  </p>
                }
                @if (enc.walkoverEquipoId) {
                  <p class="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <span aria-hidden="true">⚠</span> Walkover a favor de: {{ getEquipoNombre(enc.walkoverEquipoId) }}
                  </p>
                }
                @if (enc.motivoSuspension) {
                  <p class="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <span aria-hidden="true">⏸</span> Suspendido: {{ enc.detalleSuspension ?? enc.motivoSuspension }}
                  </p>
                }
              </div>
            }
          </div>
        </div>
      } @empty {
        <div class="section-card text-center py-16">
          <div class="text-5xl mb-4" aria-hidden="true">📋</div>
          <p class="text-slate-500 text-lg font-medium">No hay encuentros programados</p>
          <p class="text-slate-400 text-sm mt-1">Crea un nuevo encuentro para comenzar</p>
          <a [routerLink]="['/', { outlets: { primary: ['gestion', 'encuentros'], panel: ['gestion', 'encuentros', 'nuevo'] } }]" class="btn-primary mt-4 inline-flex">+ Nuevo Encuentro</a>
        </div>
      }
    </div>
  `,
})
export class EncuentroListComponent {
  private readonly encuentroService = inject(EncuentroService);
  private readonly equipoService = inject(EquipoService);
  private readonly competenciaService = inject(CompetenciaService);

  protected readonly filtroEstado = signal<EstadoEncuentro | 'todos'>('todos');
  protected readonly filtroFase = signal<FaseEncuentro | 'todas'>('todas');
  protected readonly filtroCompetencia = signal<string>('todos');
  protected readonly competencias = this.competenciaService.items;

  protected readonly estados: { value: EstadoEncuentro; label: string }[] = [
    { value: 'programado', label: 'Programados' },
    { value: 'en_curso', label: 'En curso' },
    { value: 'finalizado', label: 'Finalizados' },
    { value: 'suspendido', label: 'Suspendidos' },
    { value: 'reprogramado', label: 'Reprogramados' },
    { value: 'walkover', label: 'Walkover' },
  ];

  protected readonly fasesDisponibles: { value: FaseEncuentro; label: string }[] = Object.entries(FASE_LABELS).map(
    ([value, label]) => ({ value: value as FaseEncuentro, label })
  );

  protected readonly estadoClasses: Record<EstadoEncuentro, string> = {
    borrador: 'bg-slate-100 text-slate-700',
    programado: 'bg-blue-100 text-blue-800',
    en_curso: 'bg-emerald-100 text-emerald-800',
    finalizado: 'bg-slate-100 text-slate-700',
    suspendido: 'bg-red-100 text-red-800',
    reprogramado: 'bg-orange-100 text-orange-800',
    walkover: 'bg-amber-100 text-amber-800',
    cancelado: 'bg-rose-100 text-rose-700',
  };

  protected readonly estadoLabels = ESTADO_ENCUENTRO_LABELS;
  protected readonly faseLabels = FASE_LABELS;

  protected readonly stats = computed(() => {
    const all = this.encuentroService.encuentros();
    return {
      total: all.length,
      programados: all.filter((e) => e.estado === 'programado').length,
      finalizados: all.filter((e) => e.estado === 'finalizado').length,
      reprogramados: all.filter((e) => e.estado === 'reprogramado').length,
    };
  });

  protected readonly fechasAgrupadas = computed(() => {
    const filtroEstado = this.filtroEstado();
    const filtroFase = this.filtroFase();
    const filtroCamp = this.filtroCompetencia();

    let encuentros = this.encuentroService.encuentros();
    if (filtroEstado !== 'todos') {
      encuentros = encuentros.filter((e) => e.estado === filtroEstado);
    }
    if (filtroFase !== 'todas') {
      encuentros = encuentros.filter((e) => e.fase === filtroFase);
    }
    if (filtroCamp !== 'todos') {
      encuentros = encuentros.filter((e) => e.competenciaId === filtroCamp);
    }

    const grouped = new Map<number, { numero: number; fecha: string; encuentros: typeof encuentros }>();
    for (const enc of encuentros) {
      const existing = grouped.get(enc.numeroFecha);
      if (existing) {
        existing.encuentros.push(enc);
      } else {
        grouped.set(enc.numeroFecha, {
          numero: enc.numeroFecha,
          fecha: enc.fechaHora.split('T')[0],
          encuentros: [enc],
        });
      }
    }
    return Array.from(grouped.values()).sort((a, b) => a.numero - b.numero);
  });

  protected getEquipoNombre(id: string): string {
    return this.equipoService.getEquipoById(id)?.nombre ?? 'Equipo desconocido';
  }

  protected getSedeNombre(sedeId: string): string {
    return this.encuentroService.getSedeById(sedeId)?.nombre ?? '';
  }
}
