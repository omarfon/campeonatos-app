import { Component, input, output, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventOfferingCatalog, EventTicketPool } from '../../models/event-offering.model';
import { EventCategory } from '../../enums/event-category.enum';
import { EVENT_CATEGORY_LABELS } from '../../enums/event-category.enum';
import { syncTicketPoolsFromCatalog } from '../../services/event-offering.service';

@Component({
  selector: 'app-event-ticket-generation-config',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="space-y-4">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 class="text-sm font-bold text-slate-800">Generación e impresión de tickets</h4>
          <p class="text-xs text-slate-500 mt-0.5">
            Defina cuántos boletos, invitaciones o cartillas se generarán o imprimirán para este evento.
          </p>
        </div>
        @if (!disabled()) {
          <button type="button" class="btn-ghost !text-xs" (click)="syncFromCatalog()">Actualizar desde catálogo</button>
        }
      </div>

      @if (localPools().length > 0) {
        <div class="overflow-x-auto border border-slate-200 rounded-xl">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 text-left">
                <th class="py-2 px-3 text-xs font-semibold text-slate-500">Tipo de ticket</th>
                <th class="py-2 px-3 text-xs font-semibold text-slate-500">Código</th>
                <th class="py-2 px-3 text-xs font-semibold text-slate-500 text-right">Cantidad a generar</th>
                <th class="py-2 px-3 text-xs font-semibold text-slate-500 text-right">Generados</th>
                <th class="py-2 px-3 text-xs font-semibold text-slate-500">Prefijo</th>
                <th class="py-2 px-3 text-xs font-semibold text-slate-500 text-center">Activo</th>
              </tr>
            </thead>
            <tbody>
              @for (pool of localPools(); track pool.id) {
                <tr class="border-b border-slate-50 hover:bg-slate-50/80">
                  <td class="py-2 px-3">
                    <input class="input-modern !py-1 !text-xs w-full min-w-[140px]" [disabled]="disabled()"
                      [ngModel]="pool.label" (ngModelChange)="patchPool(pool.id, { label: $event })" />
                  </td>
                  <td class="py-2 px-3 font-mono text-xs text-slate-500">{{ pool.optionCode }}</td>
                  <td class="py-2 px-3 text-right">
                    <input type="number" class="input-modern !py-1 !text-xs w-24 text-right ml-auto" min="0"
                      [disabled]="disabled()" [ngModel]="pool.quantityToGenerate"
                      (ngModelChange)="patchPool(pool.id, { quantityToGenerate: +$event })" />
                  </td>
                  <td class="py-2 px-3 text-right text-slate-500">{{ pool.generatedCount }}</td>
                  <td class="py-2 px-3">
                    <input class="input-modern !py-1 !text-xs w-20 font-mono" [disabled]="disabled()"
                      [ngModel]="pool.prefix" (ngModelChange)="patchPool(pool.id, { prefix: $event })" />
                  </td>
                  <td class="py-2 px-3 text-center">
                    <input type="checkbox" [disabled]="disabled()" [ngModel]="pool.enabled"
                      (ngModelChange)="patchPool(pool.id, { enabled: $event })" />
                  </td>
                </tr>
              }
            </tbody>
            <tfoot>
              <tr class="bg-slate-50 font-semibold text-xs">
                <td class="py-2 px-3" colspan="2">Total a generar</td>
                <td class="py-2 px-3 text-right text-brand">{{ totalToGenerate() }}</td>
                <td class="py-2 px-3 text-right text-slate-500">{{ totalGenerated() }}</td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p class="text-xs text-slate-500 rounded-lg bg-blue-50 border border-blue-100 p-3">
          Ejemplo {{ categoryLabel() }}:
          @switch (category()) {
            @case (EventCategory.TRIP) { «Generar {{ totalToGenerate() }} invitaciones para el paseo» }
            @case (EventCategory.FUNDRAISING) { «Imprimir {{ totalToGenerate() }} boletos de bingo» }
            @default { «Generar {{ totalToGenerate() }} entradas para el evento» }
          }
        </p>
      } @else {
        <p class="text-sm text-slate-400 italic p-4 border border-dashed border-slate-200 rounded-lg text-center">
          No hay opciones con «Genera ticket» en el catálogo. Márquelas en el catálogo superior o pulse «Actualizar desde catálogo».
        </p>
      }
    </div>
  `,
})
export class EventTicketGenerationConfigComponent {
  readonly catalog = input.required<EventOfferingCatalog>();
  readonly category = input<EventCategory>(EventCategory.GENERAL);
  readonly pools = input.required<EventTicketPool[]>();
  readonly totalCapacity = input(0);
  readonly disabled = input(false);
  readonly poolsChange = output<EventTicketPool[]>();

  protected readonly EventCategory = EventCategory;
  protected readonly localPools = signal<EventTicketPool[]>([]);

  protected readonly totalToGenerate = computed(() =>
    this.localPools().filter(p => p.enabled).reduce((n, p) => n + p.quantityToGenerate, 0),
  );

  protected readonly totalGenerated = computed(() =>
    this.localPools().reduce((n, p) => n + p.generatedCount, 0),
  );

  protected readonly categoryLabel = computed(() =>
    EVENT_CATEGORY_LABELS[this.category()],
  );

  constructor() {
    effect(() => this.localPools.set(structuredClone(this.pools())));
  }

  protected syncFromCatalog(): void {
    const synced = syncTicketPoolsFromCatalog(
      this.catalog(),
      this.localPools(),
      this.category(),
      this.totalCapacity(),
    );
    this.commit(synced);
  }

  protected patchPool(poolId: string, patch: Partial<EventTicketPool>): void {
    this.commit(this.localPools().map(p => p.id === poolId ? { ...p, ...patch } : p));
  }

  private commit(pools: EventTicketPool[]): void {
    this.localPools.set(pools);
    this.poolsChange.emit(structuredClone(pools));
  }
}
