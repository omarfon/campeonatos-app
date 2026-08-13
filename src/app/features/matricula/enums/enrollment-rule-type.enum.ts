export enum EnrollmentRuleType {
  STUDENT_STATUS = 'STUDENT_STATUS',
  ACADEMIC_REQUIREMENT = 'ACADEMIC_REQUIREMENT',
  AGREEMENT = 'AGREEMENT',
  CLASS_AVAILABILITY = 'CLASS_AVAILABILITY',
  CUSTOM = 'CUSTOM',
}

export const ENROLLMENT_RULE_TYPE_LABELS: Record<EnrollmentRuleType, string> = {
  [EnrollmentRuleType.STUDENT_STATUS]: 'Estado del estudiante',
  [EnrollmentRuleType.ACADEMIC_REQUIREMENT]: 'Requisito académico',
  [EnrollmentRuleType.AGREEMENT]: 'Convenio',
  [EnrollmentRuleType.CLASS_AVAILABILITY]: 'Disponibilidad de clase',
  [EnrollmentRuleType.CUSTOM]: 'Personalizada',
};
