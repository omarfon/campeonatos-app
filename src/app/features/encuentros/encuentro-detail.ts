import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EncuentroService } from '../../core/services/encuentro.service';
import { EquipoService } from '../../core/services/equipo.service';
import { CampeonatoService } from '../../core/services/campeonato.service';
import { DisciplinaService } from '../../core/services/disciplina.service';
import {
  Encuentro,
  EstadoEncuentro,
  MotivoReprogramacion,
  MotivoWalkover,
  MotivoSuspension,
  ESTADO_ENCUENTRO_LABELS,
  FASE_LABELS,
  MOTIVO_REPROGRAMACION_LABELS,
  MOTIVO_WALKOVER_LABELS,
  MOTIVO_SUSPENSION_LABELS,
} from '../../core/models/encuentro.model';

@Component({
  selector: 'app-encuentro-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    @if (encuentro(); as enc) {
      <div class="space-y-6 max-w-4xl mx-auto">
        <!-- Header -->
        <div>
          <a routerLink="/gestion/encuentros" class="btn-ghost text-sm mb-2 inline-flex">← Volver a encuentros</a>
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 class="text-2xl font-bold text-slate-900">Detalle del Encuentro</h2>
              <p class="text-slate-500 mt-1">{{ getCampeonatoNombre(enc.campeonatoId) }} · {{ getDisciplinaNombre(enc.disciplinaId) }}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              @if (puedeControlPrePartido()) {
                <a [routerLink]="['/gestion/encuentros', enc.id, 'control-pre-partido']" class="btn-secondary text-sm">
                  📋 Control Pre-Partido
                </a>
              }
              @if (enc.estado === 'borrador' || enc.estado === 'programado') {
                <a [routerLink]="['/gestion/encuentros', enc.id, 'editar']" class="btn-secondary text-sm">Editar</a>
              }
              @for (trans of transicionesDisponibles(); track trans) {
                <button type="button" class="text-sm" [class]="getTransicionClass(trans)" (click)="abrirAccion(trans)">
                  {{ estadoLabels[trans] }}
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Matchup card -->
        <div class="section-card">
          <div class="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
            <div class="text-center sm:text-right flex-1">
              <p class="text-xl font-bold text-slate-900">{{ getEquipoNombre(enc.equipoLocalId) }}</p>
              <p class="text-sm text-slate-400 mt-1">Local</p>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center">
                <span class="text-white font-bold text-lg">VS</span>
              </div>
              <span class="text-xs px-3 py-1 rounded-full font-semibold mt-1" [class]="estadoClasses[enc.estado]">
                {{ estadoLabels[enc.estado] }}
              </span>
            </div>
            <div class="text-center sm:text-left flex-1">
              <p class="text-xl font-bold text-slate-900">{{ getEquipoNombre(enc.equipoVisitanteId) }}</p>
              <p class="text-sm text-slate-400 mt-1">Visitante</p>
            </div>
          </div>
        </div>

        <!-- Info cards grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Fecha / Hora -->
          <div class="section-card">
            <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Fecha y Hora</h4>
            <p class="text-lg font-semibold text-slate-800">{{ enc.fechaHora.split('T')[0] }}</p>
            <p class="text-sm text-slate-500">{{ enc.fechaHora.split('T')[1]?.substring(0, 5) }} hs</p>
            @if (enc.fechaOriginal) {
              <p class="text-xs text-orange-600 mt-2">Original: {{ enc.fechaOriginal.split('T')[0] }} {{ enc.fechaOriginal.split('T')[1]?.substring(0, 5) }}</p>
            }
          </div>

          <!-- Fase -->
          <div class="section-card">
            <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Fase y Fecha</h4>
            <p class="text-lg font-semibold text-slate-800">{{ faseLabels[enc.fase] }}</p>
            <p class="text-sm text-slate-500">Fecha {{ enc.numeroFecha }}{{ enc.grupo ? ' · Grupo ' + enc.grupo : '' }}</p>
          </div>

          <!-- Sede -->
          <div class="section-card">
            <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sede y Campo</h4>
            @if (enc.sedeId) {
              <p class="text-lg font-semibold text-slate-800">{{ getSedeNombre(enc.sedeId) }}</p>
              @if (enc.campoId) {
                <p class="text-sm text-slate-500">{{ getCampoNombre(enc.campoId) }}</p>
              }
            } @else {
              <p class="text-sm text-slate-400 italic">Sin sede asignada</p>
            }
          </div>

          <!-- Árbitro -->
          <div class="section-card">
            <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Árbitro</h4>
            @if (enc.arbitroId) {
              <p class="text-lg font-semibold text-slate-800">{{ getArbitroNombre(enc.arbitroId) }}</p>
            } @else {
              <p class="text-sm text-slate-400 italic">Sin árbitro asignado</p>
            }
          </div>

          <!-- Reprogramaciones -->
          <div class="section-card">
            <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Reprogramaciones</h4>
            <p class="text-lg font-semibold text-slate-800">{{ enc.cantidadReprogramaciones }}</p>
            @if (enc.motivoReprogramacion) {
              <p class="text-xs text-orange-600 mt-1">{{ motivoReprogramacionLabels[enc.motivoReprogramacion] }}</p>
            }
          </div>

          <!-- Metadata -->
          <div class="section-card">
            <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Metadata</h4>
            <p class="text-xs text-slate-500">Creado: {{ enc.creadoEn.split('T')[0] }}</p>
            <p class="text-xs text-slate-500">Actualizado: {{ enc.actualizadoEn.split('T')[0] }}</p>
          </div>
        </div>

        <!-- Walkover info -->
        @if (enc.walkoverEquipoId) {
          <div class="rounded-xl bg-amber-50 border border-amber-200 p-4">
            <h4 class="font-semibold text-amber-800 mb-1">Walkover</h4>
            <p class="text-sm text-amber-700">
              A favor de: <strong>{{ getEquipoNombre(enc.walkoverEquipoId) }}</strong>
            </p>
            @if (enc.motivoWalkover) {
              <p class="text-xs text-amber-600 mt-1">Motivo: {{ motivoWalkoverLabels[enc.motivoWalkover] }}</p>
            }
          </div>
        }

        <!-- Suspension info -->
        @if (enc.motivoSuspension) {
          <div class="rounded-xl bg-red-50 border border-red-200 p-4">
            <h4 class="font-semibold text-red-800 mb-1">Suspensión</h4>
            <p class="text-sm text-red-700">{{ motivoSuspensionLabels[enc.motivoSuspension] }}</p>
            @if (enc.detalleSuspension) {
              <p class="text-xs text-red-600 mt-1">{{ enc.detalleSuspension }}</p>
            }
          </div>
        }

        <!-- Observaciones -->
        @if (enc.observaciones) {
          <div class="section-card">
            <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Observaciones</h4>
            <p class="text-sm text-slate-600">{{ enc.observaciones }}</p>
          </div>
        }

        <!-- Historial de estados -->
        <div class="section-card">
          <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Historial de Estados</h4>
          <div class="space-y-3">
            @for (h of enc.historialEstados; track h.fecha) {
              <div class="flex items-start gap-3">
                <div class="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" [class]="estadoDot[h.estado] ?? 'bg-slate-300'"></div>
                <div>
                  <p class="text-sm font-medium text-slate-700">{{ estadoLabels[h.estado] }}</p>
                  <p class="text-xs text-slate-400">{{ h.fecha.split('T')[0] }} {{ h.fecha.split('T')[1]?.substring(0, 5) }}</p>
                  @if (h.motivo) {
                    <p class="text-xs text-slate-500 mt-0.5">{{ h.motivo }}</p>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Action modal -->
        @if (accionActiva()) {
          <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" (click)="cerrarAccion()">
            <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4" (click)="$event.stopPropagation()">
              <h3 class="text-lg font-bold text-slate-900">{{ getTituloAccion() }}</h3>

              @switch (accionActiva()) {
                @case ('reprogramado') {
                  <form [formGroup]="reprogramarForm" (ngSubmit)="ejecutarReprogramar()" class="space-y-4">
                    <div>
                      <label for="nuevaFecha" class="block text-sm font-medium text-slate-700 mb-1">Nueva fecha y hora</label>
                      <input id="nuevaFecha" formControlName="nuevaFechaHora" type="datetime-local" class="input-modern" />
                    </div>
                    <div>
                      <label for="motivoRepr" class="block text-sm font-medium text-slate-700 mb-1">Motivo</label>
                      <select id="motivoRepr" formControlName="motivo" class="input-modern">
                        @for (m of motivosReprogramacion; track m.value) {
                          <option [value]="m.value">{{ m.label }}</option>
                        }
                      </select>
                    </div>
                    <div>
                      <label for="detalleRepr" class="block text-sm font-medium text-slate-700 mb-1">Detalle</label>
                      <textarea id="detalleRepr" formControlName="detalle" rows="2" class="input-modern"></textarea>
                    </div>
                    @if (errorAccion()) {
                      <p class="text-sm text-red-600" role="alert">{{ errorAccion() }}</p>
                    }
                    <div class="flex gap-2 justify-end">
                      <button type="button" class="btn-secondary text-sm" (click)="cerrarAccion()">Cancelar</button>
                      <button type="submit" class="btn-primary text-sm" [disabled]="reprogramarForm.invalid">Reprogramar</button>
                    </div>
                  </form>
                }
                @case ('walkover') {
                  <form [formGroup]="walkoverForm" (ngSubmit)="ejecutarWalkover()" class="space-y-4">
                    <div>
                      <label for="eqGanador" class="block text-sm font-medium text-slate-700 mb-1">Equipo ganador</label>
                      <select id="eqGanador" formControlName="equipoGanadorId" class="input-modern">
                        <option value="">Seleccionar...</option>
                        <option [value]="enc.equipoLocalId">{{ getEquipoNombre(enc.equipoLocalId) }}</option>
                        <option [value]="enc.equipoVisitanteId">{{ getEquipoNombre(enc.equipoVisitanteId) }}</option>
                      </select>
                    </div>
                    <div>
                      <label for="motivoWalk" class="block text-sm font-medium text-slate-700 mb-1">Motivo</label>
                      <select id="motivoWalk" formControlName="motivo" class="input-modern">
                        @for (m of motivosWalkover; track m.value) {
                          <option [value]="m.value">{{ m.label }}</option>
                        }
                      </select>
                    </div>
                    @if (errorAccion()) {
                      <p class="text-sm text-red-600" role="alert">{{ errorAccion() }}</p>
                    }
                    <div class="flex gap-2 justify-end">
                      <button type="button" class="btn-secondary text-sm" (click)="cerrarAccion()">Cancelar</button>
                      <button type="submit" class="btn-primary text-sm" [disabled]="walkoverForm.invalid">Registrar Walkover</button>
                    </div>
                  </form>
                }
                @case ('suspendido') {
                  <form [formGroup]="suspenderForm" (ngSubmit)="ejecutarSuspender()" class="space-y-4">
                    <div>
                      <label for="motivoSusp" class="block text-sm font-medium text-slate-700 mb-1">Motivo</label>
                      <select id="motivoSusp" formControlName="motivo" class="input-modern">
                        @for (m of motivosSuspension; track m.value) {
                          <option [value]="m.value">{{ m.label }}</option>
                        }
                      </select>
                    </div>
                    <div>
                      <label for="detalleSusp" class="block text-sm font-medium text-slate-700 mb-1">Detalle</label>
                      <textarea id="detalleSusp" formControlName="detalle" rows="2" class="input-modern"></textarea>
                    </div>
                    @if (errorAccion()) {
                      <p class="text-sm text-red-600" role="alert">{{ errorAccion() }}</p>
                    }
                    <div class="flex gap-2 justify-end">
                      <button type="button" class="btn-secondary text-sm" (click)="cerrarAccion()">Cancelar</button>
                      <button type="submit" class="btn-primary text-sm" [disabled]="suspenderForm.invalid">Suspender</button>
                    </div>
                  </form>
                }
                @default {
                  <p class="text-sm text-slate-600">¿Confirmar cambio de estado a <strong>{{ estadoLabels[accionActiva()!] }}</strong>?</p>
                  @if (errorAccion()) {
                    <p class="text-sm text-red-600" role="alert">{{ errorAccion() }}</p>
                  }
                  <div class="flex gap-2 justify-end">
                    <button type="button" class="btn-secondary text-sm" (click)="cerrarAccion()">Cancelar</button>
                    <button type="button" class="btn-primary text-sm" (click)="ejecutarCambioEstado()">Confirmar</button>
                  </div>
                }
              }
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="section-card text-center py-16">
        <p class="text-slate-500 text-lg">Encuentro no encontrado</p>
        <a routerLink="/gestion/encuentros" class="btn-primary mt-4 inline-flex">Volver a encuentros</a>
      </div>
    }
  `,
})
export class EncuentroDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly encuentroService = inject(EncuentroService);
  private readonly equipoService = inject(EquipoService);
  private readonly campeonatoService = inject(CampeonatoService);
  private readonly disciplinaService = inject(DisciplinaService);

  protected readonly encuentro = signal<Encuentro | undefined>(undefined);
  protected readonly accionActiva = signal<EstadoEncuentro | null>(null);
  protected readonly errorAccion = signal('');

  protected readonly estadoLabels = ESTADO_ENCUENTRO_LABELS;
  protected readonly faseLabels = FASE_LABELS;
  protected readonly motivoReprogramacionLabels = MOTIVO_REPROGRAMACION_LABELS;
  protected readonly motivoWalkoverLabels = MOTIVO_WALKOVER_LABELS;
  protected readonly motivoSuspensionLabels = MOTIVO_SUSPENSION_LABELS;

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

  protected readonly estadoDot: Record<EstadoEncuentro, string> = {
    borrador: 'bg-slate-400',
    programado: 'bg-blue-500',
    en_curso: 'bg-emerald-500',
    finalizado: 'bg-slate-500',
    suspendido: 'bg-red-500',
    reprogramado: 'bg-orange-500',
    walkover: 'bg-amber-500',
    cancelado: 'bg-rose-500',
  };

  protected readonly motivosReprogramacion = Object.entries(MOTIVO_REPROGRAMACION_LABELS).map(
    ([value, label]) => ({ value: value as MotivoReprogramacion, label })
  );
  protected readonly motivosWalkover = Object.entries(MOTIVO_WALKOVER_LABELS).map(
    ([value, label]) => ({ value: value as MotivoWalkover, label })
  );
  protected readonly motivosSuspension = Object.entries(MOTIVO_SUSPENSION_LABELS).map(
    ([value, label]) => ({ value: value as MotivoSuspension, label })
  );

  protected readonly puedeControlPrePartido = computed(() => {
    const enc = this.encuentro();
    return enc?.estado === 'programado' || enc?.estado === 'en_curso';
  });

  protected readonly transicionesDisponibles = computed(() => {
    const enc = this.encuentro();
    if (!enc) return [];
    return this.encuentroService.transicionesDisponibles(enc.id);
  });

  readonly reprogramarForm = this.fb.nonNullable.group({
    nuevaFechaHora: ['', Validators.required],
    motivo: ['clima' as MotivoReprogramacion, Validators.required],
    detalle: [''],
  });

  readonly walkoverForm = this.fb.nonNullable.group({
    equipoGanadorId: ['', Validators.required],
    motivo: ['inasistencia' as MotivoWalkover, Validators.required],
  });

  readonly suspenderForm = this.fb.nonNullable.group({
    motivo: ['clima' as MotivoSuspension, Validators.required],
    detalle: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.encuentro.set(this.encuentroService.getById(id));
    }
  }

  private recargar(): void {
    const enc = this.encuentro();
    if (enc) {
      this.encuentro.set(this.encuentroService.getById(enc.id));
    }
  }

  protected getEquipoNombre(id: string): string {
    return this.equipoService.getEquipoById(id)?.nombre ?? 'Desconocido';
  }

  protected getCampeonatoNombre(id: string): string {
    return this.campeonatoService.getById(id)?.nombre ?? 'Desconocido';
  }

  protected getDisciplinaNombre(id: string): string {
    return this.disciplinaService.items().find((d) => d.id === id)?.nombre ?? 'Desconocida';
  }

  protected getSedeNombre(id: string): string {
    return this.encuentroService.getSedeById(id)?.nombre ?? '';
  }

  protected getCampoNombre(id: string): string {
    return this.encuentroService.getCampoById(id)?.nombre ?? '';
  }

  protected getArbitroNombre(id: string): string {
    const a = this.encuentroService.getArbitroById(id);
    return a ? `${a.nombre} ${a.apellido}` : '';
  }

  protected getTransicionClass(estado: EstadoEncuentro): string {
    switch (estado) {
      case 'en_curso': return 'btn-primary';
      case 'finalizado': return 'btn-primary';
      case 'cancelado': return 'btn-ghost text-red-600 hover:bg-red-50';
      default: return 'btn-secondary';
    }
  }

  protected abrirAccion(estado: EstadoEncuentro): void {
    this.errorAccion.set('');
    this.accionActiva.set(estado);
  }

  protected cerrarAccion(): void {
    this.accionActiva.set(null);
    this.errorAccion.set('');
  }

  protected getTituloAccion(): string {
    switch (this.accionActiva()) {
      case 'reprogramado': return 'Reprogramar encuentro';
      case 'walkover': return 'Registrar walkover';
      case 'suspendido': return 'Suspender encuentro';
      default: return 'Cambiar estado';
    }
  }

  protected ejecutarReprogramar(): void {
    const enc = this.encuentro();
    if (!enc || this.reprogramarForm.invalid) return;
    const v = this.reprogramarForm.getRawValue();
    const result = this.encuentroService.reprogramar(enc.id, v.nuevaFechaHora, v.motivo, v.detalle || undefined);
    if (result !== true) {
      this.errorAccion.set(result);
      return;
    }
    this.cerrarAccion();
    this.recargar();
  }

  protected ejecutarWalkover(): void {
    const enc = this.encuentro();
    if (!enc || this.walkoverForm.invalid) return;
    const v = this.walkoverForm.getRawValue();
    const result = this.encuentroService.registrarWalkover(enc.id, v.equipoGanadorId, v.motivo);
    if (result !== true) {
      this.errorAccion.set(result);
      return;
    }
    this.cerrarAccion();
    this.recargar();
  }

  protected ejecutarSuspender(): void {
    const enc = this.encuentro();
    if (!enc || this.suspenderForm.invalid) return;
    const v = this.suspenderForm.getRawValue();
    const result = this.encuentroService.suspender(enc.id, v.motivo, v.detalle || undefined);
    if (result !== true) {
      this.errorAccion.set(result);
      return;
    }
    this.cerrarAccion();
    this.recargar();
  }

  protected ejecutarCambioEstado(): void {
    const enc = this.encuentro();
    const estado = this.accionActiva();
    if (!enc || !estado) return;
    const result = this.encuentroService.cambiarEstado(enc.id, estado);
    if (result !== true) {
      this.errorAccion.set(result);
      return;
    }
    this.cerrarAccion();
    this.recargar();
  }
}
