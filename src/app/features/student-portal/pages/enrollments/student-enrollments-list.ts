import { Component, computed, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { RouterLink } from '@angular/router';

import { FormsModule } from '@angular/forms';

import { StudentEnrollmentService } from '../../services/student-enrollment.service';

import { StudentEnrollment } from '../../models/student-portal.model';

import { EnrollmentStatus, ENROLLMENT_STATUS_LABELS } from '../../../matricula/enums/enrollment-status.enum';

import { StudentEmptyStateComponent } from '../../components/empty-state/student-empty-state';



@Component({

  selector: 'app-student-enrollments-list',

  changeDetection: ChangeDetectionStrategy.OnPush,

  imports: [RouterLink, FormsModule, StudentEmptyStateComponent],

  template: `

    <div class="space-y-6">

      <header class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 class="sp-page-title">Mis matrículas</h1>
          <p class="text-sm text-slate-500 mt-1">Consulta el historial de tus matrículas.</p>
        </div>
        <a routerLink="/portal-alumno/matricula"
          class="btn-secondary text-center shrink-0 self-start sm:self-center">
          Volver a matrícula
        </a>
      </header>



      <div class="flex flex-wrap gap-3">

        <select class="input-modern !w-auto" [ngModel]="yearFilter()" (ngModelChange)="yearFilter.set($event)">

          <option value="">Todos los años</option>

          @for (y of years(); track y) {

            <option [value]="y">{{ y }}</option>

          }

        </select>

        <select class="input-modern !w-auto" [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)">

          <option value="">Todos los estados</option>

          @for (s of statusOptions; track s.value) {

            <option [value]="s.value">{{ s.label }}</option>

          }

        </select>

      </div>



      @if (loading()) {

        <div class="space-y-3 animate-pulse">

          @for (i of [1, 2, 3]; track i) {

            <div class="h-24 bg-slate-200 rounded-2xl"></div>

          }

        </div>

      } @else if (filtered().length === 0) {

        <app-student-empty-state

          title="Sin matrículas"

          description="No encontramos matrículas con los filtros seleccionados."

          icon="📝"

        />

      } @else {

        <div class="space-y-3">

          @for (e of filtered(); track e.id) {

            <a [routerLink]="['/portal-alumno/matriculas', e.id]"

              class="sp-card p-5 sp-card-hover block">

              <div class="flex flex-wrap items-start justify-between gap-2">

                <div>

                  <p class="font-mono text-xs text-slate-500">{{ e.code }}</p>

                  <h2 class="font-bold text-slate-900 mt-0.5">{{ e.courseName }}</h2>

                  <p class="text-sm text-slate-600 mt-1">{{ e.className }} · {{ e.period }}</p>

                </div>

                <span class="text-xs font-semibold px-2.5 py-1 rounded-full"

                  [class]="statusClass(e.status)">

                  {{ statusLabel(e.status) }}

                </span>

              </div>

              <p class="text-sm text-slate-500 mt-3">{{ e.schedule }} · {{ e.campus }}</p>

              <p class="text-sm font-semibold text-slate-900 mt-2">Total: S/ {{ e.total.toFixed(2) }}</p>

            </a>

          }

        </div>

      }

    </div>

  `,

})

export class StudentEnrollmentsListComponent implements OnInit {

  private readonly enrollmentService = inject(StudentEnrollmentService);



  protected readonly enrollments = signal<StudentEnrollment[]>([]);

  protected readonly loading = signal(true);

  protected readonly yearFilter = signal('');

  protected readonly statusFilter = signal('');



  protected readonly statusOptions = [

    { value: EnrollmentStatus.CONFIRMED, label: ENROLLMENT_STATUS_LABELS[EnrollmentStatus.CONFIRMED] },

    { value: EnrollmentStatus.PENDING_PAYMENT, label: ENROLLMENT_STATUS_LABELS[EnrollmentStatus.PENDING_PAYMENT] },

    { value: EnrollmentStatus.CANCELLED, label: ENROLLMENT_STATUS_LABELS[EnrollmentStatus.CANCELLED] },

  ];



  protected readonly years = computed(() => {

    const set = new Set<string>();

    for (const e of this.enrollments()) {

      const year = e.createdAt.slice(0, 4);

      if (year) set.add(year);

    }

    return [...set].sort((a, b) => b.localeCompare(a));

  });



  protected readonly filtered = computed(() => {

    let list = this.enrollments();

    const year = this.yearFilter();

    const status = this.statusFilter();

    if (year) list = list.filter(e => e.createdAt.startsWith(year));

    if (status) list = list.filter(e => e.status === status);

    return list;

  });



  ngOnInit(): void {

    this.enrollmentService.getMyEnrollments().subscribe({

      next: list => {

        this.enrollments.set(list);

        this.loading.set(false);

      },

      error: () => this.loading.set(false),

    });

  }



  protected statusLabel(status: EnrollmentStatus): string {

    return ENROLLMENT_STATUS_LABELS[status];

  }



  protected statusClass(status: EnrollmentStatus): string {

    switch (status) {

      case EnrollmentStatus.CONFIRMED: return 'bg-green-100 text-green-800';

      case EnrollmentStatus.PENDING_PAYMENT: return 'bg-amber-100 text-amber-800';

      case EnrollmentStatus.CANCELLED: return 'bg-slate-100 text-slate-600';

      default: return 'bg-slate-100 text-slate-600';

    }

  }

}

