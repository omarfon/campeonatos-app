import { Injectable, signal } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { AcademicClassStatus } from '../enums/academic-class-status.enum';
import {
  ClassListFilters,
  ClassListItem,
  ClassListStats,
  ClassModel,
  CreateClassRequest,
  DuplicateClassRequest,
  ClassEnrollmentStudent,
  ClassHistoryEntry,
  buildScheduleLabel,
  buildFrequencyLabel,
} from '../models/class.model';
import {
  MOCK_ACTIVITIES,
  MOCK_CAMPUSES,
  MOCK_CLASS_COURSES,
  MOCK_CLASSES,
  MOCK_CLASS_HISTORY,
  MOCK_ENROLLMENT_STUDENTS,
  MOCK_PERIODS,
  MOCK_ROOMS,
  MOCK_TEACHERS,
} from '../mocks/classes.mock';
import {
  AcademicPeriod,
  Activity,
  ClassCampusRef,
  ClassCourseRef,
  ClassRoomRef,
  ClassTeacherRef,
  getCapacityAvailability,
} from '../models/class.model';

@Injectable({ providedIn: 'root' })
export class ClassService {
  private readonly _classes = signal<ClassModel[]>([...MOCK_CLASSES]);
  private nextId = MOCK_CLASSES.length + 1;

  readonly classes = this._classes.asReadonly();

  getPublishedForEnrollment(): ClassModel[] {
    return this._classes().filter(c =>
      (c.status === AcademicClassStatus.PUBLISHED || c.status === AcademicClassStatus.IN_PROGRESS) &&
      c.enrollmentEnabled &&
      c.publicationChannels.adminEnrollment,
    );
  }

  getClassSync(id: number): ClassModel | undefined {
    return this._classes().find(c => c.id === id);
  }

  getClasses(filters?: ClassListFilters): Observable<ClassListItem[]> {
    let list = this._classes().map(c => this.toListItem(c));
    if (filters) {
      list = this.applyFilters(list, filters);
    }
    return of(list).pipe(delay(200));
  }

  getClass(id: number): Observable<ClassModel | undefined> {
    return of(this._classes().find(c => c.id === id)).pipe(delay(150));
  }

  getListStats(): Observable<ClassListStats> {
    const all = this._classes();
    const today = '2026-09-01';
    const stats: ClassListStats = {
      active: all.filter(c =>
        c.status === AcademicClassStatus.PUBLISHED || c.status === AcademicClassStatus.IN_PROGRESS,
      ).length,
      upcoming: all.filter(c =>
        c.status === AcademicClassStatus.SCHEDULED ||
        (c.status === AcademicClassStatus.PUBLISHED && c.startDate > today),
      ).length,
      full: all.filter(c => c.enrolled >= c.capacity).length,
      withSpots: all.filter(c => c.enrolled < c.capacity && c.status !== AcademicClassStatus.DRAFT).length,
      draft: all.filter(c => c.status === AcademicClassStatus.DRAFT).length,
    };
    return of(stats).pipe(delay(100));
  }

  getPeriods(): Observable<AcademicPeriod[]> {
    return of(MOCK_PERIODS.filter(p => p.enabledForScheduling)).pipe(delay(80));
  }

  getAllPeriods(): Observable<AcademicPeriod[]> {
    return of(MOCK_PERIODS).pipe(delay(80));
  }

  getActivities(): Observable<Activity[]> {
    return of(MOCK_ACTIVITIES).pipe(delay(80));
  }

  getCoursesByActivity(activityId: number): Observable<ClassCourseRef[]> {
    if (!activityId) {
      return of(MOCK_CLASS_COURSES).pipe(delay(80));
    }
    return of(MOCK_CLASS_COURSES.filter(c => c.activityId === activityId)).pipe(delay(80));
  }

  getTeachers(activityId?: number): Observable<ClassTeacherRef[]> {
    let list = MOCK_TEACHERS.filter(t => t.active);
    if (activityId) {
      const activity = MOCK_ACTIVITIES.find(a => a.id === activityId);
      if (activity) {
        list = list.filter(t => t.specialties.some(s =>
          s.toLowerCase().includes(activity.name.toLowerCase().slice(0, 4)),
        ) || t.specialties.length > 0);
      }
    }
    return of(list).pipe(delay(100));
  }

  getCampuses(): Observable<ClassCampusRef[]> {
    return of(MOCK_CAMPUSES).pipe(delay(80));
  }

  getRoomsByCampus(campusId: number, courseId?: number): Observable<ClassRoomRef[]> {
    let list = MOCK_ROOMS.filter(r => r.campusId === campusId);
    if (courseId) {
      const course = MOCK_CLASS_COURSES.find(c => c.id === courseId);
      if (course?.requiredRoomType) {
        list = list.filter(r => r.type === course.requiredRoomType || r.type === 'Virtual');
      }
    }
    return of(list).pipe(delay(80));
  }

  createClass(request: CreateClassRequest): Observable<ClassModel> {
    const course = MOCK_CLASS_COURSES.find(c => c.id === request.courseId);
    const period = MOCK_PERIODS.find(p => p.id === request.periodId);
    const code = course && period
      ? `${course.code}-${period.code}-${String(this.nextId).padStart(3, '0')}`
      : `CLS-${String(this.nextId).padStart(3, '0')}`;

    const created: ClassModel = {
      id: this.nextId++,
      code,
      name: request.name,
      description: request.description,
      periodId: request.periodId,
      activityId: request.activityId,
      courseId: request.courseId,
      teacherId: request.teacherId,
      modality: request.modality,
      campusId: request.campusId,
      roomId: request.roomId,
      platform: request.platform,
      accessInfo: request.accessInfo,
      startDate: request.startDate,
      endDate: request.endDate,
      scheduleRules: request.scheduleRules,
      capacity: request.capacity,
      minimumCapacity: request.minimumCapacity,
      warningCapacity: request.warningCapacity,
      enrolled: 0,
      waitingListEnabled: request.waitingListEnabled,
      waitingListMax: request.waitingListMax,
      overbookingPolicy: request.overbookingPolicy,
      enrollmentEnabled: request.enrollmentEnabled,
      enrollmentStartDate: request.enrollmentStartDate,
      enrollmentEndDate: request.enrollmentEndDate,
      publicationChannels: request.publicationChannels,
      status: AcademicClassStatus.DRAFT,
    };
    this._classes.update(items => [...items, created]);
    return of(created).pipe(delay(300));
  }

  updateClass(id: number, changes: Partial<ClassModel>): Observable<ClassModel | undefined> {
    let updated: ClassModel | undefined;
    this._classes.update(items =>
      items.map(c => {
        if (c.id !== id) return c;
        updated = { ...c, ...changes };
        return updated;
      }),
    );
    return of(updated).pipe(delay(250));
  }

  duplicateClass(request: DuplicateClassRequest): Observable<ClassModel | undefined> {
    const source = this._classes().find(c => c.id === request.sourceClassId);
    if (!source) return of(undefined).pipe(delay(200));

    const dup: CreateClassRequest = {
      name: `${source.name} (copia)`,
      description: source.description,
      periodId: request.periodId,
      activityId: source.activityId,
      courseId: source.courseId,
      teacherId: source.teacherId,
      modality: source.modality,
      campusId: source.campusId,
      roomId: source.roomId,
      platform: source.platform,
      accessInfo: source.accessInfo,
      startDate: request.startDate,
      endDate: request.endDate,
      scheduleRules: [...source.scheduleRules],
      capacity: source.capacity,
      minimumCapacity: source.minimumCapacity,
      warningCapacity: source.warningCapacity,
      waitingListEnabled: source.waitingListEnabled,
      waitingListMax: source.waitingListMax,
      overbookingPolicy: source.overbookingPolicy,
      enrollmentEnabled: false,
      publicationChannels: {
        adminEnrollment: false,
        studentPortal: false,
        memberPortal: false,
        publicWeb: false,
      },
      sessions: [],
    };
    return this.createClass(dup);
  }

  publishClass(id: number): Observable<ClassModel | undefined> {
    return this.updateClass(id, {
      status: AcademicClassStatus.PUBLISHED,
      publicationChannels: {
        adminEnrollment: true,
        studentPortal: true,
        memberPortal: true,
        publicWeb: false,
      },
    });
  }

  cancelClass(id: number): Observable<ClassModel | undefined> {
    return this.updateClass(id, { status: AcademicClassStatus.CANCELLED });
  }

  changeStatus(id: number, status: AcademicClassStatus): Observable<ClassModel | undefined> {
    return this.updateClass(id, { status });
  }

  getStudentsForClass(classId: number): Observable<ClassEnrollmentStudent[]> {
    const cls = this._classes().find(c => c.id === classId);
    const count = cls?.enrolled ?? 0;
    const list = MOCK_ENROLLMENT_STUDENTS.slice(0, count);
    return of(list).pipe(delay(150));
  }

  getHistoryForClass(_classId: number): Observable<ClassHistoryEntry[]> {
    return of(MOCK_CLASS_HISTORY).pipe(delay(100));
  }

  private toListItem(cls: ClassModel): ClassListItem {
    const course = MOCK_CLASS_COURSES.find(c => c.id === cls.courseId);
    const teacher = MOCK_TEACHERS.find(t => t.id === cls.teacherId);
    const campus = MOCK_CAMPUSES.find(c => c.id === cls.campusId);
    return {
      ...cls,
      courseName: course?.name ?? '—',
      teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : '—',
      campusName: campus?.name ?? '—',
      scheduleLabel: buildScheduleLabel(cls.scheduleRules),
      frequencyLabel: buildFrequencyLabel(cls.scheduleRules),
    };
  }

  private applyFilters(list: ClassListItem[], filters: ClassListFilters): ClassListItem[] {
    let result = list;
    if (filters.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(c =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.courseName.toLowerCase().includes(q) ||
        c.teacherName.toLowerCase().includes(q),
      );
    }
    if (filters.periodId) result = result.filter(c => c.periodId === filters.periodId);
    if (filters.activityId) result = result.filter(c => c.activityId === filters.activityId);
    if (filters.courseId) result = result.filter(c => c.courseId === filters.courseId);
    if (filters.teacherId) result = result.filter(c => c.teacherId === filters.teacherId);
    if (filters.campusId) result = result.filter(c => c.campusId === filters.campusId);
    if (filters.modality) result = result.filter(c => c.modality === filters.modality);
    if (filters.status) result = result.filter(c => c.status === filters.status);
    if (filters.availability) {
      result = result.filter(c => {
        const avail = c.capacity - c.enrolled;
        const label = getCapacityAvailability(avail, c.capacity, c.warningCapacity ?? 3);
        if (filters.availability === 'available') return label === 'DISPONIBLE';
        if (filters.availability === 'last_spots') return label === 'ULTIMOS_CUPOS';
        if (filters.availability === 'full') return label === 'COMPLETA';
        return true;
      });
    }
    return result;
  }
}
