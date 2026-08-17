import { MemberCalendarEventType } from '../enums/member-calendar-event-type.enum';

export interface MemberCalendarActivityTemplate {
  participantPersonId: number;
  participantName: string;
  activityName: string;
  activityId: number;
  weekdays: number[];
  timeStart: string;
  timeEnd: string;
  venue: string;
  teacher?: string;
}

export interface MemberCalendarOneOffTemplate {
  id: string;
  name: string;
  daysOffset: number;
  timeStart: string;
  timeEnd: string;
  venue: string;
  participants: { personId: number; name: string }[];
}

/** Horarios recurrentes derivados de inscripciones activas de la familia Tanaka. */
export const MOCK_CALENDAR_ACTIVITY_TEMPLATES: MemberCalendarActivityTemplate[] = [
  {
    participantPersonId: 3,
    participantName: 'Lucía Tanaka',
    activityName: 'Natación Intermedio',
    activityId: 2,
    weekdays: [1, 3, 5],
    timeStart: '18:00',
    timeEnd: '19:00',
    venue: 'Piscina Principal',
    teacher: 'Carlos Tanaka',
  },
  {
    participantPersonId: 4,
    participantName: 'Diego Tanaka',
    activityName: 'Karate Juvenil',
    activityId: 4,
    weekdays: [2, 4],
    timeStart: '19:00',
    timeEnd: '20:00',
    venue: 'Dojo Norte',
    teacher: 'Sensei Mori',
  },
  {
    participantPersonId: 2,
    participantName: 'María Tanaka',
    activityName: 'Gimnasio Funcional',
    activityId: 7,
    weekdays: [1, 3, 5],
    timeStart: '07:00',
    timeEnd: '08:00',
    venue: 'Gimnasio',
    teacher: 'Marco Díaz',
  },
];

/** Eventos puntuales relativos a la fecha actual (demo). */
export const MOCK_CALENDAR_ONE_OFF_TEMPLATES: MemberCalendarOneOffTemplate[] = [
  {
    id: 'evt-cal-1',
    name: 'Noche Cultural',
    daysOffset: 12,
    timeStart: '18:00',
    timeEnd: '21:00',
    venue: 'Auditorio Principal',
    participants: [
      { personId: 1, name: 'Juan Tanaka' },
      { personId: 2, name: 'María Tanaka' },
    ],
  },
  {
    id: 'evt-cal-2',
    name: 'Torneo Interclubes',
    daysOffset: 5,
    timeStart: '09:00',
    timeEnd: '14:00',
    venue: 'Complejo Deportivo',
    participants: [
      { personId: 3, name: 'Lucía Tanaka' },
      { personId: 4, name: 'Diego Tanaka' },
    ],
  },
  {
    id: 'evt-cal-3',
    name: 'Asamblea de Socios',
    daysOffset: 20,
    timeStart: '19:00',
    timeEnd: '20:30',
    venue: 'Salón Social',
    participants: [{ personId: 1, name: 'Juan Tanaka' }],
  },
];

export const MEMBER_PARTICIPANT_COLORS: Record<number, string> = {
  1: 'linear-gradient(135deg, #1A3263, #b45309)',
  2: 'linear-gradient(135deg, #7c3aed, #a855f7)',
  3: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
  4: 'linear-gradient(135deg, #059669, #10b981)',
};

export const MEMBER_EVENT_TYPE_COLOR = 'linear-gradient(135deg, #d97706, #f59e0b)';

export const MEMBER_CALENDAR_TYPE_LABELS: Record<MemberCalendarEventType, string> = {
  [MemberCalendarEventType.ACTIVITY]: 'Actividad',
  [MemberCalendarEventType.EVENT]: 'Evento',
};
