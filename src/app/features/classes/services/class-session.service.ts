import { Injectable, signal } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { ClassSession } from '../models/class.model';
import { ClassSessionStatus } from '../enums/class-session-status.enum';
import { MOCK_SESSIONS } from '../mocks/classes.mock';

export interface RescheduleSessionRequest {
  sessionId: number;
  newDate: string;
  newStartTime: string;
  newEndTime: string;
  reason: string;
}

export interface CancelSessionRequest {
  sessionId: number;
  reason: string;
  requiresRecovery: boolean;
}

export interface ChangeTeacherRequest {
  sessionId: number;
  newTeacherId: number;
  scope: 'session' | 'from_date' | 'future';
  fromDate?: string;
}

export interface ChangeRoomRequest {
  sessionId: number;
  newRoomId: number;
  scope: 'session' | 'future';
}

@Injectable({ providedIn: 'root' })
export class ClassSessionService {
  private readonly _sessions = signal<ClassSession[]>([...MOCK_SESSIONS]);

  readonly sessions = this._sessions.asReadonly();

  getSessions(classId: number): Observable<ClassSession[]> {
    return of(this._sessions().filter(s => s.classId === classId)).pipe(delay(150));
  }

  getSession(id: number): Observable<ClassSession | undefined> {
    return of(this._sessions().find(s => s.id === id)).pipe(delay(100));
  }

  setPreviewSessions(sessions: ClassSession[]): void {
    this._previewSessions = sessions;
  }

  private _previewSessions: ClassSession[] = [];

  getPreviewSessions(): ClassSession[] {
    return this._previewSessions;
  }

  rescheduleSession(request: RescheduleSessionRequest): Observable<ClassSession | undefined> {
    let updated: ClassSession | undefined;
    this._sessions.update(items =>
      items.map(s => {
        if (s.id !== request.sessionId) return s;
        updated = {
          ...s,
          date: request.newDate,
          startTime: request.newStartTime,
          endTime: request.newEndTime,
          status: ClassSessionStatus.RESCHEDULED,
        };
        return updated;
      }),
    );
    return of(updated).pipe(delay(250));
  }

  cancelSession(request: CancelSessionRequest): Observable<ClassSession | undefined> {
    let updated: ClassSession | undefined;
    this._sessions.update(items =>
      items.map(s => {
        if (s.id !== request.sessionId) return s;
        updated = { ...s, status: ClassSessionStatus.CANCELLED };
        return updated;
      }),
    );
    return of(updated).pipe(delay(250));
  }

  changeTeacher(request: ChangeTeacherRequest): Observable<number> {
    const session = this._sessions().find(s => s.id === request.sessionId);
    if (!session) return of(0).pipe(delay(100));

    let count = 0;
    this._sessions.update(items =>
      items.map(s => {
        const match =
          request.scope === 'session' ? s.id === request.sessionId :
          request.scope === 'from_date' ? s.classId === session.classId && s.date >= (request.fromDate ?? session.date) && s.status !== ClassSessionStatus.COMPLETED :
          s.classId === session.classId && s.date >= session.date && s.status !== ClassSessionStatus.COMPLETED;

        if (match && s.status !== ClassSessionStatus.COMPLETED) {
          count++;
          return { ...s, teacherId: request.newTeacherId };
        }
        return s;
      }),
    );
    return of(count).pipe(delay(250));
  }

  changeRoom(request: ChangeRoomRequest): Observable<number> {
    const session = this._sessions().find(s => s.id === request.sessionId);
    if (!session) return of(0).pipe(delay(100));

    let count = 0;
    this._sessions.update(items =>
      items.map(s => {
        const match =
          request.scope === 'session' ? s.id === request.sessionId :
          s.classId === session.classId && s.date >= session.date && s.status !== ClassSessionStatus.COMPLETED;

        if (match && s.status !== ClassSessionStatus.COMPLETED) {
          count++;
          return { ...s, roomId: request.newRoomId };
        }
        return s;
      }),
    );
    return of(count).pipe(delay(250));
  }

  saveSessionsForClass(classId: number, sessions: ClassSession[]): void {
    this._sessions.update(items => [
      ...items.filter(s => s.classId !== classId),
      ...sessions.map((s, i) => ({ ...s, id: s.id ?? classId * 1000 + i, classId })),
    ]);
  }
}
