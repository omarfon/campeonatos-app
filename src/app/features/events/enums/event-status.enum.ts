export enum EventStatus {
  DRAFT = 'DRAFT',
  CONFIGURED = 'CONFIGURED',
  PUBLISHED = 'PUBLISHED',
  REGISTRATION_OPEN = 'REGISTRATION_OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
  SETTLED = 'SETTLED',
  CANCELLED = 'CANCELLED',
}

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  [EventStatus.DRAFT]: 'Borrador',
  [EventStatus.CONFIGURED]: 'Configurado',
  [EventStatus.PUBLISHED]: 'Publicado',
  [EventStatus.REGISTRATION_OPEN]: 'En inscripción',
  [EventStatus.IN_PROGRESS]: 'En curso',
  [EventStatus.FINISHED]: 'Finalizado',
  [EventStatus.SETTLED]: 'Liquidado',
  [EventStatus.CANCELLED]: 'Cancelado',
};

export const EVENT_STATUS_CLASSES: Record<EventStatus, string> = {
  [EventStatus.DRAFT]: 'bg-slate-50 text-slate-600 border border-slate-200',
  [EventStatus.CONFIGURED]: 'bg-blue-50 text-blue-700 border border-blue-200',
  [EventStatus.PUBLISHED]: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  [EventStatus.REGISTRATION_OPEN]: 'bg-green-50 text-green-700 border border-green-200',
  [EventStatus.IN_PROGRESS]: 'bg-amber-50 text-amber-700 border border-amber-200',
  [EventStatus.FINISHED]: 'bg-purple-50 text-purple-700 border border-purple-200',
  [EventStatus.SETTLED]: 'bg-teal-50 text-teal-700 border border-teal-200',
  [EventStatus.CANCELLED]: 'bg-red-50 text-red-700 border border-red-200',
};
