import { Injectable, inject } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { FamilyMember, FamilyMemberDetail } from '../models/member-portal.model';
import { MemberFamilyService } from '../services/member-family.service';
import { ParticipantContextService } from '../services/participant-context.service';

@Injectable({ providedIn: 'root' })
export class MemberFamilyFacade {
  private readonly familyService = inject(MemberFamilyService);
  private readonly participantContext = inject(ParticipantContextService);

  loadFamily(): Observable<FamilyMember[]> {
    return this.familyService.getFamilyMembers();
  }

  loadMemberDetail(personId: number): Observable<FamilyMemberDetail> {
    return this.participantContext.validateParticipant(personId).pipe(
      switchMap(() => this.familyService.getFamilyMemberDetail(personId)),
    );
  }
}
