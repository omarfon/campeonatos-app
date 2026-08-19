import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClassesFacade } from '../../facades/classes.facade';
import { ClassService } from '../../services/class.service';
import { ClassStatusBadgeComponent } from '../../components/class-status-badge/class-status-badge';
import { ClassListSkeletonComponent } from '../../components/class-list-skeleton/class-list-skeleton';
import { ClassModality, CLASS_MODALITY_LABELS } from '../../enums/class-modality.enum';
import { AcademicClassStatus, ACADEMIC_CLASS_STATUS_LABELS } from '../../enums/academic-class-status.enum';
import {
  ClassListItem,
  getCapacityAvailability,
  CAPACITY_AVAILABILITY_LABELS,
} from '../../models/class.model';
import { AcademicPeriod, Activity, ClassCourseRef, ClassTeacherRef } from '../../models/class.model';

@Component({
  selector: 'app-class-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, ClassStatusBadgeComponent, ClassListSkeletonComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">Gestión de clases</h1>
          <p class="text-sm text-slate-500 mt-1 max-w-xl">
            Administra la programación, horarios, profesores, ambientes y capacidad de las clases.
          </p>
        </div>
        <a routerLink="/clases/nueva" class="btn-primary shrink-0 self-start">+ Nueva clase</a>
      </div>

      <!-- Indicadores -->
      @if (facade.loading()) {
        <app-class-list-skeleton />
      } @else {
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
        @for (card of statCards(); track card.label) {
          <div class="section-card p-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ card.label }}</p>
            <p class="text-2xl font-extrabold text-slate-900 mt-1">{{ card.value }}</p>
          </div>
        }
      </div>

      <!-- Filtros -->
      <div class="section-card p-4 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-sm font-semibold text-slate-700">Filtros</h2>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="btn-secondary !text-sm" (click)="clearFilters()">Limpiar filtros</button>
            <button type="button" class="btn-primary !text-sm" (click)="applyFilters()">Aplicar</button>
          </div>
        </div>
        <div>
          <label for="class-search" class="block text-xs font-semibold text-slate-500 mb-1">Buscar clase</label>
          <input
            id="class-search"
            type="search"
            class="input-modern !text-sm w-full"
            placeholder="Buscar clase..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
          />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label for="f-period" class="block text-xs font-semibold text-slate-500 mb-1">Periodo</label>
            <select id="f-period" class="input-modern !text-sm w-full" [(ngModel)]="filterPeriodId">
              <option [ngValue]="0">Todos</option>
              @for (p of periods(); track p.id) {
                <option [ngValue]="p.id">{{ p.name }}</option>
              }
            </select>
          </div>
          <div>
            <label for="f-activity" class="block text-xs font-semibold text-slate-500 mb-1">Actividad</label>
            <select id="f-activity" class="input-modern !text-sm w-full" [(ngModel)]="filterActivityId" (ngModelChange)="onActivityChange()">
              <option [ngValue]="0">Todas</option>
              @for (a of activities(); track a.id) {
                <option [ngValue]="a.id">{{ a.name }}</option>
              }
            </select>
          </div>
          <div>
            <label for="f-course" class="block text-xs font-semibold text-slate-500 mb-1">Curso</label>
            <select id="f-course" class="input-modern !text-sm w-full" [(ngModel)]="filterCourseId">
              <option [ngValue]="0">Todos</option>
              @for (c of filteredCourses(); track c.id) {
                <option [ngValue]="c.id">{{ c.name }}</option>
              }
            </select>
          </div>
          <div>
            <label for="f-teacher" class="block text-xs font-semibold text-slate-500 mb-1">Profesor</label>
            <select id="f-teacher" class="input-modern !text-sm w-full" [(ngModel)]="filterTeacherId">
              <option [ngValue]="0">Todos</option>
              @for (t of teachers(); track t.id) {
                <option [ngValue]="t.id">{{ t.firstName }} {{ t.lastName }}</option>
              }
            </select>
          </div>
          <div>
            <label for="f-modality" class="block text-xs font-semibold text-slate-500 mb-1">Modalidad</label>
            <select id="f-modality" class="input-modern !text-sm w-full" [(ngModel)]="filterModality">
              <option value="">Todas</option>
              @for (m of modalityOptions; track m.value) {
                <option [value]="m.value">{{ m.label }}</option>
              }
            </select>
          </div>
          <div>
            <label for="f-status" class="block text-xs font-semibold text-slate-500 mb-1">Estado</label>
            <select id="f-status" class="input-modern !text-sm w-full" [(ngModel)]="filterStatus">
              <option value="">Todos</option>
              @for (s of statusOptions; track s) {
                <option [value]="s">{{ statusLabels[s] }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      @if (facade.classes().length === 0) {
        <div class="section-card p-10 text-center space-y-4">
          <p class="text-slate-600">Todavía no existen clases programadas.</p>
          <p class="text-sm text-slate-500">Crea tu primera clase para comenzar la programación.</p>
          <a routerLink="/clases/nueva" class="btn-primary inline-flex">+ Nueva clase</a>
        </div>
      } @else {
        <!-- Tabla desktop -->
        <div class="section-card overflow-hidden hidden md:block">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-200 bg-slate-50 text-left">
                  <th class="py-3 px-4 text-xs font-semibold text-slate-500">Código</th>
                  <th class="py-3 px-4 text-xs font-semibold text-slate-500">Curso</th>
                  <th class="py-3 px-4 text-xs font-semibold text-slate-500">Profesor</th>
                  <th class="py-3 px-4 text-xs font-semibold text-slate-500">Horario</th>
                  <th class="py-3 px-4 text-xs font-semibold text-slate-500">Sede</th>
                  <th class="py-3 px-4 text-xs font-semibold text-slate-500 text-right">Cupos</th>
                  <th class="py-3 px-4 text-xs font-semibold text-slate-500">Estado</th>
                  <th class="py-3 px-4 text-xs font-semibold text-slate-500 w-12"><span class="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                @for (row of facade.classes(); track row.id) {
                  <tr class="border-b border-slate-50 hover:bg-slate-50/80">
                    <td class="py-3 px-4 font-mono text-xs">{{ row.code }}</td>
                    <td class="py-3 px-4 font-medium">{{ row.courseName }}</td>
                    <td class="py-3 px-4">{{ row.teacherName }}</td>
                    <td class="py-3 px-4 text-xs">{{ row.scheduleLabel }}</td>
                    <td class="py-3 px-4">{{ row.campusName }}</td>
                    <td class="py-3 px-4 text-right">
                      <span [attr.aria-label]="cuposLabel(row)">{{ row.enrolled }}/{{ row.capacity }}</span>
                    </td>
                    <td class="py-3 px-4">
                      <app-class-status-badge [status]="row.status" />
                    </td>
                    <td class="py-3 px-4 relative">
                      <button
                        type="button"
                        class="p-1.5 rounded-lg hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500"
                        [attr.aria-label]="'Acciones para ' + row.name"
                        [attr.aria-expanded]="openMenuId() === row.id"
                        (click)="toggleMenu(row.id, $event)"
                      >
                        <svg class="w-5 h-5 text-slate-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
                        </svg>
                      </button>
                      @if (openMenuId() === row.id) {
                        <div
                          class="absolute right-4 top-full z-20 mt-1 w-48 rounded-xl border border-slate-200 bg-white shadow-lg py-1"
                          role="menu"
                        >
                          @for (action of rowActions; track action.label) {
                            <button
                              type="button"
                              class="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 focus-visible:bg-slate-50"
                              role="menuitem"
                              (click)="runAction(action.key, row)"
                            >
                              {{ action.label }}
                            </button>
                          }
                        </div>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Cards mobile -->
        <div class="md:hidden space-y-3">
          @for (row of facade.classes(); track row.id) {
            <article class="section-card p-4 space-y-3">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <h3 class="font-bold text-slate-900">{{ row.courseName }}</h3>
                  <p class="text-xs font-mono text-slate-500">{{ row.code }}</p>
                </div>
                <app-class-status-badge [status]="row.status" />
              </div>
              <p class="text-sm text-slate-600">{{ row.teacherName }}</p>
              <p class="text-xs text-slate-500">{{ row.scheduleLabel }}</p>
              <p class="text-sm font-semibold text-slate-800">{{ row.enrolled }} / {{ row.capacity }} alumnos</p>
              <a [routerLink]="['/clases', row.id]" class="btn-secondary w-full text-center !text-sm">Ver detalle</a>
            </article>
          }
        </div>
      }
      }
    </div>
  `,
  host: {
    '(document:click)': 'closeMenu()',
  },
})
export class ClassListPage implements OnInit {
  protected readonly facade = inject(ClassesFacade);
  private readonly classService = inject(ClassService);
  private readonly router = inject(Router);

  protected searchQuery = '';
  protected filterPeriodId = 0;
  protected filterActivityId = 0;
  protected filterCourseId = 0;
  protected filterTeacherId = 0;
  protected filterModality = '';
  protected filterStatus = '';

  protected readonly periods = signal<AcademicPeriod[]>([]);
  protected readonly activities = signal<Activity[]>([]);
  protected readonly courses = signal<ClassCourseRef[]>([]);
  protected readonly teachers = signal<ClassTeacherRef[]>([]);
  protected readonly openMenuId = signal<number | null>(null);

  protected readonly statusLabels = ACADEMIC_CLASS_STATUS_LABELS;
  protected readonly statusOptions = Object.values(AcademicClassStatus);
  protected readonly modalityOptions = Object.values(ClassModality).map(v => ({
    value: v,
    label: CLASS_MODALITY_LABELS[v],
  }));

  protected readonly rowActions = [
    { key: 'view', label: 'Ver' },
    { key: 'edit', label: 'Editar' },
    { key: 'duplicate', label: 'Duplicar' },
    { key: 'students', label: 'Ver alumnos' },
    { key: 'calendar', label: 'Ver calendario' },
    { key: 'status', label: 'Cambiar estado' },
    { key: 'cancel', label: 'Cancelar' },
  ] as const;

  ngOnInit(): void {
    this.classService.getPeriods().subscribe(p => this.periods.set(p));
    this.classService.getActivities().subscribe(a => this.activities.set(a));
    this.classService.getTeachers().subscribe(t => this.teachers.set(t));
    this.classService.getCoursesByActivity(0).subscribe(c => this.courses.set(c));
    this.facade.loadList();
  }

  protected statCards() {
    const s = this.facade.stats();
    return [
      { label: 'Clases activas', value: s.active },
      { label: 'Próximas a iniciar', value: s.upcoming },
      { label: 'Completas', value: s.full },
      { label: 'Con cupos', value: s.withSpots },
      { label: 'En borrador', value: s.draft },
    ];
  }

  protected filteredCourses(): ClassCourseRef[] {
    if (!this.filterActivityId) return this.courses();
    return this.courses().filter(c => c.activityId === this.filterActivityId);
  }

  protected onActivityChange(): void {
    this.filterCourseId = 0;
    if (this.filterActivityId) {
      this.classService.getCoursesByActivity(this.filterActivityId).subscribe(c => this.courses.set(c));
    }
  }

  protected onSearchChange(): void {
    this.facade.setFilters({ search: this.searchQuery });
    this.facade.loadList(this.buildFilters());
  }

  protected applyFilters(): void {
    this.facade.loadList(this.buildFilters());
  }

  protected clearFilters(): void {
    this.searchQuery = '';
    this.filterPeriodId = 0;
    this.filterActivityId = 0;
    this.filterCourseId = 0;
    this.filterTeacherId = 0;
    this.filterModality = '';
    this.filterStatus = '';
    this.facade.clearFilters();
  }

  protected cuposLabel(row: ClassListItem): string {
    const avail = row.capacity - row.enrolled;
    return CAPACITY_AVAILABILITY_LABELS[getCapacityAvailability(avail, row.capacity, row.warningCapacity ?? 3)];
  }

  protected toggleMenu(id: number, event: Event): void {
    event.stopPropagation();
    this.openMenuId.update(cur => (cur === id ? null : id));
  }

  protected closeMenu(): void {
    this.openMenuId.set(null);
  }

  protected runAction(key: string, row: ClassListItem): void {
    this.closeMenu();
    switch (key) {
      case 'view':
        this.router.navigate(['/clases', row.id]);
        break;
      case 'edit':
        this.router.navigate(['/clases', row.id, 'editar']);
        break;
      case 'duplicate':
        this.facade.duplicateClass({
          sourceClassId: row.id,
          periodId: row.periodId,
          startDate: row.startDate,
          endDate: row.endDate,
        });
        break;
      case 'students':
        this.router.navigate(['/clases', row.id], { fragment: 'alumnos' });
        break;
      case 'calendar':
        this.router.navigate(['/clases', row.id], { fragment: 'calendario' });
        break;
      case 'status':
        if (row.status === AcademicClassStatus.DRAFT) {
          this.facade.publishClass(row.id);
        }
        break;
      case 'cancel':
        this.facade.cancelClass(row.id);
        break;
    }
  }

  private buildFilters() {
    return {
      search: this.searchQuery || undefined,
      periodId: this.filterPeriodId || undefined,
      activityId: this.filterActivityId || undefined,
      courseId: this.filterCourseId || undefined,
      teacherId: this.filterTeacherId || undefined,
      modality: (this.filterModality as ClassModality) || undefined,
      status: (this.filterStatus as AcademicClassStatus) || undefined,
    };
  }
}
