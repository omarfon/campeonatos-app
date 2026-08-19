import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ClassModality } from '../enums/class-modality.enum';
import {
  AcademicPeriod,
  Activity,
  ClassCampusRef,
  ClassConflict,
  ClassCourseRef,
  ClassPublicationChannels,
  ClassRoomRef,
  ClassScheduleRule,
  ClassSession,
  ClassTeacherRef,
  CreateClassRequest,
  buildFrequencyLabel,
  buildScheduleLabel,
} from '../models/class.model';
import { ClassService } from '../services/class.service';
import { ClassAvailabilityService, ClassScheduleService } from '../services/class-schedule.service';
import { ClassSessionService } from '../services/class-session.service';
import { MOCK_CLASS_COURSES } from '../mocks/classes.mock';

export type CreateWizardStep =
  | 'general'
  | 'schedule'
  | 'teacher'
  | 'capacity'
  | 'configuration'
  | 'sessions'
  | 'summary';

export interface WizardStepDef {
  id: CreateWizardStep;
  order: number;
  label: string;
}

export interface ClassCreateDraft {
  name: string;
  description: string;
  periodId: number;
  activityId: number;
  courseId: number;
  teacherId: number;
  modality: ClassModality;
  campusId: number;
  roomId: number;
  platform: string;
  accessInfo: string;
  startDate: string;
  endDate: string;
  scheduleRules: ClassScheduleRule[];
  capacity: number;
  minimumCapacity: number;
  warningCapacity: number;
  waitingListEnabled: boolean;
  waitingListMax: number;
  overbookingPolicy: 'none' | 'authorized';
  enrollmentEnabled: boolean;
  enrollmentStartDate: string;
  enrollmentEndDate: string;
  publicationChannels: ClassPublicationChannels;
  sessions: ClassSession[];
}

const EMPTY_DRAFT: ClassCreateDraft = {
  name: '',
  description: '',
  periodId: 0,
  activityId: 0,
  courseId: 0,
  teacherId: 0,
  modality: ClassModality.ONSITE,
  campusId: 0,
  roomId: 0,
  platform: '',
  accessInfo: '',
  startDate: '',
  endDate: '',
  scheduleRules: [],
  capacity: 20,
  minimumCapacity: 5,
  warningCapacity: 3,
  waitingListEnabled: false,
  waitingListMax: 10,
  overbookingPolicy: 'none',
  enrollmentEnabled: true,
  enrollmentStartDate: '',
  enrollmentEndDate: '',
  publicationChannels: {
    adminEnrollment: true,
    studentPortal: true,
    memberPortal: true,
    publicWeb: false,
  },
  sessions: [],
};

@Injectable()
export class ClassCreateWizardFacade {
  private readonly classService = inject(ClassService);
  private readonly scheduleService = inject(ClassScheduleService);
  private readonly availabilityService = inject(ClassAvailabilityService);
  private readonly sessionService = inject(ClassSessionService);
  private readonly router = inject(Router);

  readonly steps: WizardStepDef[] = [
    { id: 'general', order: 1, label: 'Información' },
    { id: 'schedule', order: 2, label: 'Programación' },
    { id: 'teacher', order: 3, label: 'Profesor y ambiente' },
    { id: 'capacity', order: 4, label: 'Capacidad' },
    { id: 'configuration', order: 5, label: 'Configuración' },
    { id: 'sessions', order: 6, label: 'Calendario' },
    { id: 'summary', order: 7, label: 'Resumen' },
  ];

  readonly currentStep = signal<CreateWizardStep>('general');
  readonly draft = signal<ClassCreateDraft>({ ...EMPTY_DRAFT });
  readonly conflicts = signal<ClassConflict[]>([]);
  readonly stepErrors = signal<string[]>([]);
  readonly loading = signal(false);
  readonly createdClass = signal<{ id: number; code: string; name: string; sessions: number } | null>(null);

  readonly periods = signal<AcademicPeriod[]>([]);
  readonly activities = signal<Activity[]>([]);
  readonly courses = signal<ClassCourseRef[]>([]);
  readonly teachers = signal<ClassTeacherRef[]>([]);
  readonly campuses = signal<ClassCampusRef[]>([]);
  readonly rooms = signal<ClassRoomRef[]>([]);

  readonly selectedPeriod = computed(() =>
    this.periods().find(p => p.id === this.draft().periodId),
  );

  readonly selectedCourse = computed(() =>
    this.courses().find(c => c.id === this.draft().courseId) ??
    MOCK_CLASS_COURSES.find(c => c.id === this.draft().courseId),
  );

  readonly selectedTeacher = computed(() =>
    this.teachers().find(t => t.id === this.draft().teacherId),
  );

  readonly codePreview = computed(() => {
    const course = this.selectedCourse();
    const period = this.selectedPeriod();
    if (!course || !period) return 'Se generará automáticamente';
    return `${course.code}-${period.code}-XXX`;
  });

  readonly frequencyLabel = computed(() => buildFrequencyLabel(this.draft().scheduleRules));
  readonly scheduleLabel = computed(() => buildScheduleLabel(this.draft().scheduleRules));

  readonly sessionsStale = signal(true);

  init(): void {
    this.classService.getPeriods().subscribe(p => {
      this.periods.set(p);
      const defaultPeriod = p.find(x => x.code === '202609') ?? p[0];
      if (defaultPeriod) {
        this.patchDraft({
          periodId: defaultPeriod.id,
          startDate: defaultPeriod.startDate,
          endDate: defaultPeriod.endDate,
          enrollmentStartDate: '2026-08-15',
          enrollmentEndDate: '2026-08-31',
        });
      }
    });
    this.classService.getActivities().subscribe(a => this.activities.set(a));
    this.classService.getCampuses().subscribe(c => this.campuses.set(c));
  }

  patchDraft(partial: Partial<ClassCreateDraft>): void {
    this.draft.update(d => ({ ...d, ...partial }));
    this.sessionsStale.set(true);
    this.conflicts.set([]);
  }

  onPeriodChange(periodId: number): void {
    const period = this.periods().find(p => p.id === periodId);
    this.patchDraft({
      periodId,
      startDate: period?.startDate ?? '',
      endDate: period?.endDate ?? '',
    });
  }

  onActivityChange(activityId: number): void {
    this.patchDraft({ activityId, courseId: 0, teacherId: 0 });
    if (activityId) {
      this.classService.getCoursesByActivity(activityId).subscribe(c => this.courses.set(c));
      this.classService.getTeachers(activityId).subscribe(t => this.teachers.set(t));
    } else {
      this.courses.set([]);
      this.teachers.set([]);
    }
  }

  onCourseChange(courseId: number): void {
    const course = this.courses().find(c => c.id === courseId);
    const name = course ? `${course.name} - Grupo 01` : '';
    this.patchDraft({ courseId, name: this.draft().name || name });
  }

  onCampusChange(campusId: number): void {
    this.patchDraft({ campusId, roomId: 0 });
    if (campusId) {
      this.classService.getRoomsByCampus(campusId, this.draft().courseId || undefined)
        .subscribe(r => this.rooms.set(r));
    } else {
      this.rooms.set([]);
    }
  }

  invalidateSessions(): void {
    this.sessionsStale.set(true);
    this.patchDraft({ sessions: [] });
  }

  generateSessions(): void {
    const d = this.draft();
    const sessions = this.scheduleService.generateSessions(
      0,
      d.startDate,
      d.endDate,
      d.scheduleRules,
      d.teacherId,
      d.roomId || undefined,
    );
    this.patchDraft({ sessions });
    this.sessionsStale.set(false);
    this.runAvailabilityChecks();
  }

  runAvailabilityChecks(): void {
    const d = this.draft();
    const period = this.selectedPeriod();
    if (!period || !d.teacherId) return;

    const periodConflicts = this.scheduleService.validatePeriodDates(
      d.startDate, d.endDate, period.startDate, period.endDate,
    );
    const scheduleConflicts = this.scheduleService.validateSchedule(d.scheduleRules);

    this.availabilityService.validateAll(
      {
        teacherId: d.teacherId,
        startDate: d.startDate,
        endDate: d.endDate,
        scheduleRules: d.scheduleRules,
      },
      d.roomId ? {
        roomId: d.roomId,
        startDate: d.startDate,
        endDate: d.endDate,
        scheduleRules: d.scheduleRules,
      } : undefined,
      d.scheduleRules,
      periodConflicts,
    ).subscribe(all => {
      this.conflicts.set([...scheduleConflicts, ...all]);
    });
  }

  goToStep(step: CreateWizardStep): void {
    const currentIdx = this.steps.findIndex(s => s.id === this.currentStep());
    const targetIdx = this.steps.findIndex(s => s.id === step);
    if (targetIdx <= currentIdx || this.validateStep(this.currentStep())) {
      this.currentStep.set(step);
      if (step === 'sessions' && this.sessionsStale()) {
        this.generateSessions();
      }
      if (step === 'summary') {
        this.runAvailabilityChecks();
      }
    }
  }

  nextStep(): void {
    if (!this.validateStep(this.currentStep())) return;
    const idx = this.steps.findIndex(s => s.id === this.currentStep());
    if (idx < this.steps.length - 1) {
      const next = this.steps[idx + 1].id;
      this.currentStep.set(next);
      if (next === 'sessions' && this.sessionsStale()) {
        this.generateSessions();
      }
      if (next === 'summary') {
        this.runAvailabilityChecks();
      }
    }
  }

  prevStep(): void {
    const idx = this.steps.findIndex(s => s.id === this.currentStep());
    if (idx > 0) {
      this.currentStep.set(this.steps[idx - 1].id);
    }
  }

  validateStep(step: CreateWizardStep): boolean {
    const d = this.draft();
    const errors: string[] = [];

    switch (step) {
      case 'general':
        if (!d.periodId) errors.push('Seleccione un periodo.');
        if (!d.activityId) errors.push('Seleccione una actividad.');
        if (!d.courseId) errors.push('Seleccione un curso.');
        if (!d.name.trim()) errors.push('Ingrese el nombre de la clase.');
        if (!d.modality) errors.push('Seleccione la modalidad.');
        break;
      case 'schedule':
        if (!d.startDate || !d.endDate) errors.push('Indique fecha de inicio y fin.');
        if (d.scheduleRules.length === 0) errors.push('Configure al menos un día con horario.');
        errors.push(...this.scheduleService.validateSchedule(d.scheduleRules).map(c => c.message));
        if (this.selectedPeriod()) {
          errors.push(...this.scheduleService.validatePeriodDates(
            d.startDate, d.endDate,
            this.selectedPeriod()!.startDate,
            this.selectedPeriod()!.endDate,
          ).map(c => c.message));
        }
        break;
      case 'teacher':
        if (!d.teacherId) errors.push('Seleccione un profesor.');
        if (d.modality === ClassModality.ONSITE || d.modality === ClassModality.HYBRID) {
          if (!d.campusId) errors.push('Seleccione una sede.');
          if (!d.roomId) errors.push('Seleccione un ambiente.');
        }
        if (d.modality === ClassModality.ONLINE || d.modality === ClassModality.HYBRID) {
          if (!d.platform.trim()) errors.push('Indique la plataforma virtual.');
        }
        break;
      case 'capacity':
        if (!d.capacity || d.capacity < 1) errors.push('Indique la capacidad máxima.');
        if (d.minimumCapacity && d.minimumCapacity > d.capacity) {
          errors.push('El cupo mínimo no puede superar la capacidad máxima.');
        }
        break;
      case 'configuration':
        if (d.enrollmentEnabled) {
          if (!d.enrollmentStartDate || !d.enrollmentEndDate) {
            errors.push('Indique las fechas de inscripción.');
          }
        }
        break;
      case 'sessions':
        if (d.sessions.length === 0) errors.push('Genere las sesiones antes de continuar.');
        break;
      case 'summary':
        if (this.conflicts().length > 0) {
          errors.push('Resuelva los conflictos antes de crear la clase.');
        }
        break;
    }

    const unique = [...new Set(errors)];
    this.stepErrors.set(unique);
    return unique.length === 0;
  }

  canCreate(): boolean {
    return this.steps.every(s => this.validateStepSilent(s.id)) && this.conflicts().length === 0;
  }

  private validateStepSilent(step: CreateWizardStep): boolean {
    const prev = this.stepErrors();
    const ok = this.validateStep(step);
    this.stepErrors.set(prev);
    return ok;
  }

  buildRequest(): CreateClassRequest {
    const d = this.draft();
    return {
      name: d.name.trim(),
      description: d.description.trim() || undefined,
      periodId: d.periodId,
      activityId: d.activityId,
      courseId: d.courseId,
      teacherId: d.teacherId,
      modality: d.modality,
      campusId: d.campusId || undefined,
      roomId: d.roomId || undefined,
      platform: d.platform || undefined,
      accessInfo: d.accessInfo || undefined,
      startDate: d.startDate,
      endDate: d.endDate,
      scheduleRules: d.scheduleRules,
      capacity: d.capacity,
      minimumCapacity: d.minimumCapacity,
      warningCapacity: d.warningCapacity,
      waitingListEnabled: d.waitingListEnabled,
      waitingListMax: d.waitingListMax,
      overbookingPolicy: d.overbookingPolicy,
      enrollmentEnabled: d.enrollmentEnabled,
      enrollmentStartDate: d.enrollmentStartDate || undefined,
      enrollmentEndDate: d.enrollmentEndDate || undefined,
      publicationChannels: d.publicationChannels,
      sessions: d.sessions,
    };
  }

  submit(): void {
    if (!this.canCreate()) {
      this.validateStep('summary');
      return;
    }
    this.loading.set(true);
    this.classService.createClass(this.buildRequest()).subscribe({
      next: created => {
        const sessions = this.draft().sessions;
        if (sessions.length > 0) {
          this.sessionService.saveSessionsForClass(created.id, sessions);
        }
        this.loading.set(false);
        this.createdClass.set({
          id: created.id,
          code: created.code,
          name: created.name,
          sessions: sessions.length,
        });
      },
      error: () => this.loading.set(false),
    });
  }

  viewCreated(): void {
    const c = this.createdClass();
    if (c) this.router.navigate(['/clases', c.id]);
  }

  reset(): void {
    this.draft.set({ ...EMPTY_DRAFT });
    this.currentStep.set('general');
    this.conflicts.set([]);
    this.createdClass.set(null);
    this.sessionsStale.set(true);
    this.init();
  }
}
