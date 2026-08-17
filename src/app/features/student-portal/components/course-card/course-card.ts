import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudentCourse } from '../../models/student-portal.model';
import { StudentAttendanceProgressComponent } from '../attendance-progress/attendance-progress';

@Component({
  selector: 'app-course-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, StudentAttendanceProgressComponent],
  template: `
    @if (course(); as c) {
      <article class="sp-card sp-card-hover p-5 sm:p-6 flex flex-col h-full group">
        <div class="flex items-start justify-between gap-2">
          <h3 class="font-bold text-slate-900 text-base leading-snug">{{ c.name }}</h3>
          <span class="text-xs font-semibold px-2 py-1 rounded-lg bg-brand/5 text-brand shrink-0">{{ c.level }}</span>
        </div>
        <div class="mt-4 space-y-2 text-sm">
          <p class="flex items-center gap-2 text-slate-600">
            <span class="text-base opacity-70" aria-hidden="true">🕐</span>
            {{ c.days }} · {{ c.timeStart }} - {{ c.timeEnd }}
          </p>
          <p class="flex items-center gap-2 text-slate-500">
            <span class="text-base opacity-70" aria-hidden="true">👤</span>
            {{ c.teacher }}
          </p>
        </div>
        @if (showAttendance()) {
          <div class="mt-4 pt-4 border-t border-slate-100">
            <app-attendance-progress [percentage]="c.attendancePercentage" label="Asistencia" />
          </div>
        }
        <a [routerLink]="['/portal-alumno/cursos', c.id]"
          class="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 group-hover:text-teal-800 transition-colors">
          Ver curso
          <span class="group-hover:translate-x-0.5 transition-transform" aria-hidden="true">→</span>
        </a>
      </article>
    }
  `,
})
export class CourseCardComponent {
  readonly course = input<StudentCourse | null>(null);
  readonly showAttendance = input(true);
}
