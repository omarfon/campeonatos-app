import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError, delay } from 'rxjs';
import { MemberAccount, FamilyMember, FamilyMemberDetail } from '../models/member-portal.model';
import {
  MOCK_MEMBER_ACCOUNT,
  MOCK_FAMILY_MEMBERS,
  MOCK_FAMILY_MEMBER_DETAILS,
} from '../mocks/member-portal.mock';
import { MemberSessionService } from './member-session.service';

@Injectable({ providedIn: 'root' })
export class MemberAccountService {
  private readonly sessionService = inject(MemberSessionService);

  getAccount(): Observable<MemberAccount> {
    this.sessionService.requireMemberId();
    return of({ ...MOCK_MEMBER_ACCOUNT, profile: { ...MOCK_MEMBER_ACCOUNT.profile } }).pipe(delay(400));
  }
}

@Injectable({ providedIn: 'root' })
export class MemberFamilyService {
  private readonly sessionService = inject(MemberSessionService);

  getFamilyMembers(): Observable<FamilyMember[]> {
    this.sessionService.requireMemberId();
    return of(MOCK_FAMILY_MEMBERS.map(m => ({ ...m })));
  }

  getFamilyMemberDetail(personId: number): Observable<FamilyMemberDetail> {
    this.sessionService.requireMemberId();
    const detail = MOCK_FAMILY_MEMBER_DETAILS[personId];
    if (!detail) {
      return throwError(() => new Error(
        'No encontramos la información de este integrante familiar.',
      )).pipe(delay(200));
    }
    return of({ ...detail, activities: [...detail.activities], upcomingEvents: [...detail.upcomingEvents] });
  }
}
