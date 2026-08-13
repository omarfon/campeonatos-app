export enum OfferingGroupKey {
  ENTRY = 'ENTRY',
  MOBILITY = 'MOBILITY',
  MEALS = 'MEALS',
  ACTIVITIES = 'ACTIVITIES',
  BINGO = 'BINGO',
  SEATING = 'SEATING',
  EXTRAS = 'EXTRAS',
}

export const OFFERING_GROUP_LABELS: Record<OfferingGroupKey, string> = {
  [OfferingGroupKey.ENTRY]: 'Entradas',
  [OfferingGroupKey.MOBILITY]: 'Movilidad',
  [OfferingGroupKey.MEALS]: 'Comidas / menús',
  [OfferingGroupKey.ACTIVITIES]: 'Actividades y juegos',
  [OfferingGroupKey.BINGO]: 'Bingo / cartillas',
  [OfferingGroupKey.SEATING]: 'Asientos / zonas',
  [OfferingGroupKey.EXTRAS]: 'Extras',
};

export enum SelectionMode {
  SINGLE = 'SINGLE',
  MULTIPLE = 'MULTIPLE',
  QUANTITY = 'QUANTITY',
}

export const SELECTION_MODE_LABELS: Record<SelectionMode, string> = {
  [SelectionMode.SINGLE]: 'Elegir una opción',
  [SelectionMode.MULTIPLE]: 'Elegir varias (checkbox)',
  [SelectionMode.QUANTITY]: 'Cantidad por opción',
};
