import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StudentCourseService } from '../../services/student-course.service';
import { StudentScheduleService } from '../../services/student-schedule.service';
import { StudentAttendanceService } from '../../services/student-attendance.service';
import {
  StudentCourse,
  StudentScheduleEvent,
  StudentAttendanceRecord,
} from '../../models/student-portal.model';
import { StudentAttendanceProgressComponent } from '../../components/attendance-progress/attendance-progress';
import {
  STUDENT_ATTENDANCE_STATUS_LABELS,
} from '../../enums/student-attendance-status.enum';

type DetailTab = 'summary' | 'schedule' | 'attendance';

@Component({
  selector: 'app-student-course-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, StudentAttendanceProgressComponent],
  template: `
    <div class="space-y-6">
      <nav class="text-sm text-slate-500">
        <a routerLink="/portal-alumno/cursos" class="hover:text-brand">Mis cursos</a>
        <span class="mx-2">/</span>
        <span class="text-slate-800 font-medium">Detalle</span>
      </nav>

      @if (loading()) {
        <div class="sp-card p-8 animate-pulse">
          <div class="h-6 bg-slate-200 rounded w-48"></div>
        </div>
      } @else if (course(); as c) {
        <div class="space-y-4">
          <div>
            <h1 class="sp-page-title">{{ c.name }}</h1>
            <p class="text-sm text-slate-500 mt-1">{{ c.code }} · {{ c.period }}</p>
          </div>

          <div class="flex gap-2 overflow-x-auto" role="tablist" aria-label="Secciones del curso">
            @for (t of tabs; track t.id) {
              <button type="button" role="tab" [attr.aria-selected]="tab() === t.id"
                class="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors"
                [class]="tab() === t.id ? 'bg-brand text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                (click)="tab.set(t.id)">
                {{ t.label }}
              </button>
            }
          </div>

          @switch (tab()) {
            @case ('summary') {
              <div class="sp-card p-5 space-y-4">
                <app-attendance-progress [percentage]="c.attendancePercentage" />
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-slate-500">Profesor</p>
                    <p class="font-semibold text-slate-900">{{ c.teacher }}</p>
                  </div>
                  <div>
                    <p class="text-slate-500">Modalidad</p>
                    <p class="font-semibold text-slate-900">{{ c.modality }}</p>
                  </div>
                  <div>
                    <p class="text-slate-500">Horario</p>
                    <p class="font-semibold text-slate-900">{{ c.days }}</p>
                    <p class="text-slate-600">{{ c.timeStart }} - {{ c.timeEnd }}</p>
                  </div>
                  <div>
                    <p class="text-slate-500">Sede / Ambiente</p>
                    <p class="font-semibold text-slate-900">{{ c.campus }}</p>
                    <p class="text-slate-600">{{ c.environment }}</p>
                  </div>
                </div>
                @if (c.description) {
                  <p class="text-sm text-slate-600 border-t border-slate-100 pt-4">{{ c.description }}</p>
                }
              </div>
            }
            @case ('schedule') {
              <div class="sp-card !p-0 overflow-hidden">
                @if (scheduleEvents().length === 0) {
                  <p class="p-5 text-sm text-slate-500">No hay clases programadas.</p>
                } @else {
                  @for (evt of scheduleEvents(); track evt.id) {
                    <div class="p-4 border-b border-slate-100 last:border-0 flex flex-wrap gap-4">
                      <div class="w-16 text-center shrink-0">
                        <p class="text-xs font-semibold uppercase text-slate-500">{{ evt.dayLabel }}</p>
                        <p class="text-lg font-bold text-brand">{{ evt.date.slice(8, 10) }}</p>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="font-semibold text-slate-900">{{ evt.timeStart }} - {{ evt.timeEnd }}</p>
                        <p class="text-sm text-slate-600">{{ evt.environment }} · {{ evt.teacher }}</p>
                      </div>
                    </div>
                  }
                }
              </div>
            }
            @case ('attendance') {
              <div class="sp-card !p-0 overflow-hidden">
                @if (attendanceRecords().length === 0) {
                  <p class="p-5 text-sm text-slate-500">Sin registros de asistencia.</p>
                } @else {
                  @for (rec of attendanceRecords(); track rec.id) {
                    <div class="p-4 border-b border-slate-100 last:border-0 flex justify-between items-center">
                      <span class="text-sm font-medium text-slate-900">{{ rec.dateLabel }}</span>
                      <span class="text-xs font-semibold px-2.5 py-1 rounded-full"
                        [class]="attendanceClass(rec.status)">
                        {{ attendanceLabel(rec.status) }}
                      </span>
                    </div>
                  }
                }
              </div>
            }
          }
        </div>
      } @else {
        <div class="sp-card p-8 text-center space-y-3">
          <p class="text-slate-600">Curso no encontrado.</p>
          <a routerLink="/portal-alumno/cursos" class="btn-primary inline-block">Volver a mis cursos</a>
        </div>
      }
    </div>
  `,
})
export class StudentCourseDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly courseService = inject(StudentCourseService);
  private readonly scheduleService = inject(StudentScheduleService);
  private readonly attendanceService = inject(StudentAttendanceService);

  protected readonly course = signal<StudentCourse | null>(null);
  protected readonly scheduleEvents = signal<StudentScheduleEvent[]>([]);
  protected readonly attendanceRecords = signal<StudentAttendanceRecord[]>([]);
  protected readonly loading = signal(true);
  protected readonly tab = signal<DetailTab>('summary');

  protected readonly tabs: { id: DetailTab; label: string }[] = [
    { id: 'summary', label: 'Resumen' },
    { id: 'schedule', label: 'Horario' },
    { id: 'attendance', label: 'Asistencia' },
  ];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.courseService.getCourse(id).subscribe({
      next: c => {
        this.course.set(c ?? null);
        this.loading.set(false);
        if (c) {
          this.scheduleService.getWeeklySchedule().subscribe(events =>
            this.scheduleEvents.set(events.filter(e => e.courseId === c.id)),
          );
          this.attendanceService.getCourseAttendance(c.id).subscribe(records =>
            this.attendanceRecords.set(records),
          );
        }
      },
      error: () => this.loading.set(false),
    });
  }

  protected attendanceLabel(status: StudentAttendanceRecord['status']): string {
    return STUDENT_ATTENDANCE_STATUS_LABELS[status];
  }

  protected attendanceClass(status: StudentAttendanceRecord['status']): string {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800';
      case 'ABSENT': return 'bg-red-100 text-red-800';
      case 'JUSTIFIED': return 'bg-amber-100 text-amber-800';
      default: return 'bg-slate-100 text-slate-600';
    }
  }
}
