export enum MemberNotificationType {
  ACCOUNT = 'ACCOUNT',
  FAMILY = 'FAMILY',
  ACTIVITY = 'ACTIVITY',
  EVENT = 'EVENT',
  PAYMENT = 'PAYMENT',
  BENEFIT = 'BENEFIT',
  GENERAL = 'GENERAL',
}

export const MEMBER_NOTIFICATION_TYPE_LABELS: Record<MemberNotificationType, string> = {
  [MemberNotificationType.ACCOUNT]: 'Cuenta',
  [MemberNotificationType.FAMILY]: 'Familia',
  [MemberNotificationType.ACTIVITY]: 'Actividad',
  [MemberNotificationType.EVENT]: 'Evento',
  [MemberNotificationType.PAYMENT]: 'Pago',
  [MemberNotificationType.BENEFIT]: 'Beneficio',
  [MemberNotificationType.GENERAL]: 'General',
};
