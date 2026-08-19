import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  ClassConflict,
  ClassScheduleRule,
  ClassSession,
  TeacherAvailabilityRequest,
  RoomAvailabilityRequest,
} from '../models/class.model';
import { ClassSessionStatus } from '../enums/class-session-status.enum';
import { MOCK_HOLIDAYS, MOCK_ROOM_CONFLICT, MOCK_TEACHER_CONFLICT } from '../mocks/classes.mock';

const DAY_LABELS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

@Injectable({ providedIn: 'root' })
export class ClassScheduleService {
  validateSchedule(rules: ClassScheduleRule[]): ClassConflict[] {
    const conflicts: ClassConflict[] = [];
    if (rules.length === 0) {
      conflicts.push({ type: 'SCHEDULE', message: 'Debe existir al menos un día con horario configurado.' });
      return conflicts;
    }

    const keys = new Set<string>();
    for (const rule of rules) {
      if (rule.startTime >= rule.endTime) {
        conflicts.push({
          type: 'SCHEDULE',
          message: `${DAY_LABELS[rule.dayOfWeek]}: la hora de inicio debe ser anterior a la hora de fin.`,
        });
      }
      const key = `${rule.dayOfWeek}-${rule.startTime}-${rule.endTime}`;
      if (keys.has(key)) {
        conflicts.push({
          type: 'SCHEDULE',
          message: `${DAY_LABELS[rule.dayOfWeek]}: existe un bloque horario duplicado.`,
        });
      }
      keys.add(key);

      for (const other of rules) {
        if (other === rule || other.dayOfWeek !== rule.dayOfWeek) continue;
        if (this.timesOverlap(rule.startTime, rule.endTime, other.startTime, other.endTime)) {
          conflicts.push({
            type: 'SCHEDULE',
            message: `${DAY_LABELS[rule.dayOfWeek]}: los bloques horarios se solapan.`,
          });
        }
      }
    }
    return conflicts;
  }

  validatePeriodDates(
    startDate: string,
    endDate: string,
    periodStart: string,
    periodEnd: string,
  ): ClassConflict[] {
    const conflicts: ClassConflict[] = [];
    if (startDate > endDate) {
      conflicts.push({ type: 'PERIOD', message: 'La fecha de inicio debe ser anterior o igual a la fecha de fin.' });
    }
    if (startDate < periodStart || endDate > periodEnd) {
      conflicts.push({ type: 'PERIOD', message: 'Las fechas deben estar dentro del periodo seleccionado.' });
    }
    return conflicts;
  }

  generateSessions(
    classId: number,
    startDate: string,
    endDate: string,
    scheduleRules: ClassScheduleRule[],
    teacherId: number,
    roomId?: number,
  ): ClassSession[] {
    const sessions: ClassSession[] = [];
    let sessionId = classId * 1000;
    const start = new Date(startDate + 'T12:00:00');
    const end = new Date(endDate + 'T12:00:00');

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const rules = scheduleRules.filter(r => r.dayOfWeek === dayOfWeek);
      for (const rule of rules) {
        const dateStr = d.toISOString().slice(0, 10);
        const holiday = MOCK_HOLIDAYS.find(h => h.date === dateStr);
        sessions.push({
          id: sessionId++,
          classId,
          date: dateStr,
          startTime: rule.startTime,
          endTime: rule.endTime,
          teacherId,
          roomId,
          status: ClassSessionStatus.SCHEDULED,
          holidayWarning: !!holiday,
          holidayReason: holiday?.reason,
        });
      }
    }
    return sessions;
  }

  private timesOverlap(s1: string, e1: string, s2: string, e2: string): boolean {
    return s1 < e2 && s2 < e1;
  }
}

@Injectable({ providedIn: 'root' })
export class ClassAvailabilityService {
  validateTeacherAvailability(request: TeacherAvailabilityRequest): Observable<ClassConflict[]> {
    const conflicts: ClassConflict[] = [];

    if (request.teacherId === MOCK_TEACHER_CONFLICT.teacherId) {
      for (const rule of request.scheduleRules) {
        if (
          rule.dayOfWeek === MOCK_TEACHER_CONFLICT.dayOfWeek &&
          rule.startTime === MOCK_TEACHER_CONFLICT.startTime
        ) {
          conflicts.push({
            type: 'TEACHER',
            message: `Carlos Tanaka ya tiene programada otra clase en este horario (${MOCK_TEACHER_CONFLICT.conflictingClassName}, ${DAY_LABELS[rule.dayOfWeek]} ${rule.startTime} - ${rule.endTime}).`,
            conflictingClassId: MOCK_TEACHER_CONFLICT.conflictingClassId,
            startTime: rule.startTime,
            endTime: rule.endTime,
          });
        }
      }
    }
    return of(conflicts).pipe(delay(250));
  }

  validateRoomAvailability(request: RoomAvailabilityRequest): Observable<ClassConflict[]> {
    const conflicts: ClassConflict[] = [];

    if (request.roomId === MOCK_ROOM_CONFLICT.roomId) {
      for (const rule of request.scheduleRules) {
        if (
          rule.dayOfWeek === MOCK_ROOM_CONFLICT.dayOfWeek &&
          rule.startTime >= MOCK_ROOM_CONFLICT.startTime &&
          rule.startTime < MOCK_ROOM_CONFLICT.endTime
        ) {
          conflicts.push({
            type: 'ROOM',
            message: `El ambiente no está disponible: ya está asignado a ${MOCK_ROOM_CONFLICT.conflictingClassName} (${DAY_LABELS[rule.dayOfWeek]} ${MOCK_ROOM_CONFLICT.startTime} - ${MOCK_ROOM_CONFLICT.endTime}).`,
            conflictingClassId: MOCK_ROOM_CONFLICT.conflictingClassId,
            startTime: rule.startTime,
            endTime: rule.endTime,
          });
        }
      }
    }
    return of(conflicts).pipe(delay(250));
  }

  validateAll(
    teacherRequest: TeacherAvailabilityRequest,
    roomRequest?: RoomAvailabilityRequest,
    scheduleRules?: ClassScheduleRule[],
    periodValidation?: ClassConflict[],
  ): Observable<ClassConflict[]> {
    const scheduleSvc = new ClassScheduleService();
    const scheduleConflicts = scheduleRules ? scheduleSvc.validateSchedule(scheduleRules) : [];
    const periodConflicts = periodValidation ?? [];

    return new Observable(observer => {
      this.validateTeacherAvailability(teacherRequest).subscribe(teacherConflicts => {
        if (roomRequest) {
          this.validateRoomAvailability(roomRequest).subscribe(roomConflicts => {
            observer.next([...scheduleConflicts, ...periodConflicts, ...teacherConflicts, ...roomConflicts]);
            observer.complete();
          });
        } else {
          observer.next([...scheduleConflicts, ...periodConflicts, ...teacherConflicts]);
          observer.complete();
        }
      });
    });
  }
}
