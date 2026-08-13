import { Component, input, output, signal, computed, effect, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventOfferingCatalog, EventOfferingSelection } from '../../models/event-offering.model';
import { SelectionMode } from '../../enums/offering-group.enum';
import { EventOfferingService } from '../../services/event-offering.service';

@Component({
  selector: 'app-event-offering-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    @if (catalog().groups.length > 0) {
      <div class="space-y-4">
        <h4 class="text-sm font-bold text-slate-700">Opciones del evento</h4>

        @for (group of sortedGroups(); track group.id) {
          <fieldset class="border border-slate-200 rounded-lg p-3 space-y-2">
            <legend class="text-xs font-semibold text-slate-600 px-1">
              {{ group.name }}
              @if (group.required) { <span class="text-red-500">*</span> }
            </legend>

            @switch (group.selectionMode) {
              @case (SelectionMode.SINGLE) {
                @for (opt of optionsForGroup(group.id); track opt.id) {
                  <label class="flex items-start gap-2 text-sm cursor-pointer p-2 rounded hover:bg-slate-50">
                    <input type="radio" [name]="'grp-' + group.id" [checked]="qty(opt.id) === 1"
                      (change)="setSingle(group.id, opt.id)" class="mt-0.5" />
                    <span class="flex-1">
                      {{ opt.name }}
                      @if (opt.price > 0) { <span class="text-brand font-semibold">+ S/ {{ opt.price.toFixed(2) }}</span> }
                      @if (opt.generatesTicket) { <span class="text-xs text-slate-400 ml-1">· ticket</span> }
                    </span>
                  </label>
                }
              }
              @case (SelectionMode.MULTIPLE) {
                @for (opt of optionsForGroup(group.id); track opt.id) {
                  <label class="flex items-start gap-2 text-sm cursor-pointer p-2 rounded hover:bg-slate-50">
                    <input type="checkbox" [checked]="qty(opt.id) > 0"
                      (change)="toggleMultiple(opt.id, $any($event.target).checked)" class="mt-0.5" />
                    <span class="flex-1">
                      {{ opt.name }}
                      @if (opt.price > 0) { <span class="text-brand font-semibold">+ S/ {{ opt.price.toFixed(2) }}</span> }
                    </span>
                  </label>
                }
              }
              @default {
                @for (opt of optionsForGroup(group.id); track opt.id) {
                  <div class="flex items-center gap-3 text-sm p-2">
                    <span class="flex-1">{{ opt.name }}</span>
                    @if (opt.price > 0) { <span class="text-brand text-xs font-semibold">S/ {{ opt.price.toFixed(2) }}</span> }
                    <input type="number" class="input-modern !py-1 !text-xs w-16" [min]="opt.minQuantity" [max]="opt.maxQuantity"
                      [value]="qty(opt.id)" (input)="setQuantity(opt.id, +$any($event.target).value)" />
                  </div>
                }
              }
            }
          </fieldset>
        }

        @if (validationErrors().length) {
          <ul class="text-xs text-red-600 space-y-0.5">
            @for (err of validationErrors(); track err) { <li>{{ err }}</li> }
          </ul>
        }

        <p class="text-sm font-semibold text-slate-700">
          Adicionales: S/ {{ extrasTotal().toFixed(2) }}
        </p>
      </div>
    }
  `,
})
export class EventOfferingSelectorComponent {
  readonly catalog = input.required<EventOfferingCatalog>();
  readonly selections = input<EventOfferingSelection[]>([]);
  readonly selectionsChange = output<EventOfferingSelection[]>();

  protected readonly SelectionMode = SelectionMode;
  private readonly offeringService = inject(EventOfferingService);

  private readonly quantities = signal<Record<string, number>>({});

  protected readonly sortedGroups = computed(() =>
    [...this.catalog().groups].sort((a, b) => a.sortOrder - b.sortOrder),
  );

  protected readonly extrasTotal = computed(() =>
    this.offeringService.calculateSelectionsTotal(this.buildSelections()),
  );

  protected readonly validationErrors = computed(() => {
    const result = this.offeringService.validateSelections(this.catalog(), this.buildSelections());
    return result.errors;
  });

  constructor() {
    effect(() => {
      const map: Record<string, number> = {};
      for (const s of this.selections()) map[s.optionId] = s.quantity;
      this.quantities.set(map);
    });
  }

  protected optionsForGroup(groupId: string) {
    return this.catalog().options.filter(o => o.groupId === groupId && o.status === 'active');
  }

  protected qty(optionId: string): number {
    return this.quantities()[optionId] ?? 0;
  }

  protected setSingle(groupId: string, optionId: string): void {
    const next = { ...this.quantities() };
    for (const opt of this.catalog().options.filter(o => o.groupId === groupId)) {
      next[opt.id] = opt.id === optionId ? 1 : 0;
    }
    this.quantities.set(next);
    this.emit();
  }

  protected toggleMultiple(optionId: string, checked: boolean): void {
    this.quantities.update(q => ({ ...q, [optionId]: checked ? 1 : 0 }));
    this.emit();
  }

  protected setQuantity(optionId: string, value: number): void {
    const opt = this.catalog().options.find(o => o.id === optionId);
    const qty = Math.max(0, Math.min(value, opt?.maxQuantity ?? 99));
    this.quantities.update(q => ({ ...q, [optionId]: qty }));
    this.emit();
  }

  private buildSelections(): EventOfferingSelection[] {
    const cat = this.catalog();
    const q = this.quantities();
    return cat.options
      .filter(o => (q[o.id] ?? 0) > 0)
      .map(o => this.offeringService.buildSelectionFromOption(o, q[o.id]));
  }

  private emit(): void {
    this.selectionsChange.emit(this.buildSelections());
  }
}
