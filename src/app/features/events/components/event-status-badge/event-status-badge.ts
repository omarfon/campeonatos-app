import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { EventStatus, EVENT_STATUS_LABELS, EVENT_STATUS_CLASSES } from '../../enums/event-status.enum';

@Component({
  selector: 'app-event-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider"
      [class]="className()">
      {{ label() }}
    </span>
  `,
})
export class EventStatusBadgeComponent {
  readonly status = input.required<EventStatus>();

  protected label = () => EVENT_STATUS_LABELS[this.status()];
  protected className = () => EVENT_STATUS_CLASSES[this.status()];
}
