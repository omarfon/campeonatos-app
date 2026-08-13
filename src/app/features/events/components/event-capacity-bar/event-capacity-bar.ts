import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { EventCapacity, getAvailableCapacity, getOccupancyPercent } from '../../models/event.model';

@Component({
  selector: 'app-event-capacity-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-1">
      <div class="flex items-center justify-between text-xs">
        <span class="font-semibold text-slate-700">{{ capacity().confirmedCapacity }} / {{ capacity().totalCapacity }}</span>
        <span class="text-slate-500">{{ percent().toFixed(1) }}% ocupado</span>
      </div>
      <div class="h-2 rounded-full bg-slate-100 overflow-hidden" role="progressbar"
        [attr.aria-valuenow]="capacity().confirmedCapacity"
        [attr.aria-valuemin]="0"
        [attr.aria-valuemax]="capacity().totalCapacity">
        <div class="h-full rounded-full transition-all duration-300" [class]="barClass()" [style.width.%]="percent()"></div>
      </div>
      @if (available() === 0) {
        <p class="text-xs font-bold text-red-600 uppercase">Evento agotado</p>
      } @else if (percent() >= 85) {
        <p class="text-xs font-semibold text-amber-600">Próximo a completar aforo</p>
      }
    </div>
  `,
})
export class EventCapacityBarComponent {
  readonly capacity = input.required<EventCapacity>();

  protected percent = computed(() => getOccupancyPercent(this.capacity()));
  protected available = computed(() => getAvailableCapacity(this.capacity()));

  protected barClass = computed(() => {
    const p = this.percent();
    if (p >= 100) return 'bg-red-500';
    if (p >= 85) return 'bg-amber-500';
    return 'bg-green-500';
  });
}
