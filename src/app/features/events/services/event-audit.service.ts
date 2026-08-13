import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { EventAudit } from '../models/event.model';
import { MOCK_AUDITS } from '../mocks/events.mock';

@Injectable({ providedIn: 'root' })
export class EventAuditService {
  private readonly _audits = signal<EventAudit[]>([...MOCK_AUDITS]);
  readonly audits = this._audits.asReadonly();

  getAudits(eventId: string): Observable<EventAudit[]> {
    return of(
      this._audits()
        .filter(a => a.eventId === eventId)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    ).pipe(delay(100));
  }

  addAudit(entry: Omit<EventAudit, 'id' | 'timestamp'> & { timestamp?: string }): void {
    const audit: EventAudit = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: entry.timestamp ?? new Date().toISOString(),
    };
    this._audits.update(list => [audit, ...list]);
  }
}
