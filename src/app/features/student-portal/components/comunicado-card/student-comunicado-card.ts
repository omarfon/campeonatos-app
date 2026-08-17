import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { StudentComunicado } from '../../models/student-portal.model';
import {
  STUDENT_COMUNICADO_CATEGORY_LABELS,
  StudentComunicadoCategory,
} from '../../enums/student-comunicado-category.enum';

@Component({
  selector: 'app-student-comunicado-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (comunicado(); as c) {
      <article class="sp-card sp-card-hover h-full flex flex-col overflow-hidden"
        [class.!p-0]="!compact()">
        @if (!compact()) {
          <div class="h-28 sm:h-32 shrink-0 flex items-end p-4 text-white"
            [class]="categoryGradient(c.category)">
            <span class="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm">
              {{ categoryLabel(c.category) }}
            </span>
          </div>
        }

        <div [class]="compact() ? 'p-4 space-y-2' : 'p-5 flex flex-col flex-1 space-y-3'">
          @if (compact()) {
            <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {{ categoryLabel(c.category) }}
            </span>
          }

          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-slate-900 leading-snug"
              [class.text-base]="!compact()"
              [class.text-sm]="compact()"
              [class.line-clamp-2]="compact()">
              {{ c.title }}
            </h3>
            <p class="text-sm text-slate-600 mt-2"
              [class.line-clamp-3]="!compact()"
              [class.line-clamp-2]="compact()">
              {{ c.summary }}
            </p>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-2 pt-1 mt-auto">
            <p class="text-xs text-slate-400">{{ c.relativeDate }} · {{ c.author }}</p>
            <button type="button"
              class="text-sm font-semibold text-brand hover:underline shrink-0"
              (click)="open.emit(c)">
              Leer más
            </button>
          </div>
        </div>
      </article>
    }
  `,
})
export class StudentComunicadoCardComponent {
  readonly comunicado = input<StudentComunicado | null>(null);
  readonly compact = input(false);
  readonly open = output<StudentComunicado>();

  protected categoryLabel(category: StudentComunicadoCategory): string {
    return STUDENT_COMUNICADO_CATEGORY_LABELS[category];
  }

  protected categoryGradient(category: StudentComunicadoCategory): string {
    switch (category) {
      case StudentComunicadoCategory.INSTITUCIONAL:
        return 'bg-gradient-to-br from-brand to-brand-800';
      case StudentComunicadoCategory.ACADEMICO:
        return 'bg-gradient-to-br from-teal-600 to-teal-800';
      case StudentComunicadoCategory.EVENTOS:
        return 'bg-gradient-to-br from-violet-600 to-violet-800';
      case StudentComunicadoCategory.OPERACIONES:
        return 'bg-gradient-to-br from-amber-600 to-orange-700';
      default:
        return 'bg-gradient-to-br from-slate-600 to-slate-800';
    }
  }
}
