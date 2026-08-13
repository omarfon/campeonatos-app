import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CompetenciaService } from '../../core/services/competencia.service';
import { DisciplinaService } from '../../core/services/disciplina.service';
import {
  Competencia,
  FaseDisciplinaConfig,
  EstadoFaseDisciplina,
  PruebaDisciplinaConfig,
} from '../../core/models/competencia.model';
import { FaseEncuentro, FASE_LABELS } from '../../core/models/encuentro.model';

@Component({
  selector: 'app-competencia-disciplinas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule],
  host: {
    class: 'block -mx-4 -mt-4 lg:-mx-8 lg:-mt-8 min-h-[calc(100vh-3rem)]',
  },
  template: `
    @if (camp(); as c) {
      <div class="flex flex-col min-h-[calc(100vh-3rem)] w-full">
        <!-- Header compacto -->
        <div class="shrink-0 bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 px-4 lg:px-6 py-3 text-white shadow-md">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 min-w-0">
              <a [routerLink]="['/gestion/competencias', c.id]"
                class="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm font-medium transition-colors">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/></svg>
                Volver
              </a>
              <h1 class="text-lg font-bold truncate">Pruebas y fases · {{ c.nombre }}</h1>
            </div>
            <button (click)="cancelar()" class="btn-primary !bg-white !text-amber-700 hover:!bg-amber-50 !text-sm !py-1.5 !px-4 shrink-0">
              Volver al detalle
            </button>
          </div>
        </div>

        @if (disciplinasInscritas().length === 0) {
          <div class="flex-1 flex items-center justify-center p-8">
            <div class="section-card p-8 text-center max-w-md">
              <p class="text-slate-500 mb-4">Esta competencia no tiene disciplinas asociadas.</p>
              <a [routerLink]="['/gestion/competencias', c.id, 'editar']" class="btn-primary inline-flex">
                Editar competencia para agregar disciplinas
              </a>
            </div>
          </div>
        } @else {
          <!-- Disciplinas: barra horizontal -->
          <div class="shrink-0 border-b border-slate-200 bg-white px-4 lg:px-6 py-2">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Disciplina</p>
            <div class="flex gap-2 overflow-x-auto pb-0.5" role="listbox" aria-label="Disciplinas del campeonato">
              @for (disc of disciplinasInscritas(); track disc.id) {
                <button
                  type="button"
                  role="option"
                  [attr.aria-selected]="disciplinaActivaId() === disc.id"
                  class="shrink-0 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors"
                  [class]="disciplinaActivaId() === disc.id
                    ? 'border-amber-400 bg-amber-50 text-amber-800 ring-2 ring-amber-200'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
                  (click)="seleccionarDisciplinaActiva(disc.id)">
                  {{ disc.nombre }}
                  <span class="ml-1.5 text-xs font-normal text-slate-500">({{ getCantidadPruebasDisciplina(disc.id) }})</span>
                </button>
              }
            </div>
          </div>

          <!-- Área de trabajo: pruebas | editor -->
          <div class="flex flex-1 min-h-0 overflow-hidden bg-slate-100/60">
            @if (disciplinaActivaId(); as discId) {
              <!-- Columna pruebas -->
              <aside class="w-52 xl:w-60 shrink-0 flex flex-col border-r border-slate-200 bg-white min-h-0">
                <div class="shrink-0 flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-100">
                  <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Pruebas</p>
                  <button
                    type="button"
                    class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                    (click)="agregarDraftPrueba(discId)"
                    title="Agregar prueba"
                    aria-label="Agregar prueba">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                  </button>
                </div>
                <div class="flex-1 overflow-y-auto p-2 space-y-1">
                  @if (getDraftPruebas(discId).length === 0) {
                    <p class="text-xs text-slate-400 italic px-2 py-4 text-center">Sin pruebas</p>
                  }
                  @for (prueba of getDraftPruebas(discId); track prueba.id) {
                    <button
                      type="button"
                      class="w-full rounded-lg border p-2.5 text-left transition-colors"
                      [class]="pruebaActivaId() === prueba.id
                        ? 'border-amber-400 bg-amber-50 ring-1 ring-amber-200'
                        : 'border-slate-200 bg-white hover:bg-slate-50'"
                      (click)="seleccionarPruebaActiva(prueba.id)">
                      <p class="text-sm font-semibold text-slate-800 truncate">{{ prueba.nombre }}</p>
                      <p class="text-[11px] text-slate-500 mt-0.5">{{ prueba.fases.length }} fase(s)</p>
                      @if (prueba.fases.length > 0) {
                        <div class="flex flex-wrap gap-1 mt-1.5">
                          @for (fase of prueba.fases; track fase.id) {
                            <span
                              class="inline-block max-w-full truncate rounded px-1.5 py-0.5 text-[10px] font-medium"
                              [class]="faseEstaGuardada(fase.id) ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'"
                              [title]="fase.nombre">
                              {{ fase.nombre }}
                            </span>
                          }
                        </div>
                      }
                    </button>
                  }
                </div>
              </aside>

              <!-- Editor prueba + fases -->
              <div class="flex-1 min-w-0 overflow-y-auto p-3 lg:p-4">
                @if (pruebaActiva(); as prueba) {
                  <div class="space-y-3">
                    <div class="flex flex-wrap items-center gap-3 bg-white rounded-xl border border-slate-200 px-3 py-2">
                      <label class="sr-only" [for]="'prueba-nombre-' + prueba.id">Nombre de prueba</label>
                      <input
                        [id]="'prueba-nombre-' + prueba.id"
                        class="input-modern !py-1.5 flex-1 min-w-[12rem] !text-sm font-semibold"
                        placeholder="Nombre de la prueba"
                        [ngModel]="prueba.nombre"
                        (ngModelChange)="actualizarNombrePrueba(discId, prueba.id, $event)" />
                      <div class="flex items-center gap-1.5 ml-auto shrink-0">
                        <button
                          type="button"
                          class="btn-ghost !px-2.5 !py-1.5 !text-xs !text-amber-700 hover:!bg-amber-100"
                          (click)="agregarDraftFase(discId, prueba.id)">
                          + Fase
                        </button>
                        <button
                          type="button"
                          class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-red-600 hover:bg-red-50"
                          (click)="eliminarDraftPrueba(discId, prueba.id)"
                          title="Eliminar prueba"
                          [attr.aria-label]="'Eliminar prueba ' + prueba.nombre">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
                        </button>
                      </div>
                    </div>

                    @if (fasesPruebaActiva().length === 0) {
                      <p class="text-sm text-slate-500 italic text-center py-8">Agrega una fase a esta prueba.</p>
                    } @else {
                      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                        @for (fase of fasesPruebaActiva(); track fase.id; let i = $index) {
                          <article
                            class="rounded-xl border bg-white p-3 space-y-2.5 transition-colors flex flex-col"
                            [class]="faseEstaGuardada(fase.id) ? 'border-green-200' : 'border-amber-300 ring-1 ring-amber-100'">
                            <div class="flex items-center justify-between gap-2">
                              <div class="flex items-center gap-1.5 min-w-0">
                                <span class="text-xs font-bold text-slate-600 shrink-0">F{{ i + 1 }}</span>
                                @if (faseEstaGuardada(fase.id)) {
                                  <span class="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">OK</span>
                                } @else {
                                  <span class="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">·</span>
                                }
                              </div>
                              <div class="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  class="inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
                                  [class]="faseEstaGuardada(fase.id) ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-amber-500 text-white hover:bg-amber-600'"
                                  (click)="guardarFase(discId, prueba.id, fase.id)"
                                  [title]="faseEstaGuardada(fase.id) ? 'Actualizar fase' : 'Guardar fase'"
                                  [attr.aria-label]="'Guardar fase ' + fase.nombre">
                                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
                                </button>
                                <button
                                  type="button"
                                  class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-red-500 hover:bg-red-50"
                                  (click)="eliminarDraftFase(discId, prueba.id, fase.id)"
                                  title="Eliminar fase"
                                  [attr.aria-label]="'Eliminar fase ' + fase.nombre">
                                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
                                </button>
                              </div>
                            </div>

                            <div class="space-y-2 flex-1">
                              <div>
                                <label class="block text-[11px] font-semibold text-slate-500 mb-0.5" [for]="'fase-nombre-' + fase.id">Nombre</label>
                                <input [id]="'fase-nombre-' + fase.id" class="input-modern !py-1 !text-xs"
                                  [ngModel]="fase.nombre"
                                  (ngModelChange)="actualizarTextoFase(discId, prueba.id, fase.id, 'nombre', $event)" />
                              </div>
                              <div class="grid grid-cols-2 gap-2">
                                <div>
                                  <label class="block text-[11px] font-semibold text-slate-500 mb-0.5" [for]="'fase-tipo-' + fase.id">Tipo</label>
                                  <select [id]="'fase-tipo-' + fase.id" class="input-modern !py-1 !text-xs"
                                    [ngModel]="fase.tipo_fase"
                                    (ngModelChange)="actualizarTextoFase(discId, prueba.id, fase.id, 'tipo_fase', $event)">
                                    @for (opt of fasesDisponibles; track opt) {
                                      <option [value]="opt">{{ faseLabelsMap[opt] }}</option>
                                    }
                                  </select>
                                </div>
                                <div>
                                  <label class="block text-[11px] font-semibold text-slate-500 mb-0.5" [for]="'fase-estado-' + fase.id">Estado</label>
                                  <select [id]="'fase-estado-' + fase.id" class="input-modern !py-1 !text-xs"
                                    [ngModel]="fase.estado"
                                    (ngModelChange)="actualizarTextoFase(discId, prueba.id, fase.id, 'estado', $event)">
                                    @for (estado of estadoFaseOpciones; track estado) {
                                      <option [value]="estado">{{ estado }}</option>
                                    }
                                  </select>
                                </div>
                                <div>
                                  <label class="block text-[11px] font-semibold text-slate-500 mb-0.5" [for]="'fase-grupos-' + fase.id">Grupos</label>
                                  <input [id]="'fase-grupos-' + fase.id" type="number" min="0" class="input-modern !py-1 !text-xs"
                                    [ngModel]="fase.cantidad_grupos"
                                    (ngModelChange)="actualizarNumeroFase(discId, prueba.id, fase.id, 'cantidad_grupos', $event)" />
                                </div>
                                <div>
                                  <label class="block text-[11px] font-semibold text-slate-500 mb-0.5" [for]="'fase-clasif-grupo-' + fase.id">Clasif/grupo</label>
                                  <input [id]="'fase-clasif-grupo-' + fase.id" type="number" min="0" class="input-modern !py-1 !text-xs"
                                    [ngModel]="fase.clasificados_por_grupo"
                                    (ngModelChange)="actualizarNumeroFase(discId, prueba.id, fase.id, 'clasificados_por_grupo', $event)" />
                                </div>
                                <div>
                                  <label class="block text-[11px] font-semibold text-slate-500 mb-0.5" [for]="'fase-equipos-' + fase.id">Eq. llave</label>
                                  <input [id]="'fase-equipos-' + fase.id" type="number" min="0" class="input-modern !py-1 !text-xs"
                                    [ngModel]="fase.cantidad_equipos_llave"
                                    (ngModelChange)="actualizarNumeroFase(discId, prueba.id, fase.id, 'cantidad_equipos_llave', $event)" />
                                </div>
                                <div>
                                  <label class="block text-[11px] font-semibold text-slate-500 mb-0.5" [for]="'fase-clasif-' + fase.id">Clasificados</label>
                                  <input [id]="'fase-clasif-' + fase.id" type="number" min="0" class="input-modern !py-1 !text-xs"
                                    [ngModel]="fase.cantidad_clasificados"
                                    (ngModelChange)="actualizarNumeroFase(discId, prueba.id, fase.id, 'cantidad_clasificados', $event)" />
                                </div>
                              </div>
                              <div>
                                <label class="block text-[11px] font-semibold text-slate-500 mb-0.5" [for]="'fase-anterior-' + fase.id">Fase anterior</label>
                                <select [id]="'fase-anterior-' + fase.id" class="input-modern !py-1 !text-xs"
                                  [ngModel]="fase.fase_anterior_id ?? ''"
                                  (ngModelChange)="actualizarTextoFase(discId, prueba.id, fase.id, 'fase_anterior_id', $event)">
                                  <option value="">—</option>
                                  @for (opt of opcionesRelacionFase(discId, prueba.id, fase.id); track opt.id) {
                                    <option [value]="opt.id">{{ opt.nombre }}</option>
                                  }
                                </select>
                              </div>
                              <div>
                                <label class="block text-[11px] font-semibold text-slate-500 mb-0.5" [for]="'fase-posterior-' + fase.id">Fase posterior</label>
                                <select [id]="'fase-posterior-' + fase.id" class="input-modern !py-1 !text-xs"
                                  [ngModel]="fase.fase_posterior_id ?? ''"
                                  (ngModelChange)="actualizarTextoFase(discId, prueba.id, fase.id, 'fase_posterior_id', $event)">
                                  <option value="">—</option>
                                  @for (opt of opcionesRelacionFase(discId, prueba.id, fase.id); track opt.id) {
                                    <option [value]="opt.id">{{ opt.nombre }}</option>
                                  }
                                </select>
                              </div>
                            </div>

                            <fieldset class="flex flex-wrap gap-x-2 gap-y-1 pt-1 border-t border-slate-100">
                              <legend class="sr-only">Opciones</legend>
                              <label class="flex items-center gap-1 text-[10px] text-slate-600 cursor-pointer">
                                <input type="checkbox" class="rounded-sm text-amber-600 w-3 h-3"
                                  [ngModel]="fase.es_fase_inicial"
                                  (ngModelChange)="actualizarBooleanFase(discId, prueba.id, fase.id, 'es_fase_inicial', $event)" />
                                Inicial
                              </label>
                              <label class="flex items-center gap-1 text-[10px] text-slate-600 cursor-pointer">
                                <input type="checkbox" class="rounded-sm text-amber-600 w-3 h-3"
                                  [ngModel]="fase.es_fase_final"
                                  (ngModelChange)="actualizarBooleanFase(discId, prueba.id, fase.id, 'es_fase_final', $event)" />
                                Final
                              </label>
                              <label class="flex items-center gap-1 text-[10px] text-slate-600 cursor-pointer">
                                <input type="checkbox" class="rounded-sm text-amber-600 w-3 h-3"
                                  [ngModel]="fase.permite_empates"
                                  (ngModelChange)="actualizarBooleanFase(discId, prueba.id, fase.id, 'permite_empates', $event)" />
                                Empates
                              </label>
                              <label class="flex items-center gap-1 text-[10px] text-slate-600 cursor-pointer">
                                <input type="checkbox" class="rounded-sm text-amber-600 w-3 h-3"
                                  [ngModel]="fase.arrastra_sanciones"
                                  (ngModelChange)="actualizarBooleanFase(discId, prueba.id, fase.id, 'arrastra_sanciones', $event)" />
                                Sanciones
                              </label>
                              <label class="flex items-center gap-1 text-[10px] text-slate-600 cursor-pointer">
                                <input type="checkbox" class="rounded-sm text-amber-600 w-3 h-3"
                                  [ngModel]="fase.limpia_tarjetas"
                                  (ngModelChange)="actualizarBooleanFase(discId, prueba.id, fase.id, 'limpia_tarjetas', $event)" />
                                Limpia tarj.
                              </label>
                            </fieldset>
                          </article>
                        }
                      </div>
                    }
                  </div>
                } @else {
                  <div class="flex items-center justify-center h-full min-h-[200px] text-slate-500 text-sm">
                    Selecciona o agrega una prueba para editar sus fases.
                  </div>
                }
              </div>
            } @else {
              <div class="flex-1 flex items-center justify-center text-slate-500 text-sm p-8">
                Selecciona una disciplina para comenzar.
              </div>
            }
          </div>
        }
      </div>
    } @else {
      <div class="flex items-center justify-center min-h-[50vh] p-8">
        <div class="section-card p-8 text-center">
          <p class="text-slate-500">Competencia no encontrada.</p>
          <a routerLink="/gestion/competencias" class="btn-primary mt-4 inline-flex">Volver al listado</a>
        </div>
      </div>
    }
  `,
})
export class CompetenciaDisciplinasComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly competenciaService = inject(CompetenciaService);
  private readonly disciplinaService = inject(DisciplinaService);

  protected readonly camp = signal<Competencia | undefined>(undefined);
  protected readonly draftDisciplinasSeleccionadas = signal(new Set<string>());
  protected readonly draftPruebasByDisciplina = signal<Record<string, PruebaDisciplinaConfig[]>>({});
  protected readonly disciplinaActivaId = signal<string | undefined>(undefined);
  protected readonly pruebaActivaId = signal<string | undefined>(undefined);
  protected readonly fasesGuardadasIds = signal(new Set<string>());

  protected readonly fasesDisponibles: FaseEncuentro[] = [
    'fase_grupos', 'octavos', 'cuartos', 'semifinal', 'final', 'tercer_puesto',
  ];
  protected readonly estadoFaseOpciones: EstadoFaseDisciplina[] = ['borrador', 'activa', 'inactiva', 'cerrada'];
  protected readonly faseLabelsMap = FASE_LABELS;

  protected readonly disciplinasInscritas = computed(() => {
    const c = this.camp();
    if (!c) return [];
    const ids = new Set(c.disciplinaIds);
    return this.disciplinaService.items().filter((disc) => ids.has(disc.id));
  });

  protected readonly pruebaActiva = computed(() => {
    const disciplinaId = this.disciplinaActivaId();
    if (!disciplinaId) return undefined;
    const pruebas = this.draftPruebasByDisciplina()[disciplinaId];
    if (!pruebas?.length) return undefined;
    const activaId = this.pruebaActivaId();
    return pruebas.find((p) => p.id === activaId) ?? pruebas[0];
  });

  protected readonly fasesPruebaActiva = computed(() => this.pruebaActiva()?.fases ?? []);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    const competencia = this.competenciaService.getById(id);
    if (!competencia) return;

    this.camp.set(competencia);
    this.cargarDraftDesdeCompetencia(competencia);
  }

  private cargarDraftDesdeCompetencia(c: Competencia): void {
    const disciplinaUnicaId = c.disciplinaIds[0];
    const config = this.competenciaService.getDisciplinasConfig(c.id);
    this.draftDisciplinasSeleccionadas.set(new Set(disciplinaUnicaId ? [disciplinaUnicaId] : []));
    this.draftPruebasByDisciplina.set(
      config.reduce<Record<string, PruebaDisciplinaConfig[]>>((acc, item) => {
        acc[item.disciplinaId] = item.pruebas.map((prueba) => ({
          ...prueba,
          fases: prueba.fases.map((fase) => ({ ...fase })),
        }));
        return acc;
      }, {}),
    );
    this.disciplinaActivaId.set(disciplinaUnicaId);
    if (disciplinaUnicaId) {
      const pruebas = config.find((item) => item.disciplinaId === disciplinaUnicaId)?.pruebas ?? [];
      this.pruebaActivaId.set(pruebas[0]?.id);
    }

    const guardadas = new Set<string>();
    for (const item of config) {
      for (const prueba of item.pruebas) {
        for (const fase of prueba.fases) {
          guardadas.add(fase.id);
        }
      }
    }
    this.fasesGuardadasIds.set(guardadas);
  }

  protected getDisciplinaNombre(id: string): string {
    return this.disciplinaService.getById(id)?.nombre ?? id;
  }

  protected seleccionarDisciplinaActiva(disciplinaId: string): void {
    this.activarDisciplina(disciplinaId);
    this.ensurePruebasEnDraft(disciplinaId);
    const pruebas = this.getDraftPruebas(disciplinaId);
    this.pruebaActivaId.set(pruebas[0]?.id);
  }

  protected seleccionarPruebaActiva(pruebaId: string): void {
    this.pruebaActivaId.set(pruebaId);
  }

  protected toggleDraftDisciplina(disciplinaId: string): void {
    this.draftDisciplinasSeleccionadas.update((actual) => {
      const next = new Set(actual);
      if (next.has(disciplinaId)) {
        next.delete(disciplinaId);
      } else {
        next.add(disciplinaId);
      }
      return next;
    });

    if (this.draftDisciplinasSeleccionadas().has(disciplinaId)) {
      this.activarDisciplina(disciplinaId);
    }
  }

  private activarDisciplina(disciplinaId: string): void {
    this.disciplinaActivaId.set(disciplinaId);
    this.draftDisciplinasSeleccionadas.update((actual) => new Set(actual).add(disciplinaId));
    this.ensurePruebasEnDraft(disciplinaId);
    const pruebas = this.getDraftPruebas(disciplinaId);
    if (!this.pruebaActivaId() || !pruebas.some((p) => p.id === this.pruebaActivaId())) {
      this.pruebaActivaId.set(pruebas[0]?.id);
    }
  }

  protected getDraftPruebas(disciplinaId: string): PruebaDisciplinaConfig[] {
    return this.draftPruebasByDisciplina()[disciplinaId] ?? [];
  }

  protected getCantidadPruebasDisciplina(disciplinaId: string): number {
    return this.draftPruebasByDisciplina()[disciplinaId]?.length ?? 0;
  }

  protected agregarDraftPrueba(disciplinaId: string): void {
    this.ensurePruebasEnDraft(disciplinaId);
    const pruebas = this.getDraftPruebas(disciplinaId);
    const nuevaPrueba = this.crearPruebaPorDefecto(pruebas.length + 1);
    this.draftPruebasByDisciplina.update((actual) => ({
      ...actual,
      [disciplinaId]: [...(actual[disciplinaId] ?? []), nuevaPrueba],
    }));
    this.pruebaActivaId.set(nuevaPrueba.id);
  }

  protected eliminarDraftPrueba(disciplinaId: string, pruebaId: string): void {
    const fasesPrueba = this.getDraftPruebas(disciplinaId).find((p) => p.id === pruebaId)?.fases ?? [];
    const teniaGuardadas = fasesPrueba.some((f) => this.faseEstaGuardada(f.id));

    this.draftPruebasByDisciplina.update((actual) => {
      const pruebas = [...(actual[disciplinaId] ?? [])];
      if (pruebas.length <= 1) {
        alert('La disciplina debe tener al menos una prueba.');
        return actual;
      }
      return {
        ...actual,
        [disciplinaId]: pruebas.filter((prueba) => prueba.id !== pruebaId),
      };
    });

    this.fasesGuardadasIds.update((ids) => {
      const next = new Set(ids);
      fasesPrueba.forEach((f) => next.delete(f.id));
      return next;
    });

    if (teniaGuardadas) {
      this.persistirDisciplina(disciplinaId);
    }

    const restantes = this.getDraftPruebas(disciplinaId);
    this.pruebaActivaId.set(restantes[0]?.id);
  }

  protected actualizarNombrePrueba(disciplinaId: string, pruebaId: string, nombre: string): void {
    this.mutarDraftPruebas(disciplinaId, (pruebas) =>
      pruebas.map((prueba) => (prueba.id === pruebaId ? { ...prueba, nombre } : prueba)),
    );
  }

  protected getDraftFases(disciplinaId: string, pruebaId: string): FaseDisciplinaConfig[] {
    return this.getDraftPruebas(disciplinaId).find((prueba) => prueba.id === pruebaId)?.fases ?? [this.crearFasePorDefecto(1)];
  }

  protected agregarDraftFase(disciplinaId: string, pruebaId: string): void {
    this.mutarDraftPruebas(disciplinaId, (pruebas) =>
      pruebas.map((prueba) => {
        if (prueba.id !== pruebaId) return prueba;
        return {
          ...prueba,
          fases: [...prueba.fases, this.crearFasePorDefecto(prueba.fases.length + 1)],
        };
      }),
    );
  }

  protected eliminarDraftFase(disciplinaId: string, pruebaId: string, faseId: string): void {
    const estabaGuardada = this.faseEstaGuardada(faseId);
    let eliminada = false;

    this.draftPruebasByDisciplina.update((actual) => ({
      ...actual,
      [disciplinaId]: (actual[disciplinaId] ?? []).map((prueba) => {
        if (prueba.id !== pruebaId) return prueba;
        if (prueba.fases.length <= 1) {
          alert('Cada prueba debe tener al menos una fase.');
          return prueba;
        }
        eliminada = true;
        return { ...prueba, fases: prueba.fases.filter((fase) => fase.id !== faseId) };
      }),
    }));

    if (!eliminada) return;

    this.fasesGuardadasIds.update((ids) => {
      const next = new Set(ids);
      next.delete(faseId);
      return next;
    });

    if (estabaGuardada) {
      this.persistirDisciplina(disciplinaId);
    }
  }

  protected actualizarTextoFase(
    disciplinaId: string,
    pruebaId: string,
    faseId: string,
    campo: 'nombre' | 'tipo_fase' | 'fase_anterior_id' | 'fase_posterior_id' | 'estado',
    valor: string,
  ): void {
    this.mutarDraftPruebas(disciplinaId, (pruebas) =>
      pruebas.map((prueba) => {
        if (prueba.id !== pruebaId) return prueba;
        return {
          ...prueba,
          fases: prueba.fases.map((fase) => {
            if (fase.id !== faseId) return fase;
            if (campo === 'tipo_fase') return { ...fase, tipo_fase: valor as FaseEncuentro };
            if (campo === 'estado') return { ...fase, estado: valor as EstadoFaseDisciplina };
            if (campo === 'fase_anterior_id') return { ...fase, fase_anterior_id: valor || undefined };
            if (campo === 'fase_posterior_id') return { ...fase, fase_posterior_id: valor || undefined };
            return { ...fase, nombre: valor };
          }),
        };
      }),
    );
    this.marcarFasePendiente(faseId);
  }

  protected actualizarNumeroFase(
    disciplinaId: string,
    pruebaId: string,
    faseId: string,
    campo: 'cantidad_grupos' | 'clasificados_por_grupo' | 'cantidad_equipos_llave' | 'cantidad_clasificados',
    valorRaw: string | number,
  ): void {
    const valor = Math.max(0, Number(valorRaw) || 0);
    this.mutarDraftPruebas(disciplinaId, (pruebas) =>
      pruebas.map((prueba) => {
        if (prueba.id !== pruebaId) return prueba;
        return {
          ...prueba,
          fases: prueba.fases.map((fase) => (fase.id === faseId ? { ...fase, [campo]: valor } : fase)),
        };
      }),
    );
    this.marcarFasePendiente(faseId);
  }

  protected actualizarBooleanFase(
    disciplinaId: string,
    pruebaId: string,
    faseId: string,
    campo: 'es_fase_inicial' | 'es_fase_final' | 'permite_empates' | 'arrastra_sanciones' | 'limpia_tarjetas',
    valor: boolean,
  ): void {
    this.mutarDraftPruebas(disciplinaId, (pruebas) =>
      pruebas.map((prueba) => {
        if (prueba.id !== pruebaId) return prueba;
        return {
          ...prueba,
          fases: prueba.fases.map((fase) => (fase.id === faseId ? { ...fase, [campo]: valor } : fase)),
        };
      }),
    );
    this.marcarFasePendiente(faseId);
  }

  protected opcionesRelacionFase(disciplinaId: string, pruebaId: string, faseId: string): FaseDisciplinaConfig[] {
    return this.getDraftFases(disciplinaId, pruebaId).filter((fase) => fase.id !== faseId);
  }

  protected faseEstaGuardada(faseId: string): boolean {
    return this.fasesGuardadasIds().has(faseId);
  }

  protected guardarFase(disciplinaId: string, pruebaId: string, faseId: string): void {
    const fase = this.getDraftFases(disciplinaId, pruebaId).find((item) => item.id === faseId);
    if (!fase) return;

    if (!fase.nombre.trim()) {
      alert('El nombre de la fase es obligatorio.');
      return;
    }

    this.persistirDisciplina(disciplinaId);
    this.fasesGuardadasIds.update((ids) => new Set(ids).add(faseId));
  }

  protected cancelar(): void {
    const c = this.camp();
    if (c) {
      this.router.navigate(['/gestion/competencias', c.id]);
    } else {
      this.router.navigate(['/gestion/competencias']);
    }
  }

  private mutarDraftPruebas(
    disciplinaId: string,
    mutator: (pruebas: PruebaDisciplinaConfig[]) => PruebaDisciplinaConfig[],
  ): void {
    this.ensurePruebasEnDraft(disciplinaId);
    this.draftPruebasByDisciplina.update((actual) => ({
      ...actual,
      [disciplinaId]: mutator(actual[disciplinaId] ?? []),
    }));
  }

  private ensurePruebasEnDraft(disciplinaId: string): void {
    if (this.draftPruebasByDisciplina()[disciplinaId]?.length) return;

    const c = this.camp();
    if (!c) return;

    const configItem = this.competenciaService
      .getDisciplinasConfig(c.id)
      .find((item) => item.disciplinaId === disciplinaId);

    const pruebas = configItem
      ? configItem.pruebas.map((prueba) => ({
          ...prueba,
          fases: prueba.fases.map((fase) => ({ ...fase })),
        }))
      : [this.crearPruebaPorDefecto(1)];

    this.draftPruebasByDisciplina.update((actual) => ({
      ...actual,
      [disciplinaId]: pruebas,
    }));
  }

  private marcarFasePendiente(faseId: string): void {
    this.fasesGuardadasIds.update((ids) => {
      const next = new Set(ids);
      next.delete(faseId);
      return next;
    });
  }

  private persistirDisciplina(disciplinaId: string): void {
    const c = this.camp();
    if (!c || !c.disciplinaIds.includes(disciplinaId)) return;

    this.competenciaService.actualizarPruebasDisciplina(
      c.id,
      disciplinaId,
      this.getDraftPruebas(disciplinaId),
    );
    this.camp.set(this.competenciaService.getById(c.id));
  }

  private crearPruebaPorDefecto(numero: number): PruebaDisciplinaConfig {
    return {
      id: crypto.randomUUID(),
      nombre: `Prueba ${numero}`,
      fases: [this.crearFasePorDefecto(1)],
    };
  }

  private crearFasePorDefecto(numero: number): FaseDisciplinaConfig {
    return {
      id: crypto.randomUUID(),
      nombre: `Fase ${numero}`,
      tipo_fase: 'fase_grupos',
      cantidad_grupos: 1,
      clasificados_por_grupo: 1,
      cantidad_equipos_llave: 0,
      cantidad_clasificados: 0,
      fase_anterior_id: undefined,
      fase_posterior_id: undefined,
      es_fase_inicial: numero === 1,
      es_fase_final: numero === 1,
      permite_empates: false,
      arrastra_sanciones: true,
      limpia_tarjetas: false,
      estado: 'borrador',
    };
  }
}
