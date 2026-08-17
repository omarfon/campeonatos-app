import { MemberPayment, MemberReceipt } from '../models/member-portal.model';
import { MemberPaymentStatus } from '../enums/member-payment-status.enum';
import { MemberPaymentType } from '../enums/member-payment-type.enum';

export const MOCK_MEMBER_PAYMENTS: MemberPayment[] = [
  {
    id: 1, code: 'PAG-SOC-001', concept: 'Matrícula Natación Intermedio',
    participantPersonId: 3, participantName: 'Lucía Tanaka', activityName: 'Natación Intermedio',
    period: 'Septiembre 2026', amount: 180, dueDate: '2026-08-25', status: MemberPaymentStatus.PENDING,
    type: MemberPaymentType.ACTIVITY,
  },
  {
    id: 2, code: 'PAG-SOC-002', concept: 'Matrícula Karate Juvenil',
    participantPersonId: 4, participantName: 'Diego Tanaka', activityName: 'Karate Juvenil',
    period: 'Agosto 2026', amount: 170, paidAt: '2026-08-01', status: MemberPaymentStatus.PAID,
    type: MemberPaymentType.ACTIVITY, method: 'Transferencia', receiptNumber: 'B001-00001206', receiptId: 'rec-6',
  },
  {
    id: 3, code: 'PAG-SOC-003', concept: 'Cuota societaria familiar',
    participantPersonId: 1, participantName: 'Juan Tanaka', period: 'Agosto 2026',
    amount: 120, dueDate: '2026-08-20', status: MemberPaymentStatus.OVERDUE,
    type: MemberPaymentType.MEMBERSHIP_FEE,
  },
  {
    id: 4, code: 'PAG-SOC-004', concept: 'Matrícula Gimnasio Funcional',
    participantPersonId: 2, participantName: 'María Tanaka', activityName: 'Gimnasio Funcional',
    period: 'Septiembre 2026', amount: 80, dueDate: '2026-09-05', status: MemberPaymentStatus.PENDING,
    type: MemberPaymentType.ACTIVITY,
  },
  {
    id: 5, code: 'PAG-SOC-005', concept: 'Derecho de registro',
    participantPersonId: 3, participantName: 'Lucía Tanaka', activityName: 'Natación Intermedio',
    period: 'Septiembre 2026', amount: 50, paidAt: '2026-06-01', status: MemberPaymentStatus.PAID,
    type: MemberPaymentType.OTHER, method: 'Visa', receiptNumber: 'B001-00001207', receiptId: 'rec-7',
  },
  {
    id: 6, code: 'PAG-SOC-006', concept: 'Matrícula Natación Básico',
    participantPersonId: 3, participantName: 'Lucía Tanaka', activityName: 'Natación Básico',
    period: 'Junio 2026', amount: 180, paidAt: '2026-06-01', status: MemberPaymentStatus.PAID,
    type: MemberPaymentType.ACTIVITY, method: 'Visa', receiptNumber: 'B001-00001201', receiptId: 'rec-1',
  },
  {
    id: 7, code: 'PAG-SOC-007', concept: 'Cuota societaria familiar',
    participantPersonId: 1, participantName: 'Juan Tanaka', period: 'Julio 2026',
    amount: 120, paidAt: '2026-07-05', status: MemberPaymentStatus.PAID,
    type: MemberPaymentType.MEMBERSHIP_FEE, method: 'Transferencia', receiptNumber: 'B001-00001202', receiptId: 'rec-2',
  },
  {
    id: 8, code: 'PAG-SOC-008', concept: 'Matrícula Karate Infantil',
    participantPersonId: 4, participantName: 'Diego Tanaka', activityName: 'Karate Infantil',
    period: 'Mayo 2026', amount: 160, paidAt: '2026-05-10', status: MemberPaymentStatus.PAID,
    type: MemberPaymentType.ACTIVITY, method: 'Visa', receiptNumber: 'B001-00001203', receiptId: 'rec-3',
  },
  {
    id: 9, code: 'PAG-SOC-009', concept: 'Matrícula Gimnasio Funcional',
    participantPersonId: 2, participantName: 'María Tanaka', activityName: 'Gimnasio Funcional',
    period: 'Agosto 2026', amount: 120, paidAt: '2026-08-10', status: MemberPaymentStatus.PAID,
    type: MemberPaymentType.ACTIVITY, method: 'Visa', receiptNumber: 'B001-00001204', receiptId: 'rec-4',
  },
  {
    id: 10, code: 'PAG-SOC-010', concept: 'Cuota societaria familiar',
    participantPersonId: 1, participantName: 'Juan Tanaka', period: 'Junio 2026',
    amount: 120, paidAt: '2026-06-15', status: MemberPaymentStatus.PAID,
    type: MemberPaymentType.MEMBERSHIP_FEE, method: 'Efectivo', receiptNumber: 'B001-00001205', receiptId: 'rec-5',
  },
];

export function buildMemberReceipts(): MemberReceipt[] {
  return MOCK_MEMBER_PAYMENTS
    .filter(p => p.status === MemberPaymentStatus.PAID && p.receiptNumber)
    .map(p => ({
      id: p.receiptId ?? `rec-${p.id}`,
      number: p.receiptNumber!,
      date: p.paidAt!,
      concept: p.concept,
      participantName: p.participantName,
      amount: p.amount,
      paymentId: p.id,
    }));
}
