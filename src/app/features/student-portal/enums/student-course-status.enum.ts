export enum StudentCourseStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export const STUDENT_COURSE_STATUS_LABELS: Record<StudentCourseStatus, string> = {
  [StudentCourseStatus.ACTIVE]: 'Activo',
  [StudentCourseStatus.COMPLETED]: 'Finalizado',
  [StudentCourseStatus.CANCELLED]: 'Cancelado',
};
