export enum RegistrationStatus {
  PENDING = 'PENDING',
  RESERVED = 'RESERVED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  [RegistrationStatus.PENDING]: 'Pendiente',
  [RegistrationStatus.RESERVED]: 'Reservada',
  [RegistrationStatus.CONFIRMED]: 'Confirmada',
  [RegistrationStatus.CANCELLED]: 'Cancelada',
};
