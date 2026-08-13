import { Injectable, signal } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import {
  CreateEnrollmentStudentRequest,
  EnrollmentStudent,
  StudentFilters,
  StudentSettlementStatus,
  UpdateEnrollmentStudentRequest,
} from '../models/enrollment.model';
import { MOCK_ENROLLMENT_STUDENTS, MOCK_ENROLLMENTS } from '../mocks/enrollment.mock';
import { EnrollmentStatus } from '../enums/enrollment-status.enum';

function calcAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function buildStudent(id: number, data: CreateEnrollmentStudentRequest, existing?: EnrollmentStudent): EnrollmentStudent {
  return {
    id,
    code: existing?.code ?? `EST-${String(id).padStart(6, '0')}`,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    documentType: data.documentType,
    documentNumber: data.documentNumber.trim(),
    birthDate: data.birthDate,
    age: calcAge(data.birthDate),
    gender: data.gender,
    email: data.email.trim(),
    phone: data.phone.trim(),
    address: data.address.trim(),
    district: data.district?.trim(),
    emergencyContactName: data.emergencyContactName?.trim(),
    emergencyContactPhone: data.emergencyContactPhone?.trim(),
    condition: data.condition?.trim() || 'Activo',
    notes: data.notes?.trim(),
    isRegularStudent: existing?.isRegularStudent ?? false,
    status: existing?.status ?? 'active',
    agreementIds: existing?.agreementIds ?? [],
    lastCourseName: existing?.lastCourseName,
    lastClassSchedule: existing?.lastClassSchedule,
    lastEnrollmentDate: existing?.lastEnrollmentDate,
    lastEnrollmentStatus: existing?.lastEnrollmentStatus,
  };
}

@Injectable({ providedIn: 'root' })
export class EnrollmentStudentService {
  private readonly _students = signal<EnrollmentStudent[]>([...MOCK_ENROLLMENT_STUDENTS]);
  private _nextId = MOCK_ENROLLMENT_STUDENTS.length + 1;

  readonly students = this._students.asReadonly();

  getAll(filters?: StudentFilters): Observable<EnrollmentStudent[]> {
    let list = [...this._students()];
    if (filters?.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(s =>
        s.documentNumber.includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q),
      );
    }
    if (filters?.document?.trim()) {
      list = list.filter(s => s.documentNumber.includes(filters.document!.trim()));
    }
    if (filters?.documentType) {
      list = list.filter(s => s.documentType === filters.documentType);
    }
    if (filters?.studentType === 'NEW') {
      list = list.filter(s => !s.isRegularStudent);
    } else if (filters?.studentType === 'REGULAR') {
      list = list.filter(s => s.isRegularStudent);
    }
    if (filters?.status) {
      list = list.filter(s => s.status === filters.status);
    }
    list.sort((a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName));
    return of(list).pipe(delay(150));
  }

  search(query: string): Observable<EnrollmentStudent[]> {
    return this.getAll({ search: query });
  }

  getById(id: number): Observable<EnrollmentStudent | undefined> {
    return of(this._students().find(s => s.id === id)).pipe(delay(100));
  }

  getSettlementStatus(studentId: number): Observable<StudentSettlementStatus> {
    const pending = MOCK_ENROLLMENTS.filter(
      e => e.studentId === studentId && e.status === EnrollmentStatus.PENDING_PAYMENT,
    );
    const pendingAmount = pending.reduce((sum, e) => sum + e.total, 0);
    const isSettled = pending.length === 0;
    return of({
      isSettled,
      pendingAmount,
      pendingEnrollments: pending.length,
      message: isSettled
        ? 'Estudiante al día — sin deudas pendientes de matrículas anteriores.'
        : `Deuda pendiente: S/ ${pendingAmount.toFixed(2)} en ${pending.length} matrícula(s) sin cancelar.`,
    }).pipe(delay(200));
  }

  create(data: CreateEnrollmentStudentRequest): Observable<EnrollmentStudent> {
    const student = buildStudent(this._nextId++, data);
    this._students.update(list => [...list, student]);
    return of(student).pipe(delay(300));
  }

  update(id: number, data: UpdateEnrollmentStudentRequest): Observable<EnrollmentStudent | undefined> {
    const existing = this._students().find(s => s.id === id);
    if (!existing) return of(undefined).pipe(delay(100));
    const updated = buildStudent(id, data, existing);
    this._students.update(list => list.map(s => s.id === id ? updated : s));
    return of(updated).pipe(delay(300));
  }

  delete(id: number): Observable<boolean> {
    const exists = this._students().some(s => s.id === id);
    if (!exists) return of(false).pipe(delay(100));
    this._students.update(list => list.filter(s => s.id !== id));
    return of(true).pipe(delay(200));
  }

  markAsRegular(id: number): void {
    this._students.update(list =>
      list.map(s => s.id === id ? { ...s, isRegularStudent: true } : s),
    );
  }

  getStudentName(student: EnrollmentStudent): string {
    return `${student.firstName} ${student.lastName}`;
  }
}
