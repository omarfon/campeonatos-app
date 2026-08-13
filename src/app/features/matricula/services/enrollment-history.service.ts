import { Injectable, signal } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { EnrollmentHistoryEntry } from '../models/enrollment.model';
import { MOCK_ENROLLMENT_HISTORY } from '../mocks/enrollment.mock';

@Injectable({ providedIn: 'root' })
export class EnrollmentHistoryService {
  private readonly _history = signal<EnrollmentHistoryEntry[]>([...MOCK_ENROLLMENT_HISTORY]);
  private _nextId = MOCK_ENROLLMENT_HISTORY.length + 1;

  getByEnrollment(enrollmentId: number): Observable<EnrollmentHistoryEntry[]> {
    return of(this._history().filter(h => h.enrollmentId === enrollmentId)).pipe(delay(150));
  }

  getAll(): Observable<EnrollmentHistoryEntry[]> {
    return of([...this._history()].sort((a, b) => b.timestamp.localeCompare(a.timestamp))).pipe(delay(150));
  }

  addEntry(enrollmentId: number, action: string, detail: string, user = 'Administrador Counter'): void {
    this._history.update(list => [...list, {
      id: this._nextId++,
      enrollmentId,
      timestamp: new Date().toISOString(),
      action,
      detail,
      user,
    }]);
  }
}
