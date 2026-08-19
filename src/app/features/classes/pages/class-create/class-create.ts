import { Component, inject, OnInit, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ClassCreateWizardFacade, CreateWizardStep } from '../../facades/class-create-wizard.facade';
import { ScheduleBuilderComponent } from '../../components/schedule-builder/schedule-builder';
import { TeacherSelectorComponent } from '../../components/teacher-selector/teacher-selector';
import { ClassCapacityComponent } from '../../components/class-capacity/class-capacity';
import { ClassConfigurationComponent } from '../../components/class-configuration/class-configuration';
import { ClassSessionListComponent } from '../../components/class-session-list/class-session-list';
import { ClassSummaryComponent } from '../../components/class-summary/class-summary';
import { ClassModality, CLASS_MODALITY_LABELS } from '../../enums/class-modality.enum';
import {
  hashToWizardStep,
  isClassWizardStepHash,
  wizardStepToHash,
  WizardStepId,
} from '../../utils/class-url-hash.util';

@Component({
  selector: 'app-class-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ClassCreateWizardFacade],
  imports: [
    RouterLink,
    FormsModule,
    ScheduleBuilderComponent,
    TeacherSelectorComponent,
    ClassCapacityComponent,
    ClassConfigurationComponent,
    ClassSessionListComponent,
    ClassSummaryComponent,
  ],
  template: `
    <div class="space-y-6">
      @if (facade.createdClass(); as created) {
        <div class="section-card p-8 text-center space-y-4">
          <div class="w-12 h-12 mx-auto rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xl" aria-hidden="true">✓</div>
          <h1 class="text-2xl font-extrabold text-slate-900">Clase creada correctamente</h1>
          <p class="text-slate-600">{{ created.name }}</p>
          <p class="font-mono text-sm text-slate-500">{{ created.code }}</p>
          <p class="text-sm text-slate-500">{{ created.sessions }} sesiones generadas.</p>
          <div class="flex flex-wrap justify-center gap-3 pt-2">
            <button type="button" class="btn-primary" (click)="facade.viewCreated()">Ver clase</button>
            <button type="button" class="btn-secondary" (click)="facade.reset()">Crear otra</button>
          </div>
        </div>
      } @else {
        <div>
          <a routerLink="/clases" class="text-sm text-brand-600 hover:underline">← Volver al listado</a>
          <h1 class="text-2xl font-extrabold text-slate-900 mt-2">Nueva clase</h1>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- Stepper -->
          <aside class="lg:col-span-1">
            <nav aria-label="Pasos del asistente" class="section-card p-4 space-y-1">
              @for (s of facade.steps; track s.id) {
                <button
                  type="button"
                  class="w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm transition-colors"
                  [class.bg-brand]="facade.currentStep() === s.id"
                  [class.text-white]="facade.currentStep() === s.id"
                  [class.font-semibold]="facade.currentStep() === s.id"
                  [class.text-slate-600]="facade.currentStep() !== s.id"
                  [class.hover:bg-slate-50]="facade.currentStep() !== s.id"
                  (click)="goToStep(s.id)"
                >
                  <span
                    class="w-5 h-5 rounded-full flex items-center justify-center text-xs border"
                    [class.border-white]="facade.currentStep() === s.id"
                    [class.bg-white]="isStepDone(s.id) && facade.currentStep() !== s.id"
                    [class.text-green-600]="isStepDone(s.id) && facade.currentStep() !== s.id"
                    aria-hidden="true"
                  >
                    @if (isStepDone(s.id) && facade.currentStep() !== s.id) { ✓ } @else { {{ s.order }} }
                  </span>
                  {{ s.label }}
                </button>
              }
            </nav>
          </aside>

          <!-- Contenido -->
          <div class="lg:col-span-3 space-y-4">
            @if (facade.loading()) {
              <div class="section-card p-6 text-center text-slate-500">Guardando...</div>
            }

            <div class="section-card p-6">
              @switch (facade.currentStep()) {
                @case ('general') {
                  <h2 class="text-lg font-bold mb-4">Información general</h2>
                  <div class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label for="period" class="block text-sm font-medium text-slate-700 mb-1">Periodo *</label>
                        <select
                          id="period"
                          class="input-modern w-full"
                          [ngModel]="facade.draft().periodId"
                          (ngModelChange)="facade.onPeriodChange(+$event || 0)"
                        >
                          <option [ngValue]="0">Seleccionar...</option>
                          @for (p of facade.periods(); track p.id) {
                            <option [ngValue]="p.id">{{ p.name }}</option>
                          }
                        </select>
                      </div>
                      <div>
                        <label for="activity" class="block text-sm font-medium text-slate-700 mb-1">Actividad *</label>
                        <select
                          id="activity"
                          class="input-modern w-full"
                          [ngModel]="facade.draft().activityId"
                          (ngModelChange)="facade.onActivityChange(+$event || 0)"
                        >
                          <option [ngValue]="0">Seleccionar...</option>
                          @for (a of facade.activities(); track a.id) {
                            <option [ngValue]="a.id">{{ a.name }}</option>
                          }
                        </select>
                      </div>
                      <div>
                        <label for="course" class="block text-sm font-medium text-slate-700 mb-1">Curso / Nivel *</label>
                        <select
                          id="course"
                          class="input-modern w-full"
                          [ngModel]="facade.draft().courseId"
                          (ngModelChange)="facade.onCourseChange(+$event || 0)"
                          [disabled]="!facade.draft().activityId"
                        >
                          <option [ngValue]="0">Seleccionar...</option>
                          @for (c of facade.courses(); track c.id) {
                            <option [ngValue]="c.id">{{ c.name }}</option>
                          }
                        </select>
                      </div>
                      <div>
                        <label for="modality" class="block text-sm font-medium text-slate-700 mb-1">Modalidad *</label>
                        <select
                          id="modality"
                          class="input-modern w-full"
                          [ngModel]="facade.draft().modality"
                          (ngModelChange)="facade.patchDraft({ modality: $event })"
                        >
                          @for (m of modalities; track m.value) {
                            <option [value]="m.value">{{ m.label }}</option>
                          }
                        </select>
                      </div>
                    </div>
                    <div>
                      <label for="class-name" class="block text-sm font-medium text-slate-700 mb-1">Nombre de clase *</label>
                      <input
                        id="class-name"
                        type="text"
                        class="input-modern w-full"
                        [ngModel]="facade.draft().name"
                        (ngModelChange)="facade.patchDraft({ name: $event })"
                      />
                    </div>
                    <div>
                      <label for="class-code" class="block text-sm font-medium text-slate-700 mb-1">Código</label>
                      <input
                        id="class-code"
                        type="text"
                        class="input-modern w-full bg-slate-50"
                        [value]="facade.codePreview()"
                        readonly
                        aria-readonly="true"
                      />
                      <p class="text-xs text-slate-500 mt-1">Se generará automáticamente al guardar</p>
                    </div>
                    <div>
                      <label for="description" class="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                      <textarea
                        id="description"
                        rows="3"
                        class="input-modern w-full"
                        [ngModel]="facade.draft().description"
                        (ngModelChange)="facade.patchDraft({ description: $event })"
                      ></textarea>
                    </div>
                  </div>
                }
                @case ('schedule') {
                  <h2 class="text-lg font-bold mb-4">Programación</h2>
                  <app-schedule-builder />
                }
                @case ('teacher') {
                  <h2 class="text-lg font-bold mb-4">Profesor y ambiente</h2>
                  <app-teacher-selector />
                }
                @case ('capacity') {
                  <h2 class="text-lg font-bold mb-4">Capacidad</h2>
                  <app-class-capacity />
                }
                @case ('configuration') {
                  <h2 class="text-lg font-bold mb-4">Configuración de matrícula</h2>
                  <app-class-configuration />
                }
                @case ('sessions') {
                  <h2 class="text-lg font-bold mb-4">Generación de sesiones</h2>
                  <app-class-session-list />
                }
                @case ('summary') {
                  <app-class-summary />
                }
              }

              @if (facade.stepErrors().length > 0 && facade.currentStep() !== 'summary') {
                <div class="mt-4 rounded-lg border border-red-200 bg-red-50 p-3" role="alert">
                  <ul class="text-sm text-red-700 list-disc pl-5">
                    @for (e of facade.stepErrors(); track e) {
                      <li>{{ e }}</li>
                    }
                  </ul>
                </div>
              }
            </div>

            <!-- Navegación -->
            <div class="flex justify-between gap-3">
              <button
                type="button"
                class="btn-secondary"
                [disabled]="facade.currentStep() === 'general'"
                (click)="prevStep()"
              >
                Anterior
              </button>
              @if (facade.currentStep() === 'summary') {
                <button
                  type="button"
                  class="btn-primary"
                  [disabled]="facade.loading()"
                  (click)="facade.submit()"
                >
                  Crear clase
                </button>
              } @else {
                <button type="button" class="btn-primary" (click)="nextStep()">
                  Siguiente
                </button>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ClassCreatePage implements OnInit {
  protected readonly facade = inject(ClassCreateWizardFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private syncingFromUrl = false;

  protected readonly modalities = Object.values(ClassModality).map(v => ({
    value: v,
    label: CLASS_MODALITY_LABELS[v],
  }));

  ngOnInit(): void {
    this.facade.init();

    this.route.fragment.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(fragment => {
      if (this.syncingFromUrl) return;
      if (isClassWizardStepHash(fragment)) {
        this.syncingFromUrl = true;
        this.facade.goToStep(hashToWizardStep(fragment));
        this.syncingFromUrl = false;
      }
    });

    const fragment = this.route.snapshot.fragment;
    if (isClassWizardStepHash(fragment)) {
      this.facade.goToStep(hashToWizardStep(fragment));
    } else {
      this.syncStepHash(this.facade.currentStep());
    }
  }

  protected goToStep(step: CreateWizardStep): void {
    this.facade.goToStep(step);
    this.syncStepHash(step);
  }

  protected nextStep(): void {
    const before = this.facade.currentStep();
    this.facade.nextStep();
    if (this.facade.currentStep() !== before) {
      this.syncStepHash(this.facade.currentStep());
    }
  }

  protected prevStep(): void {
    const before = this.facade.currentStep();
    this.facade.prevStep();
    if (this.facade.currentStep() !== before) {
      this.syncStepHash(this.facade.currentStep());
    }
  }

  private syncStepHash(step: CreateWizardStep): void {
    if (this.syncingFromUrl) return;
    void this.router.navigate([], {
      relativeTo: this.route,
      fragment: wizardStepToHash(step as WizardStepId),
      replaceUrl: true,
    });
  }

  protected isStepDone(step: CreateWizardStep): boolean {
    const idx = this.facade.steps.findIndex(s => s.id === step);
    const currentIdx = this.facade.steps.findIndex(s => s.id === this.facade.currentStep());
    return idx < currentIdx;
  }
}
