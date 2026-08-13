import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import {
  Enrollment,
  EnrollmentAgreement,
  EnrollmentCharge,
  EnrollmentCourse,
  EnrollmentStudent,
} from '../models/enrollment.model';
import { buildChargesForEnrollment } from '../mocks/enrollment.mock';

@Injectable({ providedIn: 'root' })
export class EnrollmentChargeService {
  generateCharges(
    student: EnrollmentStudent,
    course: EnrollmentCourse,
    agreement?: EnrollmentAgreement,
  ): Observable<EnrollmentCharge[]> {
    return of(buildChargesForEnrollment(student, course, agreement)).pipe(delay(350));
  }

  generateEnrollmentCharges(
    studentId: number,
    classId: number,
    agreementId?: number,
    student?: EnrollmentStudent,
    course?: EnrollmentCourse,
    agreement?: EnrollmentAgreement,
  ): Observable<EnrollmentCharge[]> {
    if (student && course) {
      return this.generateCharges(student, course, agreement);
    }
    return of([]).pipe(delay(100));
  }

  calculateTotals(charges: EnrollmentCharge[]): { subtotal: number; discount: number; total: number } {
    const positive = charges.filter(c => c.finalAmount >= 0).reduce((s, c) => s + c.finalAmount, 0);
    const discount = charges.filter(c => c.discountAmount > 0 || c.finalAmount < 0)
      .reduce((s, c) => s + (c.discountAmount || Math.abs(Math.min(c.finalAmount, 0))), 0);
    const total = Math.max(positive - discount, 0);
    return { subtotal: positive, discount, total };
  }

  isFullyCoveredByAgreement(charges: EnrollmentCharge[], agreement?: EnrollmentAgreement): boolean {
    if (!agreement || agreement.coveragePercentage < 100) return false;
    const { total } = this.calculateTotals(charges);
    return total === 0;
  }
}
