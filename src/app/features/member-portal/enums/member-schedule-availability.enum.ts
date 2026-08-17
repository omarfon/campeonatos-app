export enum MemberScheduleAvailability {
  AVAILABLE = 'available',
  LAST_SPOTS = 'last_spots',
  FULL = 'full',
}

export const MEMBER_SCHEDULE_AVAILABILITY_LABELS: Record<MemberScheduleAvailability, string> = {
  [MemberScheduleAvailability.AVAILABLE]: 'Disponible',
  [MemberScheduleAvailability.LAST_SPOTS]: 'Últimos cupos',
  [MemberScheduleAvailability.FULL]: 'Completo',
};
