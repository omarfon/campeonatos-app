import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { ParticipantType } from '../enums/participant-type.enum';
import { EventRate, RateCalculation } from '../models/event.model';
import { EventService } from './event.service';

export interface RateSimulationInput {
  eventId: string;
  personId: string;
  memberCategory: string;
  condition: string;
  hasDebt: boolean;
  participantType: ParticipantType;
}

@Injectable({ providedIn: 'root' })
export class EventRateService {
  constructor(private readonly eventService: EventService) {}

  calculateRate(
    eventId: string,
    personId: string,
    participantType: ParticipantType,
    hasDebt = false
  ): Observable<RateCalculation> {
    const event = this.eventService.getEventSync(eventId);
    if (!event) {
      return of({
        baseRate: 0, appliedRate: 0, rateName: 'N/A', hasDebtPenalty: false,
        participantType, explanation: 'Evento no encontrado',
      }).pipe(delay(100));
    }

    if (event.isFree) {
      return of({
        baseRate: 0, appliedRate: 0, rateName: 'Gratuito', hasDebtPenalty: false,
        participantType, explanation: 'Evento gratuito — inscripción obligatoria para control de aforo',
      }).pipe(delay(100));
    }

    let effectiveType = participantType;
    let hasDebtPenalty = false;

    if (hasDebt && event.rateRules.applyDebtPenalty && participantType === ParticipantType.MEMBER_HOLDER) {
      effectiveType = ParticipantType.PUBLIC;
      hasDebtPenalty = true;
    }

    const rate = this.findMatchingRate(event.rates, effectiveType, hasDebt);
    const explanation = hasDebtPenalty
      ? 'Socio con deuda detectada. Se aplica tarifa NO SOCIO.'
      : `Tarifa aplicable para ${this.participantLabel(participantType)}`;

    return of({
      baseRate: rate?.price ?? 0,
      appliedRate: rate?.price ?? 0,
      rateName: rate ? `${rate.memberCategory} - ${rate.condition}` : 'Sin tarifa',
      hasDebtPenalty,
      participantType: effectiveType,
      explanation,
    }).pipe(delay(150));
  }

  simulateRate(input: RateSimulationInput): Observable<RateCalculation> {
    return this.calculateRate(input.eventId, input.personId, input.participantType, input.hasDebt);
  }

  private findMatchingRate(rates: EventRate[], type: ParticipantType, hasDebt: boolean): EventRate | undefined {
    const match = rates.find(r => r.participantType === type && r.status === 'active');
    if (match) return match;
    if (hasDebt) return rates.find(r => r.memberCategory === 'No socio');
    return rates[0];
  }

  private participantLabel(type: ParticipantType): string {
    const labels: Record<ParticipantType, string> = {
      [ParticipantType.MEMBER_HOLDER]: 'Socio titular',
      [ParticipantType.MEMBER_GUEST]: 'Invitado de socio',
      [ParticipantType.NON_MEMBER]: 'No socio',
      [ParticipantType.PUBLIC]: 'Público general',
    };
    return labels[type];
  }
}
