export enum StudentComunicadoCategory {
  INSTITUCIONAL = 'INSTITUCIONAL',
  ACADEMICO = 'ACADEMICO',
  EVENTOS = 'EVENTOS',
  OPERACIONES = 'OPERACIONES',
}

export const STUDENT_COMUNICADO_CATEGORY_LABELS: Record<StudentComunicadoCategory, string> = {
  [StudentComunicadoCategory.INSTITUCIONAL]: 'Institucional',
  [StudentComunicadoCategory.ACADEMICO]: 'Académico',
  [StudentComunicadoCategory.EVENTOS]: 'Eventos',
  [StudentComunicadoCategory.OPERACIONES]: 'Operaciones',
};
