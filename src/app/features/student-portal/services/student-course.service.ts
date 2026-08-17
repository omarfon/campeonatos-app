import { Injectable, inject } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { StudentCourse } from '../models/student-portal.model';
import { MOCK_PORTAL_COURSES } from '../mocks/student-portal.mock';
import { StudentCourseStatus } from '../enums/student-course-status.enum';
import { StudentSessionService } from './student-session.service';

@Injectable({ providedIn: 'root' })
export class StudentCourseService {
  private readonly sessionService = inject(StudentSessionService);

  getMyCourses(status?: StudentCourseStatus): Observable<StudentCourse[]> {
    this.sessionService.requireStudentId();
    let list = MOCK_PORTAL_COURSES.filter(c => c.enrollmentId);
    if (status) list = list.filter(c => c.status === status);
    return of(list).pipe(delay(200));
  }

  getCourse(id: number): Observable<StudentCourse | undefined> {
    this.sessionService.requireStudentId();
    return of(MOCK_PORTAL_COURSES.find(c => c.id === id && c.enrollmentId)).pipe(delay(150));
  }
}
