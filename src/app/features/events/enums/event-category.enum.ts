export enum EventCategory {
  GENERAL = 'GENERAL',
  MASSIVE = 'MASSIVE',
  FOOD = 'FOOD',
  FUNDRAISING = 'FUNDRAISING',
  CONTEST = 'CONTEST',
  TRIP = 'TRIP',
  WORKSHOP = 'WORKSHOP',
}

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  [EventCategory.GENERAL]: 'Evento General',
  [EventCategory.MASSIVE]: 'Evento Masivo',
  [EventCategory.FOOD]: 'Evento de Comida',
  [EventCategory.FUNDRAISING]: 'Evento de Recaudación',
  [EventCategory.CONTEST]: 'Concurso',
  [EventCategory.TRIP]: 'Paseo',
  [EventCategory.WORKSHOP]: 'Taller',
};
