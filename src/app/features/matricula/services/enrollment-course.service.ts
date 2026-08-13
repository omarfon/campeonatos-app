import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { EnrollmentCourse } from '../models/enrollment.model';
import { MOCK_ENROLLMENT_COURSES } from '../mocks/enrollment.mock';
import { EnrollmentAgreement } from '../models/enrollment.model';

export interface CourseFilters {
  program?: string;
  discipline?: string;
  name?: string;
  modality?: string;
  campus?: string;
}

@Injectable({ providedIn: 'root' })
export class EnrollmentCourseService {
  getCourses(filters?: CourseFilters, agreement?: EnrollmentAgreement): Observable<EnrollmentCourse[]> {
    let list = [...MOCK_ENROLLMENT_COURSES];
    if (agreement) {
      list = list.filter(c => agreement.allowedCourseIds.includes(c.id));
    }
    if (filters?.program) {
      list = list.filter(c => c.program === filters.program);
    }
    if (filters?.discipline) {
      list = list.filter(c => c.discipline === filters.discipline);
    }
    if (filters?.modality) {
      list = list.filter(c => c.modality === filters.modality);
    }
    if (filters?.campus) {
      list = list.filter(c => c.campus === filters.campus);
    }
    if (filters?.name) {
      const q = filters.name.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q));
    }
    return of(list).pipe(delay(250));
  }

  getById(id: number): Observable<EnrollmentCourse | undefined> {
    return of(MOCK_ENROLLMENT_COURSES.find(c => c.id === id)).pipe(delay(100));
  }

  getPrograms(): string[] {
    return [...new Set(MOCK_ENROLLMENT_COURSES.map(c => c.program))];
  }

  getDisciplines(): string[] {
    return [...new Set(MOCK_ENROLLMENT_COURSES.map(c => c.discipline))];
  }

  getCampuses(): string[] {
    return [...new Set(MOCK_ENROLLMENT_COURSES.map(c => c.campus))];
  }
}
