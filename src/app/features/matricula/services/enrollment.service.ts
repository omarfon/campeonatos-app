import { Injectable, computed, inject, signal } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { EnrollmentStatus } from '../enums/enrollment-status.enum';
import {
  Enrollment,
  EnrollmentAlert,
  EnrollmentDashboardStats,
  EnrollmentFilters,
  EnrollmentListItem,
} from '../models/enrollment.model';
import { ValidationSeverity } from '../enums/validation-severity.enum';
import {
  MOCK_ENROLLMENT_CLASSES,
  MOCK_ENROLLMENT_COURSES,
  MOCK_ENROLLMENT_AGREEMENTS,
  MOCK_ENROLLMENTS,
  MOCK_ENROLLMENT_STUDENTS,
} from '../mocks/enrollment.mock';
import { EnrollmentStudentService } from './enrollment-student.service';
import { EnrollmentHistoryService } from './enrollment-history.service';

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private readonly studentService = inject(EnrollmentStudentService);
  private readonly historyService = inject(EnrollmentHistoryService);

  private readonly _enrollments = signal<Enrollment[]>([...MOCK_ENROLLMENTS]);
  private _nextId = MOCK_ENROLLMENTS.length + 1;

  readonly enrollments = this._enrollments.asReadonly();

  readonly dashboardStats = computed((): EnrollmentDashboardStats => {
    const list = this._enrollments();
    const today = new Date().toISOString().slice(0, 10);
    const month = today.slice(0, 7);
    return {
      todayCount: list.filter(e => e.createdAt === today).length,
      monthCount: list.filter(e => e.createdAt.startsWith(month)).length,
      newStudents: list.filter(e => e.studentType === 'NEW').length,
      regularStudents: list.filter(e => e.studentType === 'REGULAR').length,
      pendingPayment: list.filter(e => e.status === EnrollmentStatus.PENDING_PAYMENT).length,
      confirmed: list.filter(e => e.status === EnrollmentStatus.CONFIRMED).length,
      withAgreement: list.filter(e => e.agreementId).length,
      cancelled: list.filter(e => e.status === EnrollmentStatus.CANCELLED).length,
    };
  });

  getEnrollments(filters?: EnrollmentFilters): Observable<EnrollmentListItem[]> {
    let list = this._enrollments().map(e => this.toListItem(e));
    if (filters?.code) {
      const q = filters.code.toLowerCase();
      list = list.filter(e => e.code.toLowerCase().includes(q));
    }
    if (filters?.student) {
      const q = filters.student.toLowerCase();
      list = list.filter(e => e.studentName.toLowerCase().includes(q));
    }
    if (filters?.document) {
      list = list.filter(e => e.studentDocument.includes(filters.document!));
    }
    if (filters?.courseId) list = list.filter(e => e.courseId === filters.courseId);
    if (filters?.classId) list = list.filter(e => e.classId === filters.classId);
    if (filters?.status) list = list.filter(e => e.status === filters.status);
    if (filters?.studentType) list = list.filter(e => e.studentType === filters.studentType);
    if (filters?.agreementId) list = list.filter(e => e.agreementId === filters.agreementId);
    if (filters?.campus) list = list.filter(e => e.campus === filters.campus);
    if (filters?.dateFrom) list = list.filter(e => e.createdAt >= filters.dateFrom!);
    if (filters?.dateTo) list = list.filter(e => e.createdAt <= filters.dateTo!);
    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return of(list).pipe(delay(200));
  }

  getEnrollment(id: number): Observable<EnrollmentListItem | undefined> {
    const e = this._enrollments().find(x => x.id === id);
    return of(e ? this.toListItem(e) : undefined).pipe(delay(100));
  }

  getRecent(limit = 10): Observable<EnrollmentListItem[]> {
    const list = [...this._enrollments()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit)
      .map(e => this.toListItem(e));
    return of(list).pipe(delay(150));
  }

  startEnrollment(studentId: number): Observable<Enrollment> {
    const student = MOCK_ENROLLMENT_STUDENTS.find(s => s.id === studentId);
    const enrollment: Enrollment = {
      id: this._nextId++,
      code: `MAT-2026-${String(this._nextId).padStart(6, '0')}`,
      studentId,
      studentType: student?.isRegularStudent ? 'REGULAR' : 'NEW',
      courseId: 0,
      classId: 0,
      status: EnrollmentStatus.DRAFT,
      subtotal: 0,
      discount: 0,
      total: 0,
      campus: 'AELU Principal',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    this._enrollments.update(list => [enrollment, ...list]);
    this.historyService.addEntry(enrollment.id, 'Proceso iniciado', 'Liquidación verificada');
    return of(enrollment).pipe(delay(300));
  }

  saveDraft(enrollment: Enrollment): Observable<Enrollment> {
    this._enrollments.update(list => {
      const idx = list.findIndex(e => e.id === enrollment.id);
      if (idx >= 0) {
        const updated = [...list];
        updated[idx] = { ...enrollment, status: EnrollmentStatus.DRAFT };
        return updated;
      }
      return [enrollment, ...list];
    });
    this.historyService.addEntry(enrollment.id, 'Borrador guardado', enrollment.code);
    return of(enrollment).pipe(delay(200));
  }

  updateEnrollment(enrollment: Enrollment): void {
    this._enrollments.update(list => list.map(e => e.id === enrollment.id ? enrollment : e));
  }

  confirmEnrollment(id: number): Observable<Enrollment> {
    const enrollment = this._enrollments().find(e => e.id === id);
    if (!enrollment) return of(undefined as unknown as Enrollment);
    const confirmed: Enrollment = {
      ...enrollment,
      status: EnrollmentStatus.CONFIRMED,
      confirmedAt: new Date().toISOString().slice(0, 10),
    };
    this.updateEnrollment(confirmed);
    this.historyService.addEntry(id, 'Matrícula confirmada', confirmed.code);
    const student = MOCK_ENROLLMENT_STUDENTS.find(s => s.id === confirmed.studentId);
    if (student && !student.isRegularStudent) {
      this.studentService.markAsRegular(student.id);
    }
    return of(confirmed).pipe(delay(400));
  }

  setPendingPayment(id: number): Observable<Enrollment> {
    const enrollment = this._enrollments().find(e => e.id === id);
    if (!enrollment) return of(undefined as unknown as Enrollment);
    const updated = { ...enrollment, status: EnrollmentStatus.PENDING_PAYMENT };
    this.updateEnrollment(updated);
    return of(updated).pipe(delay(200));
  }

  cancelEnrollment(id: number): Observable<void> {
    this._enrollments.update(list =>
      list.map(e => e.id === id
        ? { ...e, status: EnrollmentStatus.CANCELLED, cancelledAt: new Date().toISOString().slice(0, 10) }
        : e,
      ),
    );
    this.historyService.addEntry(id, 'Matrícula cancelada', '');
    return of(undefined).pipe(delay(300));
  }

  getAlerts(): EnrollmentAlert[] {
    const stats = this.dashboardStats();
    const lowCapacity = MOCK_ENROLLMENT_CLASSES.filter(c => c.available > 0 && c.available <= 3).length;
    const incomplete = this._enrollments().filter(e => e.status === EnrollmentStatus.DRAFT).length;
    return [
      {
        id: 'pending-pay',
        severity: ValidationSeverity.WARNING,
        message: `${stats.pendingPayment} matrículas pendientes de pago`,
        actionLabel: 'Ver pendientes',
        actionRoute: '/matricula/pagos',
      },
      {
        id: 'low-cap',
        severity: ValidationSeverity.INFO,
        message: `${lowCapacity} clases próximas a completar capacidad`,
        actionLabel: 'Ver clases',
        actionRoute: '/matricula/clases',
      },
      {
        id: 'incomplete',
        severity: ValidationSeverity.WARNING,
        message: `${incomplete} procesos de matrícula incompletos`,
        actionLabel: 'Ver borradores',
        actionRoute: '/matricula',
      },
    ];
  }

  getDistributionByCourse(): { label: string; value: number }[] {
    const map = new Map<string, number>();
    for (const e of this._enrollments()) {
      const course = MOCK_ENROLLMENT_COURSES.find(c => c.id === e.courseId);
      const label = course?.name ?? 'Sin curso';
      map.set(label, (map.get(label) ?? 0) + 1);
    }
    return [...map.entries()].map(([label, value]) => ({ label, value }));
  }

  getDistributionByType(): { label: string; value: number }[] {
    return [
      { label: 'Nuevos', value: this._enrollments().filter(e => e.studentType === 'NEW').length },
      { label: 'Regulares', value: this._enrollments().filter(e => e.studentType === 'REGULAR').length },
    ];
  }

  getDistributionByCampus(): { label: string; value: number }[] {
    const map = new Map<string, number>();
    for (const e of this._enrollments()) {
      map.set(e.campus, (map.get(e.campus) ?? 0) + 1);
    }
    return [...map.entries()].map(([label, value]) => ({ label, value }));
  }

  getDistributionByStatus(): { label: string; value: number }[] {
    const map = new Map<string, number>();
    for (const e of this._enrollments()) {
      map.set(e.status, (map.get(e.status) ?? 0) + 1);
    }
    return [...map.entries()].map(([label, value]) => ({ label, value }));
  }

  private toListItem(e: Enrollment): EnrollmentListItem {
    const student = MOCK_ENROLLMENT_STUDENTS.find(s => s.id === e.studentId);
    const course = MOCK_ENROLLMENT_COURSES.find(c => c.id === e.courseId);
    const cls = MOCK_ENROLLMENT_CLASSES.find(c => c.id === e.classId);
    const agreement = e.agreementId
      ? MOCK_ENROLLMENT_AGREEMENTS.find(a => a.id === e.agreementId)
      : undefined;
    return {
      ...e,
      studentName: student ? `${student.firstName} ${student.lastName}` : '—',
      studentDocument: student?.documentNumber ?? '—',
      courseName: course?.name ?? '—',
      className: cls?.name ?? '—',
      schedule: cls?.schedule ?? '—',
      agreementName: agreement?.name,
    };
  }
}
