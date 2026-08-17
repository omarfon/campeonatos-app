export enum StudentAttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  JUSTIFIED = 'JUSTIFIED',
}

export const STUDENT_ATTENDANCE_STATUS_LABELS: Record<StudentAttendanceStatus, string> = {
  [StudentAttendanceStatus.PRESENT]: 'Presente',
  [StudentAttendanceStatus.ABSENT]: 'Ausente',
  [StudentAttendanceStatus.JUSTIFIED]: 'Justificada',
};
