import { Injectable, computed, signal } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { StudentSession, LoginRequest, LoginResponse } from '../models/student-portal.model';
import { MOCK_PORTAL_LOGIN, MOCK_PORTAL_SESSION } from '../mocks/student-portal.mock';

const SESSION_KEY = 'student_portal_session';

@Injectable({ providedIn: 'root' })
export class StudentSessionService {
  private readonly _session = signal<StudentSession | null>(this.loadStored());

  readonly session = this._session.asReadonly();
  readonly isAuthenticated = computed(() => !!this._session());
  readonly studentId = computed(() => this._session()?.studentId ?? null);

  login(request: LoginRequest): Observable<LoginResponse> {
    const valid =
      request.email.trim().toLowerCase() === MOCK_PORTAL_LOGIN.email &&
      request.password === MOCK_PORTAL_LOGIN.password;

    if (!valid) {
      return throwError(() => new Error('Credenciales incorrectas')).pipe(delay(400));
    }

    const response: LoginResponse = {
      session: { ...MOCK_PORTAL_SESSION },
      token: 'mock-jwt-token',
    };
    this._session.set(response.session);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(response.session));
    return of(response).pipe(delay(500));
  }

  logout(): void {
    this._session.set(null);
    sessionStorage.removeItem(SESSION_KEY);
  }

  restoreSession(): StudentSession | null {
    const stored = this.loadStored();
    this._session.set(stored);
    return stored;
  }

  requireStudentId(): number {
    const id = this._session()?.studentId;
    if (!id) throw new Error('Sesión no autenticada');
    return id;
  }

  private loadStored(): StudentSession | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) as StudentSession : null;
    } catch {
      return null;
    }
  }
}
