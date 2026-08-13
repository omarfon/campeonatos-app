import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventSettlementService } from '../../services/event-settlement.service';
import { EventService } from '../../services/event.service';
import { Event, EventSettlement } from '../../models/event.model';
import { EventStatus } from '../../enums/event-status.enum';
import { confirmDialog } from '../../../../shared/confirm-dialog';

@Component({
  selector: 'app-event-settlement',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (event(); as evt) {
      <div class="space-y-6">
        <nav class="text-sm text-slate-500" aria-label="Breadcrumb">
          <a routerLink="/eventos/listado" class="hover:text-brand">Eventos</a>
          <span class="mx-2">/</span>
          <a routerLink="/eventos/liquidaciones" class="hover:text-brand">Liquidaciones</a>
          <span class="mx-2">/</span>
          <span class="font-medium text-slate-800">{{ evt.name }}</span>
        </nav>

        <h1 class="text-2xl font-extrabold">Liquidación del evento</h1>

        @if (evt.status !== EventStatus.FINISHED && evt.status !== EventStatus.SETTLED) {
          <p class="text-amber-700 bg-amber-50 p-4 rounded-lg">Solo eventos finalizados pueden liquidarse.</p>
        } @else if (settlement(); as s) {
          <div class="section-card p-6 space-y-6">
            <h2 class="text-lg font-bold">Resumen del evento</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div class="p-3 bg-slate-50 rounded-lg"><p class="text-slate-500">Entradas emitidas</p><p class="text-xl font-bold">{{ s.ticketsIssued }}</p></div>
              <div class="p-3 bg-slate-50 rounded-lg"><p class="text-slate-500">Entradas pagadas</p><p class="text-xl font-bold">{{ s.ticketsPaid }}</p></div>
              <div class="p-3 bg-slate-50 rounded-lg"><p class="text-slate-500">Entradas anuladas</p><p class="text-xl font-bold">{{ s.ticketsCancelled }}</p></div>
              <div class="p-3 bg-slate-50 rounded-lg"><p class="text-slate-500">Cortesías</p><p class="text-xl font-bold">{{ s.courtesyTickets }}</p></div>
            </div>
            <div class="border-t border-slate-200 pt-4 space-y-2 text-sm">
              <div class="flex justify-between"><span>Ingresos entradas</span><span class="font-semibold">S/ {{ s.ticketRevenue.toLocaleString('es-PE') }}</span></div>
              <div class="flex justify-between"><span>Consumos</span><span class="font-semibold">S/ {{ s.consumptionRevenue.toLocaleString('es-PE') }}</span></div>
              <div class="flex justify-between"><span>Otros ingresos</span><span class="font-semibold">S/ {{ s.otherRevenue.toLocaleString('es-PE') }}</span></div>
              <div class="flex justify-between text-lg font-bold border-t border-slate-200 pt-2"><span>TOTAL</span><span class="text-brand">S/ {{ s.totalRevenue.toLocaleString('es-PE') }}</span></div>
            </div>
            @if (evt.status === EventStatus.FINISHED) {
              <button type="button" class="btn-primary" (click)="settle()">Cerrar / Liquidar evento</button>
            } @else {
              <p class="text-green-700 font-semibold">Evento liquidado</p>
            }
          </div>
        }
      </div>
    }
  `,
})
export class EventSettlementComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  private readonly settlementService = inject(EventSettlementService);

  protected readonly EventStatus = EventStatus;
  protected readonly event = signal<Event | undefined>(undefined);
  protected readonly settlement = signal<EventSettlement | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.eventService.getEvent(id).subscribe(evt => {
      if (evt) {
        this.event.set(evt);
        this.settlementService.getSettlement(id).subscribe(s => this.settlement.set(s));
      }
    });
  }

  protected async settle(): Promise<void> {
    const ok = await confirmDialog({ title: 'Liquidar evento', text: '¿Confirma el cierre y liquidación del evento?', confirmText: 'Liquidar' });
    if (ok && this.event()) {
      this.settlementService.settleEvent(this.event()!.id).subscribe(() => {
        this.eventService.getEvent(this.event()!.id).subscribe(e => this.event.set(e));
      });
    }
  }
}
