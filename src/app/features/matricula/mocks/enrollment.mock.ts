import { ClassStatus } from '../enums/class-status.enum';
import { EnrollmentRuleType } from '../enums/enrollment-rule-type.enum';
import { EnrollmentStatus } from '../enums/enrollment-status.enum';
import {
  EnrollmentAgreement,
  EnrollmentClass,
  EnrollmentCourse,
  EnrollmentHistoryEntry,
  EnrollmentRule,
  EnrollmentStudent,
  Enrollment,
  EnrollmentCharge,
  EnrollmentPayment,
} from '../models/enrollment.model';

const FIRST_NAMES = [
  'Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Rosa', 'Pedro', 'Lucía', 'Diego', 'Elena',
  'Miguel', 'Sofía', 'Jorge', 'Camila', 'Andrés', 'Valeria', 'Ricardo', 'Daniela', 'Fernando', 'Patricia',
  'Roberto', 'Gabriela', 'Héctor', 'Natalia', 'Oscar', 'Claudia', 'Raúl', 'Verónica', 'Sergio', 'Mónica',
];

const LAST_NAMES = [
  'Pérez', 'García', 'Nakamura', 'Tanaka', 'López', 'Martínez', 'Rodríguez', 'Fernández', 'Sánchez', 'Torres',
  'Ramírez', 'Flores', 'Vargas', 'Castro', 'Mendoza', 'Ríos', 'Silva', 'Morales', 'Herrera', 'Jiménez',
];

function student(id: number, isRegular: boolean, agreementIds: number[] = []): EnrollmentStudent {
  const fn = FIRST_NAMES[(id - 1) % FIRST_NAMES.length];
  const ln = LAST_NAMES[(id - 1) % LAST_NAMES.length];
  const birthYear = 1995 + (id % 15);
  const age = 2026 - birthYear;
  const slug = `${fn}.${ln.split(' ')[0]}`.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  return {
    id,
    code: `EST-${String(id).padStart(6, '0')}`,
    firstName: fn,
    lastName: `${ln} ${LAST_NAMES[(id + 3) % LAST_NAMES.length]}`,
    documentType: id % 7 === 0 ? 'CE' : 'DNI',
    documentNumber: String(10000000 + id * 137),
    birthDate: `${birthYear}-0${(id % 9) + 1}-15`,
    age,
    gender: id % 2 === 0 ? 'F' : 'M',
    email: `${slug}${id}@email.com`,
    phone: `9${String(10000000 + id * 17).slice(-8)}`,
    address: `Av. Ejemplo ${100 + id}, Lima`,
    district: id % 3 === 0 ? 'Miraflores' : id % 3 === 1 ? 'San Isidro' : 'Surco',
    emergencyContactName: id % 4 === 0 ? 'Contacto de emergencia' : undefined,
    emergencyContactPhone: id % 4 === 0 ? `9${String(20000000 + id).slice(-8)}` : undefined,
    condition: 'Activo',
    isRegularStudent: isRegular,
    status: id === 29 ? 'blocked' : 'active',
    agreementIds,
    lastCourseName: isRegular ? (id % 2 === 0 ? 'Natación Básico' : 'Karate Inicial') : undefined,
    lastClassSchedule: isRegular ? 'L-M-V 08:00' : undefined,
    lastEnrollmentDate: isRegular ? '2026-07-01' : undefined,
    lastEnrollmentStatus: isRegular ? 'Completado' : undefined,
  };
}

export const MOCK_ENROLLMENT_STUDENTS: EnrollmentStudent[] = [
  // Escenarios específicos del DAS
  { ...student(1, false), firstName: 'Juan', lastName: 'Tanaka', documentNumber: '45123456' },
  { ...student(2, true), firstName: 'María', lastName: 'Nakamura', documentNumber: '46234567' },
  { ...student(3, false, [1]), firstName: 'Carlos', lastName: 'Pérez García', documentNumber: '47345678' },
  { ...student(4, false, [3]), firstName: 'Ana', lastName: 'García López', documentNumber: '48456789', agreementIds: [3] },
  ...Array.from({ length: 26 }, (_, i) => {
    const id = i + 5;
    const isRegular = id <= 24;
    const agreementIds = id === 10 ? [2] : id === 15 ? [1] : [];
    return student(id, isRegular, agreementIds);
  }),
];

export const MOCK_ENROLLMENT_COURSES: EnrollmentCourse[] = [
  { id: 1, code: 'NAT-BAS', name: 'Natación Básico', program: 'Regular', discipline: 'Natación', modality: 'Presencial', campus: 'AELU Principal', level: 'Básico', basePrice: 180 },
  { id: 2, code: 'NAT-INT', name: 'Natación Intermedio', program: 'Regular', discipline: 'Natación', modality: 'Presencial', campus: 'AELU Principal', level: 'Intermedio', basePrice: 180 },
  { id: 3, code: 'NAT-AVZ', name: 'Natación Avanzado', program: 'Regular', discipline: 'Natación', modality: 'Presencial', campus: 'AELU Principal', level: 'Avanzado', basePrice: 200 },
  { id: 4, code: 'KAR-INI', name: 'Karate Inicial', program: 'Regular', discipline: 'Karate', modality: 'Presencial', campus: 'AELU Principal', level: 'Inicial', basePrice: 160 },
  { id: 5, code: 'KAR-INT', name: 'Karate Intermedio', program: 'Regular', discipline: 'Karate', modality: 'Presencial', campus: 'AELU Sede Norte', level: 'Intermedio', basePrice: 170 },
  { id: 6, code: 'GYM-BAS', name: 'Gimnasio Funcional', program: 'Regular', discipline: 'Gimnasio', modality: 'Presencial', campus: 'AELU Principal', level: 'General', basePrice: 150 },
  { id: 7, code: 'GYM-VIR', name: 'Gimnasio Virtual', program: 'Intensivo', discipline: 'Gimnasio', modality: 'Virtual', campus: 'AELU Virtual', level: 'General', basePrice: 120 },
  { id: 8, code: 'NAT-VAC', name: 'Natación Vacacional', program: 'Vacacional', discipline: 'Natación', modality: 'Presencial', campus: 'AELU Principal', level: 'Mixto', basePrice: 220 },
  { id: 9, code: 'DAN-BAS', name: 'Danza Básica', program: 'Regular', discipline: 'Danza', modality: 'Presencial', campus: 'AELU Sede Norte', level: 'Básico', basePrice: 140 },
  { id: 10, code: 'TEN-INI', name: 'Tenis Inicial', program: 'Regular', discipline: 'Tenis', modality: 'Presencial', campus: 'AELU Principal', level: 'Inicial', basePrice: 190 },
];

function cls(
  id: number, courseId: number, code: string, name: string, days: string, start: string, end: string,
  campus: string, env: string, teacher: string, cap: number, enrolled: number, status: ClassStatus,
): EnrollmentClass {
  return {
    id,
    courseId,
    code,
    name,
    modality: courseId === 7 ? 'Virtual' : 'Presencial',
    campus,
    environment: env,
    schedule: `${days} ${start} - ${end}`,
    days,
    timeStart: start,
    timeEnd: end,
    frequency: days.includes('S') ? 'Semanal' : 'L-M-V',
    teacher,
    capacity: cap,
    enrolled,
    available: Math.max(cap - enrolled, 0),
    status,
  };
}

export const MOCK_ENROLLMENT_CLASSES: EnrollmentClass[] = [
  cls(1, 1, 'NAT-BAS-LMV', 'Natación Básico L-M-V', 'L-M-V', '08:00', '09:00', 'AELU Principal', 'Piscina Principal', 'Carlos Tanaka', 25, 17, ClassStatus.APPROVED),
  cls(2, 1, 'NAT-BAS-SAB', 'Natación Básico Sáb', 'Sáb', '10:00', '11:30', 'AELU Principal', 'Piscina Principal', 'Carlos Tanaka', 20, 20, ClassStatus.APPROVED),
  cls(3, 2, 'NAT-INT-LMV', 'Natación Intermedio L-M-V', 'L-M-V', '08:00', '09:00', 'AELU Principal', 'Piscina Principal', 'Carlos Tanaka', 25, 20, ClassStatus.APPROVED),
  cls(4, 2, 'NAT-INT-MJS', 'Natación Intermedio M-J-S', 'M-J-S', '18:00', '19:00', 'AELU Principal', 'Piscina Secundaria', 'María Sato', 20, 8, ClassStatus.APPROVED),
  cls(5, 3, 'NAT-AVZ-LMV', 'Natación Avanzado', 'L-M-V', '07:00', '08:00', 'AELU Principal', 'Piscina Principal', 'Carlos Tanaka', 15, 12, ClassStatus.APPROVED),
  cls(6, 4, 'KAR-INI-LMV', 'Karate Inicial', 'L-M-V', '16:00', '17:00', 'AELU Principal', 'Dojo 1', 'Kenji Yamamoto', 30, 22, ClassStatus.APPROVED),
  cls(7, 5, 'KAR-INT-LMV', 'Karate Intermedio', 'L-M-V', '17:00', '18:00', 'AELU Sede Norte', 'Dojo Norte', 'Kenji Yamamoto', 25, 23, ClassStatus.APPROVED),
  cls(8, 6, 'GYM-BAS-LMV', 'Gimnasio L-M-V', 'L-M-V', '06:00', '07:00', 'AELU Principal', 'Gimnasio', 'Laura Mendoza', 30, 15, ClassStatus.APPROVED),
  cls(9, 6, 'GYM-BAS-MJS', 'Gimnasio M-J-S', 'M-J-S', '19:00', '20:00', 'AELU Principal', 'Gimnasio', 'Laura Mendoza', 30, 28, ClassStatus.APPROVED),
  cls(10, 7, 'GYM-VIR-ONL', 'Gimnasio Virtual', 'L-M-V', '20:00', '21:00', 'AELU Virtual', 'Zoom', 'Laura Mendoza', 50, 30, ClassStatus.APPROVED),
  cls(11, 8, 'NAT-VAC-AM', 'Natación Vacacional AM', 'L-V', '09:00', '11:00', 'AELU Principal', 'Piscina Principal', 'Carlos Tanaka', 40, 35, ClassStatus.APPROVED),
  cls(12, 9, 'DAN-BAS-LMV', 'Danza Básica', 'L-M-V', '15:00', '16:00', 'AELU Sede Norte', 'Salón Danza', 'Ana Torres', 20, 10, ClassStatus.APPROVED),
  cls(13, 10, 'TEN-INI-SAB', 'Tenis Inicial', 'Sáb-Dom', '08:00', '10:00', 'AELU Principal', 'Cancha Tenis', 'Pedro Ruiz', 16, 14, ClassStatus.APPROVED),
  cls(14, 2, 'NAT-INT-DRF', 'Natación Intermedio (Borrador)', 'L-M-V', '10:00', '11:00', 'AELU Principal', 'Piscina Secundaria', 'María Sato', 20, 0, ClassStatus.DRAFT),
  cls(15, 3, 'NAT-AVZ-PND', 'Natación Avanzado (Pendiente)', 'M-J-S', '07:00', '08:00', 'AELU Principal', 'Piscina Principal', 'Carlos Tanaka', 15, 0, ClassStatus.PENDING),
  cls(16, 4, 'KAR-INI-CAN', 'Karate Inicial (Cancelada)', 'L-M-V', '18:00', '19:00', 'AELU Principal', 'Dojo 1', 'Kenji Yamamoto', 30, 0, ClassStatus.CANCELLED),
  cls(17, 1, 'NAT-BAS-MJS', 'Natación Básico M-J-S', 'M-J-S', '17:00', '18:00', 'AELU Principal', 'Piscina Principal', 'Carlos Tanaka', 25, 24, ClassStatus.APPROVED),
  cls(18, 2, 'NAT-INT-SAB', 'Natación Intermedio Sáb', 'Sáb', '11:00', '12:30', 'AELU Principal', 'Piscina Secundaria', 'María Sato', 20, 5, ClassStatus.APPROVED),
  cls(19, 4, 'KAR-INI-SAB', 'Karate Inicial Sáb', 'Sáb', '09:00', '10:30', 'AELU Principal', 'Dojo 1', 'Kenji Yamamoto', 25, 18, ClassStatus.APPROVED),
  cls(20, 6, 'GYM-BAS-SAB', 'Gimnasio Sáb', 'Sáb', '08:00', '09:00', 'AELU Principal', 'Gimnasio', 'Laura Mendoza', 25, 3, ClassStatus.APPROVED),
  cls(21, 3, 'NAT-AVZ-MJS', 'Natación Avanzado M-J-S', 'M-J-S', '06:30', '07:30', 'AELU Principal', 'Piscina Principal', 'Carlos Tanaka', 15, 15, ClassStatus.APPROVED),
  cls(22, 5, 'KAR-INT-SAB', 'Karate Intermedio Sáb', 'Sáb', '10:00', '11:30', 'AELU Sede Norte', 'Dojo Norte', 'Kenji Yamamoto', 20, 19, ClassStatus.APPROVED),
  cls(23, 8, 'NAT-VAC-PM', 'Natación Vacacional PM', 'L-V', '15:00', '17:00', 'AELU Principal', 'Piscina Principal', 'Carlos Tanaka', 40, 38, ClassStatus.APPROVED),
  cls(24, 9, 'DAN-BAS-SAB', 'Danza Básica Sáb', 'Sáb', '14:00', '15:30', 'AELU Sede Norte', 'Salón Danza', 'Ana Torres', 20, 8, ClassStatus.APPROVED),
  cls(25, 10, 'TEN-INI-LMV', 'Tenis Inicial L-M-V', 'L-M-V', '07:00', '08:30', 'AELU Principal', 'Cancha Tenis', 'Pedro Ruiz', 16, 6, ClassStatus.APPROVED),
];

export const MOCK_ENROLLMENT_AGREEMENTS: EnrollmentAgreement[] = [
  {
    id: 1,
    name: 'Convenio Empresa ABC',
    company: 'Empresa ABC S.A.',
    description: 'Beneficio corporativo para colaboradores activos',
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    coveragePercentage: 20,
    benefitSummary: '20% de descuento',
    status: 'active',
    allowedModalities: ['Presencial'],
    allowedCampuses: ['AELU Principal', 'AELU Sede Norte'],
    allowedCourseIds: [1, 2, 4, 6],
    allowedClassIds: [1, 3, 4, 6, 8],
    conditions: 'Socio activo o colaborador registrado',
  },
  {
    id: 2,
    name: 'Convenio Corporativo XYZ',
    company: 'Corporativo XYZ',
    description: 'Descuento para familiares de colaboradores',
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    coveragePercentage: 15,
    benefitSummary: '15% de descuento',
    status: 'active',
    allowedModalities: ['Presencial', 'Virtual'],
    allowedCampuses: ['AELU Principal'],
    allowedCourseIds: [1, 2, 6, 7],
    allowedClassIds: [1, 3, 8, 10],
    conditions: 'Colaborador activo verificado',
  },
  {
    id: 3,
    name: 'Convenio Cobertura Total',
    company: 'Institución Pública DEF',
    description: 'Cobertura completa para beneficiarios seleccionados',
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    coveragePercentage: 100,
    benefitSummary: '100% cubierto por empresa',
    status: 'active',
    allowedModalities: ['Presencial'],
    allowedCampuses: ['AELU Principal'],
    allowedCourseIds: [1, 2, 3],
    allowedClassIds: [1, 3, 5],
    conditions: 'Beneficiario pre-aprobado',
  },
  {
    id: 4,
    name: 'Convenio Royal 2026',
    company: 'Royal Club',
    description: 'Beneficio para socios corporativos Royal',
    validFrom: '2026-01-01',
    validTo: '2026-06-30',
    coveragePercentage: 25,
    benefitSummary: '25% de descuento',
    status: 'active',
    allowedModalities: ['Presencial'],
    allowedCampuses: ['AELU Principal', 'AELU Sede Norte'],
    allowedCourseIds: [4, 5, 9, 10],
    allowedClassIds: [6, 7, 12, 13],
    conditions: 'Membresía Royal vigente',
  },
  {
    id: 5,
    name: 'Convenio Vencido Demo',
    company: 'Empresa Histórica',
    description: 'Convenio de demostración vencido',
    validFrom: '2025-01-01',
    validTo: '2025-12-31',
    coveragePercentage: 10,
    benefitSummary: '10% (vencido)',
    status: 'expired',
    allowedModalities: ['Presencial'],
    allowedCampuses: ['AELU Principal'],
    allowedCourseIds: [1],
    allowedClassIds: [1],
    conditions: 'No vigente',
  },
];

export const MOCK_ENROLLMENT_RULES: EnrollmentRule[] = [
  { id: 1, code: 'RULE-01', name: 'Liquidación abierta', type: EnrollmentRuleType.CUSTOM, appliesTo: 'Todas', resultType: 'blocking', description: 'No iniciar matrícula sin liquidación abierta', active: true },
  { id: 2, code: 'RULE-02', name: 'Un solo convenio', type: EnrollmentRuleType.AGREEMENT, appliesTo: 'Todas', resultType: 'blocking', description: 'Máximo un convenio por matrícula', active: true },
  { id: 3, code: 'RULE-05', name: 'Estado del estudiante', type: EnrollmentRuleType.STUDENT_STATUS, appliesTo: 'Matrícula regular', resultType: 'blocking', description: 'El estudiante debe estar activo', active: true },
  { id: 4, code: 'RULE-06', name: 'Clase aprobada', type: EnrollmentRuleType.CLASS_AVAILABILITY, appliesTo: 'Todas', resultType: 'blocking', description: 'Solo clases con estado aprobado', active: true },
  { id: 5, code: 'RULE-ACAD-01', name: 'Requisito previo', type: EnrollmentRuleType.ACADEMIC_REQUIREMENT, appliesTo: 'Cursos intermedios', resultType: 'blocking', description: 'Curso básico completado para niveles superiores', active: true },
  { id: 6, code: 'RULE-CERT', name: 'Certificado médico', type: EnrollmentRuleType.CUSTOM, appliesTo: 'Natación', resultType: 'warning', description: 'Certificado médico recomendado', active: true },
];

function genEnrollments(): Enrollment[] {
  const items: Enrollment[] = [];
  const statuses = [
    EnrollmentStatus.CONFIRMED, EnrollmentStatus.CONFIRMED, EnrollmentStatus.PENDING_PAYMENT,
    EnrollmentStatus.DRAFT, EnrollmentStatus.CANCELLED, EnrollmentStatus.CONFIRMED,
  ];
  for (let i = 1; i <= 50; i++) {
    const student = MOCK_ENROLLMENT_STUDENTS[(i - 1) % MOCK_ENROLLMENT_STUDENTS.length];
    const clsItem = MOCK_ENROLLMENT_CLASSES[(i - 1) % 13];
    const course = MOCK_ENROLLMENT_COURSES.find(c => c.id === clsItem.courseId)!;
    const status = statuses[i % statuses.length];
    const hasAgreement = student.agreementIds.length > 0 && i % 3 === 0;
    const agreementId = hasAgreement ? student.agreementIds[0] : undefined;
    const subtotal = course.basePrice + (student.isRegularStudent ? 0 : 50);
    const discount = agreementId ? Math.round(subtotal * 0.2) : 0;
    const total = subtotal - discount;
    const date = `2026-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`;
    items.push({
      id: i,
      code: `MAT-2026-${String(i).padStart(6, '0')}`,
      studentId: student.id,
      studentType: student.isRegularStudent ? 'REGULAR' : 'NEW',
      courseId: course.id,
      classId: clsItem.id,
      agreementId,
      status,
      subtotal,
      discount,
      total,
      campus: clsItem.campus,
      createdAt: date,
      confirmedAt: status === EnrollmentStatus.CONFIRMED ? date : undefined,
      cancelledAt: status === EnrollmentStatus.CANCELLED ? date : undefined,
    });
  }
  return items;
}

export const MOCK_ENROLLMENTS: Enrollment[] = genEnrollments();

export const MOCK_ENROLLMENT_PAYMENTS: EnrollmentPayment[] = MOCK_ENROLLMENTS
  .filter(e => e.status === EnrollmentStatus.CONFIRMED || e.status === EnrollmentStatus.PENDING_PAYMENT)
  .slice(0, 20)
  .map((e, i) => ({
    id: i + 1,
    enrollmentId: e.id,
    amount: e.status === EnrollmentStatus.CONFIRMED ? e.total : e.total * 0.5,
    method: (['cash', 'card', 'transfer'] as const)[i % 3],
    reference: i % 3 === 1 ? `TRX-${String(i).padStart(4, '0')}` : undefined,
    paidAt: e.createdAt,
    confirmed: e.status === EnrollmentStatus.CONFIRMED,
  }));

export const MOCK_ENROLLMENT_HISTORY: EnrollmentHistoryEntry[] = [
  { id: 1, enrollmentId: 1, timestamp: '2026-08-12T10:01:00', action: 'Proceso iniciado', detail: 'Liquidación verificada', user: 'Administrador Counter' },
  { id: 2, enrollmentId: 1, timestamp: '2026-08-12T10:02:00', action: 'Estudiante seleccionado', detail: 'Juan Tanaka (EST-000001)', user: 'Administrador Counter' },
  { id: 3, enrollmentId: 1, timestamp: '2026-08-12T10:03:00', action: 'Convenio aplicado', detail: 'Convenio Empresa ABC', user: 'Administrador Counter' },
  { id: 4, enrollmentId: 1, timestamp: '2026-08-12T10:04:00', action: 'Reglas validadas', detail: '6 reglas evaluadas, 0 bloqueantes', user: 'Administrador Counter' },
  { id: 5, enrollmentId: 1, timestamp: '2026-08-12T10:05:00', action: 'Clase seleccionada', detail: 'NAT-BAS-LMV', user: 'Administrador Counter' },
  { id: 6, enrollmentId: 1, timestamp: '2026-08-12T10:06:00', action: 'Conceptos generados', detail: '2 conceptos, total S/ 194', user: 'Administrador Counter' },
  { id: 7, enrollmentId: 1, timestamp: '2026-08-12T10:08:00', action: 'Pago confirmado', detail: 'Efectivo S/ 194', user: 'Administrador Counter' },
  { id: 8, enrollmentId: 1, timestamp: '2026-08-12T10:08:00', action: 'Matrícula confirmada', detail: 'MAT-2026-000001', user: 'Administrador Counter' },
];

export const MOCK_SETTLEMENT_OPEN = true;

export function buildChargesForEnrollment(
  student: EnrollmentStudent,
  course: EnrollmentCourse,
  agreement?: EnrollmentAgreement,
): EnrollmentCharge[] {
  const charges: EnrollmentCharge[] = [
    {
      id: 1,
      conceptCode: 'CURSO',
      conceptName: `Curso ${course.name}`,
      baseAmount: course.basePrice,
      discountAmount: 0,
      finalAmount: course.basePrice,
    },
  ];
  if (!student.isRegularStudent) {
    charges.push({
      id: 2,
      conceptCode: 'REGISTRO',
      conceptName: 'Derecho de registro',
      baseAmount: 50,
      discountAmount: 0,
      finalAmount: 50,
      registrationFee: true,
    });
  }
  if (agreement) {
    const subtotal = charges.reduce((s, c) => s + c.finalAmount, 0);
    const discount = Math.round(subtotal * (agreement.coveragePercentage / 100));
    if (discount > 0) {
      charges.push({
        id: 3,
        conceptCode: 'CONVENIO',
        conceptName: `Beneficio ${agreement.name}`,
        baseAmount: 0,
        discountAmount: discount,
        finalAmount: -discount,
        agreementBenefit: true,
      });
    }
  }
  return charges;
}
