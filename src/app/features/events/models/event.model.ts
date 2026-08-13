import { EventCategory } from '../enums/event-category.enum';
import { EventStatus } from '../enums/event-status.enum';
import { ParticipantType } from '../enums/participant-type.enum';
import { RegistrationStatus } from '../enums/registration-status.enum';
import { TicketStatus } from '../enums/ticket-status.enum';
import { ConsumptionType } from '../enums/consumption-type.enum';
import { EventOfferingCatalog } from './event-offering.model';
import { EventTicketGenerationConfig } from './event-offering.model';

// ─── Tipos base ─────────────────────────────────────────────────────────────

export interface EventType {
  id: string;
  code: string;
  name: string;
  description: string;
  active: boolean;
}

export interface EventEnvironment {
  id: string;
  name: string;
  venueId: string;
  venueName: string;
  type: string;
  capacity: number;
  status: 'available' | 'maintenance' | 'reserved';
}

export interface EventEnvironmentBooking {
  environmentId: string;
  environmentName: string;
  venueName: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  capacity: number;
}

export interface EventRate {
  id: string;
  memberCategory: string;
  condition: string;
  participantType: ParticipantType;
  price: number;
  currency: string;
  validFrom: string;
  validTo: string;
  status: 'active' | 'inactive';
}

export interface EventRateRules {
  applyDebtPenalty: boolean;
  allowGuests: boolean;
  maxGuestsPerMember: number;
  guestRateId?: string;
}

export interface EventCapacity {
  totalCapacity: number;
  reservedCapacity: number;
  confirmedCapacity: number;
}

export interface FoodConsumptionOption {
  id: string;
  name: string;
  type: ConsumptionType;
  description: string;
  additionalPrice: number;
  stock: number;
  required: boolean;
}

export interface ContestCategory {
  id: string;
  name: string;
  description: string;
  minAge: number;
  maxAge: number;
  quota: number;
  registeredCount: number;
  rate: number;
  status: 'active' | 'inactive';
}

export interface BingoSerie {
  id: string;
  name: string;
  startNumber: number;
  endNumber: number;
  cardCount: number;
  price: number;
  status: 'generated' | 'assigned' | 'delivered' | 'sold' | 'cancelled';
}

export interface BingoBatch {
  id: string;
  serieId: string;
  name: string;
  startNumber: number;
  endNumber: number;
  assignedTo: string;
  status: 'generated' | 'assigned' | 'delivered' | 'sold' | 'cancelled';
}

export interface WorkshopConfig {
  name: string;
  responsible: string;
  instructor: string;
  environmentId: string;
  date: string;
  startTime: string;
  endTime: string;
  quota: number;
  price: number;
}

export interface EventCategoryConfig {
  /** Catálogo unificado: tickets, consumos, movilidad, comidas, actividades */
  offeringCatalog?: EventOfferingCatalog;
  /** Cantidades de tickets/boletos/invitaciones a generar o imprimir */
  ticketGeneration?: EventTicketGenerationConfig;
  foodOptions?: FoodConsumptionOption[];
  contestCategories?: ContestCategory[];
  bingoSeries?: BingoSerie[];
  bingoBatches?: BingoBatch[];
  workshop?: WorkshopConfig;
  massiveEnvironments?: EventEnvironmentBooking[];
}

export interface Event {
  id: string;
  code: string;
  companyId: string;
  companyName: string;
  businessUnitId: string;
  businessUnitName: string;
  name: string;
  description: string;
  typeId: string;
  typeName: string;
  category: EventCategory;
  imageUrl?: string;
  isPublic: boolean;
  membersOnly: boolean;
  allowGuests: boolean;
  requiresRegistration: boolean;
  isFree: boolean;
  status: EventStatus;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  registrationStartDate: string;
  registrationEndDate: string;
  venueName: string;
  environments: EventEnvironmentBooking[];
  capacity: EventCapacity;
  rates: EventRate[];
  rateRules: EventRateRules;
  categoryConfig: EventCategoryConfig;
  personalTicketRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventDto extends Omit<Event, 'id' | 'createdAt' | 'updatedAt'> {}
export interface UpdateEventDto extends Partial<CreateEventDto> {}

export interface EventRegistration {
  id: string;
  code: string;
  eventId: string;
  eventName: string;
  personId: string;
  personName: string;
  documentNumber: string;
  participantType: ParticipantType;
  rateName: string;
  rateAmount: number;
  currency: string;
  registrationDate: string;
  paymentStatus: 'pending' | 'paid' | 'partial' | 'exempt';
  ticketId?: string;
  ticketCode?: string;
  status: RegistrationStatus;
  consumptions?: EventConsumptionSelection[];
}

export interface EventTicket {
  id: string;
  code: string;
  eventId: string;
  eventName: string;
  participantId: string;
  participantName: string;
  documentNumber: string;
  buyerId: string;
  buyerName: string;
  eventDate: string;
  eventTime: string;
  environmentName: string;
  ticketType: string;
  price: number;
  currency: string;
  status: TicketStatus;
  registrationId: string;
  qrData: string;
  /** Ticket generado desde pool de creación del evento */
  poolId?: string;
  poolLabel?: string;
  sequenceNumber?: number;
  groupAssignmentId?: string;
  groupName?: string;
  paymentStatus?: 'pending' | 'paid' | 'partial' | 'exempt';
  attended?: boolean;
  attendedAt?: string;
}

export interface EventConsumption {
  id: string;
  eventId: string;
  eventName: string;
  participantId: string;
  participantName: string;
  ticketId: string;
  ticketCode: string;
  optionId: string;
  optionName: string;
  quantity: number;
  status: 'pending' | 'delivered';
}

export interface EventConsumptionSelection {
  optionId: string;
  optionName: string;
  quantity: number;
  unitPrice: number;
}

export interface EventPayment {
  id: string;
  registrationId: string;
  eventId: string;
  amount: number;
  currency: string;
  method: 'cash' | 'card' | 'transfer' | 'online';
  status: 'completed' | 'pending' | 'cancelled';
  paidAt: string;
  receiptNumber: string;
}

export interface EventSettlement {
  eventId: string;
  ticketsIssued: number;
  ticketsPaid: number;
  ticketsCancelled: number;
  courtesyTickets: number;
  ticketRevenue: number;
  consumptionRevenue: number;
  otherRevenue: number;
  totalRevenue: number;
  settledAt?: string;
}

export interface EventAudit {
  id: string;
  eventId: string;
  action: string;
  description: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface RateCalculation {
  baseRate: number;
  appliedRate: number;
  rateName: string;
  hasDebtPenalty: boolean;
  participantType: ParticipantType;
  explanation: string;
}

export interface ValidationItem {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface EventValidationResult {
  valid: boolean;
  errors: ValidationItem[];
  warnings: ValidationItem[];
}

export interface EventDashboardStats {
  activeEvents: number;
  upcomingEvents: number;
  registrationOpenEvents: number;
  finishedEvents: number;
  ticketsSold: number;
  registrationsCount: number;
  capacityUsed: number;
  totalRevenue: number;
}

export interface EventFilters {
  name?: string;
  typeId?: string;
  category?: EventCategory;
  status?: EventStatus;
  dateFrom?: string;
  dateTo?: string;
  businessUnitId?: string;
}

export function getAvailableCapacity(capacity: EventCapacity): number {
  return capacity.totalCapacity - capacity.confirmedCapacity;
}

export function getOccupancyPercent(capacity: EventCapacity): number {
  if (capacity.totalCapacity === 0) return 0;
  return (capacity.confirmedCapacity / capacity.totalCapacity) * 100;
}

export function getCapacityStatus(capacity: EventCapacity): 'available' | 'almost_full' | 'full' {
  const available = getAvailableCapacity(capacity);
  if (available === 0) return 'full';
  const percent = getOccupancyPercent(capacity);
  if (percent >= 85) return 'almost_full';
  return 'available';
}
