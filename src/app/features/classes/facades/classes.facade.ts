import { Injectable, computed, inject, signal } from '@angular/core';
import { AcademicClassStatus } from '../enums/academic-class-status.enum';
import {
  ClassConflict,
  ClassEditPermissions,
  ClassEnrollmentStudent,
  ClassHistoryEntry,
  ClassListFilters,
  ClassListItem,
  ClassListStats,
  ClassModel,
  ClassSession,
  CreateClassRequest,
  DuplicateClassRequest,
  PublishValidationItem,
} from '../models/class.model';
import { ClassService } from '../services/class.service';
import { ClassAvailabilityService, ClassScheduleService } from '../services/class-schedule.service';
import {
  CancelSessionRequest,
  ChangeRoomRequest,
  ChangeTeacherRequest,
  ClassSessionService,
  RescheduleSessionRequest,
} from '../services/class-session.service';

export type WizardStep =
  | 'general'
  | 'schedule'
  | 'teacher'
  | 'capacity'
  | 'configuration'
  | 'sessions'
  | 'summary';

@Injectable({ providedIn: 'root' })
export class ClassesFacade {
  private readonly classService = inject(ClassService);
  private readonly scheduleService = inject(ClassScheduleService);
  private readonly availabilityService = inject(ClassAvailabilityService);
  private readonly sessionService = inject(ClassSessionService);

  readonly classes = signal<ClassListItem[]>([]);
  readonly selectedClass = signal<ClassModel | null>(null);
  readonly sessions = signal<ClassSession[]>([]);
  readonly enrolledStudents = signal<ClassEnrollmentStudent[]>([]);
  readonly classHistory = signal<ClassHistoryEntry[]>([]);
  readonly selectedSession = signal<ClassSession | null>(null);
  readonly previewSessions = signal<ClassSession[]>([]);
  readonly conflicts = signal<ClassConflict[]>([]);
  readonly loading = signal(false);
  readonly actionLoading = signal(false);
  readonly stats = signal<ClassListStats>({ active: 0, upcoming: 0, full: 0, withSpots: 0, draft: 0 });
  readonly filters = signal<ClassListFilters>({});
  readonly wizardStep = signal<WizardStep>('general');
  readonly createDraft = signal<Partial<CreateClassRequest>>({});

  readonly filteredCount = computed(() => this.classes().length);

  readonly publishValidation = computed((): PublishValidationItem[] => {
    const cls = this.selectedClass();
    const sessions = this.sessions();
    if (!cls) return [];
    return [
      { label: 'Profesor asignado', valid: !!cls.teacherId },
      { label: 'Ambiente configurado', valid: !!cls.roomId || cls.modality === 'ONLINE' },
      { label: 'Programación definida', valid: cls.scheduleRules.length > 0 },
      { label: 'Capacidad válida', valid: cls.capacity > 0 },
      { label: 'Sesiones generadas', valid: sessions.length > 0 },
      { label: 'Sin conflictos pendientes', valid: this.conflicts().length === 0 },
    ];
  });

  readonly canPublish = computed(() =>
    this.publishValidation().every(v => v.valid),
  );

  loadList(filters?: ClassListFilters): void {
    this.loading.set(true);
    const f = filters ?? this.filters();
    this.classService.getClasses(f).subscribe({
      next: list => {
        this.classes.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.classService.getListStats().subscribe(stats => this.stats.set(stats));
  }

  setFilters(partial: ClassListFilters): void {
    this.filters.update(f => ({ ...f, ...partial }));
  }

  clearFilters(): void {
    this.filters.set({});
    this.loadList({});
  }

  loadClass(id: number): void {
    this.loading.set(true);
    this.classService.getClass(id).subscribe({
      next: cls => {
        this.selectedClass.set(cls ?? null);
        this.loading.set(false);
        if (cls) {
          this.refreshSessions(id);
          this.classService.getStudentsForClass(id).subscribe(s => this.enrolledStudents.set(s));
          this.classService.getHistoryForClass(id).subscribe(h => this.classHistory.set(h));
        }
      },
      error: () => this.loading.set(false),
    });
  }

  refreshSessions(classId: number): void {
    this.sessionService.getSessions(classId).subscribe(s => this.sessions.set(s));
  }

  selectSession(session: ClassSession | null): void {
    this.selectedSession.set(session);
  }

  updateClass(id: number, changes: Partial<ClassModel>): void {
    this.actionLoading.set(true);
    this.classService.updateClass(id, changes).subscribe({
      next: cls => {
        if (cls) this.selectedClass.set(cls);
        this.actionLoading.set(false);
        this.loadList(this.filters());
      },
      error: () => this.actionLoading.set(false),
    });
  }

  rescheduleSession(request: RescheduleSessionRequest): void {
    this.actionLoading.set(true);
    this.sessionService.rescheduleSession(request).subscribe({
      next: () => {
        const classId = this.selectedClass()?.id;
        if (classId) this.refreshSessions(classId);
        this.selectedSession.set(null);
        this.actionLoading.set(false);
      },
      error: () => this.actionLoading.set(false),
    });
  }

  cancelSession(request: CancelSessionRequest): void {
    this.actionLoading.set(true);
    this.sessionService.cancelSession(request).subscribe({
      next: () => {
        const classId = this.selectedClass()?.id;
        if (classId) this.refreshSessions(classId);
        this.selectedSession.set(null);
        this.actionLoading.set(false);
      },
      error: () => this.actionLoading.set(false),
    });
  }

  changeSessionTeacher(request: ChangeTeacherRequest): void {
    this.actionLoading.set(true);
    this.sessionService.changeTeacher(request).subscribe({
      next: () => {
        const classId = this.selectedClass()?.id;
        if (classId) this.refreshSessions(classId);
        this.selectedSession.set(null);
        this.actionLoading.set(false);
      },
      error: () => this.actionLoading.set(false),
    });
  }

  changeSessionRoom(request: ChangeRoomRequest): void {
    this.actionLoading.set(true);
    this.sessionService.changeRoom(request).subscribe({
      next: () => {
        const classId = this.selectedClass()?.id;
        if (classId) this.refreshSessions(classId);
        this.selectedSession.set(null);
        this.actionLoading.set(false);
      },
      error: () => this.actionLoading.set(false),
    });
  }

  generatePreviewSessions(classId: number, draft: CreateClassRequest): void {
    const sessions = this.scheduleService.generateSessions(
      classId,
      draft.startDate,
      draft.endDate,
      draft.scheduleRules,
      draft.teacherId,
      draft.roomId,
    );
    this.previewSessions.set(sessions);
    this.sessionService.setPreviewSessions(sessions);
  }

  validateWizard(draft: CreateClassRequest, periodStart: string, periodEnd: string): void {
    const scheduleConflicts = this.scheduleService.validateSchedule(draft.scheduleRules);
    const periodConflicts = this.scheduleService.validatePeriodDates(
      draft.startDate,
      draft.endDate,
      periodStart,
      periodEnd,
    );

    this.availabilityService.validateAll(
      {
        teacherId: draft.teacherId,
        startDate: draft.startDate,
        endDate: draft.endDate,
        scheduleRules: draft.scheduleRules,
      },
      draft.roomId
        ? {
            roomId: draft.roomId,
            startDate: draft.startDate,
            endDate: draft.endDate,
            scheduleRules: draft.scheduleRules,
          }
        : undefined,
      draft.scheduleRules,
      periodConflicts,
    ).subscribe(all => {
      this.conflicts.set([...scheduleConflicts, ...all.filter(c => !scheduleConflicts.some(s => s.message === c.message))]);
    });
  }

  validatePublishReadiness(): void {
    const cls = this.selectedClass();
    if (!cls) return;
    this.conflicts.set([]);
    this.availabilityService.validateAll(
      {
        teacherId: cls.teacherId,
        startDate: cls.startDate,
        endDate: cls.endDate,
        scheduleRules: cls.scheduleRules,
        excludeClassId: cls.id,
      },
      cls.roomId ? {
        roomId: cls.roomId,
        startDate: cls.startDate,
        endDate: cls.endDate,
        scheduleRules: cls.scheduleRules,
        excludeClassId: cls.id,
      } : undefined,
    ).subscribe(c => this.conflicts.set(c));
  }

  createClass(request: CreateClassRequest): void {
    this.loading.set(true);
    this.classService.createClass(request).subscribe({
      next: created => {
        if (request.sessions.length > 0) {
          this.sessionService.saveSessionsForClass(created.id, request.sessions);
        }
        this.loading.set(false);
        this.loadList(this.filters());
      },
      error: () => this.loading.set(false),
    });
  }

  publishClass(id: number): void {
    this.classService.publishClass(id).subscribe(cls => {
      if (cls) {
        this.selectedClass.set(cls);
        this.loadList(this.filters());
      }
    });
  }

  cancelClass(id: number): void {
    this.classService.cancelClass(id).subscribe(cls => {
      if (cls) {
        this.selectedClass.set(cls);
        this.loadList(this.filters());
      }
    });
  }

  duplicateClass(request: DuplicateClassRequest): void {
    this.classService.duplicateClass(request).subscribe(created => {
      if (created) this.loadList(this.filters());
    });
  }

  changeStatus(id: number, status: AcademicClassStatus): void {
    this.classService.changeStatus(id, status).subscribe(cls => {
      if (cls) {
        this.selectedClass.set(cls);
        this.loadList(this.filters());
      }
    });
  }

  getEditPermissions(status: AcademicClassStatus): ClassEditPermissions {
    switch (status) {
      case AcademicClassStatus.DRAFT:
      case AcademicClassStatus.SCHEDULED:
        return { name: true, description: true, structural: true, resources: true, capacity: true, enrollment: true, publication: true };
      case AcademicClassStatus.PUBLISHED:
        return { name: true, description: true, structural: false, resources: true, capacity: true, enrollment: true, publication: true };
      case AcademicClassStatus.IN_PROGRESS:
        return { name: true, description: true, structural: false, resources: false, capacity: false, enrollment: true, publication: false };
      default:
        return { name: false, description: false, structural: false, resources: false, capacity: false, enrollment: false, publication: false };
    }
  }

  canEditFully(status: AcademicClassStatus): boolean {
    return status === AcademicClassStatus.DRAFT || status === AcademicClassStatus.SCHEDULED;
  }

  canEditPartially(status: AcademicClassStatus): boolean {
    return status === AcademicClassStatus.PUBLISHED || status === AcademicClassStatus.IN_PROGRESS;
  }

  isReadOnly(status: AcademicClassStatus): boolean {
    return status === AcademicClassStatus.COMPLETED || status === AcademicClassStatus.CANCELLED;
  }

  invalidateDependentValidations(): void {
    this.conflicts.set([]);
    this.previewSessions.set([]);
  }
}
