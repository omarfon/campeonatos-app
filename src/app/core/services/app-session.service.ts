import { Injectable, computed, signal } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { AppLoginRequest, AppLoginResponse, AppUserSession } from '../models/app-session.model';
import { MOCK_APP_LOGIN, MOCK_APP_SESSION } from '../mocks/app-session.mock';

const SESSION_KEY = 'main_portal_session';

@Injectable({ providedIn: 'root' })
export class AppSessionService {
  private readonly _session = signal<AppUserSession | null>(this.loadStored());

  readonly session = this._session.asReadonly();
  readonly isAuthenticated = computed(() => !!this._session());

  login(request: AppLoginRequest): Observable<AppLoginResponse> {
    const valid =
      request.email.trim().toLowerCase() === MOCK_APP_LOGIN.email &&
      request.password === MOCK_APP_LOGIN.password;

    if (!valid) {
      return throwError(() => new Error('Credenciales incorrectas')).pipe(delay(400));
    }

    const response: AppLoginResponse = {
      session: { ...MOCK_APP_SESSION },
      token: 'mock-admin-jwt',
    };
    this.persist(response.session);
    return of(response).pipe(delay(500));
  }

  logout(): void {
    this._session.set(null);
    sessionStorage.removeItem(SESSION_KEY);
  }

  restoreSession(): AppUserSession | null {
    const stored = this.loadStored();
    this._session.set(stored);
    return stored;
  }

  private persist(session: AppUserSession): void {
    this._session.set(session);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  private loadStored(): AppUserSession | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) as AppUserSession : null;
    } catch {
      return null;
    }
  }
}
