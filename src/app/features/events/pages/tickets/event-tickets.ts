import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventTicketService, EventTicketSummary } from '../../services/event-ticket.service';
import { EventService } from '../../services/event.service';
import { Event, EventTicket, getAvailableCapacity } from '../../models/event.model';
import { TICKET_STATUS_LABELS, TicketStatus } from '../../enums/ticket-status.enum';
import { EventStatusBadgeComponent } from '../../components/event-status-badge/event-status-badge';
import { EmptyStateComponent } from '../../components/empty-state/empty-state';
import { confirmDialog } from '../../../../shared/confirm-dialog';

@Component({
  selector: 'app-event-tickets',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, EmptyStateComponent, EventStatusBadgeComponent],
  template: `
    <div class="space-y-6">
      <nav class="text-sm text-slate-500" aria-label="Breadcrumb">
        <a routerLink="/eventos/listado" class="hover:text-brand">Eventos</a>
        <span class="mx-2">/</span>
        <span class="text-slate-800 font-medium">Entradas</span>
      </nav>

      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Entradas</h1>
        <p class="text-sm text-slate-500 mt-0.5">
          @if (filterEventId()) {
            {{ tickets().length }} entrada{{ tickets().length === 1 ? '' : 's' }} · {{ selectedEventName() }}
          } @else {
            {{ tickets().length }} entrada{{ tickets().length === 1 ? '' : 's' }} en total
          }
        </p>
      </div>

      <div class="section-card p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label for="filter-event-tickets" class="block text-xs font-semibold text-slate-500 mb-1">Evento</label>
            <select id="filter-event-tickets" class="input-modern !py-1.5 !text-sm w-full"
              [ngModel]="filterEventId()" (ngModelChange)="setFilterEvent($event)">
              <option value="">Todos los eventos</option>
              @for (e of events(); track e.id) {
                <option [value]="e.id">{{ e.name }}</option>
              }
            </select>
          </div>
          <div class="sm:col-span-2">
            <label for="search-tickets" class="block text-xs font-semibold text-slate-500 mb-1">Buscar entrada</label>
            <input id="search-tickets" type="search" class="input-modern !py-1.5 !text-sm w-full"
              placeholder="Código, participante o documento..."
              [ngModel]="search()" (ngModelChange)="onSearchChange($event)" />
          </div>
        </div>
        @if (hasActiveFilters()) {
          <div class="mt-3 flex justify-end">
            <button type="button" class="btn-ghost !text-sm" (click)="clearFilters()">Limpiar filtros</button>
          </div>
        }
      </div>

      @if (selectedEvent(); as evt) {
        @if (summary(); as s) {
          <div class="section-card p-4 space-y-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 class="text-lg font-bold text-slate-900">Reporte de entradas</h2>
                <p class="text-sm text-slate-500">{{ evt.name }} · {{ evt.startDate }}</p>
              </div>
              <app-event-status-badge [status]="evt.status" />
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div class="p-3 bg-slate-50 rounded-xl">
                <p class="text-xs font-semibold text-slate-500 uppercase">Colocadas</p>
                <p class="text-2xl font-extrabold text-slate-900">{{ s.placed }}</p>
                @if (s.targetToGenerate > 0) {
                  <p class="text-[10px] text-slate-400">Meta: {{ s.targetToGenerate }}</p>
                }
              </div>
              <div class="p-3 bg-green-50 rounded-xl">
                <p class="text-xs font-semibold text-green-700 uppercase">Pagadas</p>
                <p class="text-2xl font-extrabold text-green-800">{{ s.paid }}</p>
              </div>
              <div class="p-3 bg-amber-50 rounded-xl">
                <p class="text-xs font-semibold text-amber-700 uppercase">Pend. pago</p>
                <p class="text-2xl font-extrabold text-amber-800">{{ s.pendingPayment }}</p>
              </div>
              <div class="p-3 bg-blue-50 rounded-xl">
                <p class="text-xs font-semibold text-blue-700 uppercase">Entregadas</p>
                <p class="text-2xl font-extrabold text-blue-800">{{ s.delivered }}</p>
              </div>
              <div class="p-3 bg-violet-50 rounded-xl">
                <p class="text-xs font-semibold text-violet-700 uppercase">Usadas</p>
                <p class="text-2xl font-extrabold text-violet-800">{{ s.used }}</p>
              </div>
              <div class="p-3 bg-red-50 rounded-xl">
                <p class="text-xs font-semibold text-red-700 uppercase">Anuladas</p>
                <p class="text-2xl font-extrabold text-red-800">{{ s.cancelled }}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
              <div class="text-sm">
                <p class="text-slate-500">Ingresos cobrados</p>
                <p class="text-lg font-bold text-green-700">S/ {{ s.collectedRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}</p>
              </div>
              <div class="text-sm">
                <p class="text-slate-500">Ingresos pendientes</p>
                <p class="text-lg font-bold text-amber-700">S/ {{ s.pendingRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}</p>
              </div>
              <div class="text-sm">
                <p class="text-slate-500">Aforo del evento</p>
                <p class="text-lg font-bold text-slate-800">{{ evt.capacity.totalCapacity }}</p>
              </div>
              <div class="text-sm">
                <p class="text-slate-500">Cupos disponibles</p>
                <p class="text-lg font-bold text-slate-800">{{ availableCapacity(evt) }}</p>
              </div>
            </div>

            @if (s.targetToGenerate > 0) {
              <div class="space-y-1">
                <div class="flex justify-between text-xs text-slate-500">
                  <span>Avance de colocación</span>
                  <span>{{ placementPct(s) }}%</span>
                </div>
                <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-brand rounded-full transition-all" [style.width.%]="placementPct(s)"></div>
                </div>
              </div>
            }
          </div>
        }
      }

      <div class="section-card overflow-hidden">
        @if (tickets().length > 0) {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-200 bg-slate-50 text-left">
                  <th class="py-2 px-3 text-xs font-semibold text-slate-500">Código</th>
                  <th class="py-2 px-3 text-xs font-semibold text-slate-500">Evento</th>
                  <th class="py-2 px-3 text-xs font-semibold text-slate-500">Participante</th>
                  <th class="py-2 px-3 text-xs font-semibold text-slate-500">Precio</th>
                  <th class="py-2 px-3 text-xs font-semibold text-slate-500">Estado</th>
                  <th class="py-2 px-3 text-xs font-semibold text-slate-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (tkt of tickets(); track tkt.id) {
                  <tr class="border-b border-slate-50 hover:bg-slate-50">
                    <td class="py-2 px-3 font-mono text-xs">{{ tkt.code }}</td>
                    <td class="py-2 px-3">{{ tkt.eventName }}</td>
                    <td class="py-2 px-3">{{ tkt.participantName }}</td>
                    <td class="py-2 px-3">S/ {{ tkt.price.toFixed(2) }}</td>
                    <td class="py-2 px-3">{{ statusLabels[tkt.status] }}</td>
                    <td class="py-2 px-3">
                      <div class="flex gap-1">
                        <button type="button" class="btn-ghost !text-xs !px-2" (click)="viewTicket(tkt)">Ver</button>
                        @if (tkt.status !== TicketStatus.CANCELLED && tkt.status !== TicketStatus.USED) {
                          <button type="button" class="btn-ghost !text-xs !px-2 !text-red-600" (click)="cancelTicket(tkt)">Anular</button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <app-empty-state
            [title]="hasActiveFilters() ? 'Sin entradas para los filtros aplicados' : 'Sin entradas'"
            [description]="hasActiveFilters() ? 'Prueba otro evento o ajusta la búsqueda.' : 'Aún no hay entradas registradas.'" />
        }
      </div>

      @if (selectedTicket(); as tkt) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div class="section-card p-6 w-full max-w-md">
            <div class="text-center border-2 border-dashed border-brand rounded-xl p-6 space-y-3">
              <h2 class="text-lg font-bold">{{ tkt.eventName }}</h2>
              <p class="font-mono text-2xl font-bold text-brand">{{ tkt.code }}</p>
              <p class="text-sm">{{ tkt.participantName }}</p>
              <p class="text-xs text-slate-500">DNI: {{ tkt.documentNumber }}</p>
              <p class="text-sm">{{ tkt.eventDate }} · {{ tkt.eventTime }}</p>
              <p class="text-sm">{{ tkt.environmentName }}</p>
              <div class="w-24 h-24 mx-auto bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400">QR MOCK</div>
              <span class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">{{ statusLabels[tkt.status] }}</span>
            </div>
            <button type="button" class="btn-ghost w-full mt-4" (click)="selectedTicket.set(null)">Cerrar</button>
          </div>
        </div>
      }
    </div>
  `,
})
export class EventTicketsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly ticketService = inject(EventTicketService);
  private readonly eventService = inject(EventService);

  protected readonly TicketStatus = TicketStatus;
  protected readonly tickets = signal<EventTicket[]>([]);
  protected readonly events = signal<Event[]>([]);
  protected readonly search = signal('');
  protected readonly filterEventId = signal('');
  protected readonly summary = signal<EventTicketSummary | null>(null);
  protected readonly selectedTicket = signal<EventTicket | null>(null);
  protected readonly statusLabels = TICKET_STATUS_LABELS;

  private searchDebounce?: ReturnType<typeof setTimeout>;

  protected readonly hasActiveFilters = computed(() =>
    !!this.filterEventId() || !!this.search().trim(),
  );

  protected readonly selectedEventName = computed(() =>
    this.events().find(e => e.id === this.filterEventId())?.name ?? '',
  );

  protected readonly selectedEvent = computed(() =>
    this.events().find(e => e.id === this.filterEventId()),
  );

  ngOnInit(): void {
    const qEvent = this.route.snapshot.queryParamMap.get('evento');
    if (qEvent) this.filterEventId.set(qEvent);

    this.eventService.getEvents().subscribe(list => {
      this.events.set(list);
      this.load();
    });
  }

  protected setFilterEvent(value: string): void {
    this.filterEventId.set(value);
    this.load();
  }

  protected onSearchChange(value: string): void {
    this.search.set(value);
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.load(), 250);
  }

  protected clearFilters(): void {
    this.search.set('');
    this.filterEventId.set('');
    this.summary.set(null);
    this.load();
  }

  protected availableCapacity(evt: Event): number {
    return getAvailableCapacity(evt.capacity);
  }

  protected placementPct(s: EventTicketSummary): number {
    if (!s.targetToGenerate) return 0;
    return Math.min(100, Math.round((s.placed / s.targetToGenerate) * 100));
  }

  protected load(): void {
    const eventId = this.filterEventId();
    this.ticketService.getTickets({
      eventId: eventId || undefined,
      search: this.search().trim() || undefined,
    }).subscribe(t => this.tickets.set(t));

    if (eventId) {
      const evt = this.events().find(e => e.id === eventId);
      const target = evt?.categoryConfig.ticketGeneration?.pools
        .reduce((sum, p) => sum + p.quantityToGenerate, 0) ?? evt?.capacity.totalCapacity ?? 0;
      this.ticketService.getTicketSummary(eventId, target).subscribe(s => this.summary.set(s));
    } else {
      this.summary.set(null);
    }
  }

  protected viewTicket(tkt: EventTicket): void {
    this.selectedTicket.set(tkt);
  }

  protected async cancelTicket(tkt: EventTicket): Promise<void> {
    const reason = prompt('Motivo de anulación (obligatorio):');
    if (!reason?.trim()) return;
    const ok = await confirmDialog({ title: 'Anular entrada', text: 'Esta operación cambiará el estado de la entrada a ANULADA.', confirmText: 'Anular' });
    if (ok) {
      this.ticketService.cancelTicket(tkt.id, reason, 'usr-1', 'administrador').subscribe(() => this.load());
    }
  }
}
