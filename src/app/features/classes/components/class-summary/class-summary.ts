import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { ClassCreateWizardFacade } from '../../facades/class-create-wizard.facade';
import { ConflictAlertComponent } from '../conflict-alert/conflict-alert';
import { CLASS_MODALITY_LABELS } from '../../enums/class-modality.enum';
import { MOCK_CAMPUSES, MOCK_ROOMS } from '../../mocks/classes.mock';
import { AcademicClassStatus, ACADEMIC_CLASS_STATUS_LABELS } from '../../enums/academic-class-status.enum';

@Component({
  selector: 'app-class-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ConflictAlertComponent],
  template: `
    <div class="space-y-6">
      <h3 class="text-lg font-bold text-slate-900">Resumen de clase</h3>

      <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div><dt class="text-slate-500">Nombre</dt><dd class="font-semibold">{{ facade.draft().name }}</dd></div>
        <div><dt class="text-slate-500">Código</dt><dd class="font-mono">{{ facade.codePreview() }}</dd></div>
        <div><dt class="text-slate-500">Periodo</dt><dd class="font-semibold">{{ facade.selectedPeriod()?.name ?? '—' }}</dd></div>
        <div><dt class="text-slate-500">Curso</dt><dd class="font-semibold">{{ facade.selectedCourse()?.name ?? '—' }}</dd></div>
        <div><dt class="text-slate-500">Profesor</dt><dd class="font-semibold">{{ teacherName() }}</dd></div>
        <div><dt class="text-slate-500">Modalidad</dt><dd>{{ modalityLabel() }}</dd></div>
        <div><dt class="text-slate-500">Sede</dt><dd>{{ campusName() }}</dd></div>
        <div><dt class="text-slate-500">Ambiente</dt><dd>{{ roomName() }}</dd></div>
        <div><dt class="text-slate-500">Programación</dt><dd>{{ facade.frequencyLabel() }}</dd></div>
        <div><dt class="text-slate-500">Horario</dt><dd>{{ facade.scheduleLabel() }}</dd></div>
        <div><dt class="text-slate-500">Inicio</dt><dd>{{ facade.draft().startDate }}</dd></div>
        <div><dt class="text-slate-500">Fin</dt><dd>{{ facade.draft().endDate }}</dd></div>
        <div><dt class="text-slate-500">Sesiones</dt><dd class="font-semibold">{{ facade.draft().sessions.length }}</dd></div>
        <div><dt class="text-slate-500">Capacidad</dt><dd>{{ facade.draft().capacity }}</dd></div>
        <div><dt class="text-slate-500">Estado inicial</dt><dd>{{ statusLabel }}</dd></div>
      </dl>

      <div class="rounded-xl bg-slate-50 p-4">
        <h4 class="text-sm font-semibold text-slate-700 mb-2">Validación final</h4>
        <ul class="text-sm space-y-1">
          @for (item of checklist(); track item.label) {
            <li class="flex items-center gap-2" [class.text-green-700]="item.done" [class.text-red-600]="!item.done">
              <span aria-hidden="true">{{ item.done ? '✓' : '✗' }}</span>
              {{ item.label }}
            </li>
          }
        </ul>
      </div>

      @if (facade.conflicts().length > 0) {
        <app-conflict-alert
          [conflicts]="facade.conflicts()"
          title="No puedes crear la clase todavía"
        />
      }

      @if (facade.stepErrors().length > 0 && facade.conflicts().length === 0) {
        <div class="rounded-xl border border-red-200 bg-red-50 p-4" role="alert">
          <p class="text-sm font-semibold text-red-800 mb-2">Corrige los siguientes puntos:</p>
          <ul class="text-sm text-red-700 list-disc pl-5">
            @for (e of facade.stepErrors(); track e) {
              <li>{{ e }}</li>
            }
          </ul>
        </div>
      }
    </div>
  `,
})
export class ClassSummaryComponent {
  protected readonly facade = inject(ClassCreateWizardFacade);
  protected readonly statusLabel = ACADEMIC_CLASS_STATUS_LABELS[AcademicClassStatus.DRAFT];

  protected readonly checklist = computed(() => {
    const d = this.facade.draft();
    return [
      { label: 'Información completa', done: !!(d.periodId && d.activityId && d.courseId && d.name) },
      { label: 'Periodo válido', done: !!this.facade.selectedPeriod() },
      { label: 'Curso válido', done: !!d.courseId },
      { label: 'Programación válida', done: d.scheduleRules.length > 0 },
      { label: 'Profesor seleccionado', done: !!d.teacherId },
      { label: 'Profesor disponible', done: !this.facade.conflicts().some(c => c.type === 'TEACHER') },
      { label: 'Ambiente disponible', done: !this.facade.conflicts().some(c => c.type === 'ROOM') },
      { label: 'Capacidad válida', done: d.capacity > 0 },
      { label: 'Sesiones generadas', done: d.sessions.length > 0 },
    ];
  });

  protected teacherName(): string {
    const t = this.facade.selectedTeacher();
    return t ? `${t.firstName} ${t.lastName}` : '—';
  }

  protected modalityLabel(): string {
    return CLASS_MODALITY_LABELS[this.facade.draft().modality];
  }

  protected campusName(): string {
    return MOCK_CAMPUSES.find(c => c.id === this.facade.draft().campusId)?.name ?? '—';
  }

  protected roomName(): string {
    return MOCK_ROOMS.find(r => r.id === this.facade.draft().roomId)?.name ?? '—';
  }
}
