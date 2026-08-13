import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { EventCapacity, getAvailableCapacity, getOccupancyPercent } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventCapacityService {
  calculateAvailable(capacity: EventCapacity): number {
    return getAvailableCapacity(capacity);
  }

  getOccupancyPercent(capacity: EventCapacity): number {
    return getOccupancyPercent(capacity);
  }

  validateCapacity(capacity: EventCapacity): Observable<{ valid: boolean; message?: string }> {
    if (capacity.confirmedCapacity > capacity.totalCapacity) {
      return of({ valid: false, message: 'Los cupos confirmados no pueden superar el aforo total' }).pipe(delay(50));
    }
    if (capacity.reservedCapacity + capacity.confirmedCapacity > capacity.totalCapacity) {
      return of({ valid: false, message: 'La suma de reservados y confirmados supera el aforo total' }).pipe(delay(50));
    }
    return of({ valid: true }).pipe(delay(50));
  }

  isSoldOut(capacity: EventCapacity): boolean {
    return getAvailableCapacity(capacity) === 0;
  }
}
