export enum MemberPaymentType {
  MEMBERSHIP_FEE = 'MEMBERSHIP_FEE',
  ACTIVITY = 'ACTIVITY',
  OTHER = 'OTHER',
}

export const MEMBER_PAYMENT_TYPE_LABELS: Record<MemberPaymentType, string> = {
  [MemberPaymentType.MEMBERSHIP_FEE]: 'Cuota societaria',
  [MemberPaymentType.ACTIVITY]: 'Actividad',
  [MemberPaymentType.OTHER]: 'Otro',
};
