import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { EventTicketControlService } from '../../services/event-ticket-control.service';
import { EventTicketService } from '../../services/event-ticket.service';
import { Event, EventTicket } from '../../models/event.model';
import { EventTicketGroupAssignment, EventTicketPoolSummary } from '../../models/event-ticket-control.model';
import { TicketStatus, TICKET_STATUS_LABELS } from '../../enums/ticket-status.enum';
import { confirmDialog } from '../../../../shared/confirm-dialog';

type TabId = 'pools' | 'grupos' | 'tickets' | 'escaneo';

@Component({
  selector: 'app-ticket-control',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold">Control de tickets</h1>
          <p class="text-sm text-slate-500">Tickets generados en la creación del evento, asignación a grupos internos, pagos y asistencia</p>
        </div>
        <div class="min-w-[240px]">
          <label class="block text-xs font-semibold text-slate-500 mb-1" for="evt-select">Evento</label>
          <select id="evt-select" class="input-modern !py-2 !text-sm w-full"
            [ngModel]="selectedEventId()" (ngModelChange)="selectEvent($event)">
            @for (e of events(); track e.id) {
              <option [value]="e.id">{{ e.name }}</option>
            }
          </select>
        </div>
      </div>

      @if (selectedEvent(); as evt) {
        <div class="flex border-b border-slate-200 overflow-x-auto" role="tablist">
          @for (tab of tabs; track tab.id) {
            <button type="button" role="tab" class="px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors"
              [class]="activeTab() === tab.id ? 'text-brand border-b-2 border-brand' : 'text-slate-500 hover:text-slate-700'"
              [attr.aria-selected]="activeTab() === tab.id"
              (click)="activeTab.set(tab.id)">
              {{ tab.label }}
            </button>
          }
        </div>

        @switch (activeTab()) {
          @case ('pools') {
            <div class="space-y-4">
              @if (poolSummaries().length) {
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  @for (pool of poolSummaries(); track pool.poolId) {
                    <div class="section-card p-4 space-y-3">
                      <div class="flex items-start justify-between gap-2">
                        <div>
                          <h3 class="font-bold text-slate-800">{{ pool.poolLabel }}</h3>
                          <p class="text-xs text-slate-500 font-mono">Prefijo: {{ pool.prefix }}</p>
                        </div>
                        <span class="text-xs px-2 py-0.5 rounded-full bg-brand/10 text-brand font-semibold">
                          Meta: {{ pool.quantityToGenerate }}
                        </span>
                      </div>
                      <dl class="grid grid-cols-2 gap-2 text-sm">
                        <div class="p-2 bg-slate-50 rounded-lg"><dt class="text-xs text-slate-500">Generados</dt><dd class="font-bold">{{ pool.generatedCount }}</dd></div>
                        <div class="p-2 bg-slate-50 rounded-lg"><dt class="text-xs text-slate-500">Asignados</dt><dd class="font-bold">{{ pool.assignedCount }}</dd></div>
                        <div class="p-2 bg-green-50 rounded-lg"><dt class="text-xs text-green-700">Pagados</dt><dd class="font-bold text-green-800">{{ pool.paidCount }}</dd></div>
                        <div class="p-2 bg-blue-50 rounded-lg"><dt class="text-xs text-blue-700">Asistieron</dt><dd class="font-bold text-blue-800">{{ pool.attendedCount }}</dd></div>
                      </dl>
                      @if (pool.generatedCount < pool.quantityToGenerate) {
                        <button type="button" class="btn-primary !text-xs w-full" [disabled]="generating()"
                          (click)="generateTickets()">
                          {{ generating() ? 'Generando…' : 'Generar ' + (pool.quantityToGenerate - pool.generatedCount) + ' ticket(s)' }}
                        </button>
                      } @else {
                        <p class="text-xs text-green-700 font-semibold text-center">✓ Pool completo</p>
                      }
                    </div>
                  }
                </div>
              } @else {
                <p class="text-sm text-slate-400 italic p-6 section-card text-center">
                  Este evento no tiene pools de tickets configurados. Configure la generación en el paso 6 del wizard.
                </p>
              }
            </div>
          }

          @case ('grupos') {
            <div class="space-y-4">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <p class="text-sm text-slate-600">Asigne rangos de numeración a equipos o grupos internos del club.</p>
                <button type="button" class="btn-primary !text-sm" [disabled]="!canAssign()"
                  (click)="openAssignModal()">+ Asignar a grupo</button>
              </div>

              @if (assignments().length) {
                <div class="section-card overflow-hidden">
                  <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                      <thead>
                        <tr class="border-b border-slate-200 bg-slate-50 text-left">
                          <th class="py-2 px-3 text-xs font-semibold text-slate-500">Grupo interno</th>
                          <th class="py-2 px-3 text-xs font-semibold text-slate-500">Responsable</th>
                          <th class="py-2 px-3 text-xs font-semibold text-slate-500">Tipo ticket</th>
                          <th class="py-2 px-3 text-xs font-semibold text-slate-500">Numeración</th>
                          <th class="py-2 px-3 text-xs font-semibold text-slate-500 text-right">Cant.</th>
                          <th class="py-2 px-3 text-xs font-semibold text-slate-500 text-right">Pagados</th>
                          <th class="py-2 px-3 text-xs font-semibold text-slate-500 text-right">Asistencia</th>
                          <th class="py-2 px-3 text-xs font-semibold text-slate-500">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (g of assignments(); track g.id) {
                          <tr class="border-b border-slate-50 hover:bg-slate-50">
                            <td class="py-2 px-3 font-semibold">{{ g.groupName }}</td>
                            <td class="py-2 px-3">{{ g.responsibleName }}</td>
                            <td class="py-2 px-3 text-xs text-slate-500">{{ g.poolLabel }}</td>
                            <td class="py-2 px-3 font-mono text-xs">{{ g.startNumber }} – {{ g.endNumber }}</td>
                            <td class="py-2 px-3 text-right">{{ g.ticketCount }}</td>
                            <td class="py-2 px-3 text-right">
                              <span [class]="g.paidCount === g.ticketCount ? 'text-green-700 font-semibold' : 'text-amber-700'">
                                {{ g.paidCount }}/{{ g.ticketCount }}
                              </span>
                            </td>
                            <td class="py-2 px-3 text-right">
                              <span [class]="g.attendedCount === g.ticketCount ? 'text-green-700 font-semibold' : 'text-slate-600'">
                                {{ g.attendedCount }}/{{ g.ticketCount }}
                              </span>
                            </td>
                            <td class="py-2 px-3">
                              <div class="flex flex-wrap gap-1">
                                <button type="button" class="btn-ghost !text-xs !px-2" (click)="filterByGroup(g.id)">Ver</button>
                                <button type="button" class="btn-ghost !text-xs !px-2" (click)="markGroupPaid(g.id)">Cobrar</button>
                                <button type="button" class="btn-ghost !text-xs !px-2" (click)="markGroupAttended(g.id)">Asistió</button>
                              </div>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              } @else {
                <p class="text-sm text-slate-400 italic p-6 section-card text-center">
                  Sin asignaciones. Genere tickets y asigne rangos a grupos como «Equipo Los Delfines».
                </p>
              }
            </div>
          }

          @case ('tickets') {
            <div class="space-y-3">
              <div class="flex flex-wrap gap-3">
                <input class="input-modern !py-1.5 !text-sm flex-1 min-w-[200px]" placeholder="Buscar código, número o grupo…"
                  [ngModel]="ticketSearch()" (ngModelChange)="ticketSearch.set($event); loadTickets()" />
                @if (groupFilter()) {
                  <button type="button" class="btn-ghost !text-xs" (click)="clearGroupFilter()">Quitar filtro grupo</button>
                }
              </div>
              <div class="section-card overflow-hidden">
                @if (tickets().length) {
                  <div class="overflow-x-auto max-h-[420px] overflow-y-auto">
                    <table class="w-full text-sm">
                      <thead class="sticky top-0 bg-slate-50">
                        <tr class="border-b border-slate-200 text-left">
                          <th class="py-2 px-3 text-xs font-semibold text-slate-500">Nº</th>
                          <th class="py-2 px-3 text-xs font-semibold text-slate-500">Código</th>
                          <th class="py-2 px-3 text-xs font-semibold text-slate-500">Grupo</th>
                          <th class="py-2 px-3 text-xs font-semibold text-slate-500">Pago</th>
                          <th class="py-2 px-3 text-xs font-semibold text-slate-500">Asistencia</th>
                          <th class="py-2 px-3 text-xs font-semibold text-slate-500">Estado</th>
                          <th class="py-2 px-3 text-xs font-semibold text-slate-500">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (t of tickets(); track t.id) {
                          <tr class="border-b border-slate-50 hover:bg-slate-50">
                            <td class="py-2 px-3 font-mono">{{ t.sequenceNumber ?? '—' }}</td>
                            <td class="py-2 px-3 font-mono text-xs">{{ t.code }}</td>
                            <td class="py-2 px-3 text-xs">{{ t.groupName ?? 'Sin asignar' }}</td>
                            <td class="py-2 px-3">
                              <span class="text-xs px-2 py-0.5 rounded-full"
                                [class]="t.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'">
                                {{ t.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente' }}
                              </span>
                            </td>
                            <td class="py-2 px-3">{{ t.attended ? '✓ Sí' : '—' }}</td>
                            <td class="py-2 px-3 text-xs">{{ statusLabels[t.status] }}</td>
                            <td class="py-2 px-3">
                              <div class="flex gap-1">
                                @if (t.paymentStatus !== 'paid') {
                                  <button type="button" class="btn-ghost !text-xs !px-1.5" (click)="payTicket(t.id)">Pago</button>
                                }
                                @if (!t.attended && t.paymentStatus === 'paid') {
                                  <button type="button" class="btn-ghost !text-xs !px-1.5" (click)="attendTicket(t.id)">Ingreso</button>
                                }
                              </div>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                } @else {
                  <p class="p-6 text-sm text-slate-400 italic text-center">No hay tickets generados para este evento.</p>
                }
              </div>
            </div>
          }

          @case ('escaneo') {
            <div class="space-y-6 max-w-2xl mx-auto">
              <div class="section-card p-6">
                <label for="scan-code" class="block text-sm font-bold text-slate-700 mb-2">Escanear / ingresar código o número</label>
                <input id="scan-code" class="input-modern !py-4 !text-xl text-center font-mono w-full" placeholder="BINGO-CARD-0042"
                  [ngModel]="scanCode()" (ngModelChange)="scanCode.set($event)"
                  (keydown.enter)="searchScanned()" />
                <button type="button" class="btn-primary w-full mt-3 !py-3" (click)="searchScanned()">Buscar</button>
              </div>

              @if (scanResult(); as tkt) {
                <div class="section-card p-8 text-center space-y-3" [class]="scanResultClass(tkt)">
                  <p class="text-lg font-extrabold uppercase">{{ scanResultTitle(tkt) }}</p>
                  <p class="font-mono text-2xl font-bold text-brand">{{ tkt.code }}</p>
                  @if (tkt.sequenceNumber) { <p class="text-sm">Nº {{ tkt.sequenceNumber }}</p> }
                  @if (tkt.groupName) { <p class="text-sm text-slate-600">Grupo: {{ tkt.groupName }}</p> }
                  <p class="text-sm">{{ statusLabels[tkt.status] }} · {{ tkt.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente' }}</p>
                  @if (tkt.paymentStatus === 'paid' && !tkt.attended) {
                    <button type="button" class="btn-primary mt-2" (click)="attendTicket(tkt.id); searchScanned()">Registrar ingreso</button>
                  }
                </div>
              }
              @if (scanError()) {
                <p class="text-center text-red-600 font-semibold">{{ scanError() }}</p>
              }
            </div>
          }
        }
      }
    </div>

    @if (showAssignModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
        <div class="section-card p-6 w-full max-w-md space-y-4">
          <h2 class="text-lg font-bold">Asignar tickets a grupo interno</h2>
          @if (assignError()) { <p class="text-sm text-red-600">{{ assignError() }}</p> }
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">Pool de tickets</label>
              <select class="input-modern !py-1.5 !text-sm w-full" [(ngModel)]="assignForm.poolId">
                @for (p of poolSummaries(); track p.poolId) {
                  <option [value]="p.poolId">{{ p.poolLabel }} (1–{{ p.quantityToGenerate }})</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">Grupo interno *</label>
              <input class="input-modern !py-1.5 !text-sm w-full" placeholder="Equipo Los Delfines" [(ngModel)]="assignForm.groupName" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">Responsable *</label>
              <input class="input-modern !py-1.5 !text-sm w-full" placeholder="Nombre del responsable" [(ngModel)]="assignForm.responsibleName" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Desde Nº *</label>
                <input type="number" class="input-modern !py-1.5 !text-sm w-full" min="1" [(ngModel)]="assignForm.startNumber" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Hasta Nº *</label>
                <input type="number" class="input-modern !py-1.5 !text-sm w-full" min="1" [(ngModel)]="assignForm.endNumber" />
              </div>
            </div>
            <p class="text-xs text-slate-500">
              Se asignarán {{ assignForm.endNumber >= assignForm.startNumber ? assignForm.endNumber - assignForm.startNumber + 1 : 0 }} ticket(s).
            </p>
          </div>
          <div class="flex gap-2 justify-end">
            <button type="button" class="btn-ghost" (click)="showAssignModal.set(false)">Cancelar</button>
            <button type="button" class="btn-primary" (click)="confirmAssign()">Asignar</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class TicketControlComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  private readonly controlService = inject(EventTicketControlService);
  private readonly ticketService = inject(EventTicketService);

  protected readonly TicketStatus = TicketStatus;
  protected readonly statusLabels = TICKET_STATUS_LABELS;

  protected readonly events = signal<Event[]>([]);
  protected readonly selectedEventId = signal('evt-4');
  protected readonly poolSummaries = signal<EventTicketPoolSummary[]>([]);
  protected readonly assignments = signal<EventTicketGroupAssignment[]>([]);
  protected readonly tickets = signal<EventTicket[]>([]);
  protected readonly activeTab = signal<TabId>('pools');
  protected readonly generating = signal(false);
  protected readonly ticketSearch = signal('');
  protected readonly groupFilter = signal<string | null>(null);
  protected readonly showAssignModal = signal(false);
  protected readonly assignError = signal('');
  protected readonly scanCode = signal('');
  protected readonly scanResult = signal<EventTicket | null>(null);
  protected readonly scanError = signal('');

  protected readonly selectedEvent = computed(() =>
    this.events().find(e => e.id === this.selectedEventId()),
  );

  protected readonly tabs: { id: TabId; label: string }[] = [
    { id: 'pools', label: 'Pools generados' },
    { id: 'grupos', label: 'Grupos internos' },
    { id: 'tickets', label: 'Listado tickets' },
    { id: 'escaneo', label: 'Escaneo' },
  ];

  protected assignForm = {
    poolId: '',
    groupName: '',
    responsibleName: '',
    startNumber: 1,
    endNumber: 50,
  };

  ngOnInit(): void {
    const qEvent = this.route.snapshot.queryParamMap.get('evento');
    this.eventService.getEvents().subscribe(list => {
      this.events.set(list.filter(e => e.categoryConfig.ticketGeneration?.pools?.length));
      if (qEvent && list.some(e => e.id === qEvent)) this.selectedEventId.set(qEvent);
      else if (list.length && !list.some(e => e.id === this.selectedEventId())) {
        this.selectedEventId.set(list[0]?.id ?? 'evt-4');
      }
      this.refresh();
    });
  }

  protected selectEvent(id: string): void {
    this.selectedEventId.set(id);
    this.groupFilter.set(null);
    this.refresh();
  }

  protected refresh(): void {
    const id = this.selectedEventId();
    this.controlService.getPoolSummaries(id).subscribe(s => this.poolSummaries.set(s));
    this.controlService.getAssignments(id).subscribe(a => this.assignments.set(a));
    this.loadTickets();
  }

  protected loadTickets(): void {
    this.controlService.getTicketsForEvent(this.selectedEventId(), {
      groupId: this.groupFilter() ?? undefined,
      search: this.ticketSearch() || undefined,
    }).subscribe(t => this.tickets.set(t));
  }

  protected canAssign(): boolean {
    return this.poolSummaries().some(p => p.generatedCount > 0);
  }

  protected generateTickets(): void {
    this.generating.set(true);
    this.controlService.generateTicketsFromPools(this.selectedEventId()).subscribe({
      next: () => { this.generating.set(false); this.refresh(); },
      error: (e) => { this.generating.set(false); alert(e.message); },
    });
  }

  protected openAssignModal(): void {
    const pool = this.poolSummaries()[0];
    this.assignForm = {
      poolId: pool?.poolId ?? '',
      groupName: '',
      responsibleName: '',
      startNumber: 1,
      endNumber: 50,
    };
    this.assignError.set('');
    this.showAssignModal.set(true);
  }

  protected confirmAssign(): void {
    this.assignError.set('');
    this.controlService.assignToGroup({
      eventId: this.selectedEventId(),
      poolId: this.assignForm.poolId,
      groupName: this.assignForm.groupName.trim(),
      responsibleName: this.assignForm.responsibleName.trim(),
      startNumber: this.assignForm.startNumber,
      endNumber: this.assignForm.endNumber,
    }).subscribe({
      next: () => {
        this.showAssignModal.set(false);
        this.refresh();
      },
      error: (e) => this.assignError.set(e.message),
    });
  }

  protected filterByGroup(groupId: string): void {
    this.groupFilter.set(groupId);
    this.activeTab.set('tickets');
    this.loadTickets();
  }

  protected clearGroupFilter(): void {
    this.groupFilter.set(null);
    this.loadTickets();
  }

  protected async markGroupPaid(groupId: string): Promise<void> {
    const ok = await confirmDialog({ text: '¿Registrar pago de todos los tickets pendientes del grupo?', confirmText: 'Registrar pago' });
    if (!ok) return;
    this.controlService.markGroupPayment(this.selectedEventId(), groupId, true).subscribe(() => this.refresh());
  }

  protected async markGroupAttended(groupId: string): Promise<void> {
    const ok = await confirmDialog({ text: '¿Registrar asistencia de todos los tickets pagados del grupo?', confirmText: 'Registrar asistencia' });
    if (!ok) return;
    this.controlService.markGroupAttendance(this.selectedEventId(), groupId, true).subscribe(() => this.refresh());
  }

  protected payTicket(id: string): void {
    this.controlService.markTicketPayment(id, true).subscribe(() => this.refresh());
  }

  protected attendTicket(id: string): void {
    this.controlService.markTicketAttendance(id, true).subscribe(() => this.refresh());
  }

  protected searchScanned(): void {
    this.scanError.set('');
    this.scanResult.set(null);
    const c = this.scanCode().trim();
    if (!c) return;
    this.ticketService.getTicketByCode(c).subscribe(tkt => {
      if (tkt && tkt.eventId === this.selectedEventId()) this.scanResult.set(tkt);
      else this.scanError.set('Ticket no encontrado en este evento');
    });
  }

  protected scanResultTitle(tkt: EventTicket): string {
    if (tkt.status === TicketStatus.CANCELLED) return 'Anulado';
    if (tkt.attended || tkt.status === TicketStatus.USED) return 'Ya ingresó';
    if (tkt.paymentStatus !== 'paid') return 'Pendiente de pago';
    return 'Válido para ingreso';
  }

  protected scanResultClass(tkt: EventTicket): string {
    if (tkt.status === TicketStatus.CANCELLED) return 'border-red-300 bg-red-50';
    if (tkt.attended || tkt.status === TicketStatus.USED) return 'border-amber-300 bg-amber-50';
    if (tkt.paymentStatus !== 'paid') return 'border-slate-300 bg-slate-50';
    return 'border-green-300 bg-green-50';
  }
}
