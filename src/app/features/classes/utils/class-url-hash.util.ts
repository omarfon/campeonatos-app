export const CLASS_DETAIL_TAB_HASHES = [
  'resumen',
  'alumnos',
  'calendario',
  'asistencia',
  'configuracion',
  'historial',
] as const;

export type ClassDetailTabHash = (typeof CLASS_DETAIL_TAB_HASHES)[number];

export const CLASS_WIZARD_STEP_HASHES = [
  'informacion',
  'programacion',
  'profesor',
  'capacidad',
  'configuracion',
  'sesiones',
  'resumen',
] as const;

export type ClassWizardStepHash = (typeof CLASS_WIZARD_STEP_HASHES)[number];

export function isClassDetailTabHash(value: string | null | undefined): value is ClassDetailTabHash {
  return !!value && (CLASS_DETAIL_TAB_HASHES as readonly string[]).includes(value);
}

export function isClassWizardStepHash(value: string | null | undefined): value is ClassWizardStepHash {
  return !!value && (CLASS_WIZARD_STEP_HASHES as readonly string[]).includes(value);
}

/** Mapeo paso interno del wizard ↔ hash en URL */
export const WIZARD_STEP_TO_HASH = {
  general: 'informacion',
  schedule: 'programacion',
  teacher: 'profesor',
  capacity: 'capacidad',
  configuration: 'configuracion',
  sessions: 'sesiones',
  summary: 'resumen',
} as const;

export const WIZARD_HASH_TO_STEP = {
  informacion: 'general',
  programacion: 'schedule',
  profesor: 'teacher',
  capacidad: 'capacity',
  configuracion: 'configuration',
  sesiones: 'sessions',
  resumen: 'summary',
} as const;

export type WizardStepId = keyof typeof WIZARD_STEP_TO_HASH;

export function wizardStepToHash(step: WizardStepId): ClassWizardStepHash {
  return WIZARD_STEP_TO_HASH[step];
}

export function hashToWizardStep(hash: ClassWizardStepHash): WizardStepId {
  return WIZARD_HASH_TO_STEP[hash];
}
