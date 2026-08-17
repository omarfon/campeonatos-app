import { Injectable, inject } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { StudentScheduleEvent, StudentClass } from '../models/student-portal.model';
import { MOCK_PORTAL_NEXT_CLASS } from '../mocks/student-portal.mock';
import { StudentSessionService } from './student-session.service';
import {
  addDays,
  dayLabelFromDate,
  endOfMonth,
  formatLocalDate,
  parseLocalDate,
  startOfMonth,
  startOfWeek,
  endOfWeek,
} from '../utils/schedule-calendar.utils';

interface ClassTemplate {
  courseId: number;
  courseName: string;
  className: string;
  weekdays: number[];
  timeStart: string;
  timeEnd: string;
  campus: string;
  environment: string;
  teacher: string;
}

const CLASS_TEMPLATES: ClassTemplate[] = [
  {
    courseId: 2,
    courseName: 'Natación Intermedio',
    className: 'Natación Intermedio L-M-V',
    weekdays: [1, 3, 5],
    timeStart: '18:00',
    timeEnd: '19:00',
    campus: 'AELU Principal',
    environment: 'Piscina Principal',
    teacher: 'Carlos Tanaka',
  },
  {
    courseId: 6,
    courseName: 'Gimnasio Funcional',
    className: 'Gimnasio M-J-S',
    weekdays: [2, 4, 6],
    timeStart: '19:00',
    timeEnd: '20:00',
    campus: 'AELU Principal',
    environment: 'Gimnasio',
    teacher: 'Laura Mendoza',
  },
];

@Injectable({ providedIn: 'root' })
export class StudentScheduleService {
  private readonly sessionService = inject(StudentSessionService);
  private nextId = 1000;

  getWeeklySchedule(anchorDate?: string): Observable<StudentScheduleEvent[]> {
    const anchor = anchorDate ? parseLocalDate(anchorDate) : new Date();
    const start = formatLocalDate(startOfWeek(anchor));
    const end = formatLocalDate(endOfWeek(anchor));
    return this.getScheduleForRange(start, end);
  }

  getMonthlySchedule(anchorDate?: string): Observable<StudentScheduleEvent[]> {
    const anchor = anchorDate ? parseLocalDate(anchorDate) : new Date();
    const start = formatLocalDate(startOfMonth(anchor));
    const end = formatLocalDate(endOfMonth(anchor));
    return this.getScheduleForRange(start, end);
  }

  getScheduleForRange(start: string, end: string): Observable<StudentScheduleEvent[]> {
    try {
      this.sessionService.requireStudentId();
    } catch {
      // Catálogo demo disponible sin sesión
    }
    return of(this.buildEvents(start, end)).pipe(delay(150));
  }

  getNextClass(): Observable<StudentClass | undefined> {
    try {
      this.sessionService.requireStudentId();
    } catch {
      return of(undefined).pipe(delay(0));
    }
    return of({ ...MOCK_PORTAL_NEXT_CLASS }).pipe(delay(150));
  }

  getEvent(id: number): Observable<StudentScheduleEvent | undefined> {
    const today = formatLocalDate(new Date());
    const end = formatLocalDate(addDays(new Date(), 14));
    const events = this.buildEvents(today, end);
    return of(events.find(e => e.id === id)).pipe(delay(100));
  }

  private buildEvents(start: string, end: string): StudentScheduleEvent[] {
    const events: StudentScheduleEvent[] = [];
    let current = parseLocalDate(start);
    const last = parseLocalDate(end);

    while (current <= last) {
      const jsDay = current.getDay();
      const date = formatLocalDate(current);

      for (const tpl of CLASS_TEMPLATES) {
        if (tpl.weekdays.includes(jsDay)) {
          events.push({
            id: this.nextId++,
            courseId: tpl.courseId,
            courseName: tpl.courseName,
            className: tpl.className,
            date,
            dayLabel: dayLabelFromDate(current),
            timeStart: tpl.timeStart,
            timeEnd: tpl.timeEnd,
            campus: tpl.campus,
            environment: tpl.environment,
            teacher: tpl.teacher,
            type: 'class',
          });
        }
      }

      current = addDays(current, 1);
    }

    const importantDate = formatLocalDate(addDays(startOfWeek(new Date()), 2));
    if (importantDate >= start && importantDate <= end) {
      events.push({
        id: this.nextId++,
        courseId: 2,
        courseName: 'Natación Intermedio',
        className: 'Evaluación técnica',
        date: importantDate,
        dayLabel: dayLabelFromDate(parseLocalDate(importantDate)),
        timeStart: '17:30',
        timeEnd: '18:00',
        campus: 'AELU Principal',
        environment: 'Piscina Principal',
        teacher: 'Carlos Tanaka',
        type: 'important',
      });
    }

    return events.sort((a, b) =>
      a.date.localeCompare(b.date) || a.timeStart.localeCompare(b.timeStart),
    );
  }
}
