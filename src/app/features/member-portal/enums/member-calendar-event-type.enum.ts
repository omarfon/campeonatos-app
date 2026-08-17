export enum MemberCalendarEventType {
  ACTIVITY = 'activity',
  EVENT = 'event',
}

export const MEMBER_CALENDAR_EVENT_TYPE_LABELS: Record<MemberCalendarEventType, string> = {
  [MemberCalendarEventType.ACTIVITY]: 'Actividad',
  [MemberCalendarEventType.EVENT]: 'Evento',
};
