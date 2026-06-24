import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CompetenciaService } from '../../core/services/competencia.service';
import { DisciplinaService } from '../../core/services/disciplina.service';
import { confirmDialog } from '../../shared/confirm-dialog';
import {
  EstadoCompetencia,
  TipoCompetencia,
  ModalidadCompetencia,
  ESTADO_LABELS, TIPO_LABELS, MODALIDAD_LABELS, ESTRUCTURA_LABELS,
} from '../../core/models/competencia.model';

@Component({
  selector: 'app-competencia-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-8">

      <!-- Hero Header -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand via-brand-700 to-brand-900 p-4 text-white shadow-xl shadow-brand-200">
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200h60v60H0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z%22%20fill%3D%22rgba(255%2C255%2C255%2C0.06)%22%2F%3E%3C%2Fsvg%3E')] opacity-50"></div>
        <div class="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 class="text-xl font-extrabold tracking-tight">Competencias</h2>
            <p class="text-slate-300 text-xs mt-0.5">Administra competencias, controla estados y gestiona eventos deportivos.</p>
          </div>
          <a [routerLink]="['/', { outlets: { primary: ['gestion', 'competencias'], panel: ['gestion', 'competencias', 'nuevo'] } }]" class="btn-primary !from-white !to-green-50 !text-green-700 !shadow-xl !shadow-green-900/20 shrink-0 !text-xs !px-3 !py-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
            Nuevo Competencia
          </a>
        </div>

        <!-- Stats row -->
        <div class="relative mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1.5 text-center">
            <p class="text-lg font-bold">{{ contarPorEstado('todos') }}</p>
            <p class="text-[10px] text-green-200">Total</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1.5 text-center">
            <p class="text-lg font-bold">{{ contarPorEstado('en_ejecucion') }}</p>
            <p class="text-[10px] text-green-200">En ejecución</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1.5 text-center">
            <p class="text-lg font-bold">{{ contarPorEstado('programado') }}</p>
            <p class="text-[10px] text-green-200">Programados</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1.5 text-center">
            <p class="text-lg font-bold">{{ contarPorEstado('borrador') }}</p>
            <p class="text-[10px] text-green-200">Borradores</p>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="section-card">
        <div class="flex flex-col gap-4">
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="flex-1">
              <label for="filtro-estado" class="block text-xs font-semibold text-slate-500 mb-1">Estado</label>
              <select id="filtro-estado" class="input-modern !py-1.5 !text-sm"
                [value]="filtroEstado()"
                (change)="filtroEstado.set($any($event.target).value)">
                @for (estado of estados; track estado.value) {
                  <option [value]="estado.value">{{ estado.label }}</option>
                }
              </select>
            </div>
            <div class="flex-1">
              <label for="filtro-tipo" class="block text-xs font-semibold text-slate-500 mb-1">Tipo</label>
              <select id="filtro-tipo" class="input-modern !py-1.5 !text-sm"
                [value]="filtroTipo()"
                (change)="filtroTipo.set($any($event.target).value)">
                <option value="todos">Todos los tipos</option>
                <option value="interno">Interno</option>
                <option value="abierto">Abierto</option>
              </select>
            </div>
            <div class="flex-1">
              <label for="filtro-modalidad" class="block text-xs font-semibold text-slate-500 mb-1">Modalidad</label>
              <select id="filtro-modalidad" class="input-modern !py-1.5 !text-sm"
                [value]="filtroModalidad()"
                (change)="filtroModalidad.set($any($event.target).value)">
                <option value="todos">Todas las modalidades</option>
                <option value="interno_cerrado">Interno cerrado</option>
                <option value="interno_invitados">Interno con invitados</option>
                <option value="abierto">Abierto</option>
              </select>
            </div>
            <div class="flex-1">
              <label for="filtro-anio" class="block text-xs font-semibold text-slate-500 mb-1">Año</label>
              <select id="filtro-anio" class="input-modern !py-1.5 !text-sm"
                (change)="filtroAnio.set($any($event.target).value === 'todos' ? null : +$any($event.target).value)">
                <option value="todos">Todos los años</option>
                @for (a of aniosDisponibles(); track a) {
                  <option [value]="a">{{ a }}</option>
                }
              </select>
            </div>
            <div class="flex-1">
              <label for="filtro-disciplina" class="block text-xs font-semibold text-slate-500 mb-1">Disciplina</label>
              <select id="filtro-disciplina" class="input-modern !py-1.5 !text-sm"
                [value]="filtroDisciplina()"
                (change)="filtroDisciplina.set($any($event.target).value)">
                <option value="todos">Todas las disciplinas</option>
                @for (d of disciplinasDisponibles(); track d.id) {
                  <option [value]="d.id">{{ d.nombre }}</option>
                }
              </select>
            </div>
          </div>

          <!-- Resumen de resultados -->
          @if (filtroTipo() !== 'todos' || filtroModalidad() !== 'todos' || filtroAnio() !== null || filtroDisciplina() !== 'todos' || filtroEstado() !== 'todos') {
            <div class="flex items-center justify-between pt-2 border-t border-slate-100">
              <p class="text-sm text-slate-500">
                {{ filteredItems().length }} competencia(s) encontrada(s)
              </p>
              <button class="text-xs text-green-600 font-medium hover:text-green-800 transition-colors" (click)="limpiarFiltros()">
                Limpiar filtros
              </button>
            </div>
          }
        </div>
      </div>

      <!-- Listado -->
      <div class="section-card overflow-hidden">
        @if (filteredItems().length > 0) {
          <div class="hidden md:grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.5fr)] gap-3 px-4 py-3 border-b border-slate-200 bg-slate-50">
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Competencia</p>
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</p>
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Vigencia</p>
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Acciones</p>
          </div>

          <div class="divide-y divide-slate-100">
            @for (camp of filteredItems(); track camp.id) {
              <div class="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.5fr)] gap-3 px-4 py-4 hover:bg-slate-50 transition-colors">
                <div class="min-w-0">
                  <a [routerLink]="[camp.id]"
                    class="text-base font-bold text-slate-900 hover:text-green-600 transition-colors truncate block">
                    {{ camp.nombre }}
                  </a>
                  <div class="flex items-center gap-2 mt-1 flex-wrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider"
                      [class]="tipoClasses[camp.tipo]">
                      {{ tipoLabelsMap[camp.tipo] }}
                    </span>
                    <span class="text-xs text-slate-400 font-medium">{{ modalidadLabelsMap[camp.modalidad] }}</span>
                    <span class="text-xs text-slate-400">·</span>
                    <span class="text-xs text-slate-500 font-medium">{{ estructuraLabelsMap[camp.estructura] }}</span>
                    <span class="text-xs text-slate-400">·</span>
                    <span class="text-xs text-green-600 font-semibold">{{ camp.anio }}</span>
                  </div>
                  <div class="flex flex-wrap gap-1.5 mt-2">
                    @for (dId of camp.disciplinaIds; track dId) {
                      <span class="inline-flex items-center bg-green-50 text-green-700 rounded-lg px-2 py-0.5 text-[11px] font-medium border border-green-100">
                        {{ getDisciplinaNombre(dId) }}
                      </span>
                    }
                  </div>
                </div>

                <div class="md:pt-1">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold shrink-0"
                    [class]="estadoClasses[camp.estado]">
                    <span class="w-1.5 h-1.5 rounded-full"
                      [class]="estadoDotClasses[camp.estado]" aria-hidden="true"></span>
                    {{ estadoLabelsMap[camp.estado] }}
                  </span>
                  <div class="mt-2">
                    @if (camp.publicado) {
                      <span class="flex items-center gap-1 text-emerald-600 font-medium text-xs">
                        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></span>
                        Publicado
                      </span>
                    } @else if (camp.publicacionAutomatica && camp.fechaProgramadaPublicacion) {
                      <span class="text-xs text-amber-600 font-medium">Prog. {{ camp.fechaProgramadaPublicacion }}</span>
                    } @else {
                      <span class="text-xs text-slate-400">Sin publicar</span>
                    }
                  </div>
                </div>

                <div class="md:pt-1">
                  <div class="flex items-center gap-1.5 text-sm text-slate-500">
                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    <span>{{ camp.fechaInicio }} — {{ camp.fechaFin }}</span>
                  </div>
                </div>

                <div class="flex flex-wrap items-start gap-2">
                  <a [routerLink]="[camp.id]" class="btn-ghost !px-3 !py-1.5 !text-xs !gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    Ver
                  </a>

                  @if (camp.estado === 'borrador') {
                    <a [routerLink]="[camp.id, 'editar']" class="btn-ghost !px-3 !py-1.5 !text-xs !text-green-600 hover:!bg-green-50">Editar</a>
                    <button (click)="cambiarEstado(camp.id, 'programado')"
                      class="btn-ghost !px-3 !py-1.5 !text-xs !text-green-600 hover:!bg-green-50">
                      Programar
                    </button>
                    @if (!camp.publicado) {
                      <button (click)="publicar(camp.id)"
                        class="btn-ghost !px-3 !py-1.5 !text-xs !text-emerald-600 hover:!bg-emerald-50">Publicar</button>
                    }
                    <button (click)="cambiarEstado(camp.id, 'anulado')"
                      class="btn-ghost !px-3 !py-1.5 !text-xs !text-red-500 hover:!bg-red-50">Anular</button>
                    <button (click)="eliminar(camp.id)"
                      class="btn-ghost !px-3 !py-1.5 !text-xs !text-red-500 hover:!bg-red-50">Eliminar</button>
                  }

                  @if (camp.estado === 'programado') {
                    <button (click)="cambiarEstado(camp.id, 'en_ejecucion')"
                      class="btn-ghost !px-3 !py-1.5 !text-xs !text-emerald-600 hover:!bg-emerald-50">Iniciar</button>
                    <button (click)="cambiarEstado(camp.id, 'suspendido')"
                      class="btn-ghost !px-3 !py-1.5 !text-xs !text-amber-600 hover:!bg-amber-50">Suspender</button>
                    <button (click)="cambiarEstado(camp.id, 'anulado')"
                      class="btn-ghost !px-3 !py-1.5 !text-xs !text-red-500 hover:!bg-red-50">Anular</button>
                  }

                  @if (camp.estado === 'en_ejecucion') {
                    <button (click)="cambiarEstado(camp.id, 'finalizado')"
                      class="btn-ghost !px-3 !py-1.5 !text-xs !text-amber-600 hover:!bg-amber-50">Finalizar</button>
                    <button (click)="cambiarEstado(camp.id, 'suspendido')"
                      class="btn-ghost !px-3 !py-1.5 !text-xs !text-red-500 hover:!bg-red-50">Suspender</button>
                  }

                  @if (camp.estado === 'suspendido') {
                    <button (click)="cambiarEstado(camp.id, 'programado')"
                      class="btn-ghost !px-3 !py-1.5 !text-xs !text-green-600 hover:!bg-green-50">Reprogramar</button>
                    <button (click)="cambiarEstado(camp.id, 'en_ejecucion')"
                      class="btn-ghost !px-3 !py-1.5 !text-xs !text-emerald-600 hover:!bg-emerald-50">Reanudar</button>
                    <button (click)="cambiarEstado(camp.id, 'anulado')"
                      class="btn-ghost !px-3 !py-1.5 !text-xs !text-red-500 hover:!bg-red-50">Anular</button>
                  }
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="col-span-full flex flex-col items-center justify-center py-16">
            <div class="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center text-3xl mb-4">🏆</div>
            <p class="text-slate-500 font-medium">No se encontraron competencias</p>
            <p class="text-sm text-slate-400 mt-1">Crea tu primer competencia para comenzar</p>
            <a [routerLink]="['/', { outlets: { primary: ['gestion', 'competencias'], panel: ['gestion', 'competencias', 'nuevo'] } }]" class="btn-primary mt-4">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
              Nuevo Competencia
            </a>
          </div>
        }
      </div>
    </div>
  `,
})
export class CompetenciaListComponent {
  private readonly competenciaService = inject(CompetenciaService);
  private readonly disciplinaService = inject(DisciplinaService);

  protected readonly filtroEstado = signal<EstadoCompetencia | 'todos'>('todos');
  protected readonly filtroAnio = signal<number | null>(null);
  protected readonly filtroTipo = signal<TipoCompetencia | 'todos'>('todos');
  protected readonly filtroModalidad = signal<ModalidadCompetencia | 'todos'>('todos');
  protected readonly filtroDisciplina = signal<string>('todos');

  protected readonly aniosDisponibles = computed(() => {
    const anios = new Set(this.competenciaService.items().map((c) => c.anio));
    return Array.from(anios).sort((a, b) => b - a);
  });

  protected readonly disciplinasDisponibles = computed(() => {
    const ids = new Set(this.competenciaService.items().flatMap((c) => c.disciplinaIds));
    return Array.from(ids).map((id) => ({ id, nombre: this.getDisciplinaNombre(id) })).sort((a, b) => a.nombre.localeCompare(b.nombre));
  });

  protected readonly filteredItems = computed(() => {
    const estado = this.filtroEstado();
    const anio = this.filtroAnio();
    const tipo = this.filtroTipo();
    const modalidad = this.filtroModalidad();
    const disciplina = this.filtroDisciplina();

    let items = this.competenciaService.items();
    if (estado !== 'todos') items = items.filter((c) => c.estado === estado);
    if (anio !== null) items = items.filter((c) => c.anio === anio);
    if (tipo !== 'todos') items = items.filter((c) => c.tipo === tipo);
    if (modalidad !== 'todos') items = items.filter((c) => c.modalidad === modalidad);
    if (disciplina !== 'todos') items = items.filter((c) => c.disciplinaIds.includes(disciplina));
    return items;
  });

  protected limpiarFiltros(): void {
    this.filtroEstado.set('todos');
    this.filtroAnio.set(null);
    this.filtroTipo.set('todos');
    this.filtroModalidad.set('todos');
    this.filtroDisciplina.set('todos');
  }

  protected readonly estados: { value: EstadoCompetencia | 'todos'; label: string }[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'borrador', label: 'Borrador' },
    { value: 'programado', label: 'Programados' },
    { value: 'en_ejecucion', label: 'En ejecución' },
    { value: 'finalizado', label: 'Finalizados' },
    { value: 'suspendido', label: 'Suspendidos' },
    { value: 'anulado', label: 'Anulados' },
  ];

  protected readonly estadoClasses: Record<EstadoCompetencia, string> = {
    borrador: 'bg-slate-50 text-slate-600 border border-slate-200',
    programado: 'bg-green-50 text-green-700 border border-green-200',
    en_ejecucion: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    finalizado: 'bg-amber-50 text-amber-700 border border-amber-200',
    suspendido: 'bg-orange-50 text-orange-700 border border-orange-200',
    anulado: 'bg-red-50 text-red-700 border border-red-200',
  };

  protected readonly estadoDotClasses: Record<EstadoCompetencia, string> = {
    borrador: 'bg-slate-400',
    programado: 'bg-green-500',
    en_ejecucion: 'bg-emerald-500',
    finalizado: 'bg-amber-500',
    suspendido: 'bg-orange-500',
    anulado: 'bg-red-500',
  };

  protected readonly estadoLabelsMap = ESTADO_LABELS;
  protected readonly tipoLabelsMap = TIPO_LABELS;
  protected readonly modalidadLabelsMap = MODALIDAD_LABELS;
  protected readonly estructuraLabelsMap = ESTRUCTURA_LABELS;

  protected readonly tipoClasses: Record<string, string> = {
    interno: 'bg-sky-50 text-sky-700 border border-sky-200',
    abierto: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  };

  protected contarPorEstado(value: EstadoCompetencia | 'todos'): number {
    const items = this.competenciaService.items();
    return value === 'todos' ? items.length : items.filter((c) => c.estado === value).length;
  }

  protected getDisciplinaNombre(id: string): string {
    return this.disciplinaService.getById(id)?.nombre ?? id;
  }

  protected cambiarEstado(id: string, nuevoEstado: EstadoCompetencia): void {
    const result = this.competenciaService.cambiarEstado(id, nuevoEstado);
    if (result !== true) {
      alert(result);
    }
  }

  protected publicar(id: string): void {
    this.competenciaService.publicar(id);
  }

  protected async eliminar(id: string): Promise<void> {
    const ok = await confirmDialog({ title: 'Eliminar competencia', text: '¿Está seguro de eliminar esta competencia? Esta acción no se puede deshacer.' });
    if (ok) {
      this.competenciaService.delete(id);
    }
  }
}
