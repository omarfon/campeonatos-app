import { Injectable, inject, signal } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { StudentNotification } from '../models/student-portal.model';
import { MOCK_PORTAL_NOTIFICATIONS } from '../mocks/student-portal.mock';
import { StudentSessionService } from './student-session.service';

@Injectable({ providedIn: 'root' })
export class StudentNotificationService {
  private readonly sessionService = inject(StudentSessionService);
  private readonly _notifications = signal<StudentNotification[]>([...MOCK_PORTAL_NOTIFICATIONS]);

  getNotifications(): Observable<StudentNotification[]> {
    this.sessionService.requireStudentId();
    return of([...this._notifications()]).pipe(delay(200));
  }

  getUnreadCount(): Observable<number> {
    return of(this.unreadCount()).pipe(delay(50));
  }

  unreadCount(): number {
    return this._notifications().filter(n => !n.read).length;
  }

  markAsRead(id: number): Observable<void> {
    this.sessionService.requireStudentId();
    this._notifications.update(list =>
      list.map(n => n.id === id ? { ...n, read: true } : n),
    );
    return of(undefined).pipe(delay(100));
  }

  markAllAsRead(): Observable<void> {
    this.sessionService.requireStudentId();
    this._notifications.update(list => list.map(n => ({ ...n, read: true })));
    return of(undefined).pipe(delay(100));
  }
}
