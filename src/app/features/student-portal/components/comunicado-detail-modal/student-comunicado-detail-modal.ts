import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudentComunicado } from '../../models/student-portal.model';
import {
  STUDENT_COMUNICADO_CATEGORY_LABELS,
  StudentComunicadoCategory,
} from '../../enums/student-comunicado-category.enum';

@Component({
  selector: 'app-student-comunicado-detail-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (open() && comunicado(); as c) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
        <button type="button"
          class="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
          aria-label="Cerrar comunicado"
          (click)="close.emit()"></button>

        <article class="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col bg-white animate-[scaleIn_0.2s_ease-out]"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          (click)="$event.stopPropagation()">
          <div class="px-5 sm:px-6 py-5 border-b border-slate-100 shrink-0"
            [class]="headerGradient(c.category)">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 text-white">
                <span class="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20">
                  {{ categoryLabel(c.category) }}
                </span>
                <h2 [id]="titleId" class="text-xl font-bold mt-2 leading-snug">{{ c.title }}</h2>
                <p class="text-sm text-white/80 mt-2">{{ c.relativeDate }} · {{ c.author }}</p>
              </div>
              <button type="button"
                class="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                aria-label="Cerrar"
                (click)="close.emit()">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-4">
            <p class="text-sm font-medium text-slate-700 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
              {{ c.summary }}
            </p>
            @for (paragraph of bodyParagraphs(c.body); track $index) {
              <p class="text-sm text-slate-600 leading-relaxed">{{ paragraph }}</p>
            }
            @if (c.tags?.length) {
              <div class="flex flex-wrap gap-2 pt-2">
                @for (tag of c.tags; track tag) {
                  <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">#{{ tag }}</span>
                }
              </div>
            }
          </div>

          <div class="px-5 sm:px-6 py-4 border-t border-slate-100 flex flex-wrap gap-3 shrink-0">
            @if (c.actionRoute && c.actionLabel) {
              <a [routerLink]="c.actionRoute" class="btn-primary flex-1 sm:flex-none text-center" (click)="close.emit()">
                {{ c.actionLabel }}
              </a>
            }
            <button type="button" class="btn-secondary flex-1 sm:flex-none" (click)="close.emit()">Cerrar</button>
          </div>
        </article>
      </div>
    }
  `,
  styles: `
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `,
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class StudentComunicadoDetailModalComponent {
  readonly open = input(false);
  readonly comunicado = input<StudentComunicado | null>(null);
  readonly close = output<void>();

  protected readonly titleId = `comunicado-modal-${Math.random().toString(36).slice(2, 9)}`;

  protected categoryLabel(category: StudentComunicadoCategory): string {
    return STUDENT_COMUNICADO_CATEGORY_LABELS[category];
  }

  protected headerGradient(category: StudentComunicadoCategory): string {
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

  protected bodyParagraphs(body: string): string[] {
    return body.split('\n\n').map(p => p.trim()).filter(Boolean);
  }

  protected onKeydown(event: Event): void {
    if ((event as KeyboardEvent).key === 'Escape' && this.open()) {
      event.preventDefault();
      this.close.emit();
    }
  }
}
