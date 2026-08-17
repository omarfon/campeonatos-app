import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudentCourse } from '../../models/student-portal.model';

@Component({
  selector: 'app-enrollment-course-option',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (course(); as c) {
      <article class="sp-card sp-card-hover flex flex-col h-full overflow-hidden group"
        [class.ring-2]="selected()"
        [class.ring-teal-500]="selected()"
        [class.border-teal-200]="selected()">
        <div class="h-1.5 w-full shrink-0"
          [style.background]="disciplineGradient(c.discipline)"
          aria-hidden="true"></div>
        <div class="p-4 sm:p-5 flex flex-col flex-1">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ c.discipline }}</p>
              <h3 class="font-bold text-slate-900 mt-0.5 leading-snug">{{ c.name }}</h3>
              <p class="text-xs text-slate-500 mt-1 font-mono">{{ c.code }} · {{ c.level }}</p>
            </div>
            @if (c.recommended) {
              <span class="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-100">
                Recomendado
              </span>
            }
          </div>

          @if (c.description) {
            <p class="text-sm text-slate-600 mt-3 line-clamp-2">{{ c.description }}</p>
          }

          <dl class="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            <div>
              <dt class="text-xs text-slate-400">Modalidad</dt>
              <dd class="font-medium text-slate-700">{{ c.modality }}</dd>
            </div>
            <div>
              <dt class="text-xs text-slate-400">Sede</dt>
              <dd class="font-medium text-slate-700 truncate">{{ c.campus }}</dd>
            </div>
            @if (c.duration) {
              <div>
                <dt class="text-xs text-slate-400">Duración</dt>
                <dd class="font-medium text-slate-700">{{ c.duration }}</dd>
              </div>
            }
            @if (c.basePrice != null) {
              <div>
                <dt class="text-xs text-slate-400">Desde</dt>
                <dd class="font-bold text-slate-900">S/ {{ c.basePrice.toFixed(2) }}</dd>
              </div>
            }
          </dl>

          <div class="mt-auto pt-4">
            @if (selectable()) {
              <button type="button"
                class="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all"
                [class]="selected()
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-200'
                  : 'bg-slate-100 text-slate-800 hover:bg-teal-50 hover:text-teal-800'"
                (click)="courseSelect.emit(c)">
                @if (selected()) {
                  <span aria-hidden="true">✓</span> Seleccionado
                } @else {
                  Seleccionar curso
                }
              </button>
            } @else if (enrollLink(); as link) {
              <a [routerLink]="link" [queryParams]="enrollQueryParams()"
                class="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/20 transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
                style="background: linear-gradient(135deg, #1A3263, #0d9488)">
                Matricularme en este curso
              </a>
            }
          </div>
        </div>
      </article>
    }
  `,
})
export class EnrollmentCourseOptionComponent {
  readonly course = input<StudentCourse | null>(null);
  readonly selected = input(false);
  readonly selectable = input(false);
  readonly enrollLink = input<string | string[] | null>(null);
  readonly enrollQueryParams = input<Record<string, string | number> | null>(null);
  readonly courseSelect = output<StudentCourse>();

  protected disciplineGradient(discipline: string): string {
    const colors: Record<string, string> = {
      Natación: 'linear-gradient(90deg, #0ea5e9, #06b6d4)',
      Karate: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
      Gimnasio: 'linear-gradient(90deg, #f59e0b, #ef4444)',
      Danza: 'linear-gradient(90deg, #ec4899, #f43f5e)',
      Tenis: 'linear-gradient(90deg, #22c55e, #14b8a6)',
    };
    return colors[discipline] ?? 'linear-gradient(90deg, #1A3263, #0d9488)';
  }
}
