import { Injectable, computed, inject, signal } from '@angular/core';
import { EnrollmentStatus } from '../enums/enrollment-status.enum';
import {
  Enrollment,
  EnrollmentAgreement,
  EnrollmentCharge,
  EnrollmentClass,
  EnrollmentContext,
  EnrollmentCourse,
  EnrollmentPayment,
  EnrollmentStudent,
  EnrollmentValidationResult,
  PaymentRequest,
  StudentSettlementStatus,
  WizardStep,
  WIZARD_STEPS,
} from '../models/enrollment.model';
import { EnrollmentContextService } from '../services/enrollment-context.service';
import { EnrollmentStudentService } from '../services/enrollment-student.service';
import { EnrollmentAgreementService } from '../services/enrollment-agreement.service';
import { EnrollmentRuleService } from '../services/enrollment-rule.service';
import { EnrollmentCourseService } from '../services/enrollment-course.service';
import { EnrollmentClassService } from '../services/enrollment-class.service';
import { EnrollmentChargeService } from '../services/enrollment-charge.service';
import { EnrollmentPaymentService } from '../services/enrollment-payment.service';
import { EnrollmentService } from '../services/enrollment.service';
import { EnrollmentHistoryService } from '../services/enrollment-history.service';

@Injectable()
export class EnrollmentWizardFacade {
  private readonly contextService = inject(EnrollmentContextService);
  private readonly studentService = inject(EnrollmentStudentService);
  private readonly agreementService = inject(EnrollmentAgreementService);
  private readonly ruleService = inject(EnrollmentRuleService);
  private readonly courseService = inject(EnrollmentCourseService);
  private readonly classService = inject(EnrollmentClassService);
  private readonly chargeService = inject(EnrollmentChargeService);
  private readonly paymentService = inject(EnrollmentPaymentService);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly historyService = inject(EnrollmentHistoryService);

  readonly currentStep = signal<WizardStep>('student');
  readonly loading = signal(false);
  readonly loadingMessage = signal('');
  readonly error = signal<string | null>(null);

  readonly context = signal<EnrollmentContext | null>(null);
  readonly student = signal<EnrollmentStudent | null>(null);
  readonly studentSettlement = signal<StudentSettlementStatus | null>(null);
  readonly enrollment = signal<Enrollment | null>(null);
  readonly agreements = signal<EnrollmentAgreement[]>([]);
  readonly selectedAgreementId = signal<number | null>(null);
  readonly agreementValidated = signal(false);
  readonly validationResults = signal<EnrollmentValidationResult | null>(null);
  readonly course = signal<EnrollmentCourse | null>(null);
  readonly selectedClass = signal<EnrollmentClass | null>(null);
  readonly charges = signal<EnrollmentCharge[]>([]);
  readonly payment = signal<EnrollmentPayment | null>(null);
  readonly confirmed = signal(false);
  readonly becameRegular = signal(false);

  readonly selectedAgreement = computed(() => {
    const id = this.selectedAgreementId();
    return id ? this.agreements().find(a => a.id === id) ?? null : null;
  });

  readonly totals = computed(() => this.chargeService.calculateTotals(this.charges()));

  readonly isFullyCovered = computed(() =>
    this.chargeService.isFullyCoveredByAgreement(this.charges(), this.selectedAgreement() ?? undefined),
  );

  readonly progressItems = computed(() => {
    const ctx = this.context();
    const st = this.student();
    const settlement = this.studentSettlement();
    const agr = this.selectedAgreementId();
    const val = this.validationResults();
    const crs = this.course();
    const cls = this.selectedClass();
    const chg = this.charges();
    const pay = this.payment();
    return [
      { label: 'Estudiante seleccionado', done: !!st },
      { label: 'Estudiante liquidado', done: !!settlement?.isSettled },
      { label: 'Liquidación de periodo abierta', done: !!ctx?.settlementOpen },
      { label: 'Convenio validado', done: agr === null || this.agreementValidated() },
      { label: 'Reglas aprobadas', done: !!val?.valid },
      { label: 'Curso seleccionado', done: !!crs },
      { label: 'Clase seleccionada', done: !!cls },
      { label: 'Cobranza', done: chg.length > 0 },
      { label: 'Pago', done: !!pay || this.isFullyCovered() },
    ];
  });

  readonly canContinue = computed(() => {
    const step = this.currentStep();
    switch (step) {
      case 'student':
        return !!this.student() && !!this.studentSettlement()?.isSettled;
      case 'context':
        return !!this.context()?.settlementOpen;
      case 'agreement':
        return this.selectedAgreementId() === null || this.agreementValidated();
      case 'validation':
        return !!this.validationResults()?.valid;
      case 'course':
        return !!this.course();
      case 'class':
        return !!this.selectedClass();
      case 'charges':
        return this.charges().length > 0;
      case 'payment':
        return !!this.payment() || this.isFullyCovered();
      case 'confirmation':
        return this.confirmed();
      default:
        return false;
    }
  });

  readonly steps = WIZARD_STEPS;

  init(): void {
    this.loading.set(true);
    this.loadingMessage.set('Cargando contexto...');
    this.contextService.getContext().subscribe({
      next: ctx => {
        this.context.set(ctx);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar contexto');
        this.loading.set(false);
      },
    });
  }

  goToStep(step: WizardStep): void {
    if (step !== 'student' && !this.student()) return;
    this.currentStep.set(step);
    this.onEnterStep(step);
  }

  nextStep(): void {
    const order = WIZARD_STEPS.map(s => s.id);
    const idx = order.indexOf(this.currentStep());
    if (idx < order.length - 1 && this.canContinue()) {
      this.currentStep.set(order[idx + 1]);
      this.onEnterStep(order[idx + 1]);
    }
  }

  prevStep(): void {
    const order = WIZARD_STEPS.map(s => s.id);
    const idx = order.indexOf(this.currentStep());
    if (idx > 0) this.currentStep.set(order[idx - 1]);
  }

  selectStudent(s: EnrollmentStudent): void {
    this.invalidateFrom('student');
    this.student.set(s);
    this.loading.set(true);
    this.loadingMessage.set('Verificando estado del estudiante...');
    this.studentService.getSettlementStatus(s.id).subscribe(settlement => {
      this.studentSettlement.set(settlement);
      this.loadingMessage.set('Buscando convenios...');
      if (!this.enrollment()) {
        this.enrollmentService.startEnrollment(s.id).subscribe(e => {
          this.enrollment.set(e);
          this.historyService.addEntry(e.id, 'Estudiante seleccionado', `${s.firstName} ${s.lastName}`);
        });
      }
      this.agreementService.getAvailableAgreements(s.id).subscribe(list => {
        this.agreements.set(list);
        this.loading.set(false);
      });
    });
  }

  clearStudent(): void {
    this.invalidateFrom('student');
    this.student.set(null);
    this.studentSettlement.set(null);
    this.enrollment.set(null);
    this.currentStep.set('student');
  }

  selectAgreement(id: number | null): void {
    this.invalidateFrom('agreement');
    this.selectedAgreementId.set(id);
    this.agreementValidated.set(id === null);
    if (id === null) return;
    const st = this.student();
    if (!st) return;
    this.loading.set(true);
    this.loadingMessage.set('Validando convenio...');
    this.agreementService.validateAgreement(st.id, id).subscribe(result => {
      this.agreementValidated.set(result.valid);
      if (result.valid) {
        const agr = this.agreements().find(a => a.id === id);
        const enr = this.enrollment();
        if (enr && agr) {
          this.enrollment.set({ ...enr, agreementId: id });
          this.historyService.addEntry(enr.id, 'Convenio aplicado', agr.name);
        }
      }
      this.loading.set(false);
    });
  }

  runValidation(): void {
    const st = this.student();
    if (!st) return;
    this.loading.set(true);
    this.loadingMessage.set('Evaluando reglas...');
    this.ruleService.validateEnrollmentRules(st.id, this.course()?.id).subscribe(result => {
      this.validationResults.set(result);
      const enr = this.enrollment();
      if (enr) {
        this.historyService.addEntry(enr.id, 'Reglas validadas', `${result.results.length} reglas evaluadas`);
      }
      this.loading.set(false);
    });
  }

  loadCourses(filters?: Parameters<EnrollmentCourseService['getCourses']>[0]): void {
    this.loading.set(true);
    this.loadingMessage.set('Cargando cursos...');
    this.courseService.getCourses(filters, this.selectedAgreement() ?? undefined).subscribe(list => {
      this._coursesCache.set(list);
      this.loading.set(false);
    });
  }

  private readonly _coursesCache = signal<EnrollmentCourse[]>([]);
  readonly coursesCache = this._coursesCache.asReadonly();

  selectCourse(c: EnrollmentCourse): void {
    this.invalidateFrom('course');
    this.course.set(c);
    const enr = this.enrollment();
    if (enr) {
      this.enrollment.set({ ...enr, courseId: c.id, campus: c.campus });
    }
    this.loadClasses();
  }

  loadClasses(filters?: Parameters<EnrollmentClassService['getAvailableClasses']>[1]): void {
    const crs = this.course();
    if (!crs) return;
    this.loading.set(true);
    this.loadingMessage.set('Buscando clases...');
    this.classService.getAvailableClasses(crs.id, filters, this.selectedAgreement() ?? undefined).subscribe(list => {
      this._classesCache.set(list);
      this.loading.set(false);
    });
  }

  private readonly _classesCache = signal<EnrollmentClass[]>([]);
  readonly classesCache = this._classesCache.asReadonly();

  selectClass(c: EnrollmentClass): void {
    this.invalidateFrom('class');
    this.selectedClass.set(c);
    const enr = this.enrollment();
    if (enr) {
      this.enrollment.set({ ...enr, classId: c.id });
      this.historyService.addEntry(enr.id, 'Clase seleccionada', c.code);
    }
  }

  clearCourse(): void {
    this.invalidateFrom('course');
    this.course.set(null);
  }

  clearClass(): void {
    this.invalidateFrom('class');
    this.selectedClass.set(null);
  }

  generateCharges(): void {
    const st = this.student();
    const crs = this.course();
    if (!st || !crs) return;
    this.loading.set(true);
    this.loadingMessage.set('Calculando conceptos...');
    this.chargeService.generateCharges(st, crs, this.selectedAgreement() ?? undefined).subscribe(list => {
      this.charges.set(list);
      const { subtotal, discount, total } = this.chargeService.calculateTotals(list);
      const enr = this.enrollment();
      if (enr) {
        const updated = { ...enr, subtotal, discount, total };
        this.enrollment.set(updated);
        this.enrollmentService.updateEnrollment(updated);
        this.historyService.addEntry(enr.id, 'Conceptos generados', `${list.length} conceptos, total S/ ${total}`);
      }
      this.loading.set(false);
    });
  }

  saveDraft(): void {
    const enr = this.enrollment();
    if (enr) this.enrollmentService.saveDraft(enr).subscribe();
  }

  processPayment(request: PaymentRequest): void {
    const enr = this.enrollment();
    if (!enr) return;
    this.loading.set(true);
    this.loadingMessage.set('Procesando pago...');
    this.paymentService.processPayment(enr.id, request).subscribe(pay => {
      this.payment.set(pay);
      this.historyService.addEntry(enr.id, 'Pago confirmado', `${request.method} S/ ${request.amount}`);
      this.loading.set(false);
    });
  }

  confirmEnrollment(): void {
    const enr = this.enrollment();
    const st = this.student();
    if (!enr) return;
    this.loading.set(true);
    this.loadingMessage.set('Confirmando matrícula...');
    const wasNew = st && !st.isRegularStudent;
    if (this.isFullyCovered() && !this.payment()) {
      this.paymentService.processPayment(enr.id, { method: 'other', amount: 0 }).subscribe(pay => {
        this.payment.set(pay);
      });
    }
    this.enrollmentService.confirmEnrollment(enr.id).subscribe(confirmed => {
      this.enrollment.set(confirmed);
      this.confirmed.set(true);
      this.becameRegular.set(!!wasNew);
      this.loading.set(false);
      this.currentStep.set('confirmation');
    });
  }

  skipPaymentAndConfirm(): void {
    if (this.isFullyCovered()) {
      this.confirmEnrollment();
    }
  }

  private onEnterStep(step: WizardStep): void {
    if (step === 'validation' && !this.validationResults()) {
      this.runValidation();
    }
    if (step === 'course' && this._coursesCache().length === 0) {
      this.loadCourses();
    }
    if (step === 'class' && this.course() && this._classesCache().length === 0) {
      this.loadClasses();
    }
    if (step === 'charges' && this.charges().length === 0) {
      this.generateCharges();
    }
  }

  private invalidateFrom(from: 'student' | 'agreement' | 'course' | 'class'): void {
    if (from === 'student') {
      this.studentSettlement.set(null);
      this.selectedAgreementId.set(null);
      this.agreementValidated.set(false);
      this.agreements.set([]);
    }
    if (from === 'student' || from === 'agreement') {
      this.validationResults.set(null);
      this.course.set(null);
      this._coursesCache.set([]);
    }
    if (from === 'student' || from === 'agreement' || from === 'course') {
      this.selectedClass.set(null);
      this._classesCache.set([]);
    }
    if (from !== 'class') {
      this.charges.set([]);
      this.payment.set(null);
      this.confirmed.set(false);
      const enr = this.enrollment();
      if (enr && from !== 'course') {
        this.enrollment.set({ ...enr, subtotal: 0, discount: 0, total: 0, agreementId: undefined });
      }
    }
  }
}
