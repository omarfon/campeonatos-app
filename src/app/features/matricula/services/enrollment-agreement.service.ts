import { Injectable, inject, signal } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import {
  AgreementFilters,
  AgreementValidationResult,
  CreateEnrollmentAgreementRequest,
  EnrollmentAgreement,
  UpdateEnrollmentAgreementRequest,
  ValidationMessage,
} from '../models/enrollment.model';
import { ValidationSeverity } from '../enums/validation-severity.enum';
import {
  MOCK_ENROLLMENT_AGREEMENTS,
  MOCK_ENROLLMENT_CLASSES,
} from '../mocks/enrollment.mock';
import { ClassStatus } from '../enums/class-status.enum';
import { EnrollmentStudentService } from './enrollment-student.service';

@Injectable({ providedIn: 'root' })
export class EnrollmentAgreementService {
  private readonly studentService = inject(EnrollmentStudentService);
  private readonly _agreements = signal<EnrollmentAgreement[]>([...MOCK_ENROLLMENT_AGREEMENTS]);
  private _nextId = MOCK_ENROLLMENT_AGREEMENTS.length + 1;

  getAvailableAgreements(studentId: number): Observable<EnrollmentAgreement[]> {
    const student = this.studentService.students().find(s => s.id === studentId);
    if (!student) return of([]).pipe(delay(200));
    const agreements = this._agreements().filter(a =>
      student.agreementIds.includes(a.id) && a.status === 'active',
    );
    return of(agreements).pipe(delay(300));
  }

  getAll(filters?: AgreementFilters): Observable<EnrollmentAgreement[]> {
    let list = [...this._agreements()];
    if (filters?.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.company.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.benefitSummary.toLowerCase().includes(q),
      );
    }
    if (filters?.company?.trim()) {
      const q = filters.company.trim().toLowerCase();
      list = list.filter(a => a.company.toLowerCase().includes(q));
    }
    if (filters?.status) {
      list = list.filter(a => a.status === filters.status);
    }
    if (filters?.coverageMin != null && filters.coverageMin > 0) {
      list = list.filter(a => a.coveragePercentage >= filters.coverageMin!);
    }
    if (filters?.validFrom) {
      list = list.filter(a => a.validTo >= filters.validFrom!);
    }
    if (filters?.validTo) {
      list = list.filter(a => a.validFrom <= filters.validTo!);
    }
    if (filters?.campus) {
      list = list.filter(a => a.allowedCampuses.includes(filters.campus!));
    }
    list.sort((a, b) => a.name.localeCompare(b.name));
    return of(list).pipe(delay(150));
  }

  getById(id: number): Observable<EnrollmentAgreement | undefined> {
    return of(this._agreements().find(a => a.id === id)).pipe(delay(100));
  }

  create(data: CreateEnrollmentAgreementRequest): Observable<EnrollmentAgreement> {
    const agreement = this.buildAgreement(this._nextId++, data);
    this._agreements.update(list => [...list, agreement]);
    return of(agreement).pipe(delay(300));
  }

  update(id: number, data: UpdateEnrollmentAgreementRequest): Observable<EnrollmentAgreement | undefined> {
    const existing = this._agreements().find(a => a.id === id);
    if (!existing) return of(undefined).pipe(delay(100));
    const updated = this.buildAgreement(id, data);
    this._agreements.update(list => list.map(a => a.id === id ? updated : a));
    return of(updated).pipe(delay(300));
  }

  copy(id: number): Observable<EnrollmentAgreement | undefined> {
    const source = this._agreements().find(a => a.id === id);
    if (!source) return of(undefined).pipe(delay(100));
    return this.create({
      name: `${source.name} (Copia)`,
      company: source.company,
      description: source.description,
      validFrom: source.validFrom,
      validTo: source.validTo,
      coveragePercentage: source.coveragePercentage,
      status: 'active',
      conditions: source.conditions,
      allowedModalities: [...source.allowedModalities],
      allowedCampuses: [...source.allowedCampuses],
      allowedCourseIds: [...source.allowedCourseIds],
    });
  }

  inactivate(id: number): Observable<boolean> {
    const existing = this._agreements().find(a => a.id === id);
    if (!existing || existing.status !== 'active') return of(false).pipe(delay(100));
    this._agreements.update(list =>
      list.map(a => a.id === id ? { ...a, status: 'suspended' as const } : a),
    );
    return of(true).pipe(delay(200));
  }

  activate(id: number): Observable<boolean> {
    const existing = this._agreements().find(a => a.id === id);
    if (!existing || existing.status !== 'suspended') return of(false).pipe(delay(100));
    this._agreements.update(list =>
      list.map(a => a.id === id ? { ...a, status: 'active' as const } : a),
    );
    return of(true).pipe(delay(200));
  }

  validateAgreement(studentId: number, agreementId: number): Observable<AgreementValidationResult> {
    const student = this.studentService.students().find(s => s.id === studentId);
    const agreement = this._agreements().find(a => a.id === agreementId);
    const errors: ValidationMessage[] = [];
    const warnings: ValidationMessage[] = [];

    if (!student || !agreement) {
      errors.push({ severity: ValidationSeverity.ERROR, message: 'Datos no encontrados' });
      return of({ valid: false, errors, warnings }).pipe(delay(400));
    }
    if (agreement.status !== 'active') {
      errors.push({ severity: ValidationSeverity.ERROR, message: 'Convenio no vigente' });
    }
    if (student.status === 'blocked') {
      errors.push({ severity: ValidationSeverity.ERROR, message: 'El estudiante no cumple las condiciones configuradas' });
    }
    if (!student.agreementIds.includes(agreementId)) {
      errors.push({ severity: ValidationSeverity.ERROR, message: 'Estudiante no registrado en este convenio' });
    }
    if (errors.length === 0) {
      warnings.push(
        { severity: ValidationSeverity.SUCCESS, message: 'Convenio vigente' },
        { severity: ValidationSeverity.SUCCESS, message: 'Estudiante identificado' },
        { severity: ValidationSeverity.SUCCESS, message: 'Curso permitido' },
      );
    }
    return of({ valid: errors.length === 0, errors, warnings }).pipe(delay(400));
  }

  filterCoursesByAgreement(courseIds: number[], agreement?: EnrollmentAgreement): number[] {
    if (!agreement) return courseIds;
    return courseIds.filter(id => agreement.allowedCourseIds.includes(id));
  }

  filterClassesByAgreement(classIds: number[], agreement?: EnrollmentAgreement): number[] {
    if (!agreement) return classIds;
    return classIds.filter(id => agreement.allowedClassIds.includes(id));
  }

  private buildAgreement(id: number, data: CreateEnrollmentAgreementRequest): EnrollmentAgreement {
    const allowedClassIds = MOCK_ENROLLMENT_CLASSES
      .filter(c =>
        c.status === ClassStatus.APPROVED &&
        data.allowedCourseIds.includes(c.courseId) &&
        data.allowedCampuses.includes(c.campus) &&
        data.allowedModalities.includes(c.modality),
      )
      .map(c => c.id);

    const benefitSummary = data.coveragePercentage >= 100
      ? '100% cubierto por empresa'
      : `${data.coveragePercentage}% de descuento`;

    return {
      id,
      name: data.name,
      company: data.company,
      description: data.description,
      validFrom: data.validFrom,
      validTo: data.validTo,
      coveragePercentage: data.coveragePercentage,
      benefitSummary,
      status: data.status,
      allowedModalities: [...data.allowedModalities],
      allowedCampuses: [...data.allowedCampuses],
      allowedCourseIds: [...data.allowedCourseIds],
      allowedClassIds,
      conditions: data.conditions,
    };
  }
}
