export enum ClassModality {
  ONSITE = 'ONSITE',
  ONLINE = 'ONLINE',
  HYBRID = 'HYBRID',
}

export const CLASS_MODALITY_LABELS: Record<ClassModality, string> = {
  [ClassModality.ONSITE]: 'Presencial',
  [ClassModality.ONLINE]: 'Virtual',
  [ClassModality.HYBRID]: 'Híbrida',
};
