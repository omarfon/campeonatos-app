import { EnrollmentStatus } from '../../matricula/enums/enrollment-status.enum';
import { StudentComunicadoCategory } from '../enums/student-comunicado-category.enum';
import { StudentNotificationType } from '../enums/student-notification-type.enum';
import { StudentPaymentStatus } from '../enums/student-payment-status.enum';
import { StudentCourseStatus } from '../enums/student-course-status.enum';
import { StudentAttendanceStatus } from '../enums/student-attendance-status.enum';

export interface StudentSession {
  studentId: number;
  studentCode: string;
  fullName: string;
  email: string;
  isRegularStudent: boolean;
}

export interface StudentProfile {
  id: number;
  code: string;
  firstName: string;
  lastName: string;
  fullName: string;
  documentType: 'DNI' | 'CE';
  documentNumber: string;
  email: string;
  phone: string;
  address: string;
  district?: string;
  birthDate: string;
  isRegularStudent: boolean;
  program: string;
  level: string;
  avatarInitials: string;
  editableFields: (keyof StudentProfile)[] | string[];
}

export interface StudentDashboard {
  greeting: string;
  profile: StudentProfile;
  activeCourses: number;
  attendancePercentage: number;
  pendingAmount: number;
  paymentStatusLabel: string;
  nextClass?: StudentClass;
  activeCourseCards: StudentCourse[];
  comunicados: StudentComunicado[];
}

export interface StudentCourse {
  id: number;
  enrollmentId?: number;
  name: string;
  code: string;
  status: StudentCourseStatus;
  teacher: string;
  schedule: string;
  days: string;
  timeStart: string;
  timeEnd: string;
  campus: string;
  environment: string;
  period: string;
  attendancePercentage: number;
  modality: string;
  level: string;
  discipline: string;
  recommended?: boolean;
  description?: string;
  duration?: string;
  basePrice?: number;
  nextClassDate?: string;
}

export interface StudentClass {
  id: number;
  courseId: number;
  courseName: string;
  name: string;
  days: string;
  timeStart: string;
  timeEnd: string;
  campus: string;
  environment: string;
  teacher: string;
  capacity: number;
  enrolled: number;
  available: number;
  modality: string;
  frequency: string;
  startDate?: string;
  isToday?: boolean;
  isRecommended?: boolean;
}

export interface StudentScheduleEvent {
  id: number;
  courseId: number;
  courseName: string;
  className: string;
  date: string;
  dayLabel: string;
  timeStart: string;
  timeEnd: string;
  campus: string;
  environment: string;
  teacher: string;
  type: 'class' | 'important';
}

export interface StudentAttendanceRecord {
  id: number;
  courseId: number;
  date: string;
  dateLabel: string;
  status: StudentAttendanceStatus;
}

export interface StudentAttendanceSummary {
  overallPercentage: number;
  courses: {
    courseId: number;
    courseName: string;
    totalClasses: number;
    present: number;
    absent: number;
    justified: number;
    percentage: number;
  }[];
}

export interface StudentEnrollmentContext {
  canEnroll: boolean;
  isNewStudent: boolean;
  isRegularStudent: boolean;
  settlementOpen: boolean;
  blockedMessage?: string;
  welcomeMessage?: string;
  continueMessage?: string;
  lastCourse?: { name: string; status: string };
  recommendedCourse?: StudentCourse;
  availableAgreementsCount: number;
}

export interface StudentAgreement {
  id: number;
  name: string;
  company: string;
  description: string;
  benefitSummary: string;
  coveragePercentage: number;
  validFrom: string;
  validTo: string;
}

export interface StudentEnrollmentExtra {
  id: number;
  name: string;
  description: string;
  price: number;
  selected: boolean;
}

export interface EnrollmentCalculationLine {
  conceptCode: string;
  conceptName: string;
  amount: number;
  isDiscount?: boolean;
  isRegistrationFee?: boolean;
}

export interface EnrollmentCalculationRequest {
  courseId: number;
  classId: number;
  agreementId?: number | null;
  extraIds?: number[];
}

export interface EnrollmentCalculation {
  lines: EnrollmentCalculationLine[];
  subtotal: number;
  discount: number;
  total: number;
  fullyCovered: boolean;
}

export interface EnrollmentRequest {
  courseId: number;
  classId: number;
  agreementId?: number | null;
  extraIds?: number[];
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'other';
}

export interface StudentEnrollment {
  id: number;
  code: string;
  courseName: string;
  className: string;
  schedule: string;
  campus: string;
  environment: string;
  teacher: string;
  period: string;
  status: EnrollmentStatus;
  agreementName?: string;
  subtotal: number;
  discount: number;
  total: number;
  createdAt: string;
  confirmedAt?: string;
  startDate?: string;
  lines: EnrollmentCalculationLine[];
  paymentId?: number;
}

export interface StudentPayment {
  id: number;
  code: string;
  concept: string;
  courseName?: string;
  period?: string;
  amount: number;
  dueDate?: string;
  paidAt?: string;
  status: StudentPaymentStatus;
  method?: string;
  receiptNumber?: string;
  enrollmentId?: number;
}

export interface StudentDebt {
  id: number;
  concept: string;
  courseName: string;
  period: string;
  dueDate: string;
  amount: number;
  status: StudentPaymentStatus;
}

export interface StudentDocument {
  id: number;
  title: string;
  category: 'constancia' | 'comprobante' | 'otro';
  type: string;
  number?: string;
  date: string;
  amount?: number;
  downloadUrl?: string;
}

export interface StudentComunicado {
  id: number;
  slug: string;
  title: string;
  summary: string;
  body: string;
  category: StudentComunicadoCategory;
  publishedAt: string;
  relativeDate: string;
  author: string;
  featured?: boolean;
  tags?: string[];
  actionRoute?: string[];
  actionLabel?: string;
}

export interface StudentNotification {
  id: number;
  type: StudentNotificationType;
  title: string;
  description: string;
  date: string;
  relativeDate: string;
  read: boolean;
  actionRoute?: string[];
  actionLabel?: string;
}

export interface StudentProfileField {
  key: string;
  label: string;
  value: string;
  editable: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  status: 'pending' | 'confirmed';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  session: StudentSession;
  token: string;
}
