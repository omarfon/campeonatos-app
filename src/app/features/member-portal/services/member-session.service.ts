import { Injectable, computed, signal } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { MemberLoginRequest, MemberLoginResponse, MemberSession } from '../models/member-portal.model';
import { MOCK_MEMBER_LOGIN, MOCK_MEMBER_SESSION } from '../mocks/member-portal.mock';

const SESSION_KEY = 'member_portal_session';

@Injectable({ providedIn: 'root' })
export class MemberSessionService {
  private readonly _session = signal<MemberSession | null>(this.loadStored());

  readonly session = this._session.asReadonly();
  readonly isAuthenticated = computed(() => !!this._session());
  readonly memberId = computed(() => this._session()?.memberId ?? null);

  login(request: MemberLoginRequest): Observable<MemberLoginResponse> {
    const valid =
      request.email.trim().toLowerCase() === MOCK_MEMBER_LOGIN.email &&
      request.password === MOCK_MEMBER_LOGIN.password;

    if (!valid) {
      return throwError(() => new Error('Credenciales incorrectas')).pipe(delay(400));
    }

    const response: MemberLoginResponse = {
      session: { ...MOCK_MEMBER_SESSION },
      token: 'mock-member-jwt',
    };
    this.persist(response.session);
    return of(response).pipe(delay(500));
  }

  logout(): void {
    this._session.set(null);
    sessionStorage.removeItem(SESSION_KEY);
  }

  restoreSession(): MemberSession | null {
    const stored = this.loadStored();
    this._session.set(stored);
    return stored;
  }

  requireMemberId(): string {
    const id = this._session()?.memberId;
    if (!id) throw new Error('Sesión no autenticada');
    return id;
  }

  private persist(session: MemberSession): void {
    this._session.set(session);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  private loadStored(): MemberSession | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) as MemberSession : null;
    } catch {
      return null;
    }
  }
}
