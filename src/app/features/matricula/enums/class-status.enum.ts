export enum ClassStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  CANCELLED = 'CANCELLED',
  INACTIVE = 'INACTIVE',
}

export const CLASS_STATUS_LABELS: Record<ClassStatus, string> = {
  [ClassStatus.DRAFT]: 'Borrador',
  [ClassStatus.PENDING]: 'Pendiente',
  [ClassStatus.APPROVED]: 'Aprobada',
  [ClassStatus.CANCELLED]: 'Cancelada',
  [ClassStatus.INACTIVE]: 'Inactiva',
};
