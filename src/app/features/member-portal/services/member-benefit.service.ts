import { Injectable, inject } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { MemberBenefit } from '../models/member-portal.model';
import { MOCK_MEMBER_BENEFITS } from '../mocks/member-benefits.mock';
import { MemberSessionService } from './member-session.service';

@Injectable({ providedIn: 'root' })
export class MemberBenefitService {
  private readonly sessionService = inject(MemberSessionService);

  getBenefits(): Observable<MemberBenefit[]> {
    this.sessionService.requireMemberId();
    return of([...MOCK_MEMBER_BENEFITS]).pipe(delay(250));
  }

  getActiveBenefits(): Observable<MemberBenefit[]> {
    this.sessionService.requireMemberId();
    return of(MOCK_MEMBER_BENEFITS.filter(b => b.status === 'active')).pipe(delay(250));
  }

  getBenefit(id: string): Observable<MemberBenefit | undefined> {
    this.sessionService.requireMemberId();
    return of(MOCK_MEMBER_BENEFITS.find(b => b.id === id)).pipe(delay(150));
  }
}
