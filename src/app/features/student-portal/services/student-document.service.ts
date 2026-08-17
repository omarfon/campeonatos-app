import { Injectable, inject } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { StudentDocument } from '../models/student-portal.model';
import { MOCK_PORTAL_DOCUMENTS } from '../mocks/student-portal.mock';
import { StudentSessionService } from './student-session.service';

@Injectable({ providedIn: 'root' })
export class StudentDocumentService {
  private readonly sessionService = inject(StudentSessionService);

  getDocuments(category?: StudentDocument['category']): Observable<StudentDocument[]> {
    this.sessionService.requireStudentId();
    let list = [...MOCK_PORTAL_DOCUMENTS];
    if (category) list = list.filter(d => d.category === category);
    return of(list).pipe(delay(200));
  }

  getDocument(id: number): Observable<StudentDocument | undefined> {
    this.sessionService.requireStudentId();
    return of(MOCK_PORTAL_DOCUMENTS.find(d => d.id === id)).pipe(delay(100));
  }
}
