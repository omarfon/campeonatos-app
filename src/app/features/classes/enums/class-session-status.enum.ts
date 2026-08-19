export enum ClassSessionStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
}

export const CLASS_SESSION_STATUS_LABELS: Record<ClassSessionStatus, string> = {
  [ClassSessionStatus.SCHEDULED]: 'Programada',
  [ClassSessionStatus.COMPLETED]: 'Realizada',
  [ClassSessionStatus.CANCELLED]: 'Cancelada',
  [ClassSessionStatus.RESCHEDULED]: 'Reprogramada',
};
