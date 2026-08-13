import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventCategory, EVENT_CATEGORY_LABELS } from '../../enums/event-category.enum';
import { Event } from '../../models/event.model';
import { EventStatusBadgeComponent } from '../event-status-badge/event-status-badge';
import { EventCapacityBarComponent } from '../event-capacity-bar/event-capacity-bar';
import { getAvailableCapacity } from '../../models/event.model';

@Component({
  selector: 'app-event-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EventStatusBadgeComponent, EventCapacityBarComponent],
  template: `
    <article class="section-card p-4 card-hover flex flex-col gap-3 h-full">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <p class="text-xs font-mono text-slate-400">{{ event().code }}</p>
          <h3 class="text-base font-bold text-slate-900 truncate">{{ event().name }}</h3>
        </div>
        <app-event-status-badge [status]="event().status" />
      </div>
      <div class="flex flex-wrap gap-2 text-xs text-slate-500">
        <span class="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 font-medium">
          {{ categoryLabel() }}
        </span>
        <span>{{ event().startDate }} · {{ event().startTime }}</span>
        <span>{{ event().venueName }}</span>
      </div>
      <app-event-capacity-bar [capacity]="event().capacity" />
      <div class="flex items-center justify-between mt-auto pt-2">
        <span class="text-sm font-semibold text-brand">
          @if (event().isFree) { Gratuito } @else { Desde S/ {{ minPrice() }} }
        </span>
        <span class="text-xs text-slate-500">{{ available() }} cupos</span>
      </div>
      @if (linkTo()) {
        <a [routerLink]="linkTo()!" class="btn-primary !text-xs !py-1.5 text-center mt-1">Ver evento</a>
      }
    </article>
  `,
})
export class EventCardComponent {
  readonly event = input.required<Event>();
  readonly linkTo = input<string | string[] | null>(null);

  protected categoryLabel = () => EVENT_CATEGORY_LABELS[this.event().category];
  protected available = () => getAvailableCapacity(this.event().capacity);
  protected minPrice = () => {
    const rates = this.event().rates.filter(r => r.status === 'active');
    if (!rates.length) return 0;
    return Math.min(...rates.map(r => r.price));
  };
}
