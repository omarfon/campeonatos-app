import { Injectable, computed, inject, signal } from '@angular/core';
import { StudentEnrollmentService } from '../services/student-enrollment.service';
import {
  StudentEnrollmentWizardStep,
  STUDENT_ENROLLMENT_WIZARD_STEPS,
} from '../enums/student-enrollment-wizard-step.enum';
import {
  EnrollmentCalculation,
  StudentAgreement,
  StudentClass,
  StudentCourse,
  StudentEnrollmentContext,
  StudentEnrollmentExtra,
  StudentEnrollment,
  EnrollmentRequest,
} from '../models/student-portal.model';

@Injectable()
export class StudentEnrollmentFacade {
  private readonly enrollmentService = inject(StudentEnrollmentService);

  readonly currentStep = signal<StudentEnrollmentWizardStep>('benefits');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly context = signal<StudentEnrollmentContext | null>(null);
  readonly agreements = signal<StudentAgreement[]>([]);
  readonly selectedAgreementId = signal<number | null | undefined>(undefined);
  readonly agreementChosen = signal(false);
  readonly courses = signal<StudentCourse[]>([]);
  readonly selectedCourse = signal<StudentCourse | null>(null);
  readonly selectedModality = signal('');
  readonly selectedCampus = signal('');
  readonly classes = signal<StudentClass[]>([]);
  readonly selectedClass = signal<StudentClass | null>(null);
  readonly extras = signal<StudentEnrollmentExtra[]>([]);
  readonly calculation = signal<EnrollmentCalculation | null>(null);
  readonly confirmedEnrollment = signal<StudentEnrollment | null>(null);
  readonly paymentMethod = signal<'cash' | 'card' | 'transfer'>('card');
  readonly preselectedCourseId = signal<number | null>(null);
  private readonly initialCourseId = signal<number | null>(null);

  readonly steps = STUDENT_ENROLLMENT_WIZARD_STEPS;

  readonly selectedAgreement = computed(() => {
    const id = this.selectedAgreementId();
    return id ? this.agreements().find(a => a.id === id) ?? null : null;
  });

  readonly isFullyCovered = computed(() => this.calculation()?.fullyCovered ?? false);

  readonly modalities = computed(() => [...new Set(this.courses().map(c => c.modality))]);
  readonly campuses = computed(() => {
    const modality = this.selectedModality();
    let list = this.courses();
    if (modality) list = list.filter(c => c.modality === modality);
    return [...new Set(list.map(c => c.campus))];
  });

  readonly filteredCourses = computed(() => {
    let list = this.courses();
    const modality = this.selectedModality();
    const campus = this.selectedCampus();
    if (modality) list = list.filter(c => c.modality === modality);
    if (campus) list = list.filter(c => c.campus === campus);
    return list;
  });

  init(options?: { preselectedCourseId?: number; preselectedAgreementId?: number | null }): void {
    if (options?.preselectedCourseId) {
      this.initialCourseId.set(options.preselectedCourseId);
      this.preselectedCourseId.set(options.preselectedCourseId);
    }
    if (options?.preselectedAgreementId !== undefined) {
      this.selectedAgreementId.set(options.preselectedAgreementId);
      this.agreementChosen.set(true);
    }
    this.loading.set(true);
    this.enrollmentService.getEnrollmentContext().subscribe({
      next: ctx => {
        this.context.set(ctx);
        this.enrollmentService.getAvailableAgreements().subscribe(agreements => {
          this.agreements.set(agreements);
          if (agreements.length === 0) {
            this.agreementChosen.set(true);
            this.selectedAgreementId.set(null);
          }
          const shouldLoadCourses = !!this.preselectedCourseId()
            || options?.preselectedAgreementId !== undefined
            || this.agreementChosen();
          if (shouldLoadCourses) {
            this.loadCourses();
          } else {
            this.loading.set(false);
          }
        });
      },
      error: () => {
        this.error.set('No pudimos cargar la información de matrícula.');
        this.loading.set(false);
      },
    });
  }

  selectAgreement(id: number | null): void {
    this.invalidateFrom('agreement');
    this.selectedAgreementId.set(id);
    this.agreementChosen.set(true);
    if (this.initialCourseId()) {
      this.preselectedCourseId.set(this.initialCourseId());
    }
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading.set(true);
    this.enrollmentService.getAvailableCourses(this.selectedAgreementId()).subscribe({
      next: list => {
        this.courses.set(list);
        this.applyPreselectedCourse(list);
        this.loading.set(false);
      },
    });
  }

  private applyPreselectedCourse(list: StudentCourse[]): void {
    const preId = this.preselectedCourseId() ?? this.initialCourseId();
    if (!preId) return;
    const course = list.find(c => c.id === preId);
    if (course) {
      this.selectedCourse.set(course);
      this.selectedModality.set(course.modality);
      this.selectedCampus.set(course.campus);
      this.preselectedCourseId.set(null);
    }
  }

  selectCourse(course: StudentCourse): void {
    this.invalidateFrom('course');
    this.selectedCourse.set(course);
    this.selectedModality.set(course.modality);
    this.selectedCampus.set(course.campus);
    this.loadClasses();
  }

  setModality(modality: string): void {
    this.selectedModality.set(modality);
    this.selectedCourse.set(null);
    this.selectedClass.set(null);
    if (modality === 'Virtual') this.selectedCampus.set('');
  }

  setCampus(campus: string): void {
    this.selectedCampus.set(campus);
    this.selectedCourse.set(null);
    this.selectedClass.set(null);
  }

  loadClasses(filters?: { modality?: string; campus?: string; frequency?: string }): void {
    const course = this.selectedCourse();
    if (!course) return;
    this.loading.set(true);
    this.enrollmentService.getAvailableClasses(course.id, this.selectedAgreementId(), filters).subscribe({
      next: list => {
        this.classes.set(list);
        this.loading.set(false);
      },
    });
  }

  selectClass(cls: StudentClass): void {
    this.selectedClass.set(cls);
    this.calculation.set(null);
  }

  loadExtras(): void {
    this.enrollmentService.getExtras().subscribe(list => this.extras.set(list));
  }

  toggleExtra(id: number): void {
    this.extras.update(list =>
      list.map(e => e.id === id ? { ...e, selected: !e.selected } : e),
    );
    this.calculation.set(null);
  }

  calculate(): void {
    const course = this.selectedCourse();
    const cls = this.selectedClass();
    if (!course || !cls) return;
    this.loading.set(true);
    this.enrollmentService.calculateEnrollment({
      courseId: course.id,
      classId: cls.id,
      agreementId: this.selectedAgreementId(),
      extraIds: this.extras().filter(e => e.selected).map(e => e.id),
    }).subscribe({
      next: calc => {
        this.calculation.set(calc);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No pudimos calcular el total de tu matrícula.');
        this.loading.set(false);
      },
    });
  }

  confirm(): void {
    const course = this.selectedCourse();
    const cls = this.selectedClass();
    if (!course || !cls) return;
    this.loading.set(true);
    const request: EnrollmentRequest = {
      courseId: course.id,
      classId: cls.id,
      agreementId: this.selectedAgreementId(),
      extraIds: this.extras().filter(e => e.selected).map(e => e.id),
      paymentMethod: this.isFullyCovered() ? 'other' : this.paymentMethod(),
    };
    this.enrollmentService.confirmEnrollment(request).subscribe({
      next: enrollment => {
        this.confirmedEnrollment.set(enrollment);
        this.currentStep.set('confirmation');
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No pudimos confirmar tu matrícula. Intenta nuevamente.');
        this.loading.set(false);
      },
    });
  }

  nextStep(): void {
    const order = this.steps.map(s => s.id);
    let idx = order.indexOf(this.currentStep());
    if (idx < order.length - 1) {
      let next = order[idx + 1];
      if (next === 'course' && this.selectedCourse()) {
        next = order[idx + 2] ?? next;
      }
      this.currentStep.set(next);
      this.onEnterStep(next);
    }
  }

  prevStep(): void {
    const order = this.steps.map(s => s.id);
    const idx = order.indexOf(this.currentStep());
    if (idx > 0) this.currentStep.set(order[idx - 1]);
  }

  canContinue(): boolean {
    switch (this.currentStep()) {
      case 'benefits': return this.agreementChosen() || this.agreements().length === 0;
      case 'course': return !!this.selectedCourse();
      case 'modality': return !!this.selectedModality() && (this.selectedModality() === 'Virtual' || !!this.selectedCampus());
      case 'schedule': return !!this.selectedClass();
      case 'extras': return true;
      case 'summary': return !!this.calculation();
      case 'payment': return this.isFullyCovered() || !!this.paymentMethod();
      default: return false;
    }
  }

  private onEnterStep(step: StudentEnrollmentWizardStep): void {
    if (step === 'course' && this.courses().length === 0) this.loadCourses();
    if (step === 'schedule' && this.selectedCourse()) this.loadClasses();
    if (step === 'extras') this.loadExtras();
    if (step === 'summary' && !this.calculation()) this.calculate();
  }

  private invalidateFrom(from: 'agreement' | 'course'): void {
    if (from === 'agreement') {
      this.selectedCourse.set(null);
      this.selectedClass.set(null);
      this.courses.set([]);
      this.classes.set([]);
    }
    if (from === 'course') {
      this.selectedClass.set(null);
      this.classes.set([]);
    }
    this.calculation.set(null);
  }
}
