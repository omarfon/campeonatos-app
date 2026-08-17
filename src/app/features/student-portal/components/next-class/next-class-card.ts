import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudentClass } from '../../models/student-portal.model';

@Component({
  selector: 'app-next-class-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (nextClass(); as c) {
      @if (compact()) {
        <div class="sp-card px-3 py-2.5 sm:px-4 sm:py-3 border-l-4 border-sky-400 bg-gradient-to-r from-sky-50/80 to-white">
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:gap-x-4">
            <span class="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-700 shrink-0">
              @if (c.isToday) {
                <span class="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" aria-hidden="true"></span>
                Hoy
              } @else {
                Próxima
              }
            </span>
            <span class="font-semibold text-slate-900 text-sm truncate max-w-[12rem] sm:max-w-none">{{ c.courseName }}</span>
            <span class="text-sm font-bold text-brand tabular-nums shrink-0">{{ c.timeStart }}–{{ c.timeEnd }}</span>
            <span class="text-xs text-slate-500 truncate hidden sm:inline">{{ c.environment }} · {{ c.campus }}</span>
            <span class="text-xs text-slate-400 truncate hidden md:inline">Prof. {{ c.teacher }}</span>
            <a [routerLink]="['/portal-alumno/cursos', c.courseId]"
              class="text-xs font-semibold text-brand hover:text-brand-600 shrink-0 ml-auto">
              Ver curso →
            </a>
          </div>
        </div>
      } @else {
        <div class="sp-card p-5 sm:p-6 relative overflow-hidden h-full">
          <div class="absolute top-0 right-0 w-32 h-32 rounded-full bg-sky-100/60 -translate-y-1/2 translate-x-1/2" aria-hidden="true"></div>
          <div class="relative">
            <div class="flex items-center gap-2 mb-3">
              <span class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
                @if (c.isToday) {
                  <span class="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" aria-hidden="true"></span>
                  Hoy
                } @else {
                  Próxima clase
                }
              </span>
            </div>
            <h3 class="text-lg font-bold text-slate-900">{{ c.courseName }}</h3>
            <p class="text-2xl font-extrabold text-brand mt-2 tabular-nums">
              {{ c.timeStart }}<span class="text-slate-400 font-normal text-lg"> - </span>{{ c.timeEnd }}
            </p>
            <div class="mt-4 space-y-1.5 text-sm text-slate-600">
              <p>{{ c.environment }} · {{ c.campus }}</p>
              <p class="text-slate-500">Prof. {{ c.teacher }}</p>
            </div>
            <a [routerLink]="['/portal-alumno/cursos', c.courseId]"
              class="inline-flex items-center gap-1 mt-5 text-sm font-semibold text-brand hover:text-brand-600 transition-colors">
              Ver curso →
            </a>
          </div>
        </div>
      }
    }
  `,
})
export class NextClassCardComponent {
  readonly nextClass = input<StudentClass | null>(null);
  readonly compact = input(false);
}
