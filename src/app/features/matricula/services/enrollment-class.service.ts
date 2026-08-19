import { Injectable, inject } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { ClassFilters, EnrollmentClass } from '../models/enrollment.model';
import { ClassStatus } from '../enums/class-status.enum';
import { MOCK_ENROLLMENT_CLASSES } from '../mocks/enrollment.mock';
import { EnrollmentAgreement } from '../models/enrollment.model';
import { ClassEnrollmentBridgeService } from '../../classes/services/class-enrollment-bridge.service';

@Injectable({ providedIn: 'root' })
export class EnrollmentClassService {
  private readonly bridge = inject(ClassEnrollmentBridgeService);

  private mergedApproved(): EnrollmentClass[] {
    const legacy = MOCK_ENROLLMENT_CLASSES.filter(c => c.status === ClassStatus.APPROVED);
    const fromGestión = this.bridge.toEnrollmentClasses();
    return [...legacy, ...fromGestión];
  }

  getAvailableClasses(courseId: number, filters?: ClassFilters, agreement?: EnrollmentAgreement): Observable<EnrollmentClass[]> {
    let list = this.mergedApproved().filter(c => c.courseId === courseId);
    if (agreement) {
      list = list.filter(c => agreement.allowedClassIds.includes(c.id));
    }
    if (filters?.modality) list = list.filter(c => c.modality === filters.modality);
    if (filters?.campus) list = list.filter(c => c.campus === filters.campus);
    if (filters?.frequency) list = list.filter(c => c.frequency === filters.frequency);
    if (filters?.day) list = list.filter(c => c.days.toLowerCase().includes(filters.day!.toLowerCase()));
    if (filters?.schedule) {
      const q = filters.schedule.toLowerCase();
      list = list.filter(c => c.schedule.toLowerCase().includes(q));
    }
    return of(list).pipe(delay(250));
  }

  getAllApproved(filters?: ClassFilters): Observable<EnrollmentClass[]> {
    let list = this.mergedApproved();
    if (filters?.courseId) list = list.filter(c => c.courseId === filters.courseId);
    if (filters?.modality) list = list.filter(c => c.modality === filters.modality);
    if (filters?.campus) list = list.filter(c => c.campus === filters.campus);
    if (filters?.frequency) list = list.filter(c => c.frequency === filters.frequency);
    return of(list).pipe(delay(200));
  }

  getById(id: number): Observable<EnrollmentClass | undefined> {
    const bridged = this.bridge.findEnrollmentClassById(id);
    if (bridged) return of(bridged).pipe(delay(100));
    return of(MOCK_ENROLLMENT_CLASSES.find(c => c.id === id)).pipe(delay(100));
  }
}
