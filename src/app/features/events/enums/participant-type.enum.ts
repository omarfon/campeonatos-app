export enum ParticipantType {
  MEMBER_HOLDER = 'MEMBER_HOLDER',
  MEMBER_GUEST = 'MEMBER_GUEST',
  NON_MEMBER = 'NON_MEMBER',
  PUBLIC = 'PUBLIC',
}

export const PARTICIPANT_TYPE_LABELS: Record<ParticipantType, string> = {
  [ParticipantType.MEMBER_HOLDER]: 'Socio titular',
  [ParticipantType.MEMBER_GUEST]: 'Invitado de socio',
  [ParticipantType.NON_MEMBER]: 'No socio',
  [ParticipantType.PUBLIC]: 'Público general',
};
