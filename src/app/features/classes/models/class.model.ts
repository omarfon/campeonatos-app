import { ClassModality } from '../enums/class-modality.enum';
import { AcademicClassStatus } from '../enums/academic-class-status.enum';
import { ClassSessionStatus } from '../enums/class-session-status.enum';

export interface AcademicPeriod {
  id: number;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  enabledForScheduling: boolean;
}

export interface Activity {
  id: number;
  name: string;
  academiaRubroId?: string;
}

export interface ClassCourseRef {
  id: number;
  activityId: number;
  name: string;
  code: string;
  levelName?: string;
  requiredRoomType?: string;
  academiaCursoId?: string;
}

export interface ClassTeacherRef {
  id: number;
  firstName: string;
  lastName: string;
  specialties: string[];
  active: boolean;
  academiaDocenteId?: string;
}

export interface ClassCampusRef {
  id: number;
  name: string;
}

export interface ClassRoomRef {
  id: number;
  campusId: number;
  name: string;
  type: string;
  capacity: number;
  academiaAmbienteId?: string;
}

export interface ClassScheduleRule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface ClassScheduleBlock extends ClassScheduleRule {
  id: string;
}

export interface ClassPublicationChannels {
  adminEnrollment: boolean;
  studentPortal: boolean;
  memberPortal: boolean;
  publicWeb: boolean;
}

export interface ClassModel {
  id: number;
  code: string;
  name: string;
  description?: string;
  periodId: number;
  activityId: number;
  courseId: number;
  teacherId: number;
  modality: ClassModality;
  campusId?: number;
  roomId?: number;
  platform?: string;
  accessInfo?: string;
  startDate: string;
  endDate: string;
  scheduleRules: ClassScheduleRule[];
  capacity: number;
  minimumCapacity?: number;
  warningCapacity?: number;
  enrolled: number;
  waitingListEnabled: boolean;
  waitingListMax?: number;
  overbookingPolicy: 'none' | 'authorized';
  enrollmentEnabled: boolean;
  enrollmentStartDate?: string;
  enrollmentEndDate?: string;
  publicationChannels: ClassPublicationChannels;
  status: AcademicClassStatus;
}

export interface ClassSummary {
  enrolled: number;
  capacity: number;
  available: number;
  totalSessions: number;
  completedSessions: number;
  attendancePercentage?: number;
}

export interface ClassSession {
  id?: number;
  classId?: number;
  date: string;
  startTime: string;
  endTime: string;
  teacherId: number;
  roomId?: number;
  status: ClassSessionStatus;
  holidayWarning?: boolean;
  holidayReason?: string;
  originalSessionId?: number;
  recoverySessionId?: number;
}

export interface ClassConflict {
  type: 'TEACHER' | 'ROOM' | 'SCHEDULE' | 'PERIOD';
  message: string;
  conflictingClassId?: number;
  date?: string;
  startTime?: string;
  endTime?: string;
}

export interface TeacherAvailabilityRequest {
  teacherId: number;
  startDate: string;
  endDate: string;
  scheduleRules: ClassScheduleRule[];
  excludeClassId?: number;
}

export interface RoomAvailabilityRequest {
  roomId: number;
  startDate: string;
  endDate: string;
  scheduleRules: ClassScheduleRule[];
  excludeClassId?: number;
}

export interface ClassListFilters {
  search?: string;
  periodId?: number;
  activityId?: number;
  courseId?: number;
  teacherId?: number;
  campusId?: number;
  modality?: ClassModality | '';
  status?: AcademicClassStatus | '';
  availability?: 'available' | 'last_spots' | 'full' | '';
}

export interface ClassListItem extends ClassModel {
  courseName: string;
  teacherName: string;
  campusName: string;
  scheduleLabel: string;
  frequencyLabel: string;
}

export interface ClassListStats {
  active: number;
  upcoming: number;
  full: number;
  withSpots: number;
  draft: number;
}

export interface CreateClassRequest {
  name: string;
  description?: string;
  periodId: number;
  activityId: number;
  courseId: number;
  teacherId: number;
  modality: ClassModality;
  campusId?: number;
  roomId?: number;
  platform?: string;
  accessInfo?: string;
  startDate: string;
  endDate: string;
  scheduleRules: ClassScheduleRule[];
  capacity: number;
  minimumCapacity?: number;
  warningCapacity?: number;
  waitingListEnabled: boolean;
  waitingListMax?: number;
  overbookingPolicy: 'none' | 'authorized';
  enrollmentEnabled: boolean;
  enrollmentStartDate?: string;
  enrollmentEndDate?: string;
  publicationChannels: ClassPublicationChannels;
  sessions: ClassSession[];
}

export interface DuplicateClassRequest {
  sourceClassId: number;
  periodId: number;
  startDate: string;
  endDate: string;
}

export interface ClassEnrollmentStudent {
  id: number;
  name: string;
  type: 'Alumno' | 'Socio';
  enrollmentDate: string;
  status: 'Activo' | 'Retirado' | 'Lista de espera';
}

export interface ClassHistoryEntry {
  id: number;
  date: string;
  time: string;
  action: string;
  detail?: string;
}

export interface ClassEditPermissions {
  name: boolean;
  description: boolean;
  structural: boolean;
  resources: boolean;
  capacity: boolean;
  enrollment: boolean;
  publication: boolean;
}

export interface PublishValidationItem {
  label: string;
  valid: boolean;
}

export type CapacityAvailabilityLabel = 'DISPONIBLE' | 'ULTIMOS_CUPOS' | 'COMPLETA';

export function getCapacityAvailability(
  available: number,
  capacity: number,
  warningCapacity = 3,
): CapacityAvailabilityLabel {
  if (available <= 0) return 'COMPLETA';
  if (available <= warningCapacity) return 'ULTIMOS_CUPOS';
  return 'DISPONIBLE';
}

export const CAPACITY_AVAILABILITY_LABELS: Record<CapacityAvailabilityLabel, string> = {
  DISPONIBLE: 'Disponible',
  ULTIMOS_CUPOS: 'Últimos cupos',
  COMPLETA: 'Completa',
};

const DAY_ABBR = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

export function buildFrequencyLabel(rules: ClassScheduleRule[]): string {
  const days = [...new Set(rules.map(r => r.dayOfWeek))].sort((a, b) => a - b);
  return days.map(d => DAY_ABBR[d]).join('-');
}

export function buildScheduleLabel(rules: ClassScheduleRule[]): string {
  if (rules.length === 0) return '—';
  const freq = buildFrequencyLabel(rules);
  const first = rules[0];
  const sameTime = rules.every(r => r.startTime === first.startTime && r.endTime === first.endTime);
  if (sameTime) {
    return `${freq} ${first.startTime}`;
  }
  return freq;
}
