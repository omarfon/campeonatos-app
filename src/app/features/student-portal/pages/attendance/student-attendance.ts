import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { StudentAttendanceService } from '../../services/student-attendance.service';
import {
  StudentAttendanceSummary,
  StudentAttendanceRecord,
} from '../../models/student-portal.model';
import { StudentAttendanceProgressComponent } from '../../components/attendance-progress/attendance-progress';
import { StudentEmptyStateComponent } from '../../components/empty-state/student-empty-state';
import { StudentAttendanceDetailPanelComponent } from '../../components/attendance-detail-panel/student-attendance-detail-panel';

type CourseSummary = StudentAttendanceSummary['courses'][number];

@Component({
  selector: 'app-student-attendance',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    StudentAttendanceProgressComponent,
    StudentEmptyStateComponent,
    StudentAttendanceDetailPanelComponent,
  ],
  template: `
    <div class="space-y-6">
      <header>
        <h1 class="sp-page-title">Asistencia</h1>
        <p class="sp-page-subtitle">Revisa tu asistencia por curso.</p>
      </header>

      @if (loading()) {
        <div class="sp-card p-8 animate-pulse">
          <div class="h-4 bg-slate-200 rounded w-32 mb-4"></div>
          <div class="h-2 bg-slate-200 rounded"></div>
        </div>
      } @else if (summary(); as s) {
        <div class="sp-card p-5">
          <h2 class="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Resumen general</h2>
          <app-attendance-progress [percentage]="s.overallPercentage" label="Asistencia global" />
        </div>

        @if (s.courses.length === 0) {
          <app-student-empty-state
            title="Sin cursos"
            description="No tienes cursos con registro de asistencia."
            icon="✓"
          />
        } @else {
          <section>
            <h2 class="text-lg font-bold text-slate-900 mb-3">Por curso</h2>
            <div class="grid grid-cols-2 gap-3">
              @for (c of s.courses; track c.courseId) {
                <button type="button"
                  class="sp-card p-5 sp-card-hover w-full text-left"
                  [attr.aria-expanded]="selectedCourse()?.courseId === c.courseId && panelOpen()"
                  (click)="openCourse(c)">
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <div class="flex-1 min-w-0">
                      <h3 class="font-bold text-slate-900">{{ c.courseName }}</h3>
                      <p class="text-sm text-slate-500 mt-1">
                        {{ c.present }} presente(s) · {{ c.absent }} ausente(s)
                        @if (c.justified > 0) {
                          · {{ c.justified }} justificada(s)
                        }
                      </p>
                    </div>
                    <div class="w-full sm:w-40">
                      <app-attendance-progress [percentage]="c.percentage" [label]="''" />
                    </div>
                  </div>
                  <p class="text-sm font-semibold text-brand mt-3">Ver días marcados →</p>
                </button>
              }
            </div>
          </section>
        }
      }

      <app-student-attendance-detail-panel
        [open]="panelOpen()"
        [course]="selectedCourse()"
        [records]="courseRecords()"
        [loading]="recordsLoading()"
        (close)="closePanel()" />
    </div>
  `,
})
export class StudentAttendanceComponent implements OnInit {
  private readonly attendanceService = inject(StudentAttendanceService);

  protected readonly summary = signal<StudentAttendanceSummary | null>(null);
  protected readonly loading = signal(true);
  protected readonly panelOpen = signal(false);
  protected readonly selectedCourse = signal<CourseSummary | null>(null);
  protected readonly courseRecords = signal<StudentAttendanceRecord[]>([]);
  protected readonly recordsLoading = signal(false);

  ngOnInit(): void {
    this.attendanceService.getAttendanceSummary().subscribe({
      next: s => {
        this.summary.set(s);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected openCourse(course: CourseSummary): void {
    this.selectedCourse.set(course);
    this.panelOpen.set(true);
    this.recordsLoading.set(true);
    this.courseRecords.set([]);

    this.attendanceService.getCourseAttendance(course.courseId).subscribe({
      next: records => {
        this.courseRecords.set(records);
        this.recordsLoading.set(false);
      },
      error: () => this.recordsLoading.set(false),
    });
  }

  protected closePanel(): void {
    this.panelOpen.set(false);
  }
}
