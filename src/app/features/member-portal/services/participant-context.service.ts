import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of, throwError, delay } from 'rxjs';
import { ParticipantContext } from '../models/member-portal.model';
import { MOCK_PARTICIPANTS } from '../mocks/member-portal.mock';
import { MemberSessionService } from './member-session.service';

@Injectable({ providedIn: 'root' })
export class ParticipantContextService {
  private readonly sessionService = inject(MemberSessionService);

  private readonly _authorizedParticipants = signal<ParticipantContext[]>([...MOCK_PARTICIPANTS]);
  private readonly _selectedParticipant = signal<ParticipantContext | null>(null);

  readonly authorizedParticipants = this._authorizedParticipants.asReadonly();
  readonly selectedParticipant = this._selectedParticipant.asReadonly();

  readonly hasSelection = computed(() => !!this._selectedParticipant());
  readonly holderParticipant = computed(() =>
    this._authorizedParticipants().find(p => p.isHolder) ?? null,
  );

  selectParticipant(participant: ParticipantContext): void {
    if (!this.canOperateFor(participant.personId)) {
      throw new Error('No tienes autorización para operar en nombre de esta persona.');
    }
    this._selectedParticipant.set({ ...participant });
  }

  selectParticipantById(personId: number): void {
    const participant = this._authorizedParticipants().find(p => p.personId === personId);
    if (!participant) {
      throw new Error('Participante no encontrado en tu grupo familiar.');
    }
    this.selectParticipant(participant);
  }

  clearParticipant(): void {
    this._selectedParticipant.set(null);
  }

  /** Invalida la selección actual (p. ej. al cambiar de participante en un flujo). */
  resetOperationContext(): void {
    this._selectedParticipant.set(null);
  }

  canOperateFor(personId: number): boolean {
    this.sessionService.requireMemberId();
    return this._authorizedParticipants().some(p => p.personId === personId);
  }

  validateParticipant(personId: number): Observable<ParticipantContext> {
    this.sessionService.requireMemberId();
    const participant = this._authorizedParticipants().find(p => p.personId === personId);
    if (!participant) {
      return throwError(() => new Error(
        'No puedes realizar esta operación para la persona seleccionada. Consulta con Administración si necesitas ayuda.',
      )).pipe(delay(200));
    }
    return of({ ...participant }).pipe(delay(150));
  }

  loadAuthorizedParticipants(): Observable<ParticipantContext[]> {
    this.sessionService.requireMemberId();
    return of([...this._authorizedParticipants()]).pipe(delay(200));
  }
}
