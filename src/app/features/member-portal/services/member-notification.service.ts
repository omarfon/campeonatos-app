import { Injectable, inject, signal } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { MemberNotification } from '../models/member-portal.model';
import { MOCK_MEMBER_NOTIFICATIONS } from '../mocks/member-portal.mock';
import { MemberSessionService } from './member-session.service';

@Injectable({ providedIn: 'root' })
export class MemberNotificationService {
  private readonly sessionService = inject(MemberSessionService);
  private readonly notifications = signal<MemberNotification[]>(
    MOCK_MEMBER_NOTIFICATIONS.map(n => ({ ...n })),
  );

  getNotifications(): Observable<MemberNotification[]> {
    this.sessionService.requireMemberId();
    return of([...this.notifications()]).pipe(delay(250));
  }

  getRecentNotifications(limit = 4): Observable<MemberNotification[]> {
    this.sessionService.requireMemberId();
    return of(this.notifications().slice(0, limit)).pipe(delay(200));
  }

  getUnreadCount(): Observable<number> {
    return of(this.unreadCount()).pipe(delay(100));
  }

  unreadCount(): number {
    return this.notifications().filter(n => !n.read).length;
  }

  markAsRead(id: number): Observable<void> {
    this.sessionService.requireMemberId();
    this.notifications.update(list =>
      list.map(n => n.id === id ? { ...n, read: true } : n),
    );
    return of(undefined).pipe(delay(100));
  }

  markAllAsRead(): Observable<void> {
    this.sessionService.requireMemberId();
    this.notifications.update(list => list.map(n => ({ ...n, read: true })));
    return of(undefined).pipe(delay(100));
  }
}
