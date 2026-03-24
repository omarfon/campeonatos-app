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
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand via-brand-700 to-brand-900 p-4 text-white shadow-xl shadow-brand-200">
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2230%22%20height%3D%2230%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%2010h10V0%22%20fill%3D%22none%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.05)%22%2F%3E%3C%2Fsvg%3E')] opacity-50"></div>
        <div class="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 class="text-xl font-extrabold tracking-tight">Programación de Encuentros</h2>
            <p class="text-slate-300 text-xs mt-0.5">Gestión de fechas, fases, sedes y reprogramaciones</p>
          </div>
          <a [routerLink]="['/', { outlets: { primary: ['gestion', 'encuentros'], panel: ['gestion', 'encuentros', 'nuevo'] } }]" class="btn-primary !from-white !to-green-50 !text-green-700 !shadow-xl !shadow-green-900/20 shrink-0 !text-xs !px-3 !py-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
            Nuevo Encuentro
          </a>
        </div>

        <!-- Stats -->
        <div class="relative mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1.5 text-center">
            <p class="text-lg font-bold">{{ stats().total }}</p>
            <p class="text-[10px] text-green-200">Total</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1.5 text-center">
            <p class="text-lg font-bold">{{ stats().programados }}</p>
            <p class="text-[10px] text-green-200">Programados</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1.5 text-center">
            <p class="text-lg font-bold">{{ stats().finalizados }}</p>
            <p class="text-[10px] text-green-200">Finalizados</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1.5 text-center">
            <p class="text-lg font-bold">{{ stats().reprogramados }}</p>
            <p class="text-[10px] text-green-200">Reprogramados</p>
          </div>
        </div>
      </div>

      <!-- Buscador y filtros -->
      <div class="section-card space-y-3">
        <div class="relative">
          <svg class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input
            type="text"
            class="input-modern !pl-10 w-full"
            placeholder="Buscar por equipo local o visitante..."
            [value]="busqueda()"
            (input)="busqueda.set($any($event.target).value)"
            aria-label="Buscar encuentros"
          />
        </div>
        <div class="flex flex-col sm:flex-row gap-2">
          <select
            class="input-modern !py-1.5 !text-sm flex-1"
            [value]="filtroEstado()"
            (change)="filtroEstado.set($any($event.target).value)"
            aria-label="Filtrar por estado"
          >
            <option value="todos">Todos los estados</option>
            @for (estado of estados; track estado.value) {
              <option [value]="estado.value">{{ estado.label }}</option>
            }
          </select>
          <select
            class="input-modern !py-1.5 !text-sm flex-1"
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
            class="input-modern !py-1.5 !text-sm flex-1"
            [value]="filtroCompetencia()"
            (change)="filtroCompetencia.set($any($event.target).value)"
            aria-label="Filtrar por competencia"
          >
            <option value="todas">Todas las competencias</option>
            @for (camp of competencias(); track camp.id) {
              <option [value]="camp.id">{{ camp.nombre }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Encuentros por fecha -->
      @for (fecha of fechasAgrupadas(); track fecha.numero) {
        <div class="section-card !p-0 overflow-hidden card-hover">
          <div class="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-100">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center font-bold text-lg">
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
                    <div class="bg-gradient-to-br from-green-50 to-green-50 border border-green-100 px-3 py-1.5 rounded-lg text-xs font-bold text-green-600 min-w-[40px] text-center">
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
                      <span class="text-xs px-2 py-0.5 rounded bg-green-50 text-green-700 font-medium">{{ faseLabels[enc.fase] }}</span>
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
  protected readonly filtroCompetencia = signal<string>('todas');
  protected readonly busqueda = signal('');
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
    programado: 'bg-green-100 text-green-800',
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
    const termino = this.busqueda().toLowerCase().trim();

    let encuentros = this.encuentroService.encuentros();
    if (filtroEstado !== 'todos') {
      encuentros = encuentros.filter((e) => e.estado === filtroEstado);
    }
    if (filtroFase !== 'todas') {
      encuentros = encuentros.filter((e) => e.fase === filtroFase);
    }
    if (filtroCamp !== 'todas') {
      encuentros = encuentros.filter((e) => e.competenciaId === filtroCamp);
    }
    if (termino) {
      encuentros = encuentros.filter((e) => {
        const local = this.getEquipoNombre(e.equipoLocalId).toLowerCase();
        const visitante = this.getEquipoNombre(e.equipoVisitanteId).toLowerCase();
        return local.includes(termino) || visitante.includes(termino);
      });
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
