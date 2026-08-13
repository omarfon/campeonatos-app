import { ConsumptionType } from '../enums/consumption-type.enum';
import { OfferingKind } from '../enums/offering-kind.enum';
import { OfferingGroupKey, SelectionMode } from '../enums/offering-group.enum';
import { EventCategory } from '../enums/event-category.enum';
import { EventTicketGroupAssignment } from './event-ticket-control.model';

/** Grupo lógico de opciones: comidas, movilidad, juegos, etc. */
export interface EventOfferingGroup {
  id: string;
  key: OfferingGroupKey;
  name: string;
  description: string;
  selectionMode: SelectionMode;
  minSelections: number;
  maxSelections: number;
  required: boolean;
  sortOrder: number;
}

/**
 * Opción configurable: puede generar ticket, consumo entregable, o ambos.
 * Ej: ticket movilidad, menú 1/2/3, juego inflable, cartilla bingo.
 */
export interface EventOfferingOption {
  id: string;
  code: string;
  name: string;
  description: string;
  groupId: string;
  kind: OfferingKind;
  consumptionType: ConsumptionType;
  price: number;
  currency: string;
  stock: number;
  minQuantity: number;
  maxQuantity: number;
  required: boolean;
  /** Genera sub-ticket escaneable (movilidad, cartilla bingo, pase actividad) */
  generatesTicket: boolean;
  /** Aparece en control de consumos / entregas */
  generatesConsumption: boolean;
  status: 'active' | 'inactive';
}

export interface EventOfferingCatalog {
  groups: EventOfferingGroup[];
  options: EventOfferingOption[];
}

export interface EventOfferingSelection {
  optionId: string;
  optionCode: string;
  optionName: string;
  groupId: string;
  quantity: number;
  unitPrice: number;
  generatesTicket: boolean;
  generatesConsumption: boolean;
}

export interface OfferingValidationResult {
  valid: boolean;
  errors: string[];
}

export interface EventOfferingTemplateMeta {
  category: EventCategory;
  label: string;
  description: string;
}

/** Pool de tickets a generar/imprimir por tipo de opción del catálogo */
export interface EventTicketPool {
  id: string;
  optionId: string;
  optionName: string;
  optionCode: string;
  /** Etiqueta administrativa: "Invitaciones paseo", "Boletos bingo", etc. */
  label: string;
  quantityToGenerate: number;
  generatedCount: number;
  prefix: string;
  enabled: boolean;
}

export interface EventTicketGenerationConfig {
  pools: EventTicketPool[];
  groupAssignments?: EventTicketGroupAssignment[];
  ticketsGenerated?: boolean;
  generatedAt?: string;
  lastGeneratedAt?: string;
}
