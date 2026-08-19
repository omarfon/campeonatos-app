import { ClassModality } from '../enums/class-modality.enum';
import { AcademicClassStatus } from '../enums/academic-class-status.enum';
import { ClassSessionStatus } from '../enums/class-session-status.enum';
import {
  AcademicPeriod,
  Activity,
  ClassCampusRef,
  ClassCourseRef,
  ClassEnrollmentStudent,
  ClassHistoryEntry,
  ClassModel,
  ClassRoomRef,
  ClassScheduleRule,
  ClassSession,
  ClassTeacherRef,
} from '../models/class.model';

export const MOCK_PERIODS: AcademicPeriod[] = [
  {
    id: 1,
    name: 'Agosto 2026',
    code: '202608',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    enabledForScheduling: true,
  },
  {
    id: 2,
    name: 'Septiembre 2026',
    code: '202609',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    enabledForScheduling: true,
  },
  {
    id: 3,
    name: 'Octubre 2026',
    code: '202610',
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    enabledForScheduling: true,
  },
];

export const MOCK_ACTIVITIES: Activity[] = [
  { id: 1, name: 'Natación', academiaRubroId: 'rub-dep' },
  { id: 2, name: 'Karate', academiaRubroId: 'rub-dep' },
  { id: 3, name: 'Fútbol', academiaRubroId: 'rub-dep' },
  { id: 4, name: 'Guitarra', academiaRubroId: 'rub-mus' },
  { id: 5, name: 'Ballet', academiaRubroId: 'rub-cul' },
];

export const MOCK_CLASS_COURSES: ClassCourseRef[] = [
  { id: 1, activityId: 1, name: 'Natación Básico', code: 'NAT-BAS', levelName: 'Básico', requiredRoomType: 'Piscina', academiaCursoId: 'cur-natacion' },
  { id: 2, activityId: 1, name: 'Natación Intermedio', code: 'NAT-INT', levelName: 'Intermedio', requiredRoomType: 'Piscina', academiaCursoId: 'cur-natacion' },
  { id: 3, activityId: 1, name: 'Natación Avanzado', code: 'NAT-AVZ', levelName: 'Avanzado', requiredRoomType: 'Piscina', academiaCursoId: 'cur-natacion' },
  { id: 4, activityId: 2, name: 'Karate Infantil', code: 'KAR-INF', levelName: 'Cinturón Blanco', requiredRoomType: 'Dojo', academiaCursoId: 'cur-karate' },
  { id: 5, activityId: 2, name: 'Karate Juvenil', code: 'KAR-JUV', levelName: 'Cinturón Amarillo', requiredRoomType: 'Dojo', academiaCursoId: 'cur-karate' },
  { id: 6, activityId: 3, name: 'Fútbol Formativo', code: 'FUT-FOR', levelName: 'Iniciación', requiredRoomType: 'Cancha', academiaCursoId: 'cur-futbol' },
  { id: 7, activityId: 4, name: 'Guitarra Principiante', code: 'GTR-PRI', levelName: 'Nivel 1', requiredRoomType: 'Aula', academiaCursoId: 'cur-guitarra' },
  { id: 8, activityId: 5, name: 'Ballet Clásico', code: 'BAL-CLA', levelName: 'Inicial', requiredRoomType: 'Salón', academiaCursoId: 'cur-ballet' },
  { id: 9, activityId: 5, name: 'Ballet Intermedio', code: 'BAL-INT', levelName: 'Intermedio', requiredRoomType: 'Salón', academiaCursoId: 'cur-ballet' },
  { id: 10, activityId: 1, name: 'Natación Adultos', code: 'NAT-ADU', levelName: 'Adultos', requiredRoomType: 'Piscina', academiaCursoId: 'cur-natacion' },
];

export const MOCK_TEACHERS: ClassTeacherRef[] = [
  { id: 1, firstName: 'Carlos', lastName: 'Tanaka', specialties: ['Natación'], active: true, academiaDocenteId: 'doc-1' },
  { id: 2, firstName: 'Ana', lastName: 'Pérez', specialties: ['Natación'], active: true, academiaDocenteId: 'doc-1' },
  { id: 3, firstName: 'Kenji', lastName: 'Tanaka', specialties: ['Karate', 'Judo'], active: true, academiaDocenteId: 'doc-2' },
  { id: 4, firstName: 'Silvia', lastName: 'Montenegro', specialties: ['Ballet'], active: true, academiaDocenteId: 'doc-3' },
  { id: 5, firstName: 'Pablo', lastName: 'Ríos', specialties: ['Guitarra'], active: true, academiaDocenteId: 'doc-4' },
  { id: 6, firstName: 'Ricardo', lastName: 'Benítez', specialties: ['Fútbol'], active: true, academiaDocenteId: 'doc-5' },
  { id: 7, firstName: 'Catherine', lastName: 'Smith', specialties: ['Inglés'], active: true, academiaDocenteId: 'doc-6' },
  { id: 8, firstName: 'Laura', lastName: 'Méndez', specialties: ['Artes'], active: true, academiaDocenteId: 'doc-7' },
  { id: 9, firstName: 'Luis', lastName: 'Pérez', specialties: ['Natación'], active: true },
  { id: 10, firstName: 'María', lastName: 'García', specialties: ['Karate'], active: true },
  { id: 11, firstName: 'Diego', lastName: 'Flores', specialties: ['Fútbol'], active: true },
  { id: 12, firstName: 'Elena', lastName: 'Vargas', specialties: ['Ballet'], active: true },
  { id: 13, firstName: 'Jorge', lastName: 'Castillo', specialties: ['Guitarra'], active: false },
  { id: 14, firstName: 'Patricia', lastName: 'López', specialties: ['Natación'], active: true },
  { id: 15, firstName: 'Roberto', lastName: 'Sánchez', specialties: ['Karate'], active: true },
];

export const MOCK_CAMPUSES: ClassCampusRef[] = [
  { id: 1, name: 'Principal' },
  { id: 2, name: 'Sede Norte' },
  { id: 3, name: 'Virtual' },
];

export const MOCK_ROOMS: ClassRoomRef[] = [
  { id: 1, campusId: 1, name: 'Piscina 1', type: 'Piscina', capacity: 24, academiaAmbienteId: 'amb-piscina' },
  { id: 2, campusId: 1, name: 'Piscina 2', type: 'Piscina', capacity: 20, academiaAmbienteId: 'amb-piscina' },
  { id: 3, campusId: 1, name: 'Dojo Principal', type: 'Dojo', capacity: 18, academiaAmbienteId: 'amb-dojo' },
  { id: 4, campusId: 1, name: 'Cancha 1', type: 'Cancha', capacity: 22, academiaAmbienteId: 'amb-cancha1' },
  { id: 5, campusId: 1, name: 'Salón Música A', type: 'Aula', capacity: 12, academiaAmbienteId: 'amb-salon1' },
  { id: 6, campusId: 1, name: 'Salón Danza', type: 'Salón', capacity: 14, academiaAmbienteId: 'amb-ballet' },
  { id: 7, campusId: 2, name: 'Piscina Norte', type: 'Piscina', capacity: 18 },
  { id: 8, campusId: 2, name: 'Dojo Norte', type: 'Dojo', capacity: 16 },
  { id: 9, campusId: 1, name: 'Aula 101', type: 'Aula', capacity: 20, academiaAmbienteId: 'amb-aula1' },
  { id: 10, campusId: 1, name: 'Taller Artes', type: 'Taller', capacity: 10, academiaAmbienteId: 'amb-taller' },
  { id: 11, campusId: 1, name: 'Coliseo', type: 'Coliseo', capacity: 80, academiaAmbienteId: 'amb-coliseo' },
  { id: 12, campusId: 3, name: 'Aula Virtual', type: 'Virtual', capacity: 50 },
];

const LMV: ClassScheduleRule[] = [
  { dayOfWeek: 1, startTime: '08:00', endTime: '09:00' },
  { dayOfWeek: 3, startTime: '08:00', endTime: '09:00' },
  { dayOfWeek: 5, startTime: '08:00', endTime: '09:00' },
];

const MJ_EVENING: ClassScheduleRule[] = [
  { dayOfWeek: 2, startTime: '18:00', endTime: '19:00' },
  { dayOfWeek: 4, startTime: '18:00', endTime: '19:00' },
];

const LMV_EVENING: ClassScheduleRule[] = [
  { dayOfWeek: 1, startTime: '18:00', endTime: '19:00' },
  { dayOfWeek: 3, startTime: '18:00', endTime: '19:30' },
  { dayOfWeek: 5, startTime: '17:00', endTime: '18:00' },
];

const SAT_MULTI: ClassScheduleRule[] = [
  { dayOfWeek: 6, startTime: '09:00', endTime: '10:00' },
  { dayOfWeek: 6, startTime: '11:00', endTime: '12:00' },
];

function basePublication(published: boolean): ClassModel['publicationChannels'] {
  return {
    adminEnrollment: published,
    studentPortal: published,
    memberPortal: published,
    publicWeb: false,
  };
}

function makeClass(
  id: number,
  code: string,
  name: string,
  courseId: number,
  activityId: number,
  teacherId: number,
  campusId: number,
  roomId: number,
  scheduleRules: ClassScheduleRule[],
  capacity: number,
  enrolled: number,
  status: AcademicClassStatus,
  periodId = 2,
  startDate = '2026-09-01',
  endDate = '2026-09-30',
): ClassModel {
  return {
    id,
    code,
    name,
    periodId,
    activityId,
    courseId,
    teacherId,
    modality: ClassModality.ONSITE,
    campusId,
    roomId,
    startDate,
    endDate,
    scheduleRules,
    capacity,
    minimumCapacity: 5,
    warningCapacity: 3,
    enrolled,
    waitingListEnabled: enrolled >= capacity,
    waitingListMax: 10,
    overbookingPolicy: 'none',
    enrollmentEnabled: status !== AcademicClassStatus.DRAFT,
    enrollmentStartDate: '2026-08-15',
    enrollmentEndDate: '2026-08-31',
    publicationChannels: basePublication(
      status === AcademicClassStatus.PUBLISHED || status === AcademicClassStatus.IN_PROGRESS,
    ),
    status,
  };
}

export const MOCK_CLASSES: ClassModel[] = [
  makeClass(1, 'NAT-BAS-202609-001', 'Natación Básico - Mañana 01', 1, 1, 1, 1, 1, LMV, 20, 16, AcademicClassStatus.PUBLISHED),
  makeClass(2, 'NAT-INT-202609-001', 'Natación Intermedio - Tarde 01', 2, 1, 2, 1, 1, LMV_EVENING, 20, 20, AcademicClassStatus.PUBLISHED),
  makeClass(3, 'NAT-AVZ-202609-001', 'Natación Avanzado - Noche', 3, 1, 1, 1, 2, MJ_EVENING, 15, 12, AcademicClassStatus.IN_PROGRESS),
  makeClass(4, 'KAR-INF-202609-001', 'Karate Infantil - Tarde', 4, 2, 3, 1, 3, MJ_EVENING, 18, 14, AcademicClassStatus.PUBLISHED),
  makeClass(5, 'FUT-FOR-202609-001', 'Fútbol Formativo - Sábado', 6, 3, 6, 1, 4, SAT_MULTI, 22, 18, AcademicClassStatus.SCHEDULED),
  makeClass(6, 'GTR-PRI-202609-001', 'Guitarra Principiante', 7, 4, 5, 1, 5, LMV, 12, 8, AcademicClassStatus.PUBLISHED),
  makeClass(7, 'BAL-CLA-202609-001', 'Ballet Clásico', 8, 5, 4, 1, 6, MJ_EVENING, 14, 14, AcademicClassStatus.PUBLISHED),
  makeClass(8, 'NAT-BAS-202609-002', 'Natación Básico - Tarde 02', 1, 1, 2, 1, 1, MJ_EVENING, 20, 19, AcademicClassStatus.PUBLISHED),
  makeClass(9, 'NAT-ADU-202609-001', 'Natación Adultos', 10, 1, 14, 1, 1, LMV_EVENING, 20, 5, AcademicClassStatus.DRAFT),
  makeClass(10, 'KAR-JUV-202609-001', 'Karate Juvenil', 5, 2, 10, 1, 3, LMV, 18, 18, AcademicClassStatus.COMPLETED, 1, '2026-08-01', '2026-08-31'),
  makeClass(11, 'NAT-INT-202608-001', 'Natación Intermedio - Agosto', 2, 1, 1, 1, 1, LMV, 20, 20, AcademicClassStatus.COMPLETED, 1, '2026-08-01', '2026-08-31'),
  makeClass(12, 'BAL-INT-202609-001', 'Ballet Intermedio', 9, 5, 12, 1, 6, LMV, 14, 0, AcademicClassStatus.CANCELLED),
  makeClass(13, 'NAT-BAS-202609-003', 'Natación Básico - Norte', 1, 1, 9, 2, 7, LMV, 18, 10, AcademicClassStatus.PUBLISHED),
  makeClass(14, 'KAR-INF-202609-002', 'Karate Infantil - Norte', 4, 2, 15, 2, 8, MJ_EVENING, 16, 16, AcademicClassStatus.PUBLISHED),
  makeClass(15, 'NAT-INT-202609-002', 'Natación Intermedio - Mañana 02', 2, 1, 1, 1, 1, LMV, 20, 17, AcademicClassStatus.PUBLISHED),
];

// Generar clases adicionales hasta 30
for (let i = 16; i <= 30; i++) {
  const courseIdx = (i % MOCK_CLASS_COURSES.length);
  const course = MOCK_CLASS_COURSES[courseIdx];
  const teacher = MOCK_TEACHERS[i % MOCK_TEACHERS.length];
  const room = MOCK_ROOMS[courseIdx % MOCK_ROOMS.length];
  const statuses = [
    AcademicClassStatus.PUBLISHED,
    AcademicClassStatus.PUBLISHED,
    AcademicClassStatus.SCHEDULED,
    AcademicClassStatus.DRAFT,
    AcademicClassStatus.IN_PROGRESS,
  ];
  const status = statuses[i % statuses.length];
  const capacity = 15 + (i % 10);
  const enrolled = status === AcademicClassStatus.DRAFT ? 0 : Math.min(capacity, 5 + (i * 2) % capacity);
  MOCK_CLASSES.push(
    makeClass(
      i,
      `${course.code}-202609-${String(i).padStart(3, '0')}`,
      `${course.name} - Grupo ${i}`,
      course.id,
      course.activityId,
      teacher.id,
      room.campusId,
      room.id,
      i % 2 === 0 ? LMV : MJ_EVENING,
      capacity,
      enrolled,
      status,
    ),
  );
}

export const MOCK_HOLIDAYS: { date: string; reason: string }[] = [
  { date: '2026-10-08', reason: 'Feriado' },
  { date: '2026-09-18', reason: 'Día no laborable' },
];

function generateSessionsForClass(cls: ClassModel): ClassSession[] {
  const sessions: ClassSession[] = [];
  let sessionId = cls.id * 100;
  const start = new Date(cls.startDate + 'T12:00:00');
  const end = new Date(cls.endDate + 'T12:00:00');
  const today = new Date('2026-09-15T12:00:00');

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    const rules = cls.scheduleRules.filter(r => r.dayOfWeek === dayOfWeek);
    for (const rule of rules) {
      const dateStr = d.toISOString().slice(0, 10);
      const holiday = MOCK_HOLIDAYS.find(h => h.date === dateStr);
      let status = ClassSessionStatus.SCHEDULED;
      if (d < today) status = ClassSessionStatus.COMPLETED;
      if (cls.status === AcademicClassStatus.CANCELLED) status = ClassSessionStatus.CANCELLED;
      if (cls.id === 12 && dateStr === '2026-09-09') status = ClassSessionStatus.CANCELLED;
      if (cls.id === 1 && dateStr === '2026-09-12') status = ClassSessionStatus.RESCHEDULED;

      sessions.push({
        id: sessionId++,
        classId: cls.id,
        date: dateStr,
        startTime: rule.startTime,
        endTime: rule.endTime,
        teacherId: cls.teacherId,
        roomId: cls.roomId,
        status,
        holidayWarning: !!holiday,
        holidayReason: holiday?.reason,
      });
    }
  }
  return sessions;
}

export const MOCK_SESSIONS: ClassSession[] = MOCK_CLASSES.flatMap(generateSessionsForClass);

export const MOCK_ENROLLMENT_STUDENTS: ClassEnrollmentStudent[] = Array.from({ length: 80 }, (_, i) => ({
  id: i + 1,
  name: ['Juan Pérez', 'Lucía Tanaka', 'María López', 'Pedro Gómez', 'Ana Ruiz'][i % 5] + ` ${Math.floor(i / 5) + 1}`,
  type: i % 3 === 0 ? 'Socio' : 'Alumno',
  enrollmentDate: `2026-08-${String(10 + (i % 18)).padStart(2, '0')}`,
  status: i % 7 === 0 ? 'Lista de espera' : 'Activo',
}));

export const MOCK_CLASS_HISTORY: ClassHistoryEntry[] = [
  { id: 1, date: '2026-08-19', time: '10:30', action: 'Clase creada' },
  { id: 2, date: '2026-08-20', time: '09:15', action: 'Profesor modificado', detail: 'Carlos Tanaka → Luis Pérez' },
  { id: 3, date: '2026-08-21', time: '14:00', action: 'Clase publicada' },
  { id: 4, date: '2026-09-09', time: '11:20', action: 'Sesión cancelada', detail: 'Motivo: mantenimiento de piscina' },
  { id: 5, date: '2026-09-12', time: '16:45', action: 'Sesión reprogramada', detail: '09/09 → 12/09 10:00-11:00' },
];

/** Escenario: conflicto de profesor al crear clase con docente 1, miércoles 18:00 */
export const MOCK_TEACHER_CONFLICT = {
  teacherId: 1,
  conflictingClassId: 2,
  conflictingClassName: 'Natación Intermedio - Tarde 01',
  dayOfWeek: 3,
  startTime: '18:00',
  endTime: '19:30',
};

/** Escenario: ambiente ocupado — Piscina 1 miércoles 18:00 */
export const MOCK_ROOM_CONFLICT = {
  roomId: 1,
  conflictingClassId: 2,
  conflictingClassName: 'Natación Intermedio - Tarde 01',
  dayOfWeek: 3,
  startTime: '18:00',
  endTime: '19:30',
};
