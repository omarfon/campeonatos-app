import { Component, input, model, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-enrollment-course-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-2">
      @if (showLabel()) {
        <label [for]="inputId()" class="block text-sm font-semibold text-slate-700">
          {{ label() }}
        </label>
      } @else {
        <label [for]="inputId()" class="sr-only">{{ label() }}</label>
      }
      <div class="relative">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          [id]="inputId()"
          type="search"
          [placeholder]="placeholder()"
          class="input-modern !py-3 !pl-11 !pr-11 !rounded-2xl !border-slate-300 !bg-white !shadow-sm focus:!border-teal-400 focus:!ring-teal-100 w-full"
          [value]="query()"
          [disabled]="disabled()"
          (input)="onInput($event)"
          [attr.aria-describedby]="showResultCount() && query() ? resultCountId() : null"
          autocomplete="off"
        />
        @if (query()) {
          <button type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Limpiar búsqueda"
            (click)="clear()">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        }
      </div>
      @if (showResultCount() && query()) {
        <p [id]="resultCountId()" class="text-sm text-slate-500" aria-live="polite">
          @if (resultCount() === 0) {
            No se encontraron cursos para «{{ query() }}».
          } @else {
            {{ resultCount() }} {{ resultCount() === 1 ? 'curso encontrado' : 'cursos encontrados' }}
          }
        </p>
      }
    </div>
  `,
})
export class EnrollmentCourseSearchComponent {
  readonly query = model('');
  readonly placeholder = input('Buscar por nombre, código, disciplina o sede…');
  readonly label = input('Buscar curso');
  readonly resultCount = input(0);
  readonly showResultCount = input(true);
  readonly showLabel = input(true);
  readonly disabled = input(false);
  readonly inputId = input('enrollment-course-search');
  readonly resultCountId = input('course-search-results');

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected clear(): void {
    this.query.set('');
  }
}
