import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EncuentroService } from '../../core/services/encuentro.service';
import { EquipoService } from '../../core/services/equipo.service';
import { CompetenciaService } from '../../core/services/competencia.service';
import { DisciplinaService } from '../../core/services/disciplina.service';
import {
  FaseEncuentro,
  EstadoEncuentro,
  FASE_LABELS,
  ESTADO_ENCUENTRO_LABELS,
} from '../../core/models/encuentro.model';

@Component({
  selector: 'app-encuentro-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Header -->
      <div>
        <button type="button" (click)="cancelar()" class="btn-ghost mb-2 text-sm">
          ← Volver a encuentros
        </button>
        <h2 class="text-2xl font-bold text-slate-900">{{ isEdit() ? 'Editar' : 'Nuevo' }} Encuentro</h2>
        <p class="text-slate-500 mt-1">{{ isEdit() ? 'Modificar datos del encuentro' : 'Programar un nuevo encuentro' }}</p>
      </div>

      <!-- Steps -->
      <div class="flex gap-2" role="tablist" aria-label="Pasos del formulario">
        @for (step of steps; track step.id; let i = $index) {
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="currentStep() === i"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            [class]="currentStep() === i
              ? 'bg-indigo-600 text-white shadow-md'
              : currentStep() > i
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-500'"
            (click)="currentStep.set(i)"
          >
            @if (currentStep() > i) {
              <span aria-hidden="true">✓</span>
            }
            {{ step.label }}
          </button>
        }
      </div>

      <form [formGroup]="form" (ngSubmit)="guardar()" class="section-card space-y-6">
        <!-- Step 0: Competencia y Disciplina -->
        @if (currentStep() === 0) {
          <div class="space-y-4">
            <h3 class="font-semibold text-slate-800 text-lg">Competencia y Disciplina</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="competencia" class="block text-sm font-medium text-slate-700 mb-1">Competencia</label>
                <select id="competencia" formControlName="competenciaId" class="input-modern">
                  <option value="">Seleccionar competencia...</option>
                  @for (camp of competencias(); track camp.id) {
                    <option [value]="camp.id">{{ camp.nombre }}</option>
                  }
                </select>
              </div>
              <div>
                <label for="disciplina" class="block text-sm font-medium text-slate-700 mb-1">Disciplina</label>
                <select id="disciplina" formControlName="disciplinaId" class="input-modern">
                  <option value="">Seleccionar disciplina...</option>
                  @for (disc of disciplinas(); track disc.id) {
                    <option [value]="disc.id">{{ disc.nombre }}</option>
                  }
                </select>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label for="fase" class="block text-sm font-medium text-slate-700 mb-1">Fase</label>
                <select id="fase" formControlName="fase" class="input-modern">
                  @for (f of fases; track f.value) {
                    <option [value]="f.value">{{ f.label }}</option>
                  }
                </select>
              </div>
              <div>
                <label for="grupo" class="block text-sm font-medium text-slate-700 mb-1">Grupo</label>
                <input id="grupo" formControlName="grupo" type="text" placeholder="Ej: A, B, C..." class="input-modern" />
              </div>
              <div>
                <label for="numeroFecha" class="block text-sm font-medium text-slate-700 mb-1">Nro. de Fecha</label>
                <input id="numeroFecha" formControlName="numeroFecha" type="number" class="input-modern" />
              </div>
            </div>
          </div>
        }

        <!-- Step 1: Equipos -->
        @if (currentStep() === 1) {
          <div class="space-y-4">
            <h3 class="font-semibold text-slate-800 text-lg">Equipos participantes</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div class="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                <label for="equipoLocal" class="block text-sm font-semibold text-blue-800 mb-2">🏠 Equipo Local</label>
                <select id="equipoLocal" formControlName="equipoLocalId" class="input-modern">
                  <option value="">Seleccionar equipo...</option>
                  @for (eq of equipos(); track eq.id) {
                    <option [value]="eq.id">{{ eq.nombre }}</option>
                  }
                </select>
              </div>
              <div class="p-4 rounded-xl border border-orange-100 bg-orange-50/50">
                <label for="equipoVisitante" class="block text-sm font-semibold text-orange-800 mb-2">✈ Equipo Visitante</label>
                <select id="equipoVisitante" formControlName="equipoVisitanteId" class="input-modern">
                  <option value="">Seleccionar equipo...</option>
                  @for (eq of equipos(); track eq.id) {
                    <option [value]="eq.id">{{ eq.nombre }}</option>
                  }
                </select>
              </div>
            </div>
            @if (form.value.equipoLocalId && form.value.equipoLocalId === form.value.equipoVisitanteId) {
              <p class="text-sm text-red-600 font-medium" role="alert">⚠ Un equipo no puede jugar contra sí mismo.</p>
            }
          </div>
        }

        <!-- Step 2: Fecha, Sede y Campo -->
        @if (currentStep() === 2) {
          <div class="space-y-4">
            <h3 class="font-semibold text-slate-800 text-lg">Programación y Sede</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="fechaHora" class="block text-sm font-medium text-slate-700 mb-1">Fecha y Hora</label>
                <input id="fechaHora" formControlName="fechaHora" type="datetime-local" class="input-modern" />
              </div>
              <div>
                <label for="estado" class="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                <select id="estado" formControlName="estado" class="input-modern">
                  @for (e of estadosDisponibles; track e.value) {
                    <option [value]="e.value">{{ e.label }}</option>
                  }
                </select>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="sede" class="block text-sm font-medium text-slate-700 mb-1">Sede</label>
                <select id="sede" formControlName="sedeId" class="input-modern">
                  <option value="">Sin sede asignada</option>
                  @for (sede of sedes(); track sede.id) {
                    <option [value]="sede.id">{{ sede.nombre }}</option>
                  }
                </select>
              </div>
              <div>
                <label for="campo" class="block text-sm font-medium text-slate-700 mb-1">Campo / Cancha</label>
                <select id="campo" formControlName="campoId" class="input-modern">
                  <option value="">Sin campo asignado</option>
                  @for (campo of camposDisponibles(); track campo.id) {
                    <option [value]="campo.id">{{ campo.nombre }}</option>
                  }
                </select>
              </div>
            </div>
            <div>
              <label for="arbitro" class="block text-sm font-medium text-slate-700 mb-1">Árbitro</label>
              <select id="arbitro" formControlName="arbitroId" class="input-modern">
                <option value="">Sin árbitro asignado</option>
                @for (arb of arbitrosDisponibles(); track arb.id) {
                  <option [value]="arb.id">{{ arb.nombre }} {{ arb.apellido }}</option>
                }
              </select>
            </div>
            <div>
              <label for="observaciones" class="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
              <textarea id="observaciones" formControlName="observaciones" rows="3"
                class="input-modern" placeholder="Notas adicionales sobre el encuentro..."></textarea>
            </div>
          </div>
        }

        <!-- Error -->
        @if (errorMsg()) {
          <div class="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700" role="alert">
            {{ errorMsg() }}
          </div>
        }

        <!-- Navigation -->
        <div class="flex justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            class="btn-secondary"
            [class.invisible]="currentStep() === 0"
            (click)="currentStep.update(s => s - 1)"
          >← Anterior</button>

          @if (currentStep() < steps.length - 1) {
            <button type="button" class="btn-primary" (click)="currentStep.update(s => s + 1)">
              Siguiente →
            </button>
          } @else {
            <button type="submit" [disabled]="form.invalid" class="btn-primary">
              {{ isEdit() ? 'Actualizar' : 'Crear Encuentro' }}
            </button>
          }
        </div>
      </form>
    </div>
  `,
})
export class EncuentroFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly encuentroService = inject(EncuentroService);
  private readonly equipoService = inject(EquipoService);
  private readonly competenciaService = inject(CompetenciaService);
  private readonly disciplinaService = inject(DisciplinaService);

  protected readonly isEdit = signal(false);
  protected readonly currentStep = signal(0);
  protected readonly errorMsg = signal('');
  protected readonly competencias = this.competenciaService.items;
  protected readonly disciplinas = this.disciplinaService.items;
  protected readonly equipos = this.equipoService.equipos;
  protected readonly sedes = this.encuentroService.sedes;
  private editId = '';

  readonly steps = [
    { id: 0, label: 'Competencia' },
    { id: 1, label: 'Equipos' },
    { id: 2, label: 'Programación' },
  ];

  readonly fases: { value: FaseEncuentro; label: string }[] = Object.entries(FASE_LABELS).map(
    ([value, label]) => ({ value: value as FaseEncuentro, label })
  );

  readonly estadosDisponibles: { value: EstadoEncuentro; label: string }[] = [
    { value: 'borrador', label: ESTADO_ENCUENTRO_LABELS['borrador'] },
    { value: 'programado', label: ESTADO_ENCUENTRO_LABELS['programado'] },
  ];

  protected readonly camposDisponibles = computed(() => {
    const sedeId = this.form.value.sedeId;
    if (!sedeId) return [];
    return this.encuentroService.getCamposBySede(sedeId);
  });

  protected readonly arbitrosDisponibles = computed(() => {
    const discId = this.form.value.disciplinaId;
    if (!discId) return this.encuentroService.arbitros();
    return this.encuentroService.getArbitrosByDisciplina(discId);
  });

  readonly form = this.fb.nonNullable.group({
    competenciaId: ['', Validators.required],
    disciplinaId: ['', Validators.required],
    fase: ['fase_grupos' as FaseEncuentro],
    grupo: [''],
    numeroFecha: [1, [Validators.required, Validators.min(1)]],
    equipoLocalId: ['', Validators.required],
    equipoVisitanteId: ['', Validators.required],
    fechaHora: ['', Validators.required],
    sedeId: [''],
    campoId: [''],
    arbitroId: [''],
    estado: ['borrador' as EstadoEncuentro],
    observaciones: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const enc = this.encuentroService.getById(id);
      if (enc) {
        this.isEdit.set(true);
        this.editId = id;
        this.form.patchValue({
          competenciaId: enc.competenciaId,
          disciplinaId: enc.disciplinaId,
          fase: enc.fase,
          grupo: enc.grupo ?? '',
          numeroFecha: enc.numeroFecha,
          equipoLocalId: enc.equipoLocalId,
          equipoVisitanteId: enc.equipoVisitanteId,
          fechaHora: enc.fechaHora,
          sedeId: enc.sedeId ?? '',
          campoId: enc.campoId ?? '',
          arbitroId: enc.arbitroId ?? '',
          estado: enc.estado,
          observaciones: enc.observaciones ?? '',
        });
      }
    }
  }

  protected guardar(): void {
    if (this.form.invalid) return;
    this.errorMsg.set('');
    const v = this.form.getRawValue();

    if (v.equipoLocalId === v.equipoVisitanteId) {
      this.errorMsg.set('Un equipo no puede jugar contra sí mismo.');
      return;
    }

    if (this.isEdit()) {
      this.encuentroService.update(this.editId, {
        ...v,
        sedeId: v.sedeId || undefined,
        campoId: v.campoId || undefined,
        arbitroId: v.arbitroId || undefined,
        observaciones: v.observaciones || undefined,
        grupo: v.grupo || undefined,
      });
      this.router.navigate(['/gestion/encuentros', this.editId]);
    } else {
      const result = this.encuentroService.create({
        ...v,
        sedeId: v.sedeId || undefined,
        campoId: v.campoId || undefined,
        arbitroId: v.arbitroId || undefined,
        observaciones: v.observaciones || undefined,
        grupo: v.grupo || undefined,
      });
      if (result !== true) {
        this.errorMsg.set(result);
        return;
      }
      this.router.navigate(['/gestion/encuentros']);
    }
  }

  protected cancelar(): void {
    this.router.navigate(['/gestion/encuentros']);
  }
}
