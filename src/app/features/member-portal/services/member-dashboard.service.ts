import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { MemberDashboard, MemberNotification } from '../models/member-portal.model';
import { MOCK_MEMBER_DASHBOARD } from '../mocks/member-portal.mock';
import { MemberSessionService } from './member-session.service';
import { MemberNotificationService } from './member-notification.service';

@Injectable({ providedIn: 'root' })
export class MemberDashboardService {
  private readonly sessionService = inject(MemberSessionService);
  private readonly notificationService = inject(MemberNotificationService);

  getDashboard(): Observable<MemberDashboard> {
    this.sessionService.requireMemberId();
    return of({ ...MOCK_MEMBER_DASHBOARD }).pipe(delay(400));
  }

  getRecentNotifications(limit = 4): Observable<MemberNotification[]> {
    return this.notificationService.getRecentNotifications(limit);
  }

  getUnreadCount(): Observable<number> {
    return this.notificationService.getUnreadCount();
  }
}
