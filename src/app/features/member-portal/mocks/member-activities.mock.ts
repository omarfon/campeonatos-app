import { MemberScheduleAvailability } from '../enums/member-schedule-availability.enum';
import {
  MemberActivity,
  MemberActivitySchedule,
  MemberActivityEnrollment,
  MemberActivityAgreement,
} from '../models/member-portal.model';

export const MOCK_MEMBER_AGREEMENTS: MemberActivityAgreement[] = [
  { id: 1, name: 'Convenio Empresa ABC', description: '20% de descuento en natación y karate', discountPercent: 20 },
  { id: 2, name: 'Membresía familiar', description: '10% en segunda actividad', discountPercent: 10 },
];

export const MOCK_MEMBER_ACTIVITIES: MemberActivity[] = [
  {
    id: 1, name: 'Natación Básico', code: 'NAT-BAS', discipline: 'Natación', category: 'Infantil-Juvenil',
    level: 'Básico', modality: 'Presencial', campus: 'Sede Principal', duration: '3 meses',
    description: 'Introducción a técnicas de natación en piscina climatizada.',
    basePrice: 180, scheduleCount: 3, availableScheduleCount: 2, recommended: true,
  },
  {
    id: 2, name: 'Natación Intermedio', code: 'NAT-INT', discipline: 'Natación', category: 'Juvenil',
    level: 'Intermedio', modality: 'Presencial', campus: 'Sede Principal', duration: '3 meses',
    description: 'Perfeccionamiento de estilos y resistencia acuática.',
    basePrice: 200, scheduleCount: 2, availableScheduleCount: 2,
  },
  {
    id: 3, name: 'Karate Infantil', code: 'KAR-INF', discipline: 'Karate', category: 'Infantil',
    level: 'Básico', modality: 'Presencial', campus: 'Sede Principal', duration: '3 meses',
    description: 'Disciplina marcial con enfoque en coordinación y valores.',
    basePrice: 160, scheduleCount: 2, availableScheduleCount: 1,
  },
  {
    id: 4, name: 'Karate Juvenil', code: 'KAR-JUV', discipline: 'Karate', category: 'Juvenil',
    level: 'Intermedio', modality: 'Presencial', campus: 'Sede Norte', duration: '3 meses',
    description: 'Técnicas avanzadas y preparación para cinturones.',
    basePrice: 170, scheduleCount: 1, availableScheduleCount: 1,
  },
  {
    id: 5, name: 'Danza Contemporánea', code: 'DAN-CON', discipline: 'Danza', category: 'Juvenil',
    level: 'Básico', modality: 'Presencial', campus: 'Sede Principal', duration: '2 meses',
    description: 'Expresión corporal y coreografías grupales.',
    basePrice: 150, scheduleCount: 1, availableScheduleCount: 1,
  },
  {
    id: 6, name: 'Tenis Recreativo', code: 'TEN-REC', discipline: 'Tenis', category: 'Adulto',
    level: 'Básico', modality: 'Presencial', campus: 'Sede Norte', duration: '3 meses',
    description: 'Fundamentos del tenis en canchas al aire libre.',
    basePrice: 220, scheduleCount: 1, availableScheduleCount: 0,
  },
  {
    id: 7, name: 'Gimnasio Funcional', code: 'GIM-FUN', discipline: 'Gimnasio', category: 'Adulto',
    level: 'Todos', modality: 'Presencial', campus: 'Sede Principal', duration: 'Mensual',
    description: 'Entrenamiento funcional con instructor certificado.',
    basePrice: 120, scheduleCount: 2, availableScheduleCount: 2,
  },
  {
    id: 8, name: 'Natación Virtual', code: 'NAT-VIR', discipline: 'Natación', category: 'Adulto',
    level: 'Básico', modality: 'Virtual', campus: 'Online', duration: '2 meses',
    description: 'Clases en vivo con seguimiento personalizado.',
    basePrice: 140, scheduleCount: 1, availableScheduleCount: 1,
  },
];

export const MOCK_MEMBER_SCHEDULES: MemberActivitySchedule[] = [
  { id: 101, activityId: 1, activityName: 'Natación Básico', days: 'LUN / MIÉ / VIE', dayKeys: ['lun', 'mie', 'vie'], timeStart: '18:00', timeEnd: '19:00', venue: 'Piscina Principal', teacher: 'Carlos Tanaka', availableSpots: 8, totalSpots: 20, availability: MemberScheduleAvailability.AVAILABLE },
  { id: 102, activityId: 1, activityName: 'Natación Básico', days: 'MAR / JUE', dayKeys: ['mar', 'jue'], timeStart: '17:00', timeEnd: '18:00', venue: 'Piscina Principal', teacher: 'Ana Ruiz', availableSpots: 2, totalSpots: 15, availability: MemberScheduleAvailability.LAST_SPOTS },
  { id: 103, activityId: 1, activityName: 'Natación Básico', days: 'SÁB', dayKeys: ['sab'], timeStart: '09:00', timeEnd: '10:00', venue: 'Piscina Principal', teacher: 'Carlos Tanaka', availableSpots: 0, totalSpots: 12, availability: MemberScheduleAvailability.FULL },
  { id: 201, activityId: 2, activityName: 'Natación Intermedio', days: 'LUN / MIÉ / VIE', dayKeys: ['lun', 'mie', 'vie'], timeStart: '18:00', timeEnd: '19:00', venue: 'Piscina Principal', teacher: 'Carlos Tanaka', availableSpots: 6, totalSpots: 18, availability: MemberScheduleAvailability.AVAILABLE },
  { id: 202, activityId: 2, activityName: 'Natación Intermedio', days: 'MAR / JUE', dayKeys: ['mar', 'jue'], timeStart: '19:00', timeEnd: '20:00', venue: 'Piscina Secundaria', teacher: 'Ana Ruiz', availableSpots: 4, totalSpots: 16, availability: MemberScheduleAvailability.AVAILABLE },
  { id: 301, activityId: 3, activityName: 'Karate Infantil', days: 'LUN / MIÉ', dayKeys: ['lun', 'mie'], timeStart: '16:00', timeEnd: '17:00', venue: 'Dojo Principal', teacher: 'Sensei Mori', availableSpots: 1, totalSpots: 14, availability: MemberScheduleAvailability.LAST_SPOTS },
  { id: 302, activityId: 3, activityName: 'Karate Infantil', days: 'SÁB', dayKeys: ['sab'], timeStart: '10:00', timeEnd: '11:00', venue: 'Dojo Principal', teacher: 'Sensei Mori', availableSpots: 0, totalSpots: 12, availability: MemberScheduleAvailability.FULL },
  { id: 401, activityId: 4, activityName: 'Karate Juvenil', days: 'MAR / JUE', dayKeys: ['mar', 'jue'], timeStart: '19:00', timeEnd: '20:00', venue: 'Dojo Norte', teacher: 'Sensei Mori', availableSpots: 5, totalSpots: 16, availability: MemberScheduleAvailability.AVAILABLE },
  { id: 501, activityId: 5, activityName: 'Danza Contemporánea', days: 'VIE', dayKeys: ['vie'], timeStart: '17:00', timeEnd: '18:30', venue: 'Salón de Danza', teacher: 'Lucía Vega', availableSpots: 10, totalSpots: 20, availability: MemberScheduleAvailability.AVAILABLE },
  { id: 601, activityId: 6, activityName: 'Tenis Recreativo', days: 'SÁB', dayKeys: ['sab'], timeStart: '08:00', timeEnd: '09:30', venue: 'Cancha 1', teacher: 'Pedro Soto', availableSpots: 0, totalSpots: 8, availability: MemberScheduleAvailability.FULL },
  { id: 701, activityId: 7, activityName: 'Gimnasio Funcional', days: 'LUN / MIÉ / VIE', dayKeys: ['lun', 'mie', 'vie'], timeStart: '07:00', timeEnd: '08:00', venue: 'Gimnasio', teacher: 'Marco Díaz', availableSpots: 12, totalSpots: 25, availability: MemberScheduleAvailability.AVAILABLE },
  { id: 801, activityId: 8, activityName: 'Natación Virtual', days: 'MAR / JUE', dayKeys: ['mar', 'jue'], timeStart: '20:00', timeEnd: '21:00', venue: 'Online', teacher: 'Carlos Tanaka', availableSpots: 20, totalSpots: 30, availability: MemberScheduleAvailability.AVAILABLE },
];

export const MOCK_MEMBER_ACTIVITY_ENROLLMENTS: MemberActivityEnrollment[] = [
  {
    id: 1, code: 'ACT-2026-0001', participantPersonId: 3, participantName: 'Lucía Tanaka',
    activityName: 'Natación Intermedio', schedule: 'L-M-V 18:00 – 19:00', days: 'LUN / MIÉ / VIE',
    timeStart: '18:00', timeEnd: '19:00', venue: 'Piscina Principal', status: 'active', period: 'Septiembre 2026',
  },
  {
    id: 2, code: 'ACT-2026-0002', participantPersonId: 4, participantName: 'Diego Tanaka',
    activityName: 'Karate Juvenil', schedule: 'M-J 19:00 – 20:00', days: 'MAR / JUE',
    timeStart: '19:00', timeEnd: '20:00', venue: 'Dojo Norte', status: 'active', period: 'Septiembre 2026',
  },
  {
    id: 3, code: 'ACT-2026-0003', participantPersonId: 2, participantName: 'María Tanaka',
    activityName: 'Gimnasio Funcional', schedule: 'L-M-V 07:00 – 08:00', days: 'LUN / MIÉ / VIE',
    timeStart: '07:00', timeEnd: '08:00', venue: 'Gimnasio', status: 'active', period: 'Septiembre 2026',
  },
];

/** Mapeo participante portal → estudiante matrícula (motor existente). */
export const MEMBER_PERSON_TO_STUDENT: Record<number, number> = {
  1: 1,
  2: 2,
  3: 1,
  4: 3,
};
