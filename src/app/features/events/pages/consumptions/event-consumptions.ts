import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  EventConsumptionService,
  ConsumptionSummary,
  ConsumptionOptionTotal,
} from '../../services/event-consumption.service';
import { EventService } from '../../services/event.service';
import { Event, EventConsumption } from '../../models/event.model';
import { EmptyStateComponent } from '../../components/empty-state/empty-state';
import { EventStatusBadgeComponent } from '../../components/event-status-badge/event-status-badge';

type ConsumptionViewMode = 'total' | 'individual';

interface ParticipantGroup {
  participantName: string;
  ticketCode: string;
  items: EventConsumption[];
}

function eventInDateRange(evt: Event, from: string, to: string): boolean {
  const end = evt.endDate || evt.startDate;
  if (from && end < from) return false;
  if (to && evt.startDate > to) return false;
  return true;
}

@Component({
  selector: 'app-event-consumptions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, EmptyStateComponent, EventStatusBadgeComponent],
  template: `
    <div class="space-y-6">
      <nav class="text-sm text-slate-500" aria-label="Breadcrumb">
        <a routerLink="/eventos/listado" class="hover:text-brand">Eventos</a>
        <span class="mx-2">/</span>
        <span class="text-slate-800 font-medium">Consumos</span>
      </nav>

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">Control de Consumos</h1>
          <p class="text-sm text-slate-500 mt-0.5">
            @if (selectedEvent(); as evt) {
              Consumos del evento · {{ evt.startDate }}
            } @else {
              Seleccione un evento para ver sus consumos
            }
          </p>
        </div>
        @if (filterEventId()) {
          <div class="flex gap-2" role="tablist" aria-label="Vista de consumos">
            <button type="button" role="tab" [attr.aria-selected]="viewMode() === 'total'"
              class="px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
              [class]="viewMode() === 'total' ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'"
              (click)="viewMode.set('total')">
              Vista total
            </button>
            <button type="button" role="tab" [attr.aria-selected]="viewMode() === 'individual'"
              class="px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
              [class]="viewMode() === 'individual' ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'"
              (click)="viewMode.set('individual')">
              Vista individual
            </button>
          </div>
        }
      </div>

      <div class="section-card p-4 space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="lg:col-span-2">
            <label for="filter-event-consumptions" class="block text-xs font-semibold text-slate-500 mb-1">Evento</label>
            <select id="filter-event-consumptions" class="input-modern !py-1.5 !text-sm w-full"
              [ngModel]="filterEventId()" (ngModelChange)="setFilterEvent($event)">
              <option value="">— Seleccione un evento —</option>
              @for (e of filteredEvents(); track e.id) {
                <option [value]="e.id">{{ e.startDate }} · {{ e.name }} ({{ e.code }})</option>
              }
            </select>
          </div>
          <div>
            <label for="filter-date-from" class="block text-xs font-semibold text-slate-500 mb-1">Desde</label>
            <input id="filter-date-from" type="date" class="input-modern !py-1.5 !text-sm w-full"
              [ngModel]="filterDateFrom()" (ngModelChange)="setFilterDateFrom($event)" />
          </div>
          <div>
            <label for="filter-date-to" class="block text-xs font-semibold text-slate-500 mb-1">Hasta</label>
            <input id="filter-date-to" type="date" class="input-modern !py-1.5 !text-sm w-full"
              [ngModel]="filterDateTo()" (ngModelChange)="setFilterDateTo($event)" />
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
          <div class="lg:col-span-2">
            <label for="filter-event-search" class="block text-xs font-semibold text-slate-500 mb-1">Buscar evento</label>
            <input id="filter-event-search" type="search" class="input-modern !py-1.5 !text-sm w-full"
              placeholder="Nombre o código del evento..."
              [ngModel]="filterEventSearch()" (ngModelChange)="filterEventSearch.set($event)" />
          </div>
          <div class="flex flex-wrap gap-2 justify-end">
            @if (hasEventFilters()) {
              <button type="button" class="btn-ghost !text-sm" (click)="clearEventFilters()">Limpiar filtros</button>
            }
            <p class="text-xs text-slate-500 self-center">{{ filteredEvents().length }} evento(s)</p>
          </div>
        </div>
      </div>

      @if (!filterEventId()) {
        @if (eventsWithConsumptions().length > 0) {
          <div>
            <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Eventos con consumos
              @if (hasEventFilters()) { (filtrados) }
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              @for (e of eventsWithConsumptions(); track e.id) {
                <button type="button"
                  class="section-card p-4 text-left hover:shadow-md transition-shadow space-y-2"
                  (click)="setFilterEvent(e.id)">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <p class="font-mono text-xs text-slate-500">{{ e.code }} · {{ e.startDate }}</p>
                      <p class="font-bold text-slate-900 truncate">{{ e.name }}</p>
                    </div>
                    <app-event-status-badge [status]="e.status" />
                  </div>
                  @if (eventPreviewSummary(e.id); as preview) {
                    <p class="text-sm text-slate-600">{{ preview.totalItems }} unidades · S/ {{ preview.totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}</p>
                  }
                  <span class="text-sm font-semibold text-brand">Ver consumos →</span>
                </button>
              }
            </div>
          </div>
        } @else {
          <app-empty-state
            [title]="hasEventFilters() ? 'Sin eventos en el rango' : 'Seleccione un evento'"
            [description]="hasEventFilters()
              ? 'No hay eventos con consumos que coincidan con las fechas o la búsqueda.'
              : 'Elija un evento del listado o use las fechas para acotar la búsqueda.'" />
        }
      } @else if (selectedEvent(); as evt) {
        <div class="section-card p-4 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
          <div>
            <p class="font-mono text-xs text-slate-500">{{ evt.code }}</p>
            <p class="font-bold text-lg text-slate-900">{{ evt.name }}</p>
          </div>
          <button type="button" class="btn-ghost !text-sm" (click)="clearEvent()">Cambiar evento</button>
        </div>

        <div class="section-card p-4">
          <label for="search-consumptions" class="block text-xs font-semibold text-slate-500 mb-1">Buscar en este evento</label>
          <input id="search-consumptions" type="search" class="input-modern !py-1.5 !text-sm w-full max-w-xl"
            placeholder="Participante, entrada, opción..."
            [ngModel]="search()" (ngModelChange)="onSearchChange($event)" />
          @if (selectedOptionId()) {
            <div class="mt-3 flex items-center gap-2 text-sm">
              <span class="text-slate-500">Opción:</span>
              <span class="font-semibold text-brand">{{ selectedOptionLabel() }}</span>
              <button type="button" class="btn-ghost !text-xs !py-0" (click)="clearOptionFilter()">Ver todas las opciones</button>
            </div>
          }
        </div>

        @if (eventSummary(); as s) {
          @if (s.totalItems > 0) {
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="section-card p-4">
                <p class="text-xs font-semibold text-slate-500 uppercase">Unidades vendidas</p>
                <p class="text-2xl font-extrabold text-slate-900">{{ s.totalItems }}</p>
              </div>
              <div class="section-card p-4">
                <p class="text-xs font-semibold text-green-700 uppercase">Entregados</p>
                <p class="text-2xl font-extrabold text-green-800">{{ s.delivered }}</p>
              </div>
              <div class="section-card p-4">
                <p class="text-xs font-semibold text-brand uppercase">Valor total</p>
                <p class="text-2xl font-extrabold text-brand">S/ {{ s.totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}</p>
              </div>
              <div class="section-card p-4">
                <p class="text-xs font-semibold text-green-700 uppercase">Valor entregado</p>
                <p class="text-2xl font-extrabold text-green-800">S/ {{ s.deliveredRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}</p>
              </div>
            </div>

            @if (viewMode() === 'total') {
              <div class="section-card overflow-hidden">
                <div class="px-4 py-3 border-b border-slate-200 bg-slate-50">
                  <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-500">Resumen por concepto</h2>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead>
                      <tr class="border-b border-slate-200 bg-slate-50 text-left">
                        <th class="py-2 px-4 text-xs font-semibold text-slate-500">Opción / concepto</th>
                        <th class="py-2 px-4 text-xs font-semibold text-slate-500 text-right">Cantidad</th>
                        <th class="py-2 px-4 text-xs font-semibold text-slate-500 text-right">Precio unit.</th>
                        <th class="py-2 px-4 text-xs font-semibold text-slate-500 text-right">Total</th>
                        <th class="py-2 px-4 text-xs font-semibold text-slate-500 text-right">Entregados</th>
                        <th class="py-2 px-4 text-xs font-semibold text-slate-500">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (opt of s.byOption; track opt.optionId) {
                        <tr class="border-b border-slate-50 hover:bg-slate-50">
                          <td class="py-3 px-4 font-medium text-slate-800">{{ opt.optionName }}</td>
                          <td class="py-3 px-4 text-right font-semibold">{{ opt.quantity }}</td>
                          <td class="py-3 px-4 text-right text-slate-600">S/ {{ opt.unitPrice.toFixed(2) }}</td>
                          <td class="py-3 px-4 text-right font-bold text-brand">S/ {{ opt.totalAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}</td>
                          <td class="py-3 px-4 text-right text-green-700">{{ opt.delivered }} / {{ opt.quantity }}</td>
                          <td class="py-3 px-4">
                            <button type="button" class="btn-ghost !text-xs !px-2 whitespace-nowrap"
                              (click)="drillDownOption(opt)">
                              Ver individual
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                    <tfoot>
                      <tr class="bg-slate-50 font-bold">
                        <td class="py-3 px-4" colspan="3">Total del evento</td>
                        <td class="py-3 px-4 text-right text-brand">S/ {{ s.totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}</td>
                        <td class="py-3 px-4 text-right text-green-700" colspan="2">{{ s.delivered }} entregados</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            } @else {
              @if (participantGroups().length > 0) {
                <div class="section-card overflow-hidden">
                  <div class="px-4 py-3 border-b border-slate-200 bg-slate-50">
                    <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-500">Detalle por participante</h2>
                    <p class="text-xs text-slate-500">{{ s.participants }} participante(s)</p>
                  </div>
                  <div class="divide-y divide-slate-100">
                    @for (p of participantGroups(); track p.ticketCode + p.participantName) {
                      <div class="px-4 py-4">
                        <h3 class="font-semibold text-slate-900">{{ p.participantName }}</h3>
                        <p class="text-xs text-slate-500 mb-3">Entrada {{ p.ticketCode }}</p>
                        <div class="space-y-2">
                          @for (item of p.items; track item.id) {
                            <div class="flex flex-wrap items-center justify-between gap-2 text-sm py-2 border-b border-slate-50 last:border-0">
                              <div>
                                <span class="font-medium">{{ item.optionName }}</span>
                                <span class="text-slate-500"> × {{ item.quantity }}</span>
                                <span class="text-slate-400 text-xs ml-2">
                                  S/ {{ lineAmount(item).toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}
                                </span>
                              </div>
                              @if (item.status === 'delivered') {
                                <span class="text-green-600 font-semibold">✓ Entregado</span>
                              } @else {
                                <button type="button" class="btn-ghost !text-xs !px-2" (click)="deliver(item.id)">
                                  Registrar entrega
                                </button>
                              }
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              } @else {
                <app-empty-state title="Sin resultados" description="No hay consumos que coincidan con la búsqueda." />
              }
            }
          } @else {
            <app-empty-state
              title="Sin consumos en este evento"
              description="El evento seleccionado aún no tiene consumos registrados." />
          }
        }
      }
    </div>
  `,
})
export class EventConsumptionsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly consumptionService = inject(EventConsumptionService);
  private readonly eventService = inject(EventService);

  protected readonly consumptions = signal<EventConsumption[]>([]);
  protected readonly allEvents = signal<Event[]>([]);
  protected readonly search = signal('');
  protected readonly filterEventId = signal('');
  protected readonly filterEventSearch = signal('');
  protected readonly filterDateFrom = signal('');
  protected readonly filterDateTo = signal('');
  protected readonly selectedOptionId = signal('');
  protected readonly viewMode = signal<ConsumptionViewMode>('total');

  private searchDebounce?: ReturnType<typeof setTimeout>;
  private previewCache = new Map<string, ConsumptionSummary>();

  protected readonly hasEventFilters = computed(() =>
    !!this.filterEventSearch().trim() || !!this.filterDateFrom() || !!this.filterDateTo(),
  );

  protected readonly filteredEvents = computed(() => {
    let list = [...this.allEvents()].sort((a, b) => b.startDate.localeCompare(a.startDate));
    const q = this.filterEventSearch().trim().toLowerCase();
    if (q) {
      list = list.filter(e =>
        e.name.toLowerCase().includes(q) || e.code.toLowerCase().includes(q),
      );
    }
    const from = this.filterDateFrom();
    const to = this.filterDateTo();
    if (from || to) {
      list = list.filter(e => eventInDateRange(e, from, to));
    }
    return list;
  });

  protected readonly eventsWithConsumptions = computed(() => {
    const ids = new Set(this.consumptionService.getEventIdsWithConsumptions());
    return this.filteredEvents().filter(e => ids.has(e.id));
  });

  protected readonly selectedEvent = computed(() =>
    this.allEvents().find(e => e.id === this.filterEventId()),
  );

  protected readonly selectedOptionLabel = computed(() => {
    const id = this.selectedOptionId();
    const item = this.consumptions().find(c => c.optionId === id);
    return item?.optionName ?? id;
  });

  protected readonly eventSummary = computed(() => {
    if (!this.filterEventId()) return null;
    return this.consumptionService.buildSummary(this.consumptions(), this.allEvents());
  });

  protected readonly participantGroups = computed((): ParticipantGroup[] => {
    const map = new Map<string, ParticipantGroup>();
    for (const c of this.consumptions()) {
      const key = c.participantId + c.ticketId;
      if (!map.has(key)) {
        map.set(key, { participantName: c.participantName, ticketCode: c.ticketCode, items: [] });
      }
      map.get(key)!.items.push(c);
    }
    return [...map.values()];
  });

  ngOnInit(): void {
    const qEvent = this.route.snapshot.queryParamMap.get('evento');
    if (qEvent) this.filterEventId.set(qEvent);

    this.eventService.getEvents().subscribe(list => {
      this.allEvents.set(list);
      this.buildPreviewCache(list);
      if (this.filterEventId()) this.load();
    });
  }

  protected eventPreviewSummary(eventId: string): ConsumptionSummary | undefined {
    return this.previewCache.get(eventId);
  }

  protected setFilterEvent(value: string): void {
    this.filterEventId.set(value);
    this.selectedOptionId.set('');
    this.search.set('');
    this.viewMode.set('total');
    if (value) this.load();
    else this.consumptions.set([]);
  }

  protected setFilterDateFrom(value: string): void {
    this.filterDateFrom.set(value);
    this.validateSelectedEventInFilters();
  }

  protected setFilterDateTo(value: string): void {
    this.filterDateTo.set(value);
    this.validateSelectedEventInFilters();
  }

  protected clearEventFilters(): void {
    this.filterEventSearch.set('');
    this.filterDateFrom.set('');
    this.filterDateTo.set('');
    this.validateSelectedEventInFilters();
  }

  protected clearEvent(): void {
    this.setFilterEvent('');
  }

  private validateSelectedEventInFilters(): void {
    const id = this.filterEventId();
    if (!id) return;
    const stillVisible = this.filteredEvents().some(e => e.id === id);
    if (!stillVisible) this.setFilterEvent('');
  }

  protected drillDownOption(opt: ConsumptionOptionTotal): void {
    this.selectedOptionId.set(opt.optionId);
    this.viewMode.set('individual');
    this.load();
  }

  protected clearOptionFilter(): void {
    this.selectedOptionId.set('');
    this.load();
  }

  protected onSearchChange(value: string): void {
    this.search.set(value);
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.load(), 250);
  }

  protected lineAmount(item: EventConsumption): number {
    const event = this.selectedEvent();
    return this.consumptionService.getOptionPrice(event, item.optionId, item.optionName) * item.quantity;
  }

  protected load(): void {
    if (!this.filterEventId()) return;
    this.consumptionService.getConsumptions({
      eventId: this.filterEventId(),
      optionId: this.selectedOptionId() || undefined,
      search: this.search().trim() || undefined,
    }).subscribe(list => this.consumptions.set(list));
  }

  protected deliver(id: string): void {
    this.consumptionService.markDelivered(id).subscribe(() => {
      this.load();
      this.buildPreviewCache(this.allEvents());
    });
  }

  private buildPreviewCache(events: Event[]): void {
    this.previewCache.clear();
    for (const id of this.consumptionService.getEventIdsWithConsumptions()) {
      const items = this.consumptionService.consumptions().filter(c => c.eventId === id);
      this.previewCache.set(id, this.consumptionService.buildSummary(items, events));
    }
  }
}
