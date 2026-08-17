import { Injectable, inject } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { StudentAttendanceRecord, StudentAttendanceSummary } from '../models/student-portal.model';
import { MOCK_PORTAL_ATTENDANCE, MOCK_PORTAL_ATTENDANCE_SUMMARY } from '../mocks/student-portal.mock';
import { StudentSessionService } from './student-session.service';

@Injectable({ providedIn: 'root' })
export class StudentAttendanceService {
  private readonly sessionService = inject(StudentSessionService);

  getAttendanceSummary(): Observable<StudentAttendanceSummary> {
    this.sessionService.requireStudentId();
    return of({ ...MOCK_PORTAL_ATTENDANCE_SUMMARY }).pipe(delay(200));
  }

  getCourseAttendance(courseId: number): Observable<StudentAttendanceRecord[]> {
    this.sessionService.requireStudentId();
    return of(MOCK_PORTAL_ATTENDANCE.filter(a => a.courseId === courseId)).pipe(delay(200));
  }
}
