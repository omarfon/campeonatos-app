import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { EventEnvironment } from '../models/event.model';
import { MOCK_ENVIRONMENTS, MOCK_RESERVATIONS } from '../mocks/events.mock';

@Injectable({ providedIn: 'root' })
export class EventEnvironmentService {
  private readonly environments = [...MOCK_ENVIRONMENTS];
  private readonly reservations = [...MOCK_RESERVATIONS];

  getEnvironments(): Observable<EventEnvironment[]> {
    return of(this.environments).pipe(delay(50));
  }

  getEnvironment(id: string): Observable<EventEnvironment | undefined> {
    return of(this.environments.find(e => e.id === id)).pipe(delay(50));
  }

  checkAvailability(
    environmentId: string,
    startDate: string,
    startTime: string,
    endDate: string,
    endTime: string,
    excludeEventId?: string
  ): Observable<boolean> {
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);

    const conflict = this.reservations.some(r => {
      if (r.environmentId !== environmentId) return false;
      if (excludeEventId && r.eventId === excludeEventId) return false;
      const rStart = new Date(`${r.startDate}T${r.startTime}`);
      const rEnd = new Date(`${r.endDate}T${r.endTime}`);
      return start < rEnd && end > rStart;
    });

    return of(!conflict).pipe(delay(150));
  }

  reserveEnvironment(
    environmentId: string,
    startDate: string,
    startTime: string,
    endDate: string,
    endTime: string,
    eventId: string
  ): Observable<void> {
    this.reservations.push({ environmentId, startDate, startTime, endDate, endTime, eventId });
    return of(undefined).pipe(delay(100));
  }
}
