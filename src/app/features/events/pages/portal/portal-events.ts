import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event, getAvailableCapacity } from '../../models/event.model';
import { EventCardComponent } from '../../components/event-card/event-card';
import { EVENT_CATEGORY_LABELS } from '../../enums/event-category.enum';

@Component({
  selector: 'app-portal-event-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block min-h-screen bg-gradient-to-b from-slate-50 to-white' },
  imports: [EventCardComponent],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <header class="text-center space-y-2">
        <h1 class="text-3xl font-extrabold text-slate-900">Eventos AELU</h1>
        <p class="text-slate-500">Descubre y participa en nuestros próximos eventos</p>
      </header>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (evt of publicEvents(); track evt.id) {
          <app-event-card [event]="evt" [linkTo]="['/portal/eventos', evt.id]" />
        }
      </div>
    </div>
  `,
})
export class PortalEventListComponent implements OnInit {
  private readonly eventService = inject(EventService);

  protected readonly publicEvents = signal<Event[]>([]);

  ngOnInit(): void {
    this.eventService.getEvents().subscribe(list =>
      this.publicEvents.set(list.filter(e => e.isPublic))
    );
  }
}

@Component({
  selector: 'app-portal-event-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block min-h-screen bg-gradient-to-b from-slate-50 to-white' },
  imports: [RouterLink],
  template: `
    @if (event(); as evt) {
      <div class="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div class="rounded-2xl bg-gradient-to-br from-brand to-brand-800 h-48 flex items-end p-6 text-white">
          <div>
            <p class="text-sm opacity-80">{{ categoryLabels[evt.category] }}</p>
            <h1 class="text-3xl font-extrabold">{{ evt.name }}</h1>
          </div>
        </div>
        <div class="section-card p-6 space-y-4">
          <p class="text-slate-600">{{ evt.description }}</p>
          <dl class="grid grid-cols-2 gap-4 text-sm">
            <div><dt class="text-slate-500">Fecha</dt><dd class="font-semibold">{{ evt.startDate }}</dd></div>
            <div><dt class="text-slate-500">Horario</dt><dd class="font-semibold">{{ evt.startTime }} - {{ evt.endTime }}</dd></div>
            <div><dt class="text-slate-500">Lugar</dt><dd class="font-semibold">{{ evt.venueName }}</dd></div>
            <div><dt class="text-slate-500">Cupos</dt><dd class="font-semibold">{{ available(evt) }} disponibles</dd></div>
          </dl>
          <p class="text-lg font-bold text-brand">
            @if (evt.isFree) { Inscripción gratuita } @else { Desde S/ {{ minPrice(evt) }} }
          </p>
          <a [routerLink]="['/portal/eventos', evt.id, 'inscribirme']" class="btn-primary w-full !py-3 text-center block">Inscribirme</a>
        </div>
      </div>
    }
  `,
})
export class PortalEventDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);

  protected readonly event = signal<Event | undefined>(undefined);
  protected readonly categoryLabels = EVENT_CATEGORY_LABELS;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.eventService.getEvent(id).subscribe(e => this.event.set(e));
  }

  protected available(evt: Event): number { return getAvailableCapacity(evt.capacity); }
  protected minPrice(evt: Event): number {
    const rates = evt.rates.filter(r => r.status === 'active');
    return rates.length ? Math.min(...rates.map(r => r.price)) : 0;
  }
}

@Component({
  selector: 'app-portal-registration',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block min-h-screen bg-gradient-to-b from-slate-50 to-white' },
  imports: [RouterLink],
  template: `
    <div class="max-w-lg mx-auto px-4 py-8 space-y-6">
      <h1 class="text-2xl font-extrabold">Inscripción</h1>
      <div class="section-card p-6 space-y-4">
        <p class="text-sm text-slate-500">Flujo: Participante → Tarifa → Resumen → Pago → Confirmación</p>
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1">Nombre completo</label>
          <input class="input-modern w-full" [value]="name()" (input)="name.set($any($event.target).value)" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1">Documento</label>
          <input class="input-modern w-full" [value]="doc()" (input)="doc.set($any($event.target).value)" />
        </div>
        <div class="bg-slate-50 p-4 rounded-lg text-sm space-y-1">
          <p><strong>Total:</strong> S/ 50.00</p>
        </div>
        <button type="button" class="btn-primary w-full !py-3" (click)="confirmed.set(true)">Confirmar y pagar</button>
      </div>
      @if (confirmed()) {
        <div class="section-card p-6 text-center space-y-3 border-green-200 bg-green-50">
          <p class="text-2xl">✓</p>
          <p class="font-bold text-green-800">¡Inscripción confirmada!</p>
          <p class="text-sm text-green-700">Su entrada ha sido generada.</p>
          <a routerLink="/portal/eventos" class="btn-primary inline-block mt-2">Volver a eventos</a>
        </div>
      }
    </div>
  `,
})
export class PortalRegistrationComponent {
  protected readonly name = signal('');
  protected readonly doc = signal('');
  protected readonly confirmed = signal(false);
}
