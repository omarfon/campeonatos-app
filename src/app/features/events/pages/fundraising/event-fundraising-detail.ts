import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventFundraisingService, EventRevenueStats } from '../../services/event-fundraising.service';
import { Event, BingoSerie, BingoBatch, EventConsumption, EventRegistration } from '../../models/event.model';
import { EventStatusBadgeComponent } from '../../components/event-status-badge/event-status-badge';
import { TICKET_STATUS_LABELS } from '../../enums/ticket-status.enum';
import { EventTicketService } from '../../services/event-ticket.service';
import { EventRegistrationService } from '../../services/event-registration.service';
import { EventTicket } from '../../models/event.model';
import { EventCategory, EVENT_CATEGORY_LABELS } from '../../enums/event-category.enum';

const SERIE_STATUS_LABELS: Record<BingoSerie['status'], string> = {
  generated: 'Generada',
  assigned: 'Asignada',
  delivered: 'Entregada',
  sold: 'Vendida',
  cancelled: 'Anulada',
};

const BATCH_STATUS_LABELS: Record<BingoBatch['status'], string> = {
  generated: 'Generado',
  assigned: 'Asignado',
  delivered: 'Entregado',
  sold: 'Vendido',
  cancelled: 'Anulado',
};

@Component({
  selector: 'app-event-fundraising-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EventStatusBadgeComponent],
  template: `
    @if (event(); as evt) {
      <div class="space-y-6">
        <nav class="text-sm text-slate-500" aria-label="Breadcrumb">
          <a routerLink="/eventos/listado" class="hover:text-brand">Eventos</a>
          <span class="mx-2">/</span>
          <a routerLink="/eventos/recaudaciones" class="hover:text-brand">Recaudaciones</a>
          <span class="mx-2">/</span>
          <span class="text-slate-800 font-medium truncate">{{ evt.name }}</span>
        </nav>

        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <p class="font-mono text-xs text-slate-500">{{ evt.code }} · {{ categoryLabels[evt.category] }}</p>
            <h1 class="text-2xl font-extrabold text-slate-900">Recaudación — {{ evt.name }}</h1>
            <p class="text-sm text-slate-500 mt-1">{{ evt.description }}</p>
            <div class="flex flex-wrap items-center gap-2 mt-2">
              <app-event-status-badge [status]="evt.status" />
              <span class="text-sm text-slate-600">{{ evt.startDate }} · {{ evt.startTime }} - {{ evt.endTime }}</span>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 shrink-0">
            <a [routerLink]="['/eventos', evt.id]" class="btn-ghost !text-sm">Ver evento</a>
            <a [routerLink]="['/eventos/inscripciones']" [queryParams]="{ evento: evt.id }" class="btn-ghost !text-sm">Inscripciones</a>
            <a [routerLink]="['/eventos/entradas']" [queryParams]="{ evento: evt.id }" class="btn-primary !text-sm">Entradas</a>
          </div>
        </div>

        @if (stats(); as s) {
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div class="section-card p-4">
              <p class="text-xs font-semibold text-slate-500 uppercase">Total recaudado</p>
              <p class="text-2xl font-extrabold text-green-700 mt-1">S/ {{ s.totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}</p>
            </div>
            <div class="section-card p-4">
              <p class="text-xs font-semibold text-slate-500 uppercase">Entradas pagadas</p>
              <p class="text-2xl font-extrabold text-slate-900 mt-1">{{ s.ticketsPaid }}<span class="text-sm font-normal text-slate-400"> / {{ s.ticketsTotal }}</span></p>
              <p class="text-xs text-slate-500 mt-1">S/ {{ s.ticketRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}</p>
            </div>
            <div class="section-card p-4">
              <p class="text-xs font-semibold text-slate-500 uppercase">Inscripciones pagadas</p>
              <p class="text-2xl font-extrabold text-slate-900 mt-1">{{ s.registrationsPaid }}<span class="text-sm font-normal text-slate-400"> / {{ s.registrationsTotal }}</span></p>
              <p class="text-xs text-slate-500 mt-1">S/ {{ s.registrationRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}</p>
            </div>
            <div class="section-card p-4">
              <p class="text-xs font-semibold text-slate-500 uppercase">Consumos</p>
              <p class="text-2xl font-extrabold text-slate-900 mt-1">{{ s.consumptionsTotal }}</p>
              <p class="text-xs text-slate-500 mt-1">S/ {{ s.consumptionRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 }) }} · {{ s.consumptionsDelivered }} entregados</p>
            </div>
          </div>

          <div class="section-card overflow-hidden">
            <div class="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-500">Desglose por concepto</h2>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-slate-200 bg-slate-50 text-left">
                    <th class="py-2 px-4 text-xs font-semibold text-slate-500">Concepto</th>
                    <th class="py-2 px-4 text-xs font-semibold text-slate-500">Cantidad</th>
                    <th class="py-2 px-4 text-xs font-semibold text-slate-500">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  @for (src of s.sources; track src.key) {
                    <tr class="border-b border-slate-50 hover:bg-slate-50">
                      <td class="py-2 px-4 font-medium text-slate-800">{{ src.label }}</td>
                      <td class="py-2 px-4 text-slate-600">{{ src.count }}</td>
                      <td class="py-2 px-4 font-semibold">S/ {{ src.amount.toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        @if (isFundraising()) {
          <div class="section-card overflow-hidden">
            <div class="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-500">Series de bingo</h2>
            </div>
            @if (series().length > 0) {
              <div class="divide-y divide-slate-100">
                @for (serie of series(); track serie.id) {
                  <div class="px-4 py-4 space-y-2">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 class="font-bold text-slate-800">{{ serie.name }}</h3>
                        <p class="text-xs text-slate-500 font-mono">
                          {{ pad(serie.startNumber) }} → {{ pad(serie.endNumber) }} · S/ {{ serie.price }}
                        </p>
                      </div>
                      <span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                        {{ serieStatusLabels[serie.status] }}
                      </span>
                    </div>
                    <p class="text-sm text-slate-600">{{ serie.cardCount }} cartillas · {{ batchesForSerie(serie.id).length }} lote(s)</p>
                  </div>
                }
              </div>
            } @else {
              <p class="px-4 py-6 text-sm text-slate-500">Sin series de bingo configuradas.</p>
            }
          </div>
        }

        @if (consumptions().length > 0) {
          <div class="section-card overflow-hidden">
            <div class="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-500">Consumos registrados</h2>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-slate-200 bg-slate-50 text-left">
                    <th class="py-2 px-3 text-xs font-semibold text-slate-500">Participante</th>
                    <th class="py-2 px-3 text-xs font-semibold text-slate-500">Opción</th>
                    <th class="py-2 px-3 text-xs font-semibold text-slate-500">Cant.</th>
                    <th class="py-2 px-3 text-xs font-semibold text-slate-500">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  @for (c of consumptions(); track c.id) {
                    <tr class="border-b border-slate-50">
                      <td class="py-2 px-3">{{ c.participantName }}</td>
                      <td class="py-2 px-3">{{ c.optionName }}</td>
                      <td class="py-2 px-3">{{ c.quantity }}</td>
                      <td class="py-2 px-3">{{ c.status === 'delivered' ? 'Entregado' : 'Pendiente' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        @if (registrations().length > 0) {
          <div class="section-card overflow-hidden">
            <div class="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-500">Inscripciones con pago</h2>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-slate-200 bg-slate-50 text-left">
                    <th class="py-2 px-3 text-xs font-semibold text-slate-500">Código</th>
                    <th class="py-2 px-3 text-xs font-semibold text-slate-500">Participante</th>
                    <th class="py-2 px-3 text-xs font-semibold text-slate-500">Tarifa</th>
                    <th class="py-2 px-3 text-xs font-semibold text-slate-500">Pago</th>
                  </tr>
                </thead>
                <tbody>
                  @for (reg of registrations(); track reg.id) {
                    <tr class="border-b border-slate-50">
                      <td class="py-2 px-3 font-mono text-xs">{{ reg.code }}</td>
                      <td class="py-2 px-3">{{ reg.personName }}</td>
                      <td class="py-2 px-3">S/ {{ reg.rateAmount.toFixed(2) }}</td>
                      <td class="py-2 px-3">{{ paymentLabel(reg.paymentStatus) }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <div class="section-card overflow-hidden">
          <div class="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-500">Entradas emitidas</h2>
            <span class="text-xs text-slate-500">{{ tickets().length }} registros</span>
          </div>
          @if (tickets().length > 0) {
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-slate-200 bg-slate-50 text-left">
                    <th class="py-2 px-3 text-xs font-semibold text-slate-500">Código</th>
                    <th class="py-2 px-3 text-xs font-semibold text-slate-500">Participante</th>
                    <th class="py-2 px-3 text-xs font-semibold text-slate-500">Precio</th>
                    <th class="py-2 px-3 text-xs font-semibold text-slate-500">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  @for (tkt of tickets(); track tkt.id) {
                    <tr class="border-b border-slate-50 hover:bg-slate-50">
                      <td class="py-2 px-3 font-mono text-xs">{{ tkt.code }}</td>
                      <td class="py-2 px-3">{{ tkt.participantName }}</td>
                      <td class="py-2 px-3">S/ {{ tkt.price.toFixed(2) }}</td>
                      <td class="py-2 px-3">{{ ticketStatusLabels[tkt.status] }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <p class="px-4 py-6 text-sm text-slate-500">Aún no hay entradas emitidas para este evento.</p>
          }
        </div>
      </div>
    } @else if (notFound()) {
      <div class="space-y-4 text-center py-16">
        <p class="text-slate-500">Evento no encontrado.</p>
        <a routerLink="/eventos/recaudaciones" class="btn-primary inline-block">Volver al listado</a>
      </div>
    } @else {
      <p class="text-center py-16 text-slate-400">Cargando recaudación...</p>
    }
  `,
})
export class EventFundraisingDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fundraisingService = inject(EventFundraisingService);
  private readonly ticketService = inject(EventTicketService);
  private readonly registrationService = inject(EventRegistrationService);

  protected readonly EventCategory = EventCategory;
  protected readonly categoryLabels = EVENT_CATEGORY_LABELS;
  protected readonly serieStatusLabels = SERIE_STATUS_LABELS;
  protected readonly batchStatusLabels = BATCH_STATUS_LABELS;
  protected readonly ticketStatusLabels = TICKET_STATUS_LABELS;

  protected readonly event = signal<Event | undefined>(undefined);
  protected readonly stats = signal<EventRevenueStats | null>(null);
  protected readonly tickets = signal<EventTicket[]>([]);
  protected readonly registrations = signal<EventRegistration[]>([]);
  protected readonly consumptions = signal<EventConsumption[]>([]);
  protected readonly notFound = signal(false);

  protected readonly series = computed(() => this.event()?.categoryConfig.bingoSeries ?? []);
  protected readonly batches = computed(() => this.event()?.categoryConfig.bingoBatches ?? []);
  protected readonly isFundraising = computed(() => this.event()?.category === EventCategory.FUNDRAISING);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.fundraisingService.getRevenueEvent(id).subscribe(evt => {
      if (!evt) {
        this.notFound.set(true);
        return;
      }
      this.event.set(evt);
      this.stats.set(this.fundraisingService.getRevenueStats(evt));
      this.consumptions.set(this.fundraisingService.getConsumptionsForEvent(id));
      this.ticketService.getTickets({ eventId: id }).subscribe(t => this.tickets.set(t));
      this.registrationService.getByEvent(id).subscribe(r => this.registrations.set(r));
    });
  }

  protected batchesForSerie(serieId: string): BingoBatch[] {
    return this.batches().filter(b => b.serieId === serieId);
  }

  protected pad(n: number): string {
    return String(n).padStart(6, '0');
  }

  protected paymentLabel(status: EventRegistration['paymentStatus']): string {
    const labels: Record<EventRegistration['paymentStatus'], string> = {
      pending: 'Pendiente',
      paid: 'Pagado',
      partial: 'Parcial',
      exempt: 'Exento',
    };
    return labels[status];
  }
}
