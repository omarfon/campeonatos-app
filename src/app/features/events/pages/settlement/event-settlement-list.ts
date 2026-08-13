import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  EventSettlementService,
  SettlementListItem,
  SettlementFilterStatus,
} from '../../services/event-settlement.service';
import { EventStatusBadgeComponent } from '../../components/event-status-badge/event-status-badge';
import { EmptyStateComponent } from '../../components/empty-state/empty-state';
import { EVENT_CATEGORY_LABELS } from '../../enums/event-category.enum';
import { EventStatus } from '../../enums/event-status.enum';

@Component({
  selector: 'app-event-settlement-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, EventStatusBadgeComponent, EmptyStateComponent],
  template: `
    <div class="space-y-6">
      <nav class="text-sm text-slate-500" aria-label="Breadcrumb">
        <a routerLink="/eventos/listado" class="hover:text-brand">Eventos</a>
        <span class="mx-2">/</span>
        <span class="text-slate-800 font-medium">Liquidaciones</span>
      </nav>

      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Liquidaciones</h1>
        <p class="text-sm text-slate-500 mt-0.5">Cierre financiero de eventos finalizados</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="section-card p-4">
          <p class="text-xs font-semibold text-amber-700 uppercase">Pendientes</p>
          <p class="text-2xl font-extrabold text-amber-800">{{ pendingCount() }}</p>
        </div>
        <div class="section-card p-4">
          <p class="text-xs font-semibold text-teal-700 uppercase">Liquidados</p>
          <p class="text-2xl font-extrabold text-teal-800">{{ settledCount() }}</p>
        </div>
        <div class="section-card p-4">
          <p class="text-xs font-semibold text-brand uppercase">Total recaudado</p>
          <p class="text-2xl font-extrabold text-brand">S/ {{ totalRevenue().toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}</p>
        </div>
      </div>

      <div class="section-card p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label for="search-settlement" class="block text-xs font-semibold text-slate-500 mb-1">Buscar evento</label>
            <input id="search-settlement" type="search" class="input-modern !py-1.5 !text-sm w-full"
              placeholder="Nombre o código..."
              [ngModel]="search()" (ngModelChange)="onSearchChange($event)" />
          </div>
          <div>
            <label for="filter-settlement-status" class="block text-xs font-semibold text-slate-500 mb-1">Estado</label>
            <select id="filter-settlement-status" class="input-modern !py-1.5 !text-sm w-full"
              [ngModel]="filterStatus()" (ngModelChange)="setFilterStatus($event)">
              <option value="all">Todos</option>
              <option value="pending">Pendientes de liquidar</option>
              <option value="settled">Liquidados</option>
            </select>
          </div>
        </div>
      </div>

      @if (items().length > 0) {
        <div class="section-card overflow-hidden">
          <div class="hidden lg:grid grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,0.8fr)_minmax(0,0.6fr)_auto] gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Evento</span>
            <span>Categoría</span>
            <span>Fecha</span>
            <span>Entradas pagadas</span>
            <span>Total recaudado</span>
            <span>Estado</span>
            <span class="sr-only">Acciones</span>
          </div>
          <div class="divide-y divide-slate-100">
            @for (item of items(); track item.event.id) {
              <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,0.8fr)_minmax(0,0.6fr)_auto] gap-2 px-4 py-3 items-center text-sm hover:bg-slate-50">
                <div>
                  <p class="font-mono text-xs text-slate-500">{{ item.event.code }}</p>
                  <p class="font-semibold text-slate-900 truncate">{{ item.event.name }}</p>
                </div>
                <span class="text-slate-600">{{ categoryLabels[item.event.category] }}</span>
                <span class="text-slate-600">{{ item.event.startDate }}</span>
                <span>{{ item.settlement.ticketsPaid }} / {{ item.settlement.ticketsIssued }}</span>
                <span class="font-semibold text-green-700">S/ {{ item.settlement.totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}</span>
                <app-event-status-badge [status]="item.event.status" />
                <a [routerLink]="['/eventos', item.event.id, 'liquidacion']"
                  class="btn-ghost !text-xs whitespace-nowrap justify-self-end">
                  {{ item.canSettle ? 'Liquidar' : 'Ver detalle' }}
                </a>
              </div>
            }
          </div>
        </div>
      } @else {
        <app-empty-state
          title="Sin liquidaciones"
          description="No hay eventos finalizados o liquidados que coincidan con los filtros." />
      }
    </div>
  `,
})
export class EventSettlementListComponent implements OnInit {
  private readonly settlementService = inject(EventSettlementService);

  protected readonly allItems = signal<SettlementListItem[]>([]);
  protected readonly search = signal('');
  protected readonly filterStatus = signal<SettlementFilterStatus>('all');
  protected readonly categoryLabels = EVENT_CATEGORY_LABELS;
  protected readonly EventStatus = EventStatus;

  protected readonly items = computed(() => {
    let list = this.allItems();
    const q = this.search().trim().toLowerCase();
    if (q) {
      list = list.filter(i =>
        i.event.name.toLowerCase().includes(q) || i.event.code.toLowerCase().includes(q),
      );
    }
    const status = this.filterStatus();
    if (status === 'pending') list = list.filter(i => i.event.status === EventStatus.FINISHED);
    if (status === 'settled') list = list.filter(i => i.event.status === EventStatus.SETTLED);
    return list;
  });

  protected readonly pendingCount = computed(() =>
    this.allItems().filter(i => i.event.status === EventStatus.FINISHED).length,
  );

  protected readonly settledCount = computed(() =>
    this.allItems().filter(i => i.event.status === EventStatus.SETTLED).length,
  );

  protected readonly totalRevenue = computed(() =>
    this.allItems().reduce((sum, i) => sum + i.settlement.totalRevenue, 0),
  );

  ngOnInit(): void {
    this.load();
  }

  protected onSearchChange(value: string): void {
    this.search.set(value);
  }

  protected setFilterStatus(value: SettlementFilterStatus): void {
    this.filterStatus.set(value);
  }

  private load(): void {
    this.settlementService.getSettlements().subscribe(list => this.allItems.set(list));
  }
}
