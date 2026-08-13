import { Component, input, output, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventOfferingCatalog, EventOfferingGroup, EventOfferingOption } from '../../models/event-offering.model';
import { OFFERING_KIND_LABELS, OfferingKind } from '../../enums/offering-kind.enum';
import { CONSUMPTION_TYPE_LABELS, ConsumptionType } from '../../enums/consumption-type.enum';
import { OFFERING_GROUP_LABELS, OfferingGroupKey, SELECTION_MODE_LABELS, SelectionMode } from '../../enums/offering-group.enum';
import { confirmDialog } from '../../../../shared/confirm-dialog';

@Component({
  selector: 'app-event-offering-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="space-y-4">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 class="text-sm font-bold text-slate-800">Catálogo de tickets y consumos</h4>
          <p class="text-xs text-slate-500 mt-0.5">
            Agregue, edite o elimine opciones dentro de cada grupo. Cada opción puede generar ticket, consumo o ambos.
          </p>
        </div>
        @if (!disabled()) {
          <button type="button" class="btn-primary !text-xs !py-1.5 !px-3" (click)="addGroup()">+ Nuevo grupo</button>
        }
      </div>

      @for (group of sortedGroups(); track group.id) {
        <section class="border border-slate-200 rounded-xl overflow-hidden">
          <header class="px-4 py-3 bg-slate-50 border-b border-slate-200 space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wide shrink-0">{{ groupLabels[group.key] }}</span>
              <input class="input-modern !py-1.5 !text-sm font-semibold flex-1 min-w-[160px]"
                [ngModel]="group.name" (ngModelChange)="patchGroup(group.id, { name: $event })" [disabled]="disabled()" />
              @if (!disabled()) {
                <button type="button" class="text-xs text-red-600 font-semibold hover:underline shrink-0"
                  (click)="removeGroup(group.id)">Eliminar grupo</button>
              }
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <select class="input-modern !py-1 !text-xs w-48"
                [ngModel]="group.selectionMode" (ngModelChange)="patchGroup(group.id, { selectionMode: $event })" [disabled]="disabled()">
                @for (m of selectionModes; track m) {
                  <option [ngValue]="m">{{ modeLabels[m] }}</option>
                }
              </select>
              <label class="flex items-center gap-1.5 text-xs">
                <input type="checkbox" [ngModel]="group.required"
                  (ngModelChange)="patchGroup(group.id, { required: $event, minSelections: $event ? 1 : 0 })" [disabled]="disabled()" />
                Obligatorio
              </label>
              <div class="flex items-center gap-1 text-xs">
                <span class="text-slate-500">Máx. selecciones:</span>
                <input type="number" class="input-modern !py-1 !text-xs w-16" min="1"
                  [ngModel]="group.maxSelections" (ngModelChange)="patchGroup(group.id, { maxSelections: +$event })" [disabled]="disabled()" />
              </div>
              <span class="text-xs text-slate-400 ml-auto">{{ optionsForGroup(group.id).length }} opción(es)</span>
            </div>
          </header>

          <div class="divide-y divide-slate-100">
            @for (opt of optionsForGroup(group.id); track opt.id; let i = $index) {
              <article class="p-4 space-y-3" [class.bg-brand/5]="expandedOption() === opt.id">
                <div class="flex flex-wrap items-start gap-2">
                  <span class="text-xs font-mono text-slate-400 pt-2 shrink-0">#{{ i + 1 }}</span>
                  <div class="flex-1 min-w-[180px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    <div class="sm:col-span-2">
                      <label class="block text-[10px] font-semibold text-slate-400 mb-0.5">Nombre *</label>
                      <input class="input-modern !py-1.5 !text-sm w-full" placeholder="Ej. Ticket movilidad ida"
                        [ngModel]="opt.name" (ngModelChange)="patchOption(opt.id, { name: $event })" [disabled]="disabled()" />
                    </div>
                    <div>
                      <label class="block text-[10px] font-semibold text-slate-400 mb-0.5">Código</label>
                      <input class="input-modern !py-1.5 !text-xs w-full font-mono" placeholder="MOB-IDA"
                        [ngModel]="opt.code" (ngModelChange)="patchOption(opt.id, { code: $event })" [disabled]="disabled()" />
                    </div>
                    <div>
                      <label class="block text-[10px] font-semibold text-slate-400 mb-0.5">Precio (S/)</label>
                      <input type="number" class="input-modern !py-1.5 !text-xs w-full" min="0" step="0.01"
                        [ngModel]="opt.price" (ngModelChange)="patchOption(opt.id, { price: +$event })" [disabled]="disabled()" />
                    </div>
                  </div>
                  @if (!disabled()) {
                    <div class="flex items-center gap-1 shrink-0">
                      <button type="button" class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 text-xs"
                        [attr.aria-expanded]="expandedOption() === opt.id"
                        (click)="toggleExpand(opt.id)" title="Más campos">
                        {{ expandedOption() === opt.id ? '▲' : '▼' }}
                      </button>
                      <button type="button" class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 text-xs"
                        (click)="duplicateOption(opt.id)" title="Duplicar">⧉</button>
                      <button type="button" class="p-1.5 rounded-lg text-red-500 hover:bg-red-50 text-xs"
                        (click)="removeOption(opt.id)" title="Eliminar" aria-label="Eliminar opción">✕</button>
                    </div>
                  }
                </div>

                @if (expandedOption() === opt.id || disabled()) {
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pl-6">
                    <div class="sm:col-span-2">
                      <label class="block text-[10px] font-semibold text-slate-400 mb-0.5">Descripción</label>
                      <input class="input-modern !py-1 !text-xs w-full" placeholder="Detalle visible al inscribirse"
                        [ngModel]="opt.description" (ngModelChange)="patchOption(opt.id, { description: $event })" [disabled]="disabled()" />
                    </div>
                    <div>
                      <label class="block text-[10px] font-semibold text-slate-400 mb-0.5">Tipo</label>
                      <select class="input-modern !py-1 !text-xs w-full"
                        [ngModel]="opt.kind" (ngModelChange)="onKindChange(opt.id, $event)" [disabled]="disabled()">
                        @for (k of offeringKinds; track k) {
                          <option [ngValue]="k">{{ kindLabels[k] }}</option>
                        }
                      </select>
                    </div>
                    <div>
                      <label class="block text-[10px] font-semibold text-slate-400 mb-0.5">Consumo</label>
                      <select class="input-modern !py-1 !text-xs w-full"
                        [ngModel]="opt.consumptionType" (ngModelChange)="patchOption(opt.id, { consumptionType: $event })" [disabled]="disabled()">
                        @for (t of consumptionTypes; track t) {
                          <option [ngValue]="t">{{ typeLabels[t] }}</option>
                        }
                      </select>
                    </div>
                    <div>
                      <label class="block text-[10px] font-semibold text-slate-400 mb-0.5">Stock</label>
                      <input type="number" class="input-modern !py-1 !text-xs w-full" min="0"
                        [ngModel]="opt.stock" (ngModelChange)="patchOption(opt.id, { stock: +$event })" [disabled]="disabled()" />
                    </div>
                    <div>
                      <label class="block text-[10px] font-semibold text-slate-400 mb-0.5">Cant. mín.</label>
                      <input type="number" class="input-modern !py-1 !text-xs w-full" min="0"
                        [ngModel]="opt.minQuantity" (ngModelChange)="patchOption(opt.id, { minQuantity: +$event })" [disabled]="disabled()" />
                    </div>
                    <div>
                      <label class="block text-[10px] font-semibold text-slate-400 mb-0.5">Cant. máx.</label>
                      <input type="number" class="input-modern !py-1 !text-xs w-full" min="1"
                        [ngModel]="opt.maxQuantity" (ngModelChange)="patchOption(opt.id, { maxQuantity: +$event })" [disabled]="disabled()" />
                    </div>
                    <div class="flex flex-wrap items-center gap-3 sm:col-span-2 pt-4">
                      <label class="flex items-center gap-1.5 text-xs">
                        <input type="checkbox" [ngModel]="opt.generatesTicket"
                          (ngModelChange)="patchOption(opt.id, { generatesTicket: $event })" [disabled]="disabled()" />
                        Genera ticket
                      </label>
                      <label class="flex items-center gap-1.5 text-xs">
                        <input type="checkbox" [ngModel]="opt.generatesConsumption"
                          (ngModelChange)="patchOption(opt.id, { generatesConsumption: $event })" [disabled]="disabled()" />
                        Genera consumo
                      </label>
                      <label class="flex items-center gap-1.5 text-xs">
                        <input type="checkbox" [ngModel]="opt.required"
                          (ngModelChange)="patchOption(opt.id, { required: $event })" [disabled]="disabled()" />
                        Obligatoria
                      </label>
                    </div>
                  </div>
                }
              </article>
            } @empty {
              <p class="p-4 text-xs text-slate-400 italic text-center">Este grupo aún no tiene opciones.</p>
            }
          </div>

          @if (!disabled()) {
            <footer class="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100">
              <button type="button" class="btn-ghost !text-xs !py-1 w-full" (click)="addOption(group.id)">
                + Agregar opción en «{{ group.name }}»
              </button>
            </footer>
          }
        </section>
      } @empty {
        <p class="text-sm text-slate-400 italic p-6 border border-dashed border-slate-200 rounded-lg text-center">
          Cargue una plantilla según la categoría o cree un grupo para empezar.
        </p>
      }

      <p class="text-xs text-slate-500">
        {{ localCatalog().groups.length }} grupo(s) ·
        {{ localCatalog().options.length }} opción(es) ·
        {{ ticketCount() }} con ticket ·
        {{ consumptionCount() }} con consumo
      </p>
    </div>
  `,
})
export class EventOfferingCatalogComponent {
  readonly catalog = input.required<EventOfferingCatalog>();
  readonly disabled = input(false);
  readonly catalogChange = output<EventOfferingCatalog>();

  protected readonly localCatalog = signal<EventOfferingCatalog>({ groups: [], options: [] });
  protected readonly expandedOption = signal<string | null>(null);

  protected readonly offeringKinds = Object.values(OfferingKind);
  protected readonly consumptionTypes = Object.values(ConsumptionType);
  protected readonly selectionModes = Object.values(SelectionMode);
  protected readonly kindLabels = OFFERING_KIND_LABELS;
  protected readonly typeLabels = CONSUMPTION_TYPE_LABELS;
  protected readonly modeLabels = SELECTION_MODE_LABELS;
  protected readonly groupLabels = OFFERING_GROUP_LABELS;

  protected readonly sortedGroups = computed(() =>
    [...this.localCatalog().groups].sort((a, b) => a.sortOrder - b.sortOrder),
  );

  protected readonly ticketCount = computed(() =>
    this.localCatalog().options.filter(o => o.generatesTicket).length,
  );

  protected readonly consumptionCount = computed(() =>
    this.localCatalog().options.filter(o => o.generatesConsumption).length,
  );

  constructor() {
    effect(() => {
      this.localCatalog.set(structuredClone(this.catalog()));
    });
  }

  protected optionsForGroup(groupId: string): EventOfferingOption[] {
    return this.localCatalog().options.filter(o => o.groupId === groupId);
  }

  protected toggleExpand(optionId: string): void {
    this.expandedOption.update(id => id === optionId ? null : optionId);
  }

  protected patchGroup(groupId: string, patch: Partial<EventOfferingGroup>): void {
    this.commit({
      ...this.localCatalog(),
      groups: this.localCatalog().groups.map(g => g.id === groupId ? { ...g, ...patch } : g),
    });
  }

  protected patchOption(optionId: string, patch: Partial<EventOfferingOption>): void {
    this.commit({
      ...this.localCatalog(),
      options: this.localCatalog().options.map(o => o.id === optionId ? { ...o, ...patch } : o),
    });
  }

  protected onKindChange(optionId: string, kind: OfferingKind): void {
    const patch: Partial<EventOfferingOption> = { kind };
    if (kind === OfferingKind.ENTRY_TICKET || kind === OfferingKind.ADDON_TICKET) {
      patch.generatesTicket = true;
    }
    if (kind === OfferingKind.CONSUMPTION) {
      patch.generatesConsumption = true;
      patch.generatesTicket = false;
    }
    if (kind === OfferingKind.ACTIVITY) {
      patch.generatesTicket = true;
      patch.generatesConsumption = true;
    }
    this.patchOption(optionId, patch);
  }

  protected addGroup(): void {
    const cat = structuredClone(this.localCatalog());
    cat.groups.push({
      id: crypto.randomUUID(),
      key: OfferingGroupKey.EXTRAS,
      name: 'Nuevo grupo',
      description: '',
      selectionMode: SelectionMode.SINGLE,
      minSelections: 0,
      maxSelections: 1,
      required: false,
      sortOrder: cat.groups.length + 1,
    });
    this.commit(cat);
  }

  protected addOption(groupId: string): void {
    const cat = structuredClone(this.localCatalog());
    const newId = crypto.randomUUID();
    cat.options.push({
      id: newId,
      code: `OPT-${Date.now().toString().slice(-4)}`,
      name: '',
      description: '',
      groupId,
      kind: OfferingKind.CONSUMPTION,
      consumptionType: ConsumptionType.MENU,
      price: 0,
      currency: 'PEN',
      stock: 50,
      minQuantity: 0,
      maxQuantity: 1,
      required: false,
      generatesTicket: false,
      generatesConsumption: true,
      status: 'active',
    });
    this.commit(cat);
    this.expandedOption.set(newId);
  }

  protected duplicateOption(optionId: string): void {
    const source = this.localCatalog().options.find(o => o.id === optionId);
    if (!source) return;
    const cat = structuredClone(this.localCatalog());
    const newId = crypto.randomUUID();
    cat.options.push({
      ...structuredClone(source),
      id: newId,
      code: `${source.code}-COPY`,
      name: `${source.name} (copia)`,
    });
    this.commit(cat);
    this.expandedOption.set(newId);
  }

  protected async removeOption(optionId: string): Promise<void> {
    const opt = this.localCatalog().options.find(o => o.id === optionId);
    const ok = await confirmDialog({
      title: 'Eliminar opción',
      text: opt?.name ? `¿Eliminar «${opt.name}»?` : '¿Eliminar esta opción?',
      confirmText: 'Eliminar',
    });
    if (!ok) return;
    const cat = structuredClone(this.localCatalog());
    cat.options = cat.options.filter(o => o.id !== optionId);
    this.commit(cat);
    if (this.expandedOption() === optionId) this.expandedOption.set(null);
  }

  protected async removeGroup(groupId: string): Promise<void> {
    const group = this.localCatalog().groups.find(g => g.id === groupId);
    const count = this.optionsForGroup(groupId).length;
    const ok = await confirmDialog({
      title: 'Eliminar grupo',
      text: `¿Eliminar «${group?.name ?? 'grupo'}» y sus ${count} opción(es)?`,
      confirmText: 'Eliminar grupo',
    });
    if (!ok) return;
    const cat = structuredClone(this.localCatalog());
    cat.groups = cat.groups.filter(g => g.id !== groupId);
    cat.options = cat.options.filter(o => o.groupId !== groupId);
    this.commit(cat);
  }

  private commit(cat: EventOfferingCatalog): void {
    this.localCatalog.set(cat);
    this.catalogChange.emit(structuredClone(cat));
  }
}
