import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { StudentProfile } from '../../models/student-portal.model';
import { STUDENT_TYPE_LABELS } from '../../../matricula/models/enrollment.model';

@Component({
  selector: 'app-student-summary-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (profile(); as p) {
      <div class="sp-card p-5 sm:p-6">
        <div class="flex flex-col sm:flex-row gap-4 sm:items-center">
          <div class="w-20 h-20 rounded-2xl text-white flex items-center justify-center text-2xl font-bold shrink-0 shadow-lg"
            style="background: linear-gradient(135deg, #1A3263, #0d9488)"
            aria-hidden="true">
            {{ p.avatarInitials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Estudiante</p>
            <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5 tracking-tight">{{ p.fullName }}</h2>
            <p class="text-sm text-slate-500 mt-1 font-mono">{{ p.code }}</p>
          </div>
          <span class="self-start sm:self-auto text-xs font-semibold px-3 py-1.5 rounded-full bg-teal-50 text-teal-800 border border-teal-100 shrink-0">
            {{ p.isRegularStudent ? STUDENT_TYPE_LABELS.REGULAR : STUDENT_TYPE_LABELS.NEW }}
          </span>
        </div>
        <dl class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-100">
          <div>
            <dt class="text-xs text-slate-500 uppercase tracking-wide">Programa</dt>
            <dd class="font-semibold text-slate-900 mt-0.5">{{ p.program }}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500 uppercase tracking-wide">Nivel</dt>
            <dd class="font-semibold text-slate-900 mt-0.5">{{ p.level }}</dd>
          </div>
          <div class="col-span-2 sm:col-span-2">
            <dt class="text-xs text-slate-500 uppercase tracking-wide">Correo</dt>
            <dd class="font-medium text-slate-700 mt-0.5 truncate">{{ p.email }}</dd>
          </div>
        </dl>
      </div>
    }
  `,
})
export class StudentSummaryCardComponent {
  readonly profile = input<StudentProfile | null>(null);
  protected readonly STUDENT_TYPE_LABELS = STUDENT_TYPE_LABELS;
}
