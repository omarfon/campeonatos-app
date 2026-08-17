import { Injectable, inject } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { MemberDocument } from '../models/member-portal.model';
import { MOCK_MEMBER_DOCUMENTS } from '../mocks/member-documents.mock';
import { MemberSessionService } from './member-session.service';

@Injectable({ providedIn: 'root' })
export class MemberDocumentService {
  private readonly sessionService = inject(MemberSessionService);

  getDocuments(category?: MemberDocument['category']): Observable<MemberDocument[]> {
    this.sessionService.requireMemberId();
    let list = [...MOCK_MEMBER_DOCUMENTS];
    if (category) list = list.filter(d => d.category === category);
    return of(list).pipe(delay(250));
  }

  getDocument(id: number): Observable<MemberDocument | undefined> {
    this.sessionService.requireMemberId();
    return of(MOCK_MEMBER_DOCUMENTS.find(d => d.id === id)).pipe(delay(150));
  }
}
