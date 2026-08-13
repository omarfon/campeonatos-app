export enum ConsumptionType {
  MENU = 'MENU',
  RATION = 'RATION',
  DRINK = 'DRINK',
  MOBILITY = 'MOBILITY',
  SEAT = 'SEAT',
  ACTIVITY = 'ACTIVITY',
  OTHER = 'OTHER',
}

export const CONSUMPTION_TYPE_LABELS: Record<ConsumptionType, string> = {
  [ConsumptionType.MENU]: 'Menú',
  [ConsumptionType.RATION]: 'Ración',
  [ConsumptionType.DRINK]: 'Bebida',
  [ConsumptionType.MOBILITY]: 'Movilidad',
  [ConsumptionType.SEAT]: 'Asiento',
  [ConsumptionType.ACTIVITY]: 'Juego / inflable',
  [ConsumptionType.OTHER]: 'Otro',
};
