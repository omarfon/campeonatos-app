import { Injectable, inject } from '@angular/core';
import { EnrollmentClass } from '../../matricula/models/enrollment.model';
import { ClassStatus } from '../../matricula/enums/class-status.enum';
import { ClassService } from './class.service';
import { AcademicClassStatus } from '../enums/academic-class-status.enum';
import { ClassModality } from '../enums/class-modality.enum';
import { ClassModel, buildFrequencyLabel, buildScheduleLabel } from '../models/class.model';
import {
  MOCK_CAMPUSES,
  MOCK_ROOMS,
  MOCK_TEACHERS,
} from '../mocks/classes.mock';

const ENROLLMENT_ID_OFFSET = 10_000;

const CAMPUS_ENROLLMENT_LABELS: Record<number, string> = {
  1: 'AELU Principal',
  2: 'AELU Sede Norte',
  3: 'AELU Virtual',
};

@Injectable({ providedIn: 'root' })
export class ClassEnrollmentBridgeService {
  private readonly classService = inject(ClassService);

  /** Clases publicadas del módulo de gestión, expuestas al motor de matrícula. */
  toEnrollmentClasses(): EnrollmentClass[] {
    return this.classService
      .getPublishedForEnrollment()
      .map(cls => this.mapToEnrollmentClass(cls));
  }

  findEnrollmentClassById(id: number): EnrollmentClass | undefined {
    if (id >= ENROLLMENT_ID_OFFSET) {
      const sourceId = id - ENROLLMENT_ID_OFFSET;
      const cls = this.classService.getClassSync(sourceId);
      if (cls) return this.mapToEnrollmentClass(cls);
    }
    return undefined;
  }

  private mapToEnrollmentClass(cls: ClassModel): EnrollmentClass {
    const teacher = MOCK_TEACHERS.find(t => t.id === cls.teacherId);
    const room = MOCK_ROOMS.find(r => r.id === cls.roomId);
    const campus = MOCK_CAMPUSES.find(c => c.id === cls.campusId);
    const days = buildFrequencyLabel(cls.scheduleRules);
    const firstRule = cls.scheduleRules[0];
    const schedule = buildScheduleLabel(cls.scheduleRules);

    return {
      id: cls.id + ENROLLMENT_ID_OFFSET,
      courseId: cls.courseId,
      code: cls.code,
      name: cls.name,
      modality: this.mapModality(cls.modality),
      campus: campus ? (CAMPUS_ENROLLMENT_LABELS[campus.id] ?? campus.name) : '—',
      environment: room?.name ?? cls.platform ?? '—',
      schedule,
      days,
      timeStart: firstRule?.startTime ?? '',
      timeEnd: firstRule?.endTime ?? '',
      frequency: days,
      teacher: teacher ? `${teacher.firstName} ${teacher.lastName}` : '—',
      capacity: cls.capacity,
      enrolled: cls.enrolled,
      available: Math.max(cls.capacity - cls.enrolled, 0),
      status: ClassStatus.APPROVED,
    };
  }

  private mapModality(modality: ClassModality): string {
    switch (modality) {
      case ClassModality.ONLINE: return 'Virtual';
      case ClassModality.HYBRID: return 'Presencial';
      default: return 'Presencial';
    }
  }
}

export { ENROLLMENT_ID_OFFSET };
