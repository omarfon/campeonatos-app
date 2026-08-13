import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { EventCategory } from '../enums/event-category.enum';
import { OfferingKind } from '../enums/offering-kind.enum';
import {
  EventOfferingCatalog,
  EventOfferingOption,
  EventOfferingSelection,
  EventTicketPool,
  OfferingValidationResult,
} from '../models/event-offering.model';
import { SelectionMode } from '../enums/offering-group.enum';
import { ConsumptionType } from '../enums/consumption-type.enum';
import { FoodConsumptionOption } from '../models/event.model';
import { getOfferingTemplateForCategory } from '../mocks/event-offering.templates';

@Injectable({ providedIn: 'root' })
export class EventOfferingService {

  getTemplate(category: EventCategory): Observable<EventOfferingCatalog> {
    return of(getOfferingTemplateForCategory(category)).pipe(delay(50));
  }

  getOptionsForGroup(catalog: EventOfferingCatalog, groupId: string): EventOfferingOption[] {
    return catalog.options.filter(o => o.groupId === groupId && o.status === 'active');
  }

  calculateSelectionsTotal(selections: EventOfferingSelection[]): number {
    return selections.reduce((sum, s) => sum + s.unitPrice * s.quantity, 0);
  }

  validateSelections(catalog: EventOfferingCatalog, selections: EventOfferingSelection[]): OfferingValidationResult {
    const errors: string[] = [];

    for (const group of catalog.groups) {
      const groupSelections = selections.filter(s => s.groupId === group.id);
      const totalQty = groupSelections.reduce((n, s) => n + s.quantity, 0);

      if (group.required && totalQty < group.minSelections) {
        errors.push(`El grupo "${group.name}" requiere al menos ${group.minSelections} selección(es).`);
      }
      if (group.selectionMode === SelectionMode.SINGLE && totalQty > 1) {
        errors.push(`En "${group.name}" solo puede elegir una opción.`);
      }
      if (totalQty > group.maxSelections) {
        errors.push(`En "${group.name}" el máximo permitido es ${group.maxSelections}.`);
      }

      for (const sel of groupSelections) {
        const opt = catalog.options.find(o => o.id === sel.optionId);
        if (!opt) continue;
        if (sel.quantity < opt.minQuantity || sel.quantity > opt.maxQuantity) {
          errors.push(`"${opt.name}": cantidad debe estar entre ${opt.minQuantity} y ${opt.maxQuantity}.`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  getTicketGeneratingSelections(catalog: EventOfferingCatalog, selections: EventOfferingSelection[]): EventOfferingSelection[] {
    return selections.filter(s => {
      const opt = catalog.options.find(o => o.id === s.optionId);
      return opt?.generatesTicket ?? false;
    });
  }

  getConsumptionGeneratingSelections(catalog: EventOfferingCatalog, selections: EventOfferingSelection[]): EventOfferingSelection[] {
    return selections.filter(s => {
      const opt = catalog.options.find(o => o.id === s.optionId);
      return opt?.generatesConsumption ?? false;
    });
  }

  buildSelectionFromOption(opt: EventOfferingOption, quantity: number): EventOfferingSelection {
    return {
      optionId: opt.id,
      optionCode: opt.code,
      optionName: opt.name,
      groupId: opt.groupId,
      quantity,
      unitPrice: opt.price,
      generatesTicket: opt.generatesTicket,
      generatesConsumption: opt.generatesConsumption,
    };
  }

  migrateFoodOptionsToCatalog(foodOptions: FoodConsumptionOption[], category: EventCategory): EventOfferingCatalog {
    if (!foodOptions.length) return getOfferingTemplateForCategory(category);
    const base = getOfferingTemplateForCategory(EventCategory.FOOD);
    const mealGroup = base.groups.find(g => g.key === 'MEALS');
    const mobGroup = base.groups.find(g => g.key === 'MOBILITY');
    if (!mealGroup || !mobGroup) return base;

    const mealOpts: EventOfferingOption[] = [];
    const mobOpts: EventOfferingOption[] = [];

    foodOptions.forEach((fo, i) => {
      const isMob = fo.type === ConsumptionType.MOBILITY;
      const groupId = isMob ? mobGroup.id : mealGroup.id;
      const opt: EventOfferingOption = {
        id: fo.id,
        code: isMob ? `MOB-${i + 1}` : `MEAL-${i + 1}`,
        name: fo.name,
        description: fo.description,
        groupId,
        kind: isMob ? OfferingKind.ADDON_TICKET : OfferingKind.CONSUMPTION,
        consumptionType: fo.type,
        price: fo.additionalPrice,
        currency: 'PEN',
        stock: fo.stock,
        minQuantity: fo.required ? 1 : 0,
        maxQuantity: 1,
        required: fo.required,
        generatesTicket: isMob,
        generatesConsumption: true,
        status: 'active',
      };
      if (isMob) mobOpts.push(opt);
      else mealOpts.push(opt);
    });

    base.options = [
      ...base.options.filter(o => o.groupId !== mealGroup.id && o.groupId !== mobGroup.id),
      ...mealOpts,
      ...mobOpts,
    ];
    return base;
  }

  syncTicketPools(
    catalog: EventOfferingCatalog,
    existing: EventTicketPool[],
    category: EventCategory,
    totalCapacity: number,
  ): EventTicketPool[] {
    return syncTicketPoolsFromCatalog(catalog, existing, category, totalCapacity);
  }
}

/** Cantidad sugerida según categoría del evento (solo entrada principal) */
export function suggestTicketQuantity(category: EventCategory, optionStock: number, totalCapacity: number, isEntry: boolean): number {
  if (isEntry) {
    const categoryDefault = categoryDefaultQuantity(category);
    if (categoryDefault !== null) return categoryDefault;
    if (totalCapacity > 0) return totalCapacity;
  }
  return optionStock;
}

function categoryDefaultQuantity(category: EventCategory): number | null {
  switch (category) {
    case EventCategory.TRIP: return 600;
    case EventCategory.FUNDRAISING: return 500;
    case EventCategory.GENERAL: return 1000;
    case EventCategory.MASSIVE: return 400;
    default: return null;
  }
}

export function syncTicketPoolsFromCatalog(
  catalog: EventOfferingCatalog,
  existing: EventTicketPool[],
  category: EventCategory,
  totalCapacity: number,
): EventTicketPool[] {
  const ticketOptions = catalog.options.filter(o => o.generatesTicket && o.status === 'active');
  return ticketOptions.map(opt => {
    const prev = existing.find(p => p.optionId === opt.id);
    const isEntry = opt.kind === OfferingKind.ENTRY_TICKET;
    const defaultQty = prev?.quantityToGenerate
      ?? suggestTicketQuantity(category, opt.stock, totalCapacity, isEntry);
    return {
      id: prev?.id ?? crypto.randomUUID(),
      optionId: opt.id,
      optionName: opt.name,
      optionCode: opt.code,
      label: prev?.label ?? opt.name,
      quantityToGenerate: defaultQty,
      generatedCount: prev?.generatedCount ?? 0,
      prefix: prev?.prefix ?? opt.code,
      enabled: prev?.enabled ?? true,
    };
  });
}
