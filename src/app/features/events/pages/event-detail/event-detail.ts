import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { EventAuditService } from '../../services/event-audit.service';
import { EventRegistrationService } from '../../services/event-registration.service';
import { EventTicketService } from '../../services/event-ticket.service';
import { Event, EventAudit, getAvailableCapacity } from '../../models/event.model';
import { EventStatusBadgeComponent } from '../../components/event-status-badge/event-status-badge';
import { EventCapacityBarComponent } from '../../components/event-capacity-bar/event-capacity-bar';
import { EventRateMatrixComponent } from '../../components/rate-matrix/event-rate-matrix';
import { EventAuditTimelineComponent } from '../../components/audit-timeline/event-audit-timeline';
import { EVENT_CATEGORY_LABELS } from '../../enums/event-category.enum';
import { EventStatus } from '../../enums/event-status.enum';

@Component({
  selector: 'app-event-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, EventStatusBadgeComponent, EventCapacityBarComponent,
    EventRateMatrixComponent, EventAuditTimelineComponent,
  ],
  template: `
    @if (event(); as evt) {
      <div class="space-y-6">
        <nav class="text-sm text-slate-500">
          <a routerLink="/eventos" class="hover:text-brand">Eventos</a>
          <span class="mx-2">/</span>
          <span class="text-slate-800 font-medium">{{ evt.name }}</span>
        </nav>

        <div class="section-card p-6">
          <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <div class="flex items-center gap-3 flex-wrap">
                <h1 class="text-2xl font-extrabold text-slate-900">{{ evt.name }}</h1>
                <app-event-status-badge [status]="evt.status" />
              </div>
              <p class="text-slate-500 mt-1">{{ evt.startDate }} · {{ evt.startTime }} - {{ evt.endTime }} · {{ evt.venueName }}</p>
              <p class="text-sm text-slate-600 mt-2">{{ evt.description }}</p>
              @if (evt.personalTicketRequired) {
                <p class="mt-2 text-sm font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg inline-block">
                  Las entradas para este evento son personales e intransferibles.
                </p>
              }
            </div>
            <div class="flex flex-wrap gap-2 shrink-0">
              @if (canEdit(evt)) {
                <a [routerLink]="['/eventos', evt.id, 'editar']" class="btn-primary !text-sm">Editar</a>
              }
              <a [routerLink]="['/eventos/inscripciones']" [queryParams]="{ evento: evt.id }" class="btn-ghost !text-sm">Inscripciones</a>
              <a [routerLink]="['/eventos/entradas']" [queryParams]="{ evento: evt.id }" class="btn-ghost !text-sm">Entradas</a>
              <a [routerLink]="['/eventos/control-entradas']" [queryParams]="{ evento: evt.id }" class="btn-ghost !text-sm">Control tickets</a>
              <a [routerLink]="['/eventos/recaudaciones', evt.id]" class="btn-ghost !text-sm">Ver recaudación</a>
              @if (evt.status === EventStatus.FINISHED) {
                <a [routerLink]="['/eventos', evt.id, 'liquidacion']" class="btn-primary !text-sm">Liquidar</a>
              }
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="section-card p-4 text-center">
            <p class="text-xs font-semibold text-slate-500 uppercase">Aforo</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">{{ evt.capacity.confirmedCapacity }} / {{ evt.capacity.totalCapacity }}</p>
            <app-event-capacity-bar [capacity]="evt.capacity" />
          </div>
          <div class="section-card p-4 text-center">
            <p class="text-xs font-semibold text-slate-500 uppercase">Cupos</p>
            <p class="text-2xl font-bold text-brand mt-1">{{ available(evt) }}</p>
          </div>
          <div class="section-card p-4 text-center">
            <p class="text-xs font-semibold text-slate-500 uppercase">Inscripciones</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">{{ registrationCount() }}</p>
          </div>
          <div class="section-card p-4 text-center">
            <p class="text-xs font-semibold text-slate-500 uppercase">Entradas</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">{{ ticketCount() }}</p>
          </div>
        </div>

        <div class="section-card">
          <div class="flex border-b border-slate-200 overflow-x-auto" role="tablist">
            @for (tab of tabs; track tab.id) {
              <button type="button" role="tab" class="px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors"
                [class]="activeTab() === tab.id ? 'text-brand border-b-2 border-brand' : 'text-slate-500 hover:text-slate-700'"
                [attr.aria-selected]="activeTab() === tab.id"
                (click)="activeTab.set(tab.id)">
                {{ tab.label }}
              </button>
            }
          </div>

          <div class="p-6">
            @switch (activeTab()) {
              @case ('resumen') {
                <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div><dt class="text-slate-500">Código</dt><dd class="font-semibold">{{ evt.code }}</dd></div>
                  <div><dt class="text-slate-500">Categoría</dt><dd class="font-semibold">{{ categoryLabels[evt.category] }}</dd></div>
                  <div><dt class="text-slate-500">Tipo</dt><dd class="font-semibold">{{ evt.typeName }}</dd></div>
                  <div><dt class="text-slate-500">Compañía</dt><dd class="font-semibold">{{ evt.companyName }}</dd></div>
                  <div><dt class="text-slate-500">Inscripciones</dt><dd class="font-semibold">{{ evt.registrationStartDate }} - {{ evt.registrationEndDate }}</dd></div>
                  <div><dt class="text-slate-500">Público</dt><dd class="font-semibold">{{ evt.isPublic ? 'Sí' : 'No' }} · Socios: {{ evt.membersOnly ? 'Exclusivo' : 'Abierto' }}</dd></div>
                </dl>
              }
              @case ('ambientes') {
                <div class="space-y-3">
                  @for (env of evt.environments; track env.environmentId) {
                    <div class="rounded-lg border border-slate-200 p-3 flex flex-wrap gap-4 text-sm">
                      <span class="font-semibold">{{ env.environmentName }}</span>
                      <span class="text-slate-500">{{ env.venueName }}</span>
                      <span>{{ env.startDate }} {{ env.startTime }} - {{ env.endTime }}</span>
                      <span>Cap: {{ env.capacity }}</span>
                    </div>
                  } @empty {
                    <p class="text-slate-400 italic">Sin ambientes asignados</p>
                  }
                </div>
              }
              @case ('tarifas') {
                <app-event-rate-matrix [rates]="evt.rates" [disabled]="true" />
              }
              @case ('auditoria') {
                <app-event-audit-timeline [audits]="audits()" />
              }
              @case ('entradas') {
                @if (evt.categoryConfig.ticketGeneration?.pools?.length) {
                  <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                      <thead>
                        <tr class="border-b border-slate-200 bg-slate-50 text-left">
                          <th class="py-2 px-3 text-xs font-semibold text-slate-500">Tipo</th>
                          <th class="py-2 px-3 text-xs font-semibold text-slate-500 text-right">A generar</th>
                          <th class="py-2 px-3 text-xs font-semibold text-slate-500 text-right">Generados</th>
                          <th class="py-2 px-3 text-xs font-semibold text-slate-500">Prefijo</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (pool of evt.categoryConfig.ticketGeneration!.pools; track pool.id) {
                          @if (pool.enabled) {
                            <tr class="border-b border-slate-50">
                              <td class="py-2 px-3">{{ pool.label }}</td>
                              <td class="py-2 px-3 text-right font-semibold">{{ pool.quantityToGenerate }}</td>
                              <td class="py-2 px-3 text-right text-slate-500">{{ pool.generatedCount }}</td>
                              <td class="py-2 px-3 font-mono text-xs">{{ pool.prefix }}</td>
                            </tr>
                          }
                        }
                      </tbody>
                    </table>
                  </div>
                } @else {
                  <p class="text-slate-400 italic">Sin configuración de generación de tickets.</p>
                }
              }
              @default {
                <p class="text-slate-400 italic">Sección en desarrollo — datos disponibles en sub-módulos.</p>
              }
            }
          </div>
        </div>
      </div>
    } @else {
      <p class="text-center py-16 text-slate-400">Cargando evento...</p>
    }
  `,
})
export class EventDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  private readonly auditService = inject(EventAuditService);
  private readonly registrationService = inject(EventRegistrationService);
  private readonly ticketService = inject(EventTicketService);

  protected readonly EventStatus = EventStatus;
  protected readonly categoryLabels = EVENT_CATEGORY_LABELS;
  protected readonly event = signal<Event | undefined>(undefined);
  protected readonly audits = signal<EventAudit[]>([]);
  protected readonly activeTab = signal('resumen');
  protected readonly registrationCount = signal(0);
  protected readonly ticketCount = signal(0);

  protected readonly tabs = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'config', label: 'Configuración' },
    { id: 'ambientes', label: 'Ambientes' },
    { id: 'tarifas', label: 'Tarifas' },
    { id: 'inscripciones', label: 'Inscripciones' },
    { id: 'entradas', label: 'Entradas' },
    { id: 'consumos', label: 'Consumos' },
    { id: 'finanzas', label: 'Finanzas' },
    { id: 'auditoria', label: 'Auditoría' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.eventService.getEvent(id).subscribe(evt => {
      if (evt) {
        this.event.set(evt);
        this.auditService.getAudits(id).subscribe(a => this.audits.set(a));
        this.registrationService.getByEvent(id).subscribe(r => this.registrationCount.set(r.length));
        this.ticketService.getTickets({ eventId: id }).subscribe(t => this.ticketCount.set(t.length));
      }
    });
  }

  protected available(evt: Event): number {
    return getAvailableCapacity(evt.capacity);
  }

  protected canEdit(evt: Event): boolean {
    return evt.status !== EventStatus.SETTLED;
  }
}
