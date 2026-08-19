export enum AcademicClassStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  PUBLISHED = 'PUBLISHED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export const ACADEMIC_CLASS_STATUS_LABELS: Record<AcademicClassStatus, string> = {
  [AcademicClassStatus.DRAFT]: 'Borrador',
  [AcademicClassStatus.SCHEDULED]: 'Programada',
  [AcademicClassStatus.PUBLISHED]: 'Publicada',
  [AcademicClassStatus.IN_PROGRESS]: 'En curso',
  [AcademicClassStatus.COMPLETED]: 'Finalizada',
  [AcademicClassStatus.CANCELLED]: 'Cancelada',
};

export const ACADEMIC_CLASS_STATUS_STYLES: Record<AcademicClassStatus, string> = {
  [AcademicClassStatus.DRAFT]: 'bg-slate-100 text-slate-700',
  [AcademicClassStatus.SCHEDULED]: 'bg-blue-100 text-blue-800',
  [AcademicClassStatus.PUBLISHED]: 'bg-green-100 text-green-800',
  [AcademicClassStatus.IN_PROGRESS]: 'bg-amber-100 text-amber-800',
  [AcademicClassStatus.COMPLETED]: 'bg-purple-100 text-purple-800',
  [AcademicClassStatus.CANCELLED]: 'bg-red-100 text-red-800',
};
