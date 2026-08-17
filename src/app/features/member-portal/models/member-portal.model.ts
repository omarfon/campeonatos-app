import { MemberAccountStatus } from '../enums/member-status.enum';
import { MemberNotificationType } from '../enums/member-notification-type.enum';
import { MemberScheduleAvailability } from '../enums/member-schedule-availability.enum';
import { MemberCalendarEventType } from '../enums/member-calendar-event-type.enum';
import { MemberPaymentStatus } from '../enums/member-payment-status.enum';
import { MemberPaymentType } from '../enums/member-payment-type.enum';

export interface MemberSession {
  memberId: string;
  memberCode: string;
  fullName: string;
  email: string;
  isHolder: boolean;
}

export interface MemberLoginRequest {
  email: string;
  password: string;
}

export interface MemberLoginResponse {
  session: MemberSession;
  token: string;
}

export interface ParticipantContext {
  personId: number;
  memberId: string;
  fullName: string;
  relationship: string;
  isHolder: boolean;
  avatarUrl?: string;
}

export interface MemberProfileSummary {
  memberId: string;
  code: string;
  fullName: string;
  firstName: string;
  category: string;
  memberType: string;
  status: MemberAccountStatus;
  affiliationDate: string;
  validityDate: string;
}

export interface MemberDashboardStats {
  familyCount: number;
  activeActivities: number;
  upcomingEvents: number;
  activeTickets: number;
  pendingAmount: number;
  availableBenefits: number;
}

export interface MemberNextActivity {
  id: string;
  activityName: string;
  participantName: string;
  dateLabel: string;
  timeStart: string;
  timeEnd: string;
  venue: string;
  route: string[];
}

export interface MemberUpcomingEvent {
  id: string;
  name: string;
  dateLabel: string;
  timeStart: string;
  venue: string;
  route: string[];
}

export interface MemberDashboard {
  greeting: string;
  profile: MemberProfileSummary;
  stats: MemberDashboardStats;
  nextActivity: MemberNextActivity | null;
  upcomingEvents: MemberUpcomingEvent[];
}

export interface MemberNotification {
  id: number;
  type: MemberNotificationType;
  title: string;
  description: string;
  date: string;
  relativeDate: string;
  read: boolean;
  actionRoute?: string[];
}

export interface MemberPortalMenuItem {
  label: string;
  icon: string;
  route: string;
  permission?: string;
  badge?: number;
}

export interface MemberBenefitSummary {
  id: string;
  name: string;
  discountLabel: string;
  validUntil: string;
  applicableTo: string[];
}

export interface MemberBenefit extends MemberBenefitSummary {
  description: string;
  sponsor?: string;
  status: 'active' | 'expired' | 'pending';
  coveragePercent?: number;
}

export interface MemberDocument {
  id: number;
  title: string;
  category: 'constancia' | 'comprobante' | 'contrato' | 'otro';
  type: string;
  number?: string;
  date: string;
  amount?: number;
  participantName?: string;
  downloadUrl?: string;
}

export interface MemberProfile extends MemberProfileSummary {
  documentType: string;
  documentNumber: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  editableFields: readonly string[];
}

export interface MemberProfileField {
  key: string;
  label: string;
  value: string;
  editable: boolean;
}

export interface MemberEconomicStatus {
  label: string;
  pendingAmount: number;
  isUpToDate: boolean;
  lastPaymentDate?: string;
}

export interface MemberAccount {
  profile: MemberProfileSummary;
  documentType: string;
  documentNumber: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  benefits: MemberBenefitSummary[];
  economicStatus: MemberEconomicStatus;
  /** Campos que el socio puede editar desde el portal. */
  editableFields: readonly string[];
}

export interface FamilyMemberActivity {
  id: string;
  name: string;
  schedule: string;
  status: 'active' | 'pending' | 'cancelled';
}

export interface FamilyMemberEvent {
  id: string;
  name: string;
  dateLabel: string;
}

export interface FamilyMember {
  personId: number;
  memberId: string;
  fullName: string;
  firstName: string;
  relationship: string;
  age: number;
  birthDate: string;
  status: MemberAccountStatus;
  activeActivities: string[];
  activityCount: number;
  upcomingEventsCount: number;
  nextActivityLabel?: string;
  isHolder: boolean;
}

export interface FamilyMemberDetail extends FamilyMember {
  documentType: string;
  documentNumber: string;
  email?: string;
  phone?: string;
  activities: FamilyMemberActivity[];
  upcomingEvents: FamilyMemberEvent[];
}

export interface MemberActivityFilters {
  discipline?: string;
  category?: string;
  modality?: string;
  campus?: string;
  day?: string;
  availability?: MemberScheduleAvailability | 'all';
  query?: string;
}

export interface MemberActivity {
  id: number;
  name: string;
  code: string;
  discipline: string;
  category: string;
  level: string;
  modality: string;
  campus: string;
  description: string;
  basePrice: number;
  scheduleCount: number;
  availableScheduleCount: number;
  recommended?: boolean;
  duration?: string;
}

export interface MemberActivitySchedule {
  id: number;
  activityId: number;
  activityName: string;
  days: string;
  dayKeys: string[];
  timeStart: string;
  timeEnd: string;
  venue: string;
  teacher: string;
  availableSpots: number;
  totalSpots: number;
  availability: MemberScheduleAvailability;
}

export interface MemberActivityEnrollment {
  id: number;
  code: string;
  participantPersonId: number;
  participantName: string;
  activityName: string;
  schedule: string;
  days: string;
  timeStart: string;
  timeEnd: string;
  venue: string;
  status: 'active' | 'pending' | 'cancelled';
  period: string;
}

export interface MemberActivityAgreement {
  id: number;
  name: string;
  description: string;
  discountPercent: number;
}

export interface MemberEnrollmentContext {
  canEnroll: boolean;
  blockedMessage?: string;
}

export interface MemberEnrollmentCalculationLine {
  conceptName: string;
  amount: number;
  isDiscount?: boolean;
}

export interface MemberEnrollmentCalculation {
  lines: MemberEnrollmentCalculationLine[];
  subtotal: number;
  discount: number;
  total: number;
  fullyCovered: boolean;
}

export interface MemberEnrollmentRequest {
  participantPersonId: number;
  activityId: number;
  scheduleId: number;
  agreementId?: number | null;
  paymentMethod?: string;
}

export interface MemberEnrollmentResult {
  enrollment: MemberActivityEnrollment;
  paymentReference?: string;
}

export type MemberCalendarFilterType = MemberCalendarEventType | 'all';

export interface MemberCalendarEvent {
  id: string;
  type: MemberCalendarEventType;
  title: string;
  date: string;
  dayLabel: string;
  timeStart: string;
  timeEnd: string;
  participantPersonId: number;
  participantName: string;
  venue: string;
  teacher?: string;
  activityId?: number;
  eventId?: string;
}

export interface MemberCalendarFilters {
  participantPersonId?: number | 'all';
  eventType?: MemberCalendarFilterType;
}

export interface MemberPayment {
  id: number;
  code: string;
  concept: string;
  participantPersonId: number;
  participantName: string;
  activityName?: string;
  period?: string;
  amount: number;
  dueDate?: string;
  paidAt?: string;
  status: MemberPaymentStatus;
  type: MemberPaymentType;
  method?: string;
  receiptNumber?: string;
  receiptId?: string;
}

export interface MemberReceipt {
  id: string;
  number: string;
  date: string;
  concept: string;
  participantName: string;
  amount: number;
  paymentId: number;
}

export interface MemberAccountStatementLine {
  participantPersonId: number;
  participantName: string;
  pendingAmount: number;
  debtCount: number;
}

export interface MemberAccountStatement {
  totalPending: number;
  isUpToDate: boolean;
  lastPaymentDate?: string;
  nextDueDate?: string;
  lines: MemberAccountStatementLine[];
}
