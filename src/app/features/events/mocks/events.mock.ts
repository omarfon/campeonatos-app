import { EventCategory } from '../enums/event-category.enum';
import { EventStatus } from '../enums/event-status.enum';
import { ParticipantType } from '../enums/participant-type.enum';
import { RegistrationStatus } from '../enums/registration-status.enum';
import { TicketStatus } from '../enums/ticket-status.enum';
import { ConsumptionType } from '../enums/consumption-type.enum';
import {
  Event,
  EventType,
  EventEnvironment,
  EventRegistration,
  EventTicket,
  EventConsumption,
  EventPayment,
  EventAudit,
  EventRate,
} from '../models/event.model';
import { getOfferingTemplateForCategory } from './event-offering.templates';
import { syncTicketPoolsFromCatalog, EventOfferingService } from '../services/event-offering.service';

const offeringService = new EventOfferingService();

function withTicketGeneration(
  category: EventCategory,
  catalog: ReturnType<typeof getOfferingTemplateForCategory>,
  capacity: number,
  extra: Record<string, unknown> = {},
) {
  return {
    offeringCatalog: catalog,
    ticketGeneration: { pools: syncTicketPoolsFromCatalog(catalog, [], category, capacity) },
    ...extra,
  };
}

export const MOCK_EVENT_TYPES: EventType[] = [
  { id: 'et-1', code: 'SOC', name: 'Social', description: 'Eventos sociales y culturales', active: true },
  { id: 'et-2', code: 'DEP', name: 'Deportivo', description: 'Eventos deportivos recreativos', active: true },
  { id: 'et-3', code: 'REC', name: 'Recaudación', description: 'Eventos de recaudación y bingo', active: true },
  { id: 'et-4', code: 'EDU', name: 'Educativo', description: 'Talleres y capacitaciones', active: true },
  { id: 'et-5', code: 'FAM', name: 'Familiar', description: 'Eventos familiares masivos', active: true },
];

export const MOCK_ENVIRONMENTS: EventEnvironment[] = [
  { id: 'env-1', name: 'Auditorio Principal', venueId: 'sed-1', venueName: 'Sede Central AELU', type: 'Auditorio', capacity: 500, status: 'available' },
  { id: 'env-2', name: 'Salón Social', venueId: 'sed-1', venueName: 'Sede Central AELU', type: 'Salón', capacity: 200, status: 'available' },
  { id: 'env-3', name: 'Piscina Olímpica', venueId: 'sed-1', venueName: 'Sede Central AELU', type: 'Piscina', capacity: 150, status: 'available' },
  { id: 'env-4', name: 'Cancha 1 - Fútbol', venueId: 'sed-2', venueName: 'Complejo Deportivo Sur', type: 'Cancha', capacity: 300, status: 'available' },
  { id: 'env-5', name: 'Cancha 2 - Vóley', venueId: 'sed-2', venueName: 'Complejo Deportivo Sur', type: 'Cancha', capacity: 200, status: 'available' },
  { id: 'env-6', name: 'Comedor Social', venueId: 'sed-1', venueName: 'Sede Central AELU', type: 'Comedor', capacity: 180, status: 'available' },
  { id: 'env-7', name: 'Sala de Talleres A', venueId: 'sed-1', venueName: 'Sede Central AELU', type: 'Aula', capacity: 40, status: 'available' },
  { id: 'env-8', name: 'Terraza Panorámica', venueId: 'sed-3', venueName: 'Sede Norte', type: 'Terraza', capacity: 120, status: 'available' },
  { id: 'env-9', name: 'Gimnasio Cubierto', venueId: 'sed-2', venueName: 'Complejo Deportivo Sur', type: 'Gimnasio', capacity: 250, status: 'maintenance' },
  { id: 'env-10', name: 'Salón VIP', venueId: 'sed-1', venueName: 'Sede Central AELU', type: 'Salón', capacity: 50, status: 'available' },
];

const DEFAULT_RATES: EventRate[] = [
  { id: 'rate-1', memberCategory: 'Socio', condition: 'Habilitado', participantType: ParticipantType.MEMBER_HOLDER, price: 50, currency: 'PEN', validFrom: '2026-01-01', validTo: '2026-12-31', status: 'active' },
  { id: 'rate-2', memberCategory: 'Socio', condition: 'Habilitado', participantType: ParticipantType.MEMBER_GUEST, price: 70, currency: 'PEN', validFrom: '2026-01-01', validTo: '2026-12-31', status: 'active' },
  { id: 'rate-3', memberCategory: 'Socio', condition: 'Con deuda', participantType: ParticipantType.MEMBER_HOLDER, price: 100, currency: 'PEN', validFrom: '2026-01-01', validTo: '2026-12-31', status: 'active' },
  { id: 'rate-4', memberCategory: 'No socio', condition: 'General', participantType: ParticipantType.PUBLIC, price: 100, currency: 'PEN', validFrom: '2026-01-01', validTo: '2026-12-31', status: 'active' },
];

export const MOCK_EVENTS: Event[] = [
  {
    id: 'evt-1', code: 'EVT-2026-001', companyId: 'comp-1', companyName: 'AELU', businessUnitId: 'bu-1', businessUnitName: 'Club Social',
    name: 'Noche Cultural AELU', description: 'Presentación artística con música en vivo, danza folclórica y exposición de artes plásticas.',
    typeId: 'et-1', typeName: 'Social', category: EventCategory.GENERAL, isPublic: true, membersOnly: false, allowGuests: true,
    requiresRegistration: true, isFree: false, status: EventStatus.REGISTRATION_OPEN,
    startDate: '2026-09-15', endDate: '2026-09-15', startTime: '18:00', endTime: '23:00',
    registrationStartDate: '2026-08-01', registrationEndDate: '2026-09-14',
    venueName: 'Auditorio Principal', environments: [{ environmentId: 'env-1', environmentName: 'Auditorio Principal', venueName: 'Sede Central AELU', startDate: '2026-09-15', startTime: '18:00', endDate: '2026-09-15', endTime: '23:00', capacity: 500 }],
    capacity: { totalCapacity: 200, reservedCapacity: 10, confirmedCapacity: 145 },
    rates: [...DEFAULT_RATES], rateRules: { applyDebtPenalty: true, allowGuests: true, maxGuestsPerMember: 3 },
    categoryConfig: withTicketGeneration(EventCategory.GENERAL, getOfferingTemplateForCategory(EventCategory.GENERAL), 200),
    personalTicketRequired: false, createdAt: '2026-07-01T10:00:00Z', updatedAt: '2026-08-10T14:30:00Z',
  },
  {
    id: 'evt-2', code: 'EVT-2026-002', companyId: 'comp-1', companyName: 'AELU', businessUnitId: 'bu-1', businessUnitName: 'Club Social',
    name: 'Día Familiar en la Piscina', description: 'Jornada recreativa con actividades acuáticas, juegos y almuerzo buffet para toda la familia.',
    typeId: 'et-5', typeName: 'Familiar', category: EventCategory.MASSIVE, isPublic: false, membersOnly: true, allowGuests: true,
    requiresRegistration: true, isFree: false, status: EventStatus.PUBLISHED,
    startDate: '2026-10-05', endDate: '2026-10-05', startTime: '09:00', endTime: '18:00',
    registrationStartDate: '2026-09-01', registrationEndDate: '2026-10-04',
    venueName: 'Complejo Deportivo Sur', environments: [
      { environmentId: 'env-3', environmentName: 'Piscina Olímpica', venueName: 'Sede Central AELU', startDate: '2026-10-05', startTime: '09:00', endDate: '2026-10-05', endTime: '14:00', capacity: 150 },
      { environmentId: 'env-4', environmentName: 'Cancha 1 - Fútbol', venueName: 'Complejo Deportivo Sur', startDate: '2026-10-05', startTime: '09:00', endDate: '2026-10-05', endTime: '18:00', capacity: 300 },
      { environmentId: 'env-6', environmentName: 'Comedor Social', venueName: 'Sede Central AELU', startDate: '2026-10-05', startTime: '12:00', endDate: '2026-10-05', endTime: '16:00', capacity: 180 },
    ],
    capacity: { totalCapacity: 400, reservedCapacity: 20, confirmedCapacity: 180 },
    rates: [...DEFAULT_RATES.map(r => ({ ...r, price: r.price + 20 }))], rateRules: { applyDebtPenalty: true, allowGuests: true, maxGuestsPerMember: 5 },
    categoryConfig: withTicketGeneration(EventCategory.MASSIVE, getOfferingTemplateForCategory(EventCategory.MASSIVE), 400, { massiveEnvironments: [] }),
    personalTicketRequired: false, createdAt: '2026-07-15T08:00:00Z', updatedAt: '2026-08-01T11:00:00Z',
  },
  {
    id: 'evt-3', code: 'EVT-2026-003', companyId: 'comp-1', companyName: 'AELU', businessUnitId: 'bu-1', businessUnitName: 'Club Social',
    name: 'Cena de Gala Aniversario', description: 'Cena especial con menú gourmet para celebrar el aniversario del club.',
    typeId: 'et-1', typeName: 'Social', category: EventCategory.FOOD, isPublic: false, membersOnly: true, allowGuests: true,
    requiresRegistration: true, isFree: false, status: EventStatus.REGISTRATION_OPEN,
    startDate: '2026-11-20', endDate: '2026-11-20', startTime: '19:00', endTime: '23:30',
    registrationStartDate: '2026-10-01', registrationEndDate: '2026-11-15',
    venueName: 'Salón Social', environments: [{ environmentId: 'env-2', environmentName: 'Salón Social', venueName: 'Sede Central AELU', startDate: '2026-11-20', startTime: '19:00', endDate: '2026-11-20', endTime: '23:30', capacity: 200 }],
    capacity: { totalCapacity: 180, reservedCapacity: 5, confirmedCapacity: 92 },
    rates: [...DEFAULT_RATES.map(r => ({ ...r, price: r.price * 2 }))], rateRules: { applyDebtPenalty: true, allowGuests: true, maxGuestsPerMember: 2 },
    categoryConfig: {
      offeringCatalog: offeringService.migrateFoodOptionsToCatalog([
        { id: 'fo-1', name: 'Menú criollo', type: ConsumptionType.MENU, description: 'Entrada, plato de fondo y postre', additionalPrice: 0, stock: 100, required: true },
        { id: 'fo-2', name: 'Menú vegetariano', type: ConsumptionType.MENU, description: 'Opción sin carne', additionalPrice: 0, stock: 30, required: false },
        { id: 'fo-3', name: 'Menú infantil', type: ConsumptionType.MENU, description: 'Porción reducida', additionalPrice: 0, stock: 40, required: false },
        { id: 'fo-4', name: 'Ida y retorno', type: ConsumptionType.MOBILITY, description: 'Transporte desde sede norte', additionalPrice: 20, stock: 50, required: false },
      ], EventCategory.FOOD),
      foodOptions: [
        { id: 'fo-1', name: 'Menú criollo', type: ConsumptionType.MENU, description: 'Entrada, plato de fondo y postre', additionalPrice: 0, stock: 100, required: true },
        { id: 'fo-2', name: 'Menú vegetariano', type: ConsumptionType.MENU, description: 'Opción sin carne', additionalPrice: 0, stock: 30, required: false },
        { id: 'fo-3', name: 'Menú infantil', type: ConsumptionType.MENU, description: 'Porción reducida', additionalPrice: 0, stock: 40, required: false },
        { id: 'fo-4', name: 'Ida y retorno', type: ConsumptionType.MOBILITY, description: 'Transporte desde sede norte', additionalPrice: 20, stock: 50, required: false },
      ],
    },
    personalTicketRequired: false, createdAt: '2026-08-01T09:00:00Z', updatedAt: '2026-08-15T16:00:00Z',
  },
  {
    id: 'evt-4', code: 'EVT-2026-004', companyId: 'comp-1', companyName: 'AELU', businessUnitId: 'bu-1', businessUnitName: 'Club Social',
    name: 'Gran Bingo Solidario 2026', description: 'Bingo benéfico con premios y sorteos especiales a beneficio de obras sociales.',
    typeId: 'et-3', typeName: 'Recaudación', category: EventCategory.FUNDRAISING, isPublic: true, membersOnly: false, allowGuests: true,
    requiresRegistration: false, isFree: false, status: EventStatus.PUBLISHED,
    startDate: '2026-12-10', endDate: '2026-12-10', startTime: '15:00', endTime: '21:00',
    registrationStartDate: '2026-11-01', registrationEndDate: '2026-12-09',
    venueName: 'Auditorio Principal', environments: [{ environmentId: 'env-1', environmentName: 'Auditorio Principal', venueName: 'Sede Central AELU', startDate: '2026-12-10', startTime: '15:00', endDate: '2026-12-10', endTime: '21:00', capacity: 500 }],
    capacity: { totalCapacity: 500, reservedCapacity: 0, confirmedCapacity: 0 },
    rates: [{ id: 'rate-b1', memberCategory: 'General', condition: 'Público', participantType: ParticipantType.PUBLIC, price: 15, currency: 'PEN', validFrom: '2026-11-01', validTo: '2026-12-10', status: 'active' }],
    rateRules: { applyDebtPenalty: false, allowGuests: true, maxGuestsPerMember: 10 },
    categoryConfig: {
      ...withTicketGeneration(EventCategory.FUNDRAISING, getOfferingTemplateForCategory(EventCategory.FUNDRAISING), 500),
      bingoSeries: [
        { id: 'bs-1', name: 'Serie A', startNumber: 1, endNumber: 1000, cardCount: 1000, price: 15, status: 'generated' },
        { id: 'bs-2', name: 'Serie B', startNumber: 1001, endNumber: 2000, cardCount: 1000, price: 15, status: 'assigned' },
      ],
      bingoBatches: [
        { id: 'bb-1', serieId: 'bs-1', name: 'Lote 001', startNumber: 1, endNumber: 100, assignedTo: 'Club A', status: 'assigned' },
        { id: 'bb-2', serieId: 'bs-1', name: 'Lote 002', startNumber: 101, endNumber: 200, assignedTo: 'Club B', status: 'delivered' },
      ],
    },
    personalTicketRequired: false, createdAt: '2026-08-05T10:00:00Z', updatedAt: '2026-08-20T12:00:00Z',
  },
  {
    id: 'evt-5', code: 'EVT-2026-005', companyId: 'comp-1', companyName: 'AELU', businessUnitId: 'bu-2', businessUnitName: 'Deportes',
    name: 'Concurso de Talentos Juvenil', description: 'Competencia de talentos artísticos para jóvenes socios del club.',
    typeId: 'et-1', typeName: 'Social', category: EventCategory.CONTEST, isPublic: false, membersOnly: true, allowGuests: false,
    requiresRegistration: true, isFree: false, status: EventStatus.REGISTRATION_OPEN,
    startDate: '2026-09-28', endDate: '2026-09-28', startTime: '16:00', endTime: '20:00',
    registrationStartDate: '2026-09-01', registrationEndDate: '2026-09-25',
    venueName: 'Auditorio Principal', environments: [{ environmentId: 'env-1', environmentName: 'Auditorio Principal', venueName: 'Sede Central AELU', startDate: '2026-09-28', startTime: '16:00', endDate: '2026-09-28', endTime: '20:00', capacity: 500 }],
    capacity: { totalCapacity: 90, reservedCapacity: 5, confirmedCapacity: 52 },
    rates: [...DEFAULT_RATES], rateRules: { applyDebtPenalty: true, allowGuests: false, maxGuestsPerMember: 0 },
    categoryConfig: { offeringCatalog: getOfferingTemplateForCategory(EventCategory.CONTEST),
      contestCategories: [
        { id: 'cc-1', name: 'Infantil', description: 'Categoría para niños', minAge: 6, maxAge: 12, quota: 30, registeredCount: 22, rate: 30, status: 'active' },
        { id: 'cc-2', name: 'Juvenil', description: 'Categoría para adolescentes', minAge: 13, maxAge: 17, quota: 30, registeredCount: 18, rate: 40, status: 'active' },
        { id: 'cc-3', name: 'Adultos', description: 'Categoría libre', minAge: 18, maxAge: 35, quota: 30, registeredCount: 12, rate: 50, status: 'active' },
      ],
    },
    personalTicketRequired: false, createdAt: '2026-08-10T11:00:00Z', updatedAt: '2026-08-18T09:00:00Z',
  },
  {
    id: 'evt-6', code: 'EVT-2026-006', companyId: 'comp-1', companyName: 'AELU', businessUnitId: 'bu-1', businessUnitName: 'Club Social',
    name: 'Paseo a Paracas', description: 'Excursión de un día al Parque Nacional de Paracas con transporte y guía incluidos.',
    typeId: 'et-5', typeName: 'Familiar', category: EventCategory.TRIP, isPublic: false, membersOnly: true, allowGuests: false,
    requiresRegistration: true, isFree: false, status: EventStatus.REGISTRATION_OPEN,
    startDate: '2026-10-18', endDate: '2026-10-18', startTime: '05:00', endTime: '22:00',
    registrationStartDate: '2026-09-05', registrationEndDate: '2026-10-10',
    venueName: 'Salida Sede Central', environments: [{ environmentId: 'env-8', environmentName: 'Terraza Panorámica', venueName: 'Sede Norte', startDate: '2026-10-18', startTime: '05:00', endDate: '2026-10-18', endTime: '06:00', capacity: 120 }],
    capacity: { totalCapacity: 55, reservedCapacity: 3, confirmedCapacity: 48 },
    rates: [{ id: 'rate-t1', memberCategory: 'Socio', condition: 'Habilitado', participantType: ParticipantType.MEMBER_HOLDER, price: 180, currency: 'PEN', validFrom: '2026-09-05', validTo: '2026-10-10', status: 'active' }],
    rateRules: { applyDebtPenalty: true, allowGuests: false, maxGuestsPerMember: 0 },
    categoryConfig: withTicketGeneration(EventCategory.TRIP, getOfferingTemplateForCategory(EventCategory.TRIP), 55),
    personalTicketRequired: true, createdAt: '2026-08-12T08:00:00Z', updatedAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'evt-7', code: 'EVT-2026-007', companyId: 'comp-1', companyName: 'AELU', businessUnitId: 'bu-2', businessUnitName: 'Deportes',
    name: 'Taller de Natación para Adultos', description: 'Curso intensivo de natación nivel intermedio con instructor certificado.',
    typeId: 'et-4', typeName: 'Educativo', category: EventCategory.WORKSHOP, isPublic: false, membersOnly: true, allowGuests: false,
    requiresRegistration: true, isFree: false, status: EventStatus.PUBLISHED,
    startDate: '2026-11-03', endDate: '2026-11-28', startTime: '07:00', endTime: '08:30',
    registrationStartDate: '2026-10-01', registrationEndDate: '2026-11-01',
    venueName: 'Piscina Olímpica', environments: [{ environmentId: 'env-3', environmentName: 'Piscina Olímpica', venueName: 'Sede Central AELU', startDate: '2026-11-03', startTime: '07:00', endDate: '2026-11-28', endTime: '08:30', capacity: 150 }],
    capacity: { totalCapacity: 20, reservedCapacity: 2, confirmedCapacity: 14 },
    rates: [{ id: 'rate-w1', memberCategory: 'Socio', condition: 'Habilitado', participantType: ParticipantType.MEMBER_HOLDER, price: 120, currency: 'PEN', validFrom: '2026-10-01', validTo: '2026-11-01', status: 'active' }],
    rateRules: { applyDebtPenalty: false, allowGuests: false, maxGuestsPerMember: 0 },
    categoryConfig: { workshop: { name: 'Natación Adultos Nivel II', responsible: 'Dept. Deportes', instructor: 'Carlos Mendoza', environmentId: 'env-3', date: '2026-11-03', startTime: '07:00', endTime: '08:30', quota: 20, price: 120 } },
    personalTicketRequired: false, createdAt: '2026-08-20T14:00:00Z', updatedAt: '2026-09-05T11:00:00Z',
  },
  {
    id: 'evt-8', code: 'EVT-2026-008', companyId: 'comp-1', companyName: 'AELU', businessUnitId: 'bu-1', businessUnitName: 'Club Social',
    name: 'Torneo Relámpago de Ajedrez', description: 'Torneo rápido de ajedrez open para socios y no socios.',
    typeId: 'et-2', typeName: 'Deportivo', category: EventCategory.GENERAL, isPublic: true, membersOnly: false, allowGuests: true,
    requiresRegistration: true, isFree: true, status: EventStatus.DRAFT,
    startDate: '2026-12-05', endDate: '2026-12-05', startTime: '10:00', endTime: '18:00',
    registrationStartDate: '2026-11-15', registrationEndDate: '2026-12-04',
    venueName: 'Salón Social', environments: [{ environmentId: 'env-2', environmentName: 'Salón Social', venueName: 'Sede Central AELU', startDate: '2026-12-05', startTime: '10:00', endDate: '2026-12-05', endTime: '18:00', capacity: 200 }],
    capacity: { totalCapacity: 64, reservedCapacity: 0, confirmedCapacity: 0 },
    rates: [], rateRules: { applyDebtPenalty: false, allowGuests: true, maxGuestsPerMember: 1 },
    categoryConfig: {}, personalTicketRequired: false, createdAt: '2026-09-01T09:00:00Z', updatedAt: '2026-09-01T09:00:00Z',
  },
  {
    id: 'evt-9', code: 'EVT-2025-015', companyId: 'comp-1', companyName: 'AELU', businessUnitId: 'bu-1', businessUnitName: 'Club Social',
    name: 'Fiesta de Fin de Año 2025', description: 'Celebración de fin de año con cena, música y fuegos artificiales.',
    typeId: 'et-1', typeName: 'Social', category: EventCategory.FOOD, isPublic: false, membersOnly: true, allowGuests: true,
    requiresRegistration: true, isFree: false, status: EventStatus.SETTLED,
    startDate: '2025-12-31', endDate: '2026-01-01', startTime: '20:00', endTime: '02:00',
    registrationStartDate: '2025-11-01', registrationEndDate: '2025-12-20',
    venueName: 'Terraza Panorámica', environments: [{ environmentId: 'env-8', environmentName: 'Terraza Panorámica', venueName: 'Sede Norte', startDate: '2025-12-31', startTime: '20:00', endDate: '2026-01-01', endTime: '02:00', capacity: 120 }],
    capacity: { totalCapacity: 120, reservedCapacity: 0, confirmedCapacity: 118 },
    rates: [...DEFAULT_RATES.map(r => ({ ...r, price: r.price * 3 }))], rateRules: { applyDebtPenalty: true, allowGuests: true, maxGuestsPerMember: 2 },
    categoryConfig: { foodOptions: [{ id: 'fo-f1', name: 'Menú de gala', type: ConsumptionType.MENU, description: 'Cena especial', additionalPrice: 0, stock: 120, required: true }] },
    personalTicketRequired: false, createdAt: '2025-10-01T08:00:00Z', updatedAt: '2026-01-05T10:00:00Z',
  },
  {
    id: 'evt-10', code: 'EVT-2026-010', companyId: 'comp-1', companyName: 'AELU', businessUnitId: 'bu-2', businessUnitName: 'Deportes',
    name: 'Maratón Interna 5K', description: 'Carrera recreativa de 5 kilómetros por las instalaciones del club.',
    typeId: 'et-2', typeName: 'Deportivo', category: EventCategory.GENERAL, isPublic: true, membersOnly: false, allowGuests: true,
    requiresRegistration: true, isFree: false, status: EventStatus.IN_PROGRESS,
    startDate: '2026-08-12', endDate: '2026-08-12', startTime: '06:30', endTime: '10:00',
    registrationStartDate: '2026-07-01', registrationEndDate: '2026-08-10',
    venueName: 'Complejo Deportivo Sur', environments: [{ environmentId: 'env-4', environmentName: 'Cancha 1 - Fútbol', venueName: 'Complejo Deportivo Sur', startDate: '2026-08-12', startTime: '06:30', endDate: '2026-08-12', endTime: '10:00', capacity: 300 }],
    capacity: { totalCapacity: 250, reservedCapacity: 0, confirmedCapacity: 198 },
    rates: [...DEFAULT_RATES.map(r => ({ ...r, price: 35 }))], rateRules: { applyDebtPenalty: true, allowGuests: true, maxGuestsPerMember: 2 },
    categoryConfig: {}, personalTicketRequired: false, createdAt: '2026-06-01T08:00:00Z', updatedAt: '2026-08-12T06:00:00Z',
  },
  {
    id: 'evt-11', code: 'EVT-2026-011', companyId: 'comp-1', companyName: 'AELU', businessUnitId: 'bu-1', businessUnitName: 'Club Social',
    name: 'Concierto Sinfónico de Verano', description: 'Orquesta sinfónica invitada en presentación exclusiva para socios.',
    typeId: 'et-1', typeName: 'Social', category: EventCategory.GENERAL, isPublic: false, membersOnly: true, allowGuests: true,
    requiresRegistration: true, isFree: false, status: EventStatus.CONFIGURED,
    startDate: '2026-10-25', endDate: '2026-10-25', startTime: '19:30', endTime: '22:00',
    registrationStartDate: '2026-09-15', registrationEndDate: '2026-10-20',
    venueName: 'Auditorio Principal', environments: [{ environmentId: 'env-1', environmentName: 'Auditorio Principal', venueName: 'Sede Central AELU', startDate: '2026-10-25', startTime: '19:30', endDate: '2026-10-25', endTime: '22:00', capacity: 500 }],
    capacity: { totalCapacity: 350, reservedCapacity: 0, confirmedCapacity: 0 },
    rates: [...DEFAULT_RATES], rateRules: { applyDebtPenalty: true, allowGuests: true, maxGuestsPerMember: 2 },
    categoryConfig: {}, personalTicketRequired: false, createdAt: '2026-08-25T10:00:00Z', updatedAt: '2026-08-28T15:00:00Z',
  },
  {
    id: 'evt-12', code: 'EVT-2026-012', companyId: 'comp-1', companyName: 'AELU', businessUnitId: 'bu-1', businessUnitName: 'Club Social',
    name: 'Brunch Dominical', description: 'Brunch especial todos los domingos del mes de octubre.',
    typeId: 'et-1', typeName: 'Social', category: EventCategory.FOOD, isPublic: false, membersOnly: true, allowGuests: true,
    requiresRegistration: true, isFree: false, status: EventStatus.CANCELLED,
    startDate: '2026-10-04', endDate: '2026-10-25', startTime: '10:00', endTime: '14:00',
    registrationStartDate: '2026-09-01', registrationEndDate: '2026-10-03',
    venueName: 'Comedor Social', environments: [{ environmentId: 'env-6', environmentName: 'Comedor Social', venueName: 'Sede Central AELU', startDate: '2026-10-04', startTime: '10:00', endDate: '2026-10-25', endTime: '14:00', capacity: 180 }],
    capacity: { totalCapacity: 80, reservedCapacity: 0, confirmedCapacity: 0 },
    rates: [...DEFAULT_RATES], rateRules: { applyDebtPenalty: false, allowGuests: true, maxGuestsPerMember: 4 },
    categoryConfig: {}, personalTicketRequired: false, createdAt: '2026-08-01T08:00:00Z', updatedAt: '2026-09-10T09:00:00Z',
  },
  {
    id: 'evt-13', code: 'EVT-2025-020', companyId: 'comp-1', companyName: 'AELU', businessUnitId: 'bu-1', businessUnitName: 'Club Social',
    name: 'Festival Gastronómico 2025', description: 'Feria de comidas regionales con stands y demostraciones culinarias.',
    typeId: 'et-1', typeName: 'Social', category: EventCategory.FOOD, isPublic: true, membersOnly: false, allowGuests: true,
    requiresRegistration: true, isFree: false, status: EventStatus.FINISHED,
    startDate: '2025-08-15', endDate: '2025-08-17', startTime: '11:00', endTime: '22:00',
    registrationStartDate: '2025-07-01', registrationEndDate: '2025-08-14',
    venueName: 'Terraza Panorámica', environments: [{ environmentId: 'env-8', environmentName: 'Terraza Panorámica', venueName: 'Sede Norte', startDate: '2025-08-15', startTime: '11:00', endDate: '2025-08-17', endTime: '22:00', capacity: 120 }],
    capacity: { totalCapacity: 300, reservedCapacity: 0, confirmedCapacity: 287 },
    rates: [...DEFAULT_RATES], rateRules: { applyDebtPenalty: true, allowGuests: true, maxGuestsPerMember: 5 },
    categoryConfig: {}, personalTicketRequired: false, createdAt: '2025-06-01T08:00:00Z', updatedAt: '2025-08-18T10:00:00Z',
  },
  {
    id: 'evt-14', code: 'EVT-2026-014', companyId: 'comp-1', companyName: 'AELU', businessUnitId: 'bu-2', businessUnitName: 'Deportes',
    name: 'Clínica de Fútbol Infantil', description: 'Entrenamiento especial con ex futbolista profesional para niños de 8 a 12 años.',
    typeId: 'et-4', typeName: 'Educativo', category: EventCategory.WORKSHOP, isPublic: false, membersOnly: true, allowGuests: false,
    requiresRegistration: true, isFree: false, status: EventStatus.PUBLISHED,
    startDate: '2026-11-08', endDate: '2026-11-08', startTime: '09:00', endTime: '13:00',
    registrationStartDate: '2026-10-01', registrationEndDate: '2026-11-05',
    venueName: 'Cancha 1 - Fútbol', environments: [{ environmentId: 'env-4', environmentName: 'Cancha 1 - Fútbol', venueName: 'Complejo Deportivo Sur', startDate: '2026-11-08', startTime: '09:00', endDate: '2026-11-08', endTime: '13:00', capacity: 300 }],
    capacity: { totalCapacity: 40, reservedCapacity: 5, confirmedCapacity: 28 },
    rates: [{ id: 'rate-w2', memberCategory: 'Socio', condition: 'Habilitado', participantType: ParticipantType.MEMBER_HOLDER, price: 45, currency: 'PEN', validFrom: '2026-10-01', validTo: '2026-11-05', status: 'active' }],
    rateRules: { applyDebtPenalty: false, allowGuests: false, maxGuestsPerMember: 0 },
    categoryConfig: { workshop: { name: 'Clínica Fútbol Infantil', responsible: 'Escuela de Fútbol', instructor: 'Roberto García', environmentId: 'env-4', date: '2026-11-08', startTime: '09:00', endTime: '13:00', quota: 40, price: 45 } },
    personalTicketRequired: false, createdAt: '2026-09-01T08:00:00Z', updatedAt: '2026-09-15T10:00:00Z',
  },
  {
    id: 'evt-15', code: 'EVT-2026-015', companyId: 'comp-1', companyName: 'AELU', businessUnitId: 'bu-1', businessUnitName: 'Club Social',
    name: 'Noche de Jazz en la Terraza', description: 'Concierto íntimo de jazz con trío en vivo y cocteles especiales.',
    typeId: 'et-1', typeName: 'Social', category: EventCategory.GENERAL, isPublic: false, membersOnly: true, allowGuests: true,
    requiresRegistration: true, isFree: false, status: EventStatus.REGISTRATION_OPEN,
    startDate: '2026-09-05', endDate: '2026-09-05', startTime: '20:00', endTime: '23:30',
    registrationStartDate: '2026-08-15', registrationEndDate: '2026-09-04',
    venueName: 'Terraza Panorámica', environments: [{ environmentId: 'env-8', environmentName: 'Terraza Panorámica', venueName: 'Sede Norte', startDate: '2026-09-05', startTime: '20:00', endDate: '2026-09-05', endTime: '23:30', capacity: 120 }],
    capacity: { totalCapacity: 80, reservedCapacity: 2, confirmedCapacity: 76 },
    rates: [...DEFAULT_RATES.map(r => ({ ...r, price: r.price + 30 }))], rateRules: { applyDebtPenalty: true, allowGuests: true, maxGuestsPerMember: 2 },
    categoryConfig: {}, personalTicketRequired: false, createdAt: '2026-08-01T10:00:00Z', updatedAt: '2026-08-20T14:00:00Z',
  },
];

export const MOCK_REGISTRATIONS: EventRegistration[] = Array.from({ length: 50 }, (_, i) => {
  const event = MOCK_EVENTS[i % 8];
  const types = [ParticipantType.MEMBER_HOLDER, ParticipantType.MEMBER_GUEST, ParticipantType.PUBLIC, ParticipantType.NON_MEMBER];
  const statuses = [RegistrationStatus.CONFIRMED, RegistrationStatus.CONFIRMED, RegistrationStatus.PENDING, RegistrationStatus.RESERVED, RegistrationStatus.CANCELLED];
  const payments: EventRegistration['paymentStatus'][] = ['paid', 'paid', 'pending', 'partial', 'exempt'];
  const names = ['Juan Pérez', 'María González', 'Carlos Rodríguez', 'Ana Torres', 'Luis Mendoza', 'Patricia Silva', 'Roberto García', 'Carmen Vásquez', 'Diego Flores', 'Rosa Herrera'];
  return {
    id: `reg-${i + 1}`,
    code: `INS-${String(i + 1).padStart(5, '0')}`,
    eventId: event.id,
    eventName: event.name,
    personId: `person-${i + 1}`,
    personName: names[i % names.length],
    documentNumber: `${String(10000000 + i).slice(0, 8)}`,
    participantType: types[i % types.length],
    rateName: 'Tarifa estándar',
    rateAmount: event.rates[0]?.price ?? 0,
    currency: 'PEN',
    registrationDate: `2026-08-${String((i % 28) + 1).padStart(2, '0')}`,
    paymentStatus: payments[i % payments.length],
    ticketId: i % 4 !== 0 ? `tkt-${i + 1}` : undefined,
    ticketCode: i % 4 !== 0 ? `EVT-TKT-${String(i + 1).padStart(5, '0')}` : undefined,
    status: statuses[i % statuses.length],
  };
});

export const MOCK_TICKETS: EventTicket[] = Array.from({ length: 50 }, (_, i) => {
  const event = MOCK_EVENTS[i % 8];
  const names = ['Juan Pérez', 'María González', 'Carlos Rodríguez', 'Ana Torres', 'Luis Mendoza'];
  const statuses = [TicketStatus.PAID, TicketStatus.DELIVERED, TicketStatus.USED, TicketStatus.PENDING_PAYMENT, TicketStatus.CANCELLED];
  return {
    id: `tkt-${i + 1}`,
    code: `EVT-TKT-${String(i + 1).padStart(5, '0')}`,
    eventId: event.id,
    eventName: event.name,
    participantId: `person-${i + 1}`,
    participantName: names[i % names.length],
    documentNumber: `${String(10000000 + i).slice(0, 8)}`,
    buyerId: `person-${i + 1}`,
    buyerName: names[i % names.length],
    eventDate: event.startDate,
    eventTime: event.startTime,
    environmentName: event.environments[0]?.environmentName ?? '',
    ticketType: 'General',
    price: event.rates[0]?.price ?? 0,
    currency: 'PEN',
    status: statuses[i % statuses.length],
    registrationId: `reg-${i + 1}`,
    qrData: `EVT:${event.id}:TKT:${i + 1}`,
  };
});

export const MOCK_CONSUMPTIONS: EventConsumption[] = [
  { id: 'cons-1', eventId: 'evt-3', eventName: 'Cena de Gala Aniversario', participantId: 'person-1', participantName: 'Juan Pérez', ticketId: 'tkt-1', ticketCode: 'EVT-TKT-00001', optionId: 'fo-1', optionName: 'Menú criollo', quantity: 1, status: 'delivered' },
  { id: 'cons-2', eventId: 'evt-3', eventName: 'Cena de Gala Aniversario', participantId: 'person-1', participantName: 'Juan Pérez', ticketId: 'tkt-1', ticketCode: 'EVT-TKT-00001', optionId: 'fo-4', optionName: 'Ida y retorno', quantity: 1, status: 'pending' },
  { id: 'cons-3', eventId: 'evt-3', eventName: 'Cena de Gala Aniversario', participantId: 'person-2', participantName: 'María González', ticketId: 'tkt-2', ticketCode: 'EVT-TKT-00002', optionId: 'fo-2', optionName: 'Menú vegetariano', quantity: 1, status: 'pending' },
  { id: 'cons-4', eventId: 'evt-6', eventName: 'Paseo a Paracas', participantId: 'bulk-meals', participantName: 'Venta grupal', ticketId: 'bulk-1', ticketCode: 'GRUPAL', optionId: 'MEAL-1T', optionName: '1 comida', quantity: 350, status: 'delivered' },
  { id: 'cons-5', eventId: 'evt-6', eventName: 'Paseo a Paracas', participantId: 'person-3', participantName: 'Carlos Rodríguez', ticketId: 'tkt-7', ticketCode: 'EVT-TKT-00007', optionId: 'MOB-BUS', optionName: 'Ticket bus turístico', quantity: 1, status: 'delivered' },
  { id: 'cons-6', eventId: 'evt-6', eventName: 'Paseo a Paracas', participantId: 'person-4', participantName: 'Ana Torres', ticketId: 'tkt-8', ticketCode: 'EVT-TKT-00008', optionId: 'MOB-BUS', optionName: 'Ticket bus turístico', quantity: 1, status: 'pending' },
  { id: 'cons-7', eventId: 'evt-6', eventName: 'Paseo a Paracas', participantId: 'person-4', participantName: 'Ana Torres', ticketId: 'tkt-8', ticketCode: 'EVT-TKT-00008', optionId: 'MEAL-2T', optionName: '2 comidas', quantity: 1, status: 'pending' },
  { id: 'cons-8', eventId: 'evt-1', eventName: 'Noche Cultural AELU', participantId: 'person-5', participantName: 'Luis Mendoza', ticketId: 'tkt-3', ticketCode: 'EVT-TKT-00003', optionId: 'MEAL-1', optionName: '1 comida — Menú estándar', quantity: 2, status: 'delivered' },
];

export const MOCK_PAYMENTS: EventPayment[] = Array.from({ length: 30 }, (_, i) => ({
  id: `pay-${i + 1}`,
  registrationId: `reg-${i + 1}`,
  eventId: MOCK_EVENTS[i % 8].id,
  amount: MOCK_EVENTS[i % 8].rates[0]?.price ?? 50,
  currency: 'PEN',
  method: (['cash', 'card', 'transfer', 'online'] as const)[i % 4],
  status: 'completed' as const,
  paidAt: `2026-08-${String((i % 28) + 1).padStart(2, '0')}T14:30:00Z`,
  receiptNumber: `REC-${String(i + 1).padStart(6, '0')}`,
}));

export const MOCK_AUDITS: EventAudit[] = [
  { id: 'aud-1', eventId: 'evt-1', action: 'created', description: 'Evento creado', userId: 'usr-1', userName: 'administrador', timestamp: '2026-07-01T10:00:00Z' },
  { id: 'aud-2', eventId: 'evt-1', action: 'rate_updated', description: 'Tarifa modificada: S/ 40 → S/ 50', userId: 'usr-1', userName: 'administrador', timestamp: '2026-07-15T11:30:00Z' },
  { id: 'aud-3', eventId: 'evt-1', action: 'published', description: 'Evento publicado', userId: 'usr-1', userName: 'administrador', timestamp: '2026-08-01T08:00:00Z' },
  { id: 'aud-4', eventId: 'evt-1', action: 'ticket_cancelled', description: 'Entrada EVT-TKT-00045 anulada. Motivo: Solicitud del socio', userId: 'usr-2', userName: 'operador.eventos', timestamp: '2026-08-20T17:42:00Z' },
];

export const MOCK_RESERVATIONS: { environmentId: string; startDate: string; startTime: string; endDate: string; endTime: string; eventId: string }[] = [
  { environmentId: 'env-1', startDate: '2026-09-28', startTime: '16:00', endDate: '2026-09-28', endTime: '20:00', eventId: 'evt-5' },
  { environmentId: 'env-3', startDate: '2026-11-03', startTime: '07:00', endDate: '2026-11-28', endTime: '08:30', eventId: 'evt-7' },
];
