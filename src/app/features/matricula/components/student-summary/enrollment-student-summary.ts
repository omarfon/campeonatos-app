import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import {
  EnrollmentStudent,
  StudentSettlementStatus,
  STUDENT_TYPE_LABELS,
} from '../../models/enrollment.model';

@Component({
  selector: 'app-enrollment-student-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (student(); as s) {
      <div class="section-card p-4 border-l-4"
        [class]="settlement()?.isSettled === false ? 'border-l-amber-500 bg-amber-50/40' : 'border-l-brand bg-brand/5'">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Estudiante seleccionado</p>
            <p class="font-bold text-slate-900 mt-0.5">{{ s.firstName }} {{ s.lastName }}</p>
            <p class="text-sm text-slate-600">
              {{ s.documentType }} {{ s.documentNumber }} · {{ s.code }}
            </p>
            <div class="flex flex-wrap gap-2 mt-2">
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full"
                [class]="s.isRegularStudent ? 'bg-brand/10 text-brand' : 'bg-blue-100 text-blue-800'">
                {{ s.isRegularStudent ? STUDENT_TYPE_LABELS.REGULAR : STUDENT_TYPE_LABELS.NEW }}
              </span>
              @if (settlement(); as st) {
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full"
                  [class]="st.isSettled ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'">
                  {{ st.isSettled ? 'Liquidado' : 'Con deuda pendiente' }}
                </span>
              }
            </div>
          </div>
          @if (showChange()) {
            <button type="button" class="btn-ghost !text-sm shrink-0" (click)="changeStudent.emit()">
              Cambiar estudiante
            </button>
          }
        </div>
        @if (settlement(); as st) {
          <p class="text-sm mt-3"
            [class]="st.isSettled ? 'text-green-800' : 'text-amber-900'">
            {{ st.message }}
          </p>
          @if (!st.isSettled) {
            <p class="text-xs text-amber-800 mt-1">
              Debe regularizar la deuda antes de continuar con la matrícula.
            </p>
          }
        }
      </div>
    }
  `,
})
export class EnrollmentStudentSummaryComponent {
  readonly student = input<EnrollmentStudent | null>(null);
  readonly settlement = input<StudentSettlementStatus | null>(null);
  readonly showChange = input(true);

  readonly changeStudent = output<void>();

  protected readonly STUDENT_TYPE_LABELS = STUDENT_TYPE_LABELS;
}
