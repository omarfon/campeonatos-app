import { EventCategory } from '../enums/event-category.enum';
import { OfferingKind } from '../enums/offering-kind.enum';
import { OfferingGroupKey, SelectionMode } from '../enums/offering-group.enum';
import { ConsumptionType } from '../enums/consumption-type.enum';
import { EventOfferingCatalog, EventOfferingGroup, EventOfferingOption } from '../models/event-offering.model';

function gid(): string { return crypto.randomUUID(); }

function oid(
  code: string,
  groupId: string,
  partial: Omit<EventOfferingOption, 'id' | 'code' | 'groupId' | 'currency' | 'status'>,
): EventOfferingOption {
  return { id: gid(), code, groupId, currency: 'PEN', status: 'active', ...partial };
}

function grp(
  key: OfferingGroupKey,
  name: string,
  selectionMode: SelectionMode,
  sortOrder: number,
  required = false,
  max = 99,
): EventOfferingGroup {
  return { id: gid(), key, name, description: '', selectionMode, minSelections: required ? 1 : 0, maxSelections: max, required, sortOrder };
}

function templateConcert(): EventOfferingCatalog {
  const gEntry = grp(OfferingGroupKey.ENTRY, 'Entrada al evento', SelectionMode.SINGLE, 1, true, 1);
  const gMob = grp(OfferingGroupKey.MOBILITY, 'Movilidad', SelectionMode.MULTIPLE, 2);
  const gMeals = grp(OfferingGroupKey.MEALS, 'Comidas', SelectionMode.SINGLE, 3);
  const gAct = grp(OfferingGroupKey.ACTIVITIES, 'Actividades adicionales', SelectionMode.QUANTITY, 4);
  return {
    groups: [gEntry, gMob, gMeals, gAct],
    options: [
      oid('ENTRY-GEN', gEntry.id, { name: 'Entrada general', description: 'Acceso al concierto', kind: OfferingKind.ENTRY_TICKET, consumptionType: ConsumptionType.OTHER, price: 0, stock: 500, minQuantity: 1, maxQuantity: 1, required: true, generatesTicket: true, generatesConsumption: false }),
      oid('MOB-IDA', gMob.id, { name: 'Ticket movilidad — Ida', description: 'Transporte ida sede norte', kind: OfferingKind.ADDON_TICKET, consumptionType: ConsumptionType.MOBILITY, price: 15, stock: 80, minQuantity: 0, maxQuantity: 4, required: false, generatesTicket: true, generatesConsumption: true }),
      oid('MOB-RET', gMob.id, { name: 'Ticket movilidad — Retorno', description: 'Transporte retorno', kind: OfferingKind.ADDON_TICKET, consumptionType: ConsumptionType.MOBILITY, price: 15, stock: 80, minQuantity: 0, maxQuantity: 4, required: false, generatesTicket: true, generatesConsumption: true }),
      oid('MOB-IR', gMob.id, { name: 'Ticket movilidad — Ida y retorno', description: 'Transporte completo', kind: OfferingKind.ADDON_TICKET, consumptionType: ConsumptionType.MOBILITY, price: 25, stock: 60, minQuantity: 0, maxQuantity: 4, required: false, generatesTicket: true, generatesConsumption: true }),
      oid('MEAL-1', gMeals.id, { name: '1 comida — Menú estándar', description: 'Una comida durante el evento', kind: OfferingKind.CONSUMPTION, consumptionType: ConsumptionType.MENU, price: 25, stock: 200, minQuantity: 0, maxQuantity: 1, required: false, generatesTicket: false, generatesConsumption: true }),
      oid('MEAL-2', gMeals.id, { name: '2 comidas — Pack doble', description: 'Almuerzo y cena', kind: OfferingKind.CONSUMPTION, consumptionType: ConsumptionType.MENU, price: 45, stock: 150, minQuantity: 0, maxQuantity: 1, required: false, generatesTicket: false, generatesConsumption: true }),
      oid('MEAL-3', gMeals.id, { name: '3 comidas — Pack completo', description: 'Desayuno, almuerzo y cena', kind: OfferingKind.CONSUMPTION, consumptionType: ConsumptionType.MENU, price: 60, stock: 100, minQuantity: 0, maxQuantity: 1, required: false, generatesTicket: false, generatesConsumption: true }),
      oid('ACT-INFL', gAct.id, { name: 'Juego inflable', description: 'Acceso a zona de inflables', kind: OfferingKind.ACTIVITY, consumptionType: ConsumptionType.ACTIVITY, price: 12, stock: 300, minQuantity: 0, maxQuantity: 5, required: false, generatesTicket: true, generatesConsumption: true }),
    ],
  };
}

function templateTrip(): EventOfferingCatalog {
  const gEntry = grp(OfferingGroupKey.ENTRY, 'Entrada al paseo', SelectionMode.SINGLE, 1, true, 1);
  const gMob = grp(OfferingGroupKey.MOBILITY, 'Movilidad obligatoria', SelectionMode.SINGLE, 2, true, 1);
  const gMeals = grp(OfferingGroupKey.MEALS, 'Paquete de comidas', SelectionMode.SINGLE, 3, true, 1);
  return {
    groups: [gEntry, gMob, gMeals],
    options: [
      oid('ENTRY-TRIP', gEntry.id, { name: 'Entrada personal', description: 'Intransferible — vinculada al participante', kind: OfferingKind.ENTRY_TICKET, consumptionType: ConsumptionType.OTHER, price: 0, stock: 55, minQuantity: 1, maxQuantity: 1, required: true, generatesTicket: true, generatesConsumption: false }),
      oid('MOB-BUS', gMob.id, { name: 'Ticket bus turístico', description: 'Asiento en bus del club', kind: OfferingKind.ADDON_TICKET, consumptionType: ConsumptionType.MOBILITY, price: 40, stock: 55, minQuantity: 1, maxQuantity: 1, required: true, generatesTicket: true, generatesConsumption: true }),
      oid('MEAL-1T', gMeals.id, { name: '1 comida', description: 'Almuerzo en ruta', kind: OfferingKind.CONSUMPTION, consumptionType: ConsumptionType.MENU, price: 20, stock: 55, minQuantity: 0, maxQuantity: 1, required: false, generatesTicket: false, generatesConsumption: true }),
      oid('MEAL-2T', gMeals.id, { name: '2 comidas', description: 'Almuerzo y snack', kind: OfferingKind.CONSUMPTION, consumptionType: ConsumptionType.MENU, price: 35, stock: 55, minQuantity: 0, maxQuantity: 1, required: false, generatesTicket: false, generatesConsumption: true }),
      oid('MEAL-3T', gMeals.id, { name: '3 comidas', description: 'Desayuno, almuerzo y cena', kind: OfferingKind.CONSUMPTION, consumptionType: ConsumptionType.MENU, price: 50, stock: 55, minQuantity: 0, maxQuantity: 1, required: false, generatesTicket: false, generatesConsumption: true }),
    ],
  };
}

function templateBingo(): EventOfferingCatalog {
  const gBingo = grp(OfferingGroupKey.BINGO, 'Cartillas de bingo', SelectionMode.QUANTITY, 1, true, 20);
  const gMeals = grp(OfferingGroupKey.MEALS, 'Comidas opcionales', SelectionMode.MULTIPLE, 2);
  const gExtras = grp(OfferingGroupKey.EXTRAS, 'Extras', SelectionMode.QUANTITY, 3);
  return {
    groups: [gBingo, gMeals, gExtras],
    options: [
      oid('BINGO-CARD', gBingo.id, { name: 'Cartilla bingo', description: 'Genera ticket numerado de cartilla', kind: OfferingKind.ADDON_TICKET, consumptionType: ConsumptionType.OTHER, price: 15, stock: 2000, minQuantity: 1, maxQuantity: 20, required: true, generatesTicket: true, generatesConsumption: false }),
      oid('MEAL-BINGO', gMeals.id, { name: 'Cena bingo', description: 'Cena durante el evento', kind: OfferingKind.CONSUMPTION, consumptionType: ConsumptionType.MENU, price: 30, stock: 400, minQuantity: 0, maxQuantity: 1, required: false, generatesTicket: false, generatesConsumption: true }),
      oid('DRINK-BINGO', gMeals.id, { name: 'Bebida', description: 'Bebida durante el bingo', kind: OfferingKind.CONSUMPTION, consumptionType: ConsumptionType.DRINK, price: 8, stock: 500, minQuantity: 0, maxQuantity: 3, required: false, generatesTicket: false, generatesConsumption: true }),
    ],
  };
}

function templateMassive(): EventOfferingCatalog {
  const gEntry = grp(OfferingGroupKey.ENTRY, 'Ingreso general', SelectionMode.SINGLE, 1, true, 1);
  const gMeals = grp(OfferingGroupKey.MEALS, 'Comidas', SelectionMode.SINGLE, 2);
  const gAct = grp(OfferingGroupKey.ACTIVITIES, 'Zona de juegos', SelectionMode.QUANTITY, 3);
  const gMob = grp(OfferingGroupKey.MOBILITY, 'Movilidad', SelectionMode.MULTIPLE, 4);
  return {
    groups: [gEntry, gMeals, gAct, gMob],
    options: [
      oid('ENTRY-FAM', gEntry.id, { name: 'Ingreso día familiar', description: 'Acceso a todas las zonas', kind: OfferingKind.ENTRY_TICKET, consumptionType: ConsumptionType.OTHER, price: 0, stock: 400, minQuantity: 1, maxQuantity: 1, required: true, generatesTicket: true, generatesConsumption: false }),
      oid('MEAL-1M', gMeals.id, { name: '1 comida', description: 'Almuerzo buffet', kind: OfferingKind.CONSUMPTION, consumptionType: ConsumptionType.MENU, price: 20, stock: 400, minQuantity: 0, maxQuantity: 1, required: false, generatesTicket: false, generatesConsumption: true }),
      oid('MEAL-2M', gMeals.id, { name: '2 comidas', description: 'Almuerzo y merienda', kind: OfferingKind.CONSUMPTION, consumptionType: ConsumptionType.MENU, price: 35, stock: 300, minQuantity: 0, maxQuantity: 1, required: false, generatesTicket: false, generatesConsumption: true }),
      oid('MEAL-3M', gMeals.id, { name: '3 comidas', description: 'Desayuno, almuerzo y merienda', kind: OfferingKind.CONSUMPTION, consumptionType: ConsumptionType.MENU, price: 48, stock: 200, minQuantity: 0, maxQuantity: 1, required: false, generatesTicket: false, generatesConsumption: true }),
      oid('INFL-1', gAct.id, { name: 'Castillo inflable', description: '15 min en castillo', kind: OfferingKind.ACTIVITY, consumptionType: ConsumptionType.ACTIVITY, price: 10, stock: 200, minQuantity: 0, maxQuantity: 3, required: false, generatesTicket: true, generatesConsumption: true }),
      oid('INFL-2', gAct.id, { name: 'Piscina de pelotas', description: 'Acceso piscina de pelotas', kind: OfferingKind.ACTIVITY, consumptionType: ConsumptionType.ACTIVITY, price: 8, stock: 250, minQuantity: 0, maxQuantity: 3, required: false, generatesTicket: true, generatesConsumption: true }),
      oid('MOB-MAS', gMob.id, { name: 'Ticket movilidad', description: 'Transporte desde sede', kind: OfferingKind.ADDON_TICKET, consumptionType: ConsumptionType.MOBILITY, price: 12, stock: 100, minQuantity: 0, maxQuantity: 5, required: false, generatesTicket: true, generatesConsumption: true }),
    ],
  };
}

function templateFood(): EventOfferingCatalog {
  const gEntry = grp(OfferingGroupKey.ENTRY, 'Entrada', SelectionMode.SINGLE, 0, true, 1);
  const gMeals = grp(OfferingGroupKey.MEALS, 'Menús', SelectionMode.SINGLE, 1, true, 1);
  const gMob = grp(OfferingGroupKey.MOBILITY, 'Movilidad', SelectionMode.MULTIPLE, 2);
  return {
    groups: [gEntry, gMeals, gMob],
    options: [
      oid('ENTRY-FOOD', gEntry.id, { name: 'Entrada cena', description: 'Reserva de mesa', kind: OfferingKind.ENTRY_TICKET, consumptionType: ConsumptionType.OTHER, price: 0, stock: 180, minQuantity: 1, maxQuantity: 1, required: true, generatesTicket: true, generatesConsumption: false }),
      oid('MENU-C', gMeals.id, { name: 'Menú criollo', description: '', kind: OfferingKind.CONSUMPTION, consumptionType: ConsumptionType.MENU, price: 0, stock: 100, minQuantity: 1, maxQuantity: 1, required: true, generatesTicket: false, generatesConsumption: true }),
      oid('MENU-V', gMeals.id, { name: 'Menú vegetariano', description: '', kind: OfferingKind.CONSUMPTION, consumptionType: ConsumptionType.MENU, price: 0, stock: 30, minQuantity: 0, maxQuantity: 1, required: false, generatesTicket: false, generatesConsumption: true }),
      oid('MENU-I', gMeals.id, { name: 'Menú infantil', description: '', kind: OfferingKind.CONSUMPTION, consumptionType: ConsumptionType.MENU, price: 0, stock: 40, minQuantity: 0, maxQuantity: 1, required: false, generatesTicket: false, generatesConsumption: true }),
      oid('MOB-F', gMob.id, { name: 'Ida y retorno', description: 'Transporte', kind: OfferingKind.ADDON_TICKET, consumptionType: ConsumptionType.MOBILITY, price: 20, stock: 50, minQuantity: 0, maxQuantity: 1, required: false, generatesTicket: true, generatesConsumption: true }),
    ],
  };
}

export function getOfferingTemplateForCategory(category: EventCategory): EventOfferingCatalog {
  switch (category) {
    case EventCategory.TRIP: return structuredClone(templateTrip());
    case EventCategory.FUNDRAISING: return structuredClone(templateBingo());
    case EventCategory.MASSIVE: return structuredClone(templateMassive());
    case EventCategory.FOOD: return structuredClone(templateFood());
    case EventCategory.GENERAL:
    case EventCategory.CONTEST:
    case EventCategory.WORKSHOP:
    default: return structuredClone(templateConcert());
  }
}

export function cloneCatalog(catalog: EventOfferingCatalog): EventOfferingCatalog {
  return structuredClone(catalog);
}
