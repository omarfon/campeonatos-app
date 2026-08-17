import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { StudentContentManagerService } from '../../services/student-content-manager.service';
import { StudentComunicado } from '../../models/student-portal.model';
import {
  StudentComunicadoCategory,
  STUDENT_COMUNICADO_CATEGORY_LABELS,
} from '../../enums/student-comunicado-category.enum';
import { StudentComunicadoCardComponent } from '../../components/comunicado-card/student-comunicado-card';
import { StudentComunicadoDetailModalComponent } from '../../components/comunicado-detail-modal/student-comunicado-detail-modal';
import { StudentEmptyStateComponent } from '../../components/empty-state/student-empty-state';

type CategoryFilter = StudentComunicadoCategory | 'all';

@Component({
  selector: 'app-student-comunicados',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    StudentComunicadoCardComponent,
    StudentComunicadoDetailModalComponent,
    StudentEmptyStateComponent,
  ],
  template: `
    <div class="space-y-6">
      <header>
        <h1 class="sp-page-title">Comunicados</h1>
        <p class="sp-page-subtitle">Información oficial publicada por la institución.</p>
      </header>

      <div class="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar comunicados">
        @for (cat of categories; track cat.value) {
          <button type="button" role="tab"
            [attr.aria-selected]="filter() === cat.value"
            class="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            [class]="filter() === cat.value ? 'bg-brand text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
            (click)="setFilter(cat.value)">
            {{ cat.label }}
          </button>
        }
      </div>

      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          @for (i of [1, 2, 3, 4]; track i) {
            <div class="h-56 bg-slate-200/80 rounded-2xl"></div>
          }
        </div>
      } @else if (comunicados().length === 0) {
        <app-student-empty-state
          title="Sin comunicados"
          description="No hay comunicados publicados en esta categoría."
          icon="📢"
        />
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (c of comunicados(); track c.id) {
            <app-student-comunicado-card [comunicado]="c" (open)="openDetail($event)" />
          }
        </div>
      }

      <app-student-comunicado-detail-modal
        [open]="detailOpen()"
        [comunicado]="selected()"
        (close)="closeDetail()" />
    </div>
  `,
})
export class StudentComunicadosComponent implements OnInit {
  private readonly contentManager = inject(StudentContentManagerService);

  protected readonly comunicados = signal<StudentComunicado[]>([]);
  protected readonly loading = signal(true);
  protected readonly filter = signal<CategoryFilter>('all');
  protected readonly detailOpen = signal(false);
  protected readonly selected = signal<StudentComunicado | null>(null);

  protected readonly categories: { value: CategoryFilter; label: string }[] = [
    { value: 'all', label: 'Todos' },
    ...Object.values(StudentComunicadoCategory).map(value => ({
      value,
      label: STUDENT_COMUNICADO_CATEGORY_LABELS[value],
    })),
  ];

  ngOnInit(): void {
    this.load();
  }

  protected setFilter(value: CategoryFilter): void {
    this.filter.set(value);
    this.load();
  }

  protected openDetail(comunicado: StudentComunicado): void {
    this.selected.set(comunicado);
    this.detailOpen.set(true);
  }

  protected closeDetail(): void {
    this.detailOpen.set(false);
    this.selected.set(null);
  }

  private load(): void {
    this.loading.set(true);
    const filter = this.filter();
    const category = filter === 'all' ? undefined : filter;
    this.contentManager.getPublishedComunicados({ category }).subscribe({
      next: list => {
        this.comunicados.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
