import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventFundraisingService, EventRevenueListItem } from '../../services/event-fundraising.service';
import { EventStatusBadgeComponent } from '../../components/event-status-badge/event-status-badge';
import { EmptyStateComponent } from '../../components/empty-state/empty-state';
import { EVENT_CATEGORY_LABELS } from '../../enums/event-category.enum';

@Component({
  selector: 'app-event-fundraising-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EventStatusBadgeComponent, EmptyStateComponent],
  template: `
    <div class="space-y-6">
      <nav class="text-sm text-slate-500" aria-label="Breadcrumb">
        <a routerLink="/eventos/listado" class="hover:text-brand">Eventos</a>
        <span class="mx-2">/</span>
        <span class="text-slate-800 font-medium">Recaudaciones</span>
      </nav>

      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Recaudaciones</h1>
        <p class="text-sm text-slate-500 mt-0.5">Ingresos por entradas, inscripciones, comidas, movilidad y otras ofertas del evento</p>
      </div>

      <div class="section-card p-4">
        <label for="search-fundraising" class="block text-xs font-semibold text-slate-500 mb-1">Buscar evento</label>
        <input id="search-fundraising" type="search" class="input-modern !py-1.5 !text-sm w-full max-w-md"
          placeholder="Nombre o código del evento..."
          [value]="search()" (input)="onSearch($any($event.target).value)" />
      </div>

      @if (items().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          @for (item of items(); track item.event.id) {
            <a [routerLink]="['/eventos/recaudaciones', item.event.id]"
              class="section-card p-4 hover:shadow-md transition-shadow block space-y-3">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="font-mono text-xs text-slate-500">{{ item.event.code }}</p>
                  <h2 class="font-bold text-slate-900 truncate">{{ item.event.name }}</h2>
                  <p class="text-xs text-slate-500 mt-0.5">{{ categoryLabels[item.event.category] }}</p>
                </div>
                <app-event-status-badge [status]="item.event.status" />
              </div>
              <p class="text-sm text-slate-600">{{ item.event.startDate }} · {{ item.event.startTime }}</p>
              <dl class="grid grid-cols-2 gap-2 text-sm">
                <div class="p-2 bg-slate-50 rounded-lg">
                  <dt class="text-xs text-slate-500">Entradas pagadas</dt>
                  <dd class="font-bold">{{ item.stats.ticketsPaid }}</dd>
                </div>
                <div class="p-2 bg-slate-50 rounded-lg">
                  <dt class="text-xs text-slate-500">Inscripciones pagadas</dt>
                  <dd class="font-bold">{{ item.stats.registrationsPaid }}</dd>
                </div>
                <div class="p-2 bg-green-50 rounded-lg col-span-2">
                  <dt class="text-xs text-green-700">Total recaudado</dt>
                  <dd class="font-bold text-green-800">S/ {{ item.stats.totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}</dd>
                </div>
              </dl>
              <span class="text-sm font-semibold text-brand">Ver recaudación →</span>
            </a>
          }
        </div>
      } @else {
        <app-empty-state
          title="Sin eventos"
          description="No hay eventos que coincidan con la búsqueda." />
      }
    </div>
  `,
})
export class EventFundraisingListComponent implements OnInit {
  private readonly fundraisingService = inject(EventFundraisingService);

  protected readonly items = signal<EventRevenueListItem[]>([]);
  protected readonly search = signal('');
  protected readonly categoryLabels = EVENT_CATEGORY_LABELS;

  private searchDebounce?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.load();
  }

  protected onSearch(value: string): void {
    this.search.set(value);
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.load(), 250);
  }

  private load(): void {
    this.fundraisingService.getRevenueEvents(this.search()).subscribe(list => this.items.set(list));
  }
}
