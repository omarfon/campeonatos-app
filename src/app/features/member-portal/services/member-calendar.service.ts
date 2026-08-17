import { Injectable, inject } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import {
  MemberCalendarEvent,
  MemberCalendarFilters,
} from '../models/member-portal.model';
import { MemberCalendarEventType } from '../enums/member-calendar-event-type.enum';
import { MemberSessionService } from './member-session.service';
import { ParticipantContextService } from './participant-context.service';
import {
  MOCK_CALENDAR_ACTIVITY_TEMPLATES,
  MOCK_CALENDAR_ONE_OFF_TEMPLATES,
} from '../mocks/member-calendar.mock';
import {
  addDays,
  dayLabelFromDate,
  endOfMonth,
  endOfWeek,
  formatLocalDate,
  parseLocalDate,
  startOfMonth,
  startOfWeek,
} from '../../student-portal/utils/schedule-calendar.utils';

@Injectable({ providedIn: 'root' })
export class MemberCalendarService {
  private readonly sessionService = inject(MemberSessionService);
  private readonly participantService = inject(ParticipantContextService);
  private nextId = 1;

  getWeeklyEvents(anchorDate?: string, filters: MemberCalendarFilters = {}): Observable<MemberCalendarEvent[]> {
    this.sessionService.requireMemberId();
    const anchor = anchorDate ? parseLocalDate(anchorDate) : new Date();
    const start = formatLocalDate(startOfWeek(anchor));
    const end = formatLocalDate(endOfWeek(anchor));
    return of(this.buildEvents(start, end, filters)).pipe(delay(250));
  }

  getMonthlyEvents(anchorDate?: string, filters: MemberCalendarFilters = {}): Observable<MemberCalendarEvent[]> {
    this.sessionService.requireMemberId();
    const anchor = anchorDate ? parseLocalDate(anchorDate) : new Date();
    const start = formatLocalDate(startOfMonth(anchor));
    const end = formatLocalDate(endOfMonth(anchor));
    return of(this.buildEvents(start, end, filters)).pipe(delay(250));
  }

  getNextEvent(): Observable<MemberCalendarEvent | null> {
    this.sessionService.requireMemberId();
    const today = formatLocalDate(new Date());
    const end = formatLocalDate(addDays(new Date(), 14));
    const events = this.buildEvents(today, end, {});
    const now = new Date();
    const upcoming = events
      .map(e => ({ e, start: this.toDateTime(e.date, e.timeStart) }))
      .filter(({ start }) => start >= now)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
    return of(upcoming[0]?.e ?? null).pipe(delay(150));
  }

  private buildEvents(start: string, end: string, filters: MemberCalendarFilters): MemberCalendarEvent[] {
    this.nextId = 1;
    const authorizedIds = new Set(
      this.participantService.authorizedParticipants().map(p => p.personId),
    );
    const events: MemberCalendarEvent[] = [];

    if (filters.eventType !== MemberCalendarEventType.EVENT) {
      events.push(...this.buildActivityEvents(start, end, authorizedIds, filters.participantPersonId));
    }

    if (filters.eventType !== MemberCalendarEventType.ACTIVITY) {
      events.push(...this.buildOneOffEvents(start, end, authorizedIds, filters.participantPersonId));
    }

    return events.sort((a, b) =>
      a.date.localeCompare(b.date) || a.timeStart.localeCompare(b.timeStart),
    );
  }

  private buildActivityEvents(
    start: string,
    end: string,
    authorizedIds: Set<number>,
    participantFilter?: number | 'all',
  ): MemberCalendarEvent[] {
    const events: MemberCalendarEvent[] = [];
    let current = parseLocalDate(start);
    const last = parseLocalDate(end);

    while (current <= last) {
      const jsDay = current.getDay();
      const date = formatLocalDate(current);

      for (const tpl of MOCK_CALENDAR_ACTIVITY_TEMPLATES) {
        if (!authorizedIds.has(tpl.participantPersonId)) continue;
        if (participantFilter != null && participantFilter !== 'all' && tpl.participantPersonId !== participantFilter) {
          continue;
        }
        if (!tpl.weekdays.includes(jsDay)) continue;

        events.push({
          id: `act-${this.nextId++}`,
          type: MemberCalendarEventType.ACTIVITY,
          title: tpl.activityName,
          date,
          dayLabel: dayLabelFromDate(current),
          timeStart: tpl.timeStart,
          timeEnd: tpl.timeEnd,
          participantPersonId: tpl.participantPersonId,
          participantName: tpl.participantName,
          venue: tpl.venue,
          teacher: tpl.teacher,
          activityId: tpl.activityId,
        });
      }

      current = addDays(current, 1);
    }

    return events;
  }

  private buildOneOffEvents(
    start: string,
    end: string,
    authorizedIds: Set<number>,
    participantFilter?: number | 'all',
  ): MemberCalendarEvent[] {
    const events: MemberCalendarEvent[] = [];
    const today = new Date();

    for (const tpl of MOCK_CALENDAR_ONE_OFF_TEMPLATES) {
      const eventDate = formatLocalDate(addDays(today, tpl.daysOffset));
      if (eventDate < start || eventDate > end) continue;

      const d = parseLocalDate(eventDate);
      for (const p of tpl.participants) {
        if (!authorizedIds.has(p.personId)) continue;
        if (participantFilter != null && participantFilter !== 'all' && p.personId !== participantFilter) {
          continue;
        }

        events.push({
          id: `evt-${this.nextId++}`,
          type: MemberCalendarEventType.EVENT,
          title: tpl.name,
          date: eventDate,
          dayLabel: dayLabelFromDate(d),
          timeStart: tpl.timeStart,
          timeEnd: tpl.timeEnd,
          participantPersonId: p.personId,
          participantName: p.name,
          venue: tpl.venue,
          eventId: tpl.id,
        });
      }
    }

    return events;
  }

  private toDateTime(date: string, time: string): Date {
    const [y, m, d] = date.split('-').map(Number);
    const [h, min] = time.split(':').map(Number);
    return new Date(y, m - 1, d, h, min);
  }
}
