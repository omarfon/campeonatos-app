import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EnrollmentService } from '../../services/enrollment.service';
import { EnrollmentCourseService } from '../../services/enrollment-course.service';
import { EnrollmentStatusBadgeComponent } from '../../components/enrollment-status-badge/enrollment-status-badge';
import { EnrollmentStatus, ENROLLMENT_STATUS_LABELS } from '../../enums/enrollment-status.enum';
import { EnrollmentListItem, STUDENT_TYPE_LABELS, StudentType } from '../../models/enrollment.model';

@Component({
  selector: 'app-enrollment-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, EnrollmentStatusBadgeComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">Matrículas</h1>
          <p class="text-sm text-slate-500">{{ filtered().length }} registro(s)</p>
        </div>
        <a routerLink="/matricula/nueva" class="btn-primary">Nueva matrícula</a>
      </div>

      <div class="section-card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label for="f-code" class="block text-xs font-semibold text-slate-500 mb-1">Código</label>
          <input id="f-code" type="search" class="input-modern !py-1.5 !text-sm w-full" [(ngModel)]="filterCode" (ngModelChange)="applyFilters()" />
        </div>
        <div>
          <label for="f-student" class="block text-xs font-semibold text-slate-500 mb-1">Estudiante</label>
          <input id="f-student" type="search" class="input-modern !py-1.5 !text-sm w-full" [(ngModel)]="filterStudent" (ngModelChange)="applyFilters()" />
        </div>
        <div>
          <label for="f-doc" class="block text-xs font-semibold text-slate-500 mb-1">Documento</label>
          <input id="f-doc" type="search" class="input-modern !py-1.5 !text-sm w-full" [(ngModel)]="filterDocument" (ngModelChange)="applyFilters()" />
        </div>
        <div>
          <label for="f-status" class="block text-xs font-semibold text-slate-500 mb-1">Estado</label>
          <select id="f-status" class="input-modern !py-1.5 !text-sm w-full" [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()">
            <option value="">Todos</option>
            @for (s of statusOptions; track s) {
              <option [value]="s">{{ ENROLLMENT_STATUS_LABELS[s] }}</option>
            }
          </select>
        </div>
        <div>
          <label for="f-course" class="block text-xs font-semibold text-slate-500 mb-1">Curso</label>
          <select id="f-course" class="input-modern !py-1.5 !text-sm w-full" [(ngModel)]="filterCourseId" (ngModelChange)="applyFilters()">
            <option [ngValue]="0">Todos</option>
            @for (c of courses(); track c.id) {
              <option [ngValue]="c.id">{{ c.name }}</option>
            }
          </select>
        </div>
        <div>
          <label for="f-type" class="block text-xs font-semibold text-slate-500 mb-1">Tipo estudiante</label>
          <select id="f-type" class="input-modern !py-1.5 !text-sm w-full" [(ngModel)]="filterStudentType" (ngModelChange)="applyFilters()">
            <option value="">Todos</option>
            <option value="NEW">Nuevo</option>
            <option value="REGULAR">Regular</option>
          </select>
        </div>
        <div>
          <label for="f-from" class="block text-xs font-semibold text-slate-500 mb-1">Desde</label>
          <input id="f-from" type="date" class="input-modern !py-1.5 !text-sm w-full" [(ngModel)]="filterDateFrom" (ngModelChange)="applyFilters()" />
        </div>
        <div>
          <label for="f-to" class="block text-xs font-semibold text-slate-500 mb-1">Hasta</label>
          <input id="f-to" type="date" class="input-modern !py-1.5 !text-sm w-full" [(ngModel)]="filterDateTo" (ngModelChange)="applyFilters()" />
        </div>
      </div>

      <div class="section-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 text-left">
                <th class="py-2 px-4 text-xs font-semibold text-slate-500">Código</th>
                <th class="py-2 px-4 text-xs font-semibold text-slate-500">Estudiante</th>
                <th class="py-2 px-4 text-xs font-semibold text-slate-500">Documento</th>
                <th class="py-2 px-4 text-xs font-semibold text-slate-500">Curso</th>
                <th class="py-2 px-4 text-xs font-semibold text-slate-500">Horario</th>
                <th class="py-2 px-4 text-xs font-semibold text-slate-500">Tipo</th>
                <th class="py-2 px-4 text-xs font-semibold text-slate-500">Convenio</th>
                <th class="py-2 px-4 text-xs font-semibold text-slate-500 text-right">Importe</th>
                <th class="py-2 px-4 text-xs font-semibold text-slate-500">Estado</th>
                <th class="py-2 px-4 text-xs font-semibold text-slate-500">Fecha</th>
              </tr>
            </thead>
            <tbody>
              @for (m of paged(); track m.id) {
                <tr class="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                  tabindex="0"
                  role="link"
                  [attr.aria-label]="'Ver matrícula ' + m.code"
                  (click)="openDetail(m.id)"
                  (keydown.enter)="openDetail(m.id)"
                  (keydown.space)="openDetail(m.id); $event.preventDefault()">
                  <td class="py-2 px-4 font-mono text-xs text-brand font-semibold">{{ m.code }}</td>
                  <td class="py-2 px-4 font-medium">{{ m.studentName }}</td>
                  <td class="py-2 px-4">{{ m.studentDocument }}</td>
                  <td class="py-2 px-4">{{ m.courseName }}</td>
                  <td class="py-2 px-4 text-xs">{{ m.schedule }}</td>
                  <td class="py-2 px-4">{{ typeLabel(m.studentType) }}</td>
                  <td class="py-2 px-4 text-xs">{{ m.agreementName ?? '—' }}</td>
                  <td class="py-2 px-4 text-right font-semibold">S/ {{ m.total.toFixed(2) }}</td>
                  <td class="py-2 px-4"><app-enrollment-status-badge [status]="m.status" /></td>
                  <td class="py-2 px-4 text-xs">{{ m.createdAt }}</td>
                </tr>
              } @empty {
                <tr><td colspan="10" class="py-8 text-center text-slate-400">Sin matrículas</td></tr>
              }
            </tbody>
          </table>
        </div>
        @if (totalPages() > 1) {
          <div class="px-4 py-3 border-t border-slate-200 flex justify-between items-center">
            <button type="button" class="btn-ghost !text-sm" [disabled]="page() <= 1" (click)="page.set(page() - 1)">Anterior</button>
            <span class="text-sm text-slate-500">Página {{ page() }} de {{ totalPages() }}</span>
            <button type="button" class="btn-ghost !text-sm" [disabled]="page() >= totalPages()" (click)="page.set(page() + 1)">Siguiente</button>
          </div>
        }
      </div>
    </div>
  `,
})
export class EnrollmentListComponent implements OnInit {
  private readonly service = inject(EnrollmentService);
  private readonly courseService = inject(EnrollmentCourseService);
  private readonly router = inject(Router);

  protected readonly items = signal<EnrollmentListItem[]>([]);
  protected readonly courses = signal<{ id: number; name: string }[]>([]);
  protected readonly page = signal(1);
  protected readonly pageSize = 15;

  protected filterCode = '';
  protected filterStudent = '';
  protected filterDocument = '';
  protected filterStatus = '';
  protected filterCourseId = 0;
  protected filterStudentType = '';
  protected filterDateFrom = '';
  protected filterDateTo = '';

  protected readonly statusOptions = Object.values(EnrollmentStatus);
  protected readonly ENROLLMENT_STATUS_LABELS = ENROLLMENT_STATUS_LABELS;

  protected readonly filtered = computed(() => this.items());

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize)),
  );

  protected readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.load();
    this.courseService.getCourses().subscribe(list =>
      this.courses.set(list.map(c => ({ id: c.id, name: c.name }))),
    );
  }

  protected applyFilters(): void {
    this.page.set(1);
    this.load();
  }

  protected typeLabel(t: StudentType): string {
    return STUDENT_TYPE_LABELS[t];
  }

  protected openDetail(id: number): void {
    this.router.navigate(['/matricula', id]);
  }

  private load(): void {
    this.service.getEnrollments({
      code: this.filterCode || undefined,
      student: this.filterStudent || undefined,
      document: this.filterDocument || undefined,
      status: (this.filterStatus as EnrollmentStatus) || undefined,
      courseId: this.filterCourseId || undefined,
      studentType: (this.filterStudentType as StudentType) || undefined,
      dateFrom: this.filterDateFrom || undefined,
      dateTo: this.filterDateTo || undefined,
    }).subscribe(list => this.items.set(list));
  }
}
