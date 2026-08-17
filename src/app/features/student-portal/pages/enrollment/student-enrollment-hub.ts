import {
  Component,
  inject,
  signal,
  model,
  computed,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { StudentEnrollmentService } from '../../services/student-enrollment.service';
import {
  StudentEnrollmentContext,
  StudentCourse,
  StudentAgreement,
} from '../../models/student-portal.model';
import { EnrollmentCourseOptionComponent } from '../../components/enrollment-course-option/enrollment-course-option';
import { EnrollmentCourseSearchComponent } from '../../components/enrollment-course-search/enrollment-course-search';
import { StudentEmptyStateComponent } from '../../components/empty-state/student-empty-state';
import { filterEnrollmentCourses } from '../../utils/enrollment-course-filter';

@Component({
  selector: 'app-student-enrollment-hub',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EnrollmentCourseOptionComponent, EnrollmentCourseSearchComponent, StudentEmptyStateComponent],
  template: `
    <div class="space-y-6">
      <header class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 class="sp-page-title">Matrícula</h1>
          <p class="sp-page-subtitle">Gestiona tu matrícula y continúa tu formación.</p>
        </div>
        <a routerLink="/portal-alumno/matriculas"
          class="btn-secondary text-center shrink-0 self-start sm:self-center">
          Ver mis matrículas
        </a>
      </header>

      @if (context()?.blockedMessage; as blocked) {
        <div class="sp-card p-5 border-l-4 border-amber-500 bg-amber-50/50" role="alert">
          <p class="font-semibold text-amber-900">Matrícula no disponible</p>
          <p class="text-sm text-amber-800 mt-1">{{ blocked }}</p>
        </div>
      }

      <section class="space-y-4" aria-labelledby="cursos-disponibles-heading">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <h2 id="cursos-disponibles-heading" class="text-lg font-bold text-slate-900">
            Cursos disponibles
          </h2>
          @if (!coursesLoading() && courses().length > 0) {
            <p class="text-sm text-slate-500">{{ filteredCourses().length }} de {{ courses().length }} cursos</p>
          }
        </div>

        <div class="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_min(16rem,240px)] gap-3 items-end">
          <app-enrollment-course-search
            inputId="hub-course-search"
            resultCountId="hub-course-search-results"
            [query]="searchQuery()"
            (queryChange)="onSearchChange($event)"
            [disabled]="coursesLoading()"
            [showResultCount]="false" />

          <div class="space-y-2">
            <label for="hub-agreement-select" class="block text-sm font-semibold text-slate-700">
              Convenio
            </label>
            <select
              id="hub-agreement-select"
              class="input-modern !py-3 !rounded-2xl !border-slate-300 !bg-white w-full"
              [disabled]="coursesLoading()"
              [value]="agreementSelectValue()"
              (change)="onAgreementChange($event)">
              <option value="">Sin convenio</option>
              @for (a of agreements(); track a.id) {
                <option [value]="a.id">{{ a.name }}</option>
              }
            </select>
          </div>
        </div>

        @if (disciplines().length > 1) {
          <div class="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por disciplina">
            <button type="button" role="tab"
              class="sp-tab"
              [class.sp-tab-active]="disciplineFilter() === 'all'"
              [attr.aria-selected]="disciplineFilter() === 'all'"
              (click)="setDisciplineFilter('all')">
              Todos
            </button>
            @for (d of disciplines(); track d) {
              <button type="button" role="tab"
                class="sp-tab"
                [class.sp-tab-active]="disciplineFilter() === d"
                [attr.aria-selected]="disciplineFilter() === d"
                (click)="setDisciplineFilter(d)">
                {{ d }}
              </button>
            }
          </div>
        }

        @if (coursesLoading()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 animate-pulse">
            @for (i of [1, 2, 3, 4, 5, 6]; track i) {
              <div class="h-64 bg-slate-200/80 rounded-3xl"></div>
            }
          </div>
        } @else if (courses().length === 0) {
          <app-student-empty-state
            title="No hay cursos disponibles"
            description="No pudimos cargar el catálogo. Intenta recargar la página."
            icon="📚"
            actionLabel="Reintentar"
            (actionClick)="loadCourses()"
          />
        } @else if (filteredCourses().length === 0) {
          <app-student-empty-state
            title="Sin resultados"
            description="Prueba con otro término o limpia los filtros para ver todos los cursos."
            icon="🔍"
            actionLabel="Limpiar filtros"
            (actionClick)="clearFilters()"
          />
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            @for (c of filteredCourses(); track c.id) {
              <app-enrollment-course-option
                [course]="c"
                [enrollLink]="canEnroll() ? '/portal-alumno/matricula/nueva' : null"
                [enrollQueryParams]="canEnroll() ? enrollQueryParams(c.id) : null" />
            }
          </div>
        }
      </section>
    </div>
  `,
})
export class StudentEnrollmentHubComponent implements OnInit {
  private readonly enrollmentService = inject(StudentEnrollmentService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly context = signal<StudentEnrollmentContext | null>(null);
  protected readonly agreements = signal<StudentAgreement[]>([]);
  protected readonly courses = signal<StudentCourse[]>([]);
  protected readonly selectedAgreementId = signal<number | null>(null);
  protected readonly disciplineFilter = signal<string>('all');
  protected readonly searchQuery = signal('');
  protected readonly coursesLoading = signal(true);

  protected readonly canEnroll = computed(() => this.context()?.canEnroll ?? true);

  protected readonly disciplines = computed(() =>
    [...new Set(this.courses().map(c => c.discipline))].sort(),
  );

  protected readonly filteredCourses = computed(() => {
    let list = this.courses();
    const filter = this.disciplineFilter();
    if (filter !== 'all') {
      list = list.filter(c => c.discipline === filter);
    }
    return filterEnrollmentCourses(list, this.searchQuery());
  });

  ngOnInit(): void {
    this.loadCourses();
    this.loadContext();
  }

  protected onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  protected agreementSelectValue(): string {
    const id = this.selectedAgreementId();
    return id == null ? '' : String(id);
  }

  protected enrollQueryParams(courseId: number): Record<string, number> {
    const params: Record<string, number> = { curso: courseId };
    const agreementId = this.selectedAgreementId();
    if (agreementId != null) params['convenio'] = agreementId;
    return params;
  }

  protected onAgreementChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedAgreementId.set(value ? Number(value) : null);
    this.loadCourses();
  }

  protected setDisciplineFilter(value: string): void {
    this.disciplineFilter.set(value);
  }

  protected clearFilters(): void {
    this.disciplineFilter.set('all');
    this.searchQuery.set('');
  }

  protected loadCourses(): void {
    this.coursesLoading.set(true);
    this.enrollmentService.getCatalogCourses(this.selectedAgreementId()).pipe(
      catchError(() => of([] as StudentCourse[])),
      finalize(() => {
        this.coursesLoading.set(false);
        this.cdr.markForCheck();
      }),
    ).subscribe(list => {
      this.courses.set(list);
      this.cdr.markForCheck();
    });
  }

  private loadContext(): void {
    this.enrollmentService.getEnrollmentContext().pipe(
      catchError(() => of(null)),
    ).subscribe(ctx => {
      if (ctx) this.context.set(ctx);
      this.cdr.markForCheck();
    });

    this.enrollmentService.getAvailableAgreements().pipe(
      catchError(() => of([] as StudentAgreement[])),
    ).subscribe(list => {
      this.agreements.set(list);
      this.cdr.markForCheck();
    });
  }
}
