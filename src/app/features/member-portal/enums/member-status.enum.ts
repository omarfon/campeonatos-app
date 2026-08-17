export enum MemberAccountStatus {
  ENABLED = 'ENABLED',
  RESTRICTED = 'RESTRICTED',
  SUSPENDED = 'SUSPENDED',
}

export const MEMBER_ACCOUNT_STATUS_LABELS: Record<MemberAccountStatus, string> = {
  [MemberAccountStatus.ENABLED]: 'Habilitado',
  [MemberAccountStatus.RESTRICTED]: 'Restringido',
  [MemberAccountStatus.SUSPENDED]: 'Suspendido',
};
