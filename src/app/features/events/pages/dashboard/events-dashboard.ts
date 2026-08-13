import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { EventCapacityBarComponent } from '../../components/event-capacity-bar/event-capacity-bar';
import { EventStatusBadgeComponent } from '../../components/event-status-badge/event-status-badge';
import { EVENT_CATEGORY_LABELS } from '../../enums/event-category.enum';
import { getAvailableCapacity } from '../../models/event.model';

@Component({
  selector: 'app-events-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EventCapacityBarComponent, EventStatusBadgeComponent],
  template: `
    <div class="space-y-8">
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand via-brand-700 to-brand-900 p-6 text-white shadow-xl">
        <div class="relative">
          <h1 class="text-2xl font-extrabold">Dashboard de Eventos</h1>
          <p class="text-slate-300 text-sm mt-1">Indicadores operativos y próximos eventos</p>
        </div>
        <div class="relative mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          @for (stat of stats(); track stat.label) {
            <div class="rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 text-center">
              <p class="text-2xl font-bold">{{ stat.value }}</p>
              <p class="text-xs text-green-200 mt-0.5">{{ stat.label }}</p>
            </div>
          }
        </div>
      </div>

      <section class="section-card p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-slate-900">Próximos eventos</h2>
          <a routerLink="/eventos/listado" class="text-sm text-brand font-semibold hover:underline">Ver todos</a>
        </div>
        @if (upcoming().length === 0) {
          <p class="text-slate-400 text-center py-8">No hay eventos próximos</p>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-200 text-left">
                  <th class="py-2 px-3 text-xs font-semibold text-slate-500">Evento</th>
                  <th class="py-2 px-3 text-xs font-semibold text-slate-500">Categoría</th>
                  <th class="py-2 px-3 text-xs font-semibold text-slate-500">Fecha</th>
                  <th class="py-2 px-3 text-xs font-semibold text-slate-500">Lugar</th>
                  <th class="py-2 px-3 text-xs font-semibold text-slate-500">Ocupación</th>
                  <th class="py-2 px-3 text-xs font-semibold text-slate-500">Estado</th>
                </tr>
              </thead>
              <tbody>
                @for (evt of upcoming(); track evt.id) {
                  <tr class="border-b border-slate-50 hover:bg-slate-50">
                    <td class="py-3 px-3">
                      <a [routerLink]="['/eventos', evt.id]" class="font-semibold text-brand hover:underline">{{ evt.name }}</a>
                    </td>
                    <td class="py-3 px-3 text-slate-600">{{ categoryLabel(evt.category) }}</td>
                    <td class="py-3 px-3 text-slate-600">{{ evt.startDate }}</td>
                    <td class="py-3 px-3 text-slate-600">{{ evt.venueName }}</td>
                    <td class="py-3 px-3 min-w-[180px]">
                      <app-event-capacity-bar [capacity]="evt.capacity" />
                      <p class="text-[10px] text-slate-400 mt-1">{{ available(evt) }} cupos disponibles</p>
                    </td>
                    <td class="py-3 px-3"><app-event-status-badge [status]="evt.status" /></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>
    </div>
  `,
})
export class EventsDashboardComponent implements OnInit {
  private readonly eventService = inject(EventService);

  protected readonly upcoming = signal<Event[]>([]);

  protected stats = () => {
    const s = this.eventService.dashboardStats();
    return [
      { label: 'Eventos activos', value: s.activeEvents },
      { label: 'Próximos', value: s.upcomingEvents },
      { label: 'En inscripción', value: s.registrationOpenEvents },
      { label: 'Finalizados', value: s.finishedEvents },
      { label: 'Entradas vendidas', value: s.ticketsSold },
      { label: 'Inscripciones', value: s.registrationsCount },
      { label: 'Aforo utilizado', value: s.capacityUsed },
      { label: 'Ingresos (S/)', value: s.totalRevenue.toLocaleString('es-PE') },
    ];
  };

  ngOnInit(): void {
    this.eventService.getUpcomingEvents(8).subscribe(list => this.upcoming.set(list));
  }

  protected categoryLabel(cat: Event['category']): string {
    return EVENT_CATEGORY_LABELS[cat];
  }

  protected available(evt: Event): number {
    return getAvailableCapacity(evt.capacity);
  }
}
