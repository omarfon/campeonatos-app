export enum OfferingKind {
  ENTRY_TICKET = 'ENTRY_TICKET',
  ADDON_TICKET = 'ADDON_TICKET',
  CONSUMPTION = 'CONSUMPTION',
  ACTIVITY = 'ACTIVITY',
}

export const OFFERING_KIND_LABELS: Record<OfferingKind, string> = {
  [OfferingKind.ENTRY_TICKET]: 'Entrada principal',
  [OfferingKind.ADDON_TICKET]: 'Ticket adicional',
  [OfferingKind.CONSUMPTION]: 'Consumo / servicio',
  [OfferingKind.ACTIVITY]: 'Actividad / juego',
};
