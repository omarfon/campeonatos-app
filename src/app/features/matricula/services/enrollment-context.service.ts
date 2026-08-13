import { Injectable, signal } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { EnrollmentContext } from '../models/enrollment.model';
import { MOCK_SETTLEMENT_OPEN } from '../mocks/enrollment.mock';

@Injectable({ providedIn: 'root' })
export class EnrollmentContextService {
  private readonly _settlementOpen = signal(MOCK_SETTLEMENT_OPEN);

  getContext(): Observable<EnrollmentContext> {
    const today = new Date();
    const date = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    return of({
      campus: 'AELU Principal',
      user: 'Administrador Counter',
      date,
      settlementOpen: this._settlementOpen(),
      settlementId: this._settlementOpen() ? 'LIQ-2026-001' : undefined,
    }).pipe(delay(200));
  }

  isSettlementOpen(): Observable<boolean> {
    return of(this._settlementOpen()).pipe(delay(100));
  }

  /** Mock: alternar liquidación para pruebas */
  toggleSettlement(open: boolean): void {
    this._settlementOpen.set(open);
  }
}
