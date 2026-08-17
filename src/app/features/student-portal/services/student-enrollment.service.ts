import { Injectable, inject } from '@angular/core';
import { delay, map, Observable, of, switchMap, catchError } from 'rxjs';
import {
  StudentCourse,
  StudentClass,
  StudentEnrollmentContext,
  StudentAgreement,
  StudentEnrollment,
  EnrollmentCalculation,
  EnrollmentCalculationRequest,
  EnrollmentRequest,
  StudentEnrollmentExtra,
} from '../models/student-portal.model';
import { StudentSessionService } from './student-session.service';
import { EnrollmentContextService } from '../../matricula/services/enrollment-context.service';
import { EnrollmentAgreementService } from '../../matricula/services/enrollment-agreement.service';
import { EnrollmentCourseService } from '../../matricula/services/enrollment-course.service';
import { EnrollmentClassService } from '../../matricula/services/enrollment-class.service';
import { EnrollmentChargeService } from '../../matricula/services/enrollment-charge.service';
import { EnrollmentStudentService } from '../../matricula/services/enrollment-student.service';
import { EnrollmentService } from '../../matricula/services/enrollment.service';
import {
  MOCK_PORTAL_COURSES,
  MOCK_PORTAL_ENROLLMENTS,
  MOCK_PORTAL_EXTRAS,
  MOCK_PORTAL_PROFILE,
} from '../mocks/student-portal.mock';
import { EnrollmentStatus } from '../../matricula/enums/enrollment-status.enum';
import { StudentCourseStatus } from '../enums/student-course-status.enum';
import { EnrollmentAgreement, EnrollmentClass, EnrollmentCourse, EnrollmentStudent } from '../../matricula/models/enrollment.model';
import { MOCK_ENROLLMENT_COURSES } from '../../matricula/mocks/enrollment.mock';

@Injectable({ providedIn: 'root' })
export class StudentEnrollmentService {
  private readonly sessionService = inject(StudentSessionService);
  private readonly contextService = inject(EnrollmentContextService);
  private readonly agreementService = inject(EnrollmentAgreementService);
  private readonly courseService = inject(EnrollmentCourseService);
  private readonly classService = inject(EnrollmentClassService);
  private readonly chargeService = inject(EnrollmentChargeService);
  private readonly studentService = inject(EnrollmentStudentService);
  private readonly enrollmentService = inject(EnrollmentService);

  getMyEnrollments(): Observable<StudentEnrollment[]> {
    this.sessionService.requireStudentId();
    return of([...MOCK_PORTAL_ENROLLMENTS]).pipe(delay(200));
  }

  getEnrollment(id: number): Observable<StudentEnrollment | undefined> {
    this.sessionService.requireStudentId();
    return of(MOCK_PORTAL_ENROLLMENTS.find(e => e.id === id)).pipe(delay(150));
  }

  getEnrollmentContext(): Observable<StudentEnrollmentContext> {
    let studentId: number;
    try {
      studentId = this.sessionService.requireStudentId();
    } catch {
      return of({
        canEnroll: false,
        isNewStudent: false,
        isRegularStudent: false,
        settlementOpen: false,
        blockedMessage: undefined,
        availableAgreementsCount: 0,
      } satisfies StudentEnrollmentContext).pipe(delay(0));
    }
    return this.studentService.getById(studentId).pipe(
      switchMap(student => {
        if (!student) {
          return of({
            canEnroll: false,
            isNewStudent: false,
            isRegularStudent: false,
            settlementOpen: false,
            blockedMessage: 'No pudimos verificar tu información. Comunícate con Administración.',
            availableAgreementsCount: 0,
          } satisfies StudentEnrollmentContext);
        }
        return this.contextService.getContext().pipe(
          switchMap(ctx => this.agreementService.getAvailableAgreements(studentId).pipe(
            map(agreements => this.buildContext(student, ctx.settlementOpen, agreements)),
          )),
        );
      }),
      delay(300),
    );
  }

  getAvailableAgreements(): Observable<StudentAgreement[]> {
    let studentId: number;
    try {
      studentId = this.sessionService.requireStudentId();
    } catch {
      return of([]).pipe(delay(0));
    }
    return this.agreementService.getAvailableAgreements(studentId).pipe(
      map(list => list.map(a => this.mapAgreement(a))),
      delay(200),
    );
  }

  /** Catálogo de cursos para el hub — no requiere sesión activa. */
  getCatalogCourses(agreementId?: number | null): Observable<StudentCourse[]> {
    const agreement$ = agreementId
      ? this.agreementService.getById(agreementId).pipe(map(a => a ?? undefined))
      : of(undefined);
    return agreement$.pipe(
      switchMap(agreement =>
        this.courseService.getCourses(undefined, agreement).pipe(
          map(courses => courses.map(c => this.mapCourse(c))),
        ),
      ),
      catchError(() => of(MOCK_ENROLLMENT_COURSES.map(c => this.mapCourse(c)))),
      delay(150),
    );
  }

  getAvailableCourses(agreementId?: number | null): Observable<StudentCourse[]> {
    try {
      this.sessionService.requireStudentId();
    } catch {
      return this.getCatalogCourses(agreementId);
    }
    return this.getCatalogCourses(agreementId);
  }

  getRecommendedCourse(agreementId?: number | null): Observable<StudentCourse | undefined> {
    return this.getAvailableCourses(agreementId).pipe(
      map(courses => courses.find(c => c.recommended) ?? courses[0]),
    );
  }

  getAvailableClasses(courseId: number, agreementId?: number | null, filters?: { modality?: string; campus?: string; frequency?: string }): Observable<StudentClass[]> {
    this.sessionService.requireStudentId();
    const agreement$ = agreementId
      ? this.agreementService.getById(agreementId).pipe(map(a => a ?? undefined))
      : of(undefined);
    return agreement$.pipe(
      switchMap(agreement =>
        this.classService.getAvailableClasses(courseId, filters, agreement).pipe(
          map(classes => classes.map(c => this.mapClass(c, courseId))),
        ),
      ),
      delay(250),
    );
  }

  getExtras(): Observable<StudentEnrollmentExtra[]> {
    this.sessionService.requireStudentId();
    return of(MOCK_PORTAL_EXTRAS.map(e => ({ ...e }))).pipe(delay(150));
  }

  calculateEnrollment(request: EnrollmentCalculationRequest): Observable<EnrollmentCalculation> {
    const studentId = this.sessionService.requireStudentId();
    return this.studentService.getById(studentId).pipe(
      switchMap(student => {
        if (!student) throw new Error('Estudiante no encontrado');
        return this.courseService.getById(request.courseId).pipe(
          switchMap(course => {
            if (!course) throw new Error('Curso no encontrado');
            const agreement$ = request.agreementId
              ? this.agreementService.getById(request.agreementId).pipe(map(a => a ?? undefined))
              : of(undefined);
            return agreement$.pipe(
              switchMap(agreement =>
                this.chargeService.generateCharges(student, course, agreement).pipe(
                  map(charges => {
                    let lines = charges.map(c => ({
                      conceptCode: c.conceptCode,
                      conceptName: c.conceptName,
                      amount: c.finalAmount,
                      isDiscount: c.discountAmount > 0 && c.agreementBenefit ? true : undefined,
                      isRegistrationFee: c.registrationFee ? true : undefined,
                    }));
                    const extras = MOCK_PORTAL_EXTRAS.filter(e => request.extraIds?.includes(e.id));
                    for (const extra of extras) {
                      lines = [...lines, {
                        conceptCode: `EXTRA-${extra.id}`,
                        conceptName: extra.name,
                        amount: extra.price,
                        isDiscount: undefined,
                        isRegistrationFee: undefined,
                      }];
                    }
                    const totals = this.chargeService.calculateTotals(charges);
                    const extrasTotal = extras.reduce((s, e) => s + e.price, 0);
                    const total = totals.total + extrasTotal;
                    const fullyCovered = agreement
                      ? this.chargeService.isFullyCoveredByAgreement(charges, agreement)
                      : false;
                    return {
                      lines,
                      subtotal: totals.subtotal + extrasTotal,
                      discount: totals.discount,
                      total: fullyCovered ? 0 : total,
                      fullyCovered,
                    } satisfies EnrollmentCalculation;
                  }),
                ),
              ),
            );
          }),
        );
      }),
      delay(400),
    );
  }

  createPaymentIntent(amount: number): Observable<{ id: string; amount: number }> {
    this.sessionService.requireStudentId();
    return of({ id: `pi_mock_${Date.now()}`, amount }).pipe(delay(300));
  }

  processPayment(method: string, amount: number): Observable<{ success: boolean; reference: string }> {
    this.sessionService.requireStudentId();
    return of({ success: true, reference: `TRX-${Date.now()}` }).pipe(delay(600));
  }

  confirmEnrollment(request: EnrollmentRequest): Observable<StudentEnrollment> {
    const studentId = this.sessionService.requireStudentId();
    return this.calculateEnrollment(request).pipe(
      switchMap(calc =>
        this.classService.getById(request.classId).pipe(
          switchMap(cls => {
            if (!cls) throw new Error('Clase no encontrada');
            return this.courseService.getById(request.courseId).pipe(
              map(course => {
                const newId = MOCK_PORTAL_ENROLLMENTS.length + 1;
                const enrollment: StudentEnrollment = {
                  id: newId,
                  code: `MAT-2026-${String(newId).padStart(6, '0')}`,
                  courseName: course?.name ?? 'Curso',
                  className: cls.name,
                  schedule: cls.schedule,
                  campus: cls.campus,
                  environment: cls.environment,
                  teacher: cls.teacher,
                  period: 'Octubre 2026',
                  status: EnrollmentStatus.CONFIRMED,
                  subtotal: calc.subtotal,
                  discount: calc.discount,
                  total: calc.total,
                  createdAt: new Date().toISOString().slice(0, 10),
                  confirmedAt: new Date().toISOString().slice(0, 10),
                  startDate: '2026-10-01',
                  lines: calc.lines,
                };
                MOCK_PORTAL_ENROLLMENTS.unshift(enrollment);
                if (!MOCK_PORTAL_PROFILE.isRegularStudent) {
                  this.studentService.markAsRegular(studentId);
                }
                return enrollment;
              }),
            );
          }),
        ),
      ),
      delay(500),
    );
  }

  private buildContext(
    student: EnrollmentStudent,
    settlementOpen: boolean,
    agreements: EnrollmentAgreement[],
  ): StudentEnrollmentContext {
    const blocked = student.status === 'blocked';
    const canEnroll = settlementOpen && !blocked && student.status === 'active';
    const recommended = MOCK_PORTAL_COURSES.find(c => c.recommended);
    return {
      canEnroll,
      isNewStudent: !student.isRegularStudent,
      isRegularStudent: student.isRegularStudent,
      settlementOpen,
      blockedMessage: blocked
        ? 'Por el momento no puedes continuar con esta matrícula. Comunícate con Administración para obtener más información.'
        : !settlementOpen
          ? 'El periodo de matrícula no está disponible en este momento. Inténtalo más tarde.'
          : undefined,
      welcomeMessage: !student.isRegularStudent
        ? 'Esta será tu primera matrícula. Te ayudaremos a seleccionar una opción adecuada para comenzar.'
        : undefined,
      continueMessage: student.isRegularStudent
        ? 'Continúa con tu formación.'
        : undefined,
      lastCourse: student.lastCourseName
        ? { name: student.lastCourseName, status: student.lastEnrollmentStatus ?? 'Completado' }
        : undefined,
      recommendedCourse: recommended,
      availableAgreementsCount: agreements.length,
    };
  }

  private mapAgreement(a: EnrollmentAgreement): StudentAgreement {
    return {
      id: a.id,
      name: a.name,
      company: a.company,
      description: a.description,
      benefitSummary: a.benefitSummary,
      coveragePercentage: a.coveragePercentage,
      validFrom: a.validFrom,
      validTo: a.validTo,
    };
  }

  private mapCourse(c: EnrollmentCourse): StudentCourse {
    const portalCourse = MOCK_PORTAL_COURSES.find(p => p.code === c.code);
    const descriptions: Record<string, string> = {
      'NAT-BAS': 'Aprende los fundamentos de la natación en un entorno seguro y guiado.',
      'NAT-INT': 'Perfecciona tu técnica y resistencia en piscina con instructores certificados.',
      'NAT-AVZ': 'Entrena a nivel avanzado con rutinas exigentes y seguimiento personalizado.',
      'KAR-INI': 'Iníciate en karate: disciplina, coordinación y valores deportivos.',
      'KAR-INT': 'Desarrolla katas, combate controlado y preparación física integral.',
      'GYM-BAS': 'Mejora fuerza, resistencia y movilidad con entrenamiento funcional.',
      'GYM-VIR': 'Entrena desde casa con sesiones en vivo y plan personalizado.',
      'NAT-VAC': 'Programa intensivo de verano para todas las edades.',
      'DAN-BAS': 'Expresión corporal, ritmo y técnica de danza para principiantes.',
      'TEN-INI': 'Domina golpes básicos, footwork y reglas del tenis desde cero.',
    };
    return {
      id: c.id,
      name: c.name,
      code: c.code,
      status: StudentCourseStatus.ACTIVE,
      teacher: 'Por asignar',
      schedule: '',
      days: '',
      timeStart: '',
      timeEnd: '',
      campus: c.campus,
      environment: '',
      period: 'Octubre 2026',
      attendancePercentage: 0,
      modality: c.modality,
      level: c.level,
      discipline: c.discipline,
      description: portalCourse?.description ?? descriptions[c.code] ?? `Curso de ${c.discipline} — nivel ${c.level}.`,
      duration: portalCourse?.duration ?? 'Mensual',
      basePrice: c.basePrice,
      recommended: portalCourse?.recommended ?? c.level === 'Intermedio',
    };
  }

  private mapClass(c: EnrollmentClass, courseId: number): StudentClass {
    const course = MOCK_PORTAL_COURSES.find(p => p.id === courseId);
    return {
      id: c.id,
      courseId: c.courseId,
      courseName: course?.name ?? c.name,
      name: c.name,
      days: c.days,
      timeStart: c.timeStart,
      timeEnd: c.timeEnd,
      campus: c.campus,
      environment: c.environment,
      teacher: c.teacher,
      capacity: c.capacity,
      enrolled: c.enrolled,
      available: c.available,
      modality: c.modality,
      frequency: c.frequency,
      startDate: '2026-10-01',
    };
  }
}
