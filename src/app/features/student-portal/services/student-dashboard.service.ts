import { Injectable, inject } from '@angular/core';
import { delay, map, Observable, of, switchMap } from 'rxjs';
import { StudentDashboard } from '../models/student-portal.model';
import {
  MOCK_PORTAL_COURSES,
  MOCK_PORTAL_NEXT_CLASS,
  MOCK_PORTAL_PAYMENTS,
  MOCK_PORTAL_PROFILE,
} from '../mocks/student-portal.mock';
import { StudentContentManagerService } from './student-content-manager.service';
import { StudentCourseStatus } from '../enums/student-course-status.enum';
import { StudentPaymentStatus } from '../enums/student-payment-status.enum';
import { StudentPortalService } from './student-portal.service';
import { StudentSessionService } from './student-session.service';

@Injectable({ providedIn: 'root' })
export class StudentDashboardService {
  private readonly portalService = inject(StudentPortalService);
  private readonly sessionService = inject(StudentSessionService);
  private readonly contentManager = inject(StudentContentManagerService);

  getDashboard(): Observable<StudentDashboard> {
    this.sessionService.requireStudentId();
    return this.portalService.getGreeting().pipe(
      switchMap(greeting => {
        const activeCourses = MOCK_PORTAL_COURSES.filter(
          c => c.status === StudentCourseStatus.ACTIVE && c.enrollmentId,
        );
        const pending = MOCK_PORTAL_PAYMENTS.filter(p => p.status === StudentPaymentStatus.PENDING);
        const pendingAmount = pending.reduce((s, p) => s + p.amount, 0);
        const attendanceValues = activeCourses.map(c => c.attendancePercentage);
        const attendancePercentage = attendanceValues.length
          ? Math.round(attendanceValues.reduce((a, b) => a + b, 0) / attendanceValues.length)
          : 0;

        const base = {
          greeting,
          profile: { ...MOCK_PORTAL_PROFILE },
          activeCourses: activeCourses.length,
          attendancePercentage,
          pendingAmount,
          paymentStatusLabel: pendingAmount > 0 ? 'Pendiente' : 'Al día',
          nextClass: { ...MOCK_PORTAL_NEXT_CLASS },
          activeCourseCards: activeCourses.slice(0, 2),
        };

        return this.contentManager.getPublishedComunicados().pipe(
          map(comunicados => ({
            ...base,
            comunicados: comunicados.slice(0, 2),
          } satisfies StudentDashboard)),
        );
      }),
      delay(300),
    );
  }
}
