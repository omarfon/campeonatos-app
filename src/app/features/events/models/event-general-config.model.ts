import { EventCategory } from '../enums/event-category.enum';
import { EventRateRules } from './event.model';

/**
 * Campos y reglas comunes a TODOS los tipos de evento.
 * La configuración por categoría (EventCategoryConfig) se agrega aparte.
 */
export interface EventGeneralConfig {
  code: string;
  companyId: string;
  companyName: string;
  businessUnitId: string;
  businessUnitName: string;
  name: string;
  description: string;
  typeId: string;
  typeName: string;
  category: EventCategory;
  imageUrl?: string;
  isPublic: boolean;
  membersOnly: boolean;
  allowGuests: boolean;
  requiresRegistration: boolean;
  isFree: boolean;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  registrationStartDate: string;
  registrationEndDate: string;
  totalCapacity: number;
  reservedCapacity: number;
  rateRules: EventRateRules;
}

/** Pasos del wizard que forman la configuración general */
export const GENERAL_WIZARD_STEPS = [
  { id: 1, label: 'Información general', scope: 'general' as const },
  { id: 2, label: 'Fecha y horarios', scope: 'general' as const },
  { id: 3, label: 'Ambientes', scope: 'general' as const },
  { id: 4, label: 'Aforo', scope: 'general' as const },
  { id: 5, label: 'Tarifas y reglas', scope: 'general' as const },
] as const;

export const CATEGORY_WIZARD_STEP = { id: 6, label: 'Config. por categoría', scope: 'category' as const };
export const FINAL_WIZARD_STEPS = [
  { id: 7, label: 'Revisión', scope: 'final' as const },
  { id: 8, label: 'Publicación', scope: 'final' as const },
] as const;

export const MOCK_AUTH_CONTEXT = {
  companyId: 'comp-1',
  companyName: 'AELU',
  businessUnitId: 'bu-1',
  businessUnitName: 'Club Social',
};
