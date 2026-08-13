import { EnrollmentStatus } from '../enums/enrollment-status.enum';
import { ClassStatus } from '../enums/class-status.enum';
import { EnrollmentRuleType } from '../enums/enrollment-rule-type.enum';
import { ValidationSeverity } from '../enums/validation-severity.enum';

export type StudentType = 'NEW' | 'REGULAR';

export const STUDENT_TYPE_LABELS: Record<StudentType, string> = {
  NEW: 'Estudiante nuevo',
  REGULAR: 'Estudiante regular',
};

export interface ValidationMessage {
  severity: ValidationSeverity;
  message: string;
}

export interface EnrollmentContext {
  campus: string;
  user: string;
  date: string;
  settlementOpen: boolean;
  settlementId?: string;
}

export interface EnrollmentStudent {
  id: number;
  code: string;
  firstName: string;
  lastName: string;
  documentType: 'DNI' | 'CE';
  documentNumber: string;
  birthDate: string;
  age: number;
  gender?: 'M' | 'F' | 'O';
  email: string;
  phone: string;
  address: string;
  district?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  condition: string;
  isRegularStudent: boolean;
  status: 'active' | 'inactive' | 'blocked';
  agreementIds: number[];
  notes?: string;
  lastCourseName?: string;
  lastClassSchedule?: string;
  lastEnrollmentDate?: string;
  lastEnrollmentStatus?: string;
}

export interface StudentFilters {
  search?: string;
  document?: string;
  documentType?: EnrollmentStudent['documentType'] | '';
  studentType?: 'NEW' | 'REGULAR' | '';
  status?: EnrollmentStudent['status'] | '';
}

export interface CreateEnrollmentStudentRequest {
  firstName: string;
  lastName: string;
  documentType: EnrollmentStudent['documentType'];
  documentNumber: string;
  birthDate: string;
  gender?: EnrollmentStudent['gender'];
  email: string;
  phone: string;
  address: string;
  district?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  condition?: string;
  notes?: string;
}

export type UpdateEnrollmentStudentRequest = CreateEnrollmentStudentRequest;

export interface StudentSettlementStatus {
  isSettled: boolean;
  pendingAmount: number;
  pendingEnrollments: number;
  message: string;
}

export interface EnrollmentCourse {
  id: number;
  code: string;
  name: string;
  program: string;
  discipline: string;
  modality: string;
  campus: string;
  level: string;
  basePrice: number;
}

export interface EnrollmentClass {
  id: number;
  courseId: number;
  code: string;
  name: string;
  modality: string;
  campus: string;
  environment: string;
  schedule: string;
  days: string;
  timeStart: string;
  timeEnd: string;
  frequency: string;
  teacher: string;
  capacity: number;
  enrolled: number;
  available: number;
  status: ClassStatus;
}

export interface EnrollmentAgreement {
  id: number;
  name: string;
  company: string;
  description: string;
  validFrom: string;
  validTo: string;
  coveragePercentage: number;
  benefitSummary: string;
  status: 'active' | 'expired' | 'suspended';
  allowedModalities: string[];
  allowedCampuses: string[];
  allowedCourseIds: number[];
  allowedClassIds: number[];
  conditions: string;
}

export const AGREEMENT_STATUS_LABELS: Record<EnrollmentAgreement['status'], string> = {
  active: 'Activo',
  expired: 'Vencido',
  suspended: 'Suspendido',
};

export interface AgreementFilters {
  search?: string;
  company?: string;
  status?: EnrollmentAgreement['status'] | '';
  coverageMin?: number;
  validFrom?: string;
  validTo?: string;
  campus?: string;
}

export interface CreateEnrollmentAgreementRequest {
  name: string;
  company: string;
  description: string;
  validFrom: string;
  validTo: string;
  coveragePercentage: number;
  status: EnrollmentAgreement['status'];
  conditions: string;
  allowedModalities: string[];
  allowedCampuses: string[];
  allowedCourseIds: number[];
}

export type UpdateEnrollmentAgreementRequest = CreateEnrollmentAgreementRequest;

export interface AgreementValidationResult {
  valid: boolean;
  errors: ValidationMessage[];
  warnings: ValidationMessage[];
}

export interface EnrollmentRule {
  id: number;
  code: string;
  name: string;
  type: EnrollmentRuleType;
  appliesTo: string;
  resultType: 'blocking' | 'warning' | 'info';
  description: string;
  active: boolean;
}

export interface EnrollmentRuleResult {
  ruleId: number;
  ruleName: string;
  status: 'PASSED' | 'WARNING' | 'FAILED';
  message: string;
  blocking: boolean;
}

export interface EnrollmentValidationResult {
  valid: boolean;
  results: EnrollmentRuleResult[];
  blockingErrors: number;
  warnings: number;
}

export interface EnrollmentCharge {
  id: number;
  conceptCode: string;
  conceptName: string;
  baseAmount: number;
  discountAmount: number;
  finalAmount: number;
  agreementBenefit?: boolean;
  registrationFee?: boolean;
}

export interface EnrollmentPayment {
  id: number;
  enrollmentId: number;
  amount: number;
  method: 'cash' | 'card' | 'transfer' | 'other';
  reference?: string;
  paidAt: string;
  confirmed: boolean;
}

export interface EnrollmentHistoryEntry {
  id: number;
  enrollmentId: number;
  timestamp: string;
  action: string;
  detail: string;
  user: string;
}

export interface Enrollment {
  id: number;
  code: string;
  studentId: number;
  studentType: StudentType;
  courseId: number;
  classId: number;
  agreementId?: number;
  status: EnrollmentStatus;
  subtotal: number;
  discount: number;
  total: number;
  campus: string;
  createdAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
}

export interface EnrollmentListItem extends Enrollment {
  studentName: string;
  studentDocument: string;
  courseName: string;
  className: string;
  schedule: string;
  agreementName?: string;
}

export interface EnrollmentFilters {
  code?: string;
  student?: string;
  document?: string;
  courseId?: number;
  classId?: number;
  dateFrom?: string;
  dateTo?: string;
  status?: EnrollmentStatus;
  studentType?: StudentType;
  agreementId?: number;
  campus?: string;
  page?: number;
  pageSize?: number;
}

export interface ClassFilters {
  program?: string;
  courseId?: number;
  modality?: string;
  campus?: string;
  frequency?: string;
  day?: string;
  schedule?: string;
}

export interface PaymentRequest {
  method: 'cash' | 'card' | 'transfer' | 'other';
  amount: number;
  reference?: string;
}

export interface EnrollmentDashboardStats {
  todayCount: number;
  monthCount: number;
  newStudents: number;
  regularStudents: number;
  pendingPayment: number;
  confirmed: number;
  withAgreement: number;
  cancelled: number;
}

export interface EnrollmentAlert {
  id: string;
  severity: ValidationSeverity;
  message: string;
  actionLabel?: string;
  actionRoute?: string;
}

export type WizardStep =
  | 'context'
  | 'student'
  | 'agreement'
  | 'validation'
  | 'course'
  | 'class'
  | 'charges'
  | 'payment'
  | 'confirmation';

export const WIZARD_STEPS: { id: WizardStep; label: string; order: number }[] = [
  { id: 'student', label: 'Estudiante', order: 1 },
  { id: 'context', label: 'Liquidación', order: 2 },
  { id: 'agreement', label: 'Convenio', order: 3 },
  { id: 'validation', label: 'Validaciones', order: 4 },
  { id: 'course', label: 'Curso', order: 5 },
  { id: 'class', label: 'Clase / horario', order: 6 },
  { id: 'charges', label: 'Conceptos', order: 7 },
  { id: 'payment', label: 'Pago', order: 8 },
  { id: 'confirmation', label: 'Confirmación', order: 9 },
];

export const REGISTRATION_FEE_AMOUNT = 50;

export function getAvailabilityLabel(available: number, capacity: number): 'available' | 'low' | 'full' {
  if (available <= 0) return 'full';
  if (available <= Math.ceil(capacity * 0.2)) return 'low';
  return 'available';
}

export const AVAILABILITY_LABELS = {
  available: 'Disponible',
  low: 'Últimos cupos',
  full: 'Completo',
} as const;
