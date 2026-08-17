import { MemberAccountStatus } from '../enums/member-status.enum';
import { MemberNotificationType } from '../enums/member-notification-type.enum';
import {
  MemberSession,
  MemberDashboard,
  MemberNotification,
  ParticipantContext,
  MemberAccount,
  FamilyMember,
  FamilyMemberDetail,
} from '../models/member-portal.model';

export const MEMBER_PORTAL_DEMO_MEMBER_ID = 'soc-001';

export const MOCK_MEMBER_LOGIN = {
  email: 'juan.tanaka@email.com',
  password: 'demo123',
};

export const MOCK_MEMBER_SESSION: MemberSession = {
  memberId: MEMBER_PORTAL_DEMO_MEMBER_ID,
  memberCode: 'SOC-001245',
  fullName: 'Juan Tanaka',
  email: 'juan.tanaka@email.com',
  isHolder: true,
};

export const MOCK_PARTICIPANTS: ParticipantContext[] = [
  {
    personId: 1,
    memberId: MEMBER_PORTAL_DEMO_MEMBER_ID,
    fullName: 'Juan Tanaka',
    relationship: 'Titular',
    isHolder: true,
  },
  {
    personId: 2,
    memberId: 'dep-002',
    fullName: 'María Tanaka',
    relationship: 'Cónyuge',
    isHolder: false,
  },
  {
    personId: 3,
    memberId: 'dep-003',
    fullName: 'Lucía Tanaka',
    relationship: 'Hija',
    isHolder: false,
  },
  {
    personId: 4,
    memberId: 'dep-004',
    fullName: 'Diego Tanaka',
    relationship: 'Hijo',
    isHolder: false,
  },
];

export const MOCK_MEMBER_DASHBOARD: MemberDashboard = {
  greeting: 'Buenos días',
  profile: {
    memberId: MEMBER_PORTAL_DEMO_MEMBER_ID,
    code: 'SOC-001245',
    fullName: 'Juan Tanaka',
    firstName: 'Juan',
    category: 'Familiar',
    memberType: 'Titular',
    status: MemberAccountStatus.ENABLED,
    affiliationDate: '2018-03-15',
    validityDate: '2026-12-31',
  },
  stats: {
    familyCount: 4,
    activeActivities: 3,
    upcomingEvents: 2,
    activeTickets: 5,
    pendingAmount: 180,
    availableBenefits: 2,
  },
  nextActivity: {
    id: 'act-1',
    activityName: 'Natación',
    participantName: 'Lucía Tanaka',
    dateLabel: 'Hoy',
    timeStart: '18:00',
    timeEnd: '19:00',
    venue: 'Piscina Principal',
    route: ['/socio', 'mis-actividades'],
  },
  upcomingEvents: [
    {
      id: 'evt-1',
      name: 'Noche Cultural',
      dateLabel: '15 septiembre',
      timeStart: '18:00',
      venue: 'Auditorio Principal',
      route: ['/socio', 'eventos', 'evt-1'],
    },
  ],
};

export const MOCK_MEMBER_ACCOUNT: MemberAccount = {
  profile: MOCK_MEMBER_DASHBOARD.profile,
  documentType: 'DNI',
  documentNumber: '12345678',
  email: 'juan.tanaka@email.com',
  phone: '987654321',
  address: 'Av. Principal 456, Lima',
  district: 'San Isidro',
  benefits: [
    {
      id: 'ben-1',
      name: 'Convenio Empresa ABC',
      discountLabel: '20% de beneficio',
      validUntil: '2026-12-31',
      applicableTo: ['Natación', 'Karate'],
    },
    {
      id: 'ben-2',
      name: 'Membresía familiar',
      discountLabel: '10% en actividades adicionales',
      validUntil: '2026-12-31',
      applicableTo: ['Todas las disciplinas'],
    },
  ],
  economicStatus: {
    label: 'Con deuda pendiente',
    pendingAmount: 380,
    isUpToDate: false,
    lastPaymentDate: '2026-08-10',
  },
  editableFields: ['phone'],
};

export const MOCK_FAMILY_MEMBERS: FamilyMember[] = [
  {
    personId: 1,
    memberId: MEMBER_PORTAL_DEMO_MEMBER_ID,
    fullName: 'Juan Tanaka',
    firstName: 'Juan',
    relationship: 'Titular',
    age: 42,
    birthDate: '1984-03-12',
    status: MemberAccountStatus.ENABLED,
    activeActivities: [],
    activityCount: 0,
    upcomingEventsCount: 1,
    isHolder: true,
  },
  {
    personId: 2,
    memberId: 'dep-002',
    fullName: 'María Tanaka',
    firstName: 'María',
    relationship: 'Cónyuge',
    age: 40,
    birthDate: '1986-07-20',
    status: MemberAccountStatus.ENABLED,
    activeActivities: [],
    activityCount: 0,
    upcomingEventsCount: 1,
    isHolder: false,
  },
  {
    personId: 3,
    memberId: 'dep-003',
    fullName: 'Lucía Tanaka',
    firstName: 'Lucía',
    relationship: 'Hija',
    age: 16,
    birthDate: '2010-05-08',
    status: MemberAccountStatus.ENABLED,
    activeActivities: ['Natación Intermedio'],
    activityCount: 1,
    upcomingEventsCount: 1,
    nextActivityLabel: 'Hoy 18:00',
    isHolder: false,
  },
  {
    personId: 4,
    memberId: 'dep-004',
    fullName: 'Diego Tanaka',
    firstName: 'Diego',
    relationship: 'Hijo',
    age: 13,
    birthDate: '2013-11-22',
    status: MemberAccountStatus.ENABLED,
    activeActivities: ['Karate Básico'],
    activityCount: 1,
    upcomingEventsCount: 0,
    nextActivityLabel: 'Mañana 19:00',
    isHolder: false,
  },
];

export const MOCK_FAMILY_MEMBER_DETAILS: Record<number, FamilyMemberDetail> = {
  1: {
    ...MOCK_FAMILY_MEMBERS[0],
    documentType: 'DNI',
    documentNumber: '12345678',
    email: 'juan.tanaka@email.com',
    phone: '987654321',
    activities: [],
    upcomingEvents: [{ id: 'evt-1', name: 'Noche Cultural', dateLabel: '15 septiembre' }],
  },
  2: {
    ...MOCK_FAMILY_MEMBERS[1],
    documentType: 'DNI',
    documentNumber: '23456789',
    email: 'maria.tanaka@email.com',
    phone: '987654322',
    activities: [],
    upcomingEvents: [{ id: 'evt-1', name: 'Noche Cultural', dateLabel: '15 septiembre' }],
  },
  3: {
    ...MOCK_FAMILY_MEMBERS[2],
    documentType: 'DNI',
    documentNumber: '34567890',
    activities: [
      { id: 'act-1', name: 'Natación Intermedio', schedule: 'L-M-V 18:00 – 19:00', status: 'active' },
    ],
    upcomingEvents: [{ id: 'evt-2', name: 'Torneo Juvenil', dateLabel: '22 septiembre' }],
  },
  4: {
    ...MOCK_FAMILY_MEMBERS[3],
    documentType: 'DNI',
    documentNumber: '45678901',
    activities: [
      { id: 'act-2', name: 'Karate Básico', schedule: 'M-J 19:00 – 20:00', status: 'active' },
    ],
    upcomingEvents: [],
  },
};

export const MOCK_MEMBER_NOTIFICATIONS: MemberNotification[] = [
  {
    id: 1,
    type: MemberNotificationType.PAYMENT,
    title: 'Pago próximo a vencer',
    description: 'Tienes un pago pendiente de Natación por S/ 180.',
    date: '2026-08-17T08:00:00',
    relativeDate: 'Hace 2 horas',
    read: false,
    actionRoute: ['/socio', 'pagos'],
  },
  {
    id: 2,
    type: MemberNotificationType.ACTIVITY,
    title: 'Nueva actividad disponible',
    description: 'Karate Infantil abrió nuevos horarios para septiembre.',
    date: '2026-08-16T14:00:00',
    relativeDate: 'Ayer',
    read: false,
    actionRoute: ['/socio', 'actividades'],
  },
  {
    id: 3,
    type: MemberNotificationType.BENEFIT,
    title: 'Beneficio activo',
    description: 'Tu convenio Empresa ABC está vigente hasta diciembre 2026.',
    date: '2026-08-15T10:00:00',
    relativeDate: 'Hace 2 días',
    read: true,
    actionRoute: ['/socio', 'beneficios'],
  },
  {
    id: 4,
    type: MemberNotificationType.FAMILY,
    title: 'Recordatorio de clase',
    description: 'Lucía tiene Natación Intermedio hoy a las 18:00.',
    date: '2026-08-17T07:00:00',
    relativeDate: 'Hace 3 horas',
    read: false,
    actionRoute: ['/socio', 'calendario'],
  },
  {
    id: 5,
    type: MemberNotificationType.GENERAL,
    title: 'Documento disponible',
    description: 'Tu constancia de membresía ya está lista para descargar.',
    date: '2026-08-14T09:00:00',
    relativeDate: 'Hace 3 días',
    read: true,
    actionRoute: ['/socio', 'documentos'],
  },
];
