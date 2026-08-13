import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ContestCategory } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventContestService {
  validateCategoryQuota(category: ContestCategory): Observable<{ valid: boolean; message?: string }> {
    if (category.registeredCount >= category.quota) {
      return of({ valid: false, message: `Cupo de categoría "${category.name}" agotado (${category.quota})` }).pipe(delay(50));
    }
    return of({ valid: true }).pipe(delay(50));
  }
}
