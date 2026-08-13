import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { EventEnvironmentBooking } from '../../models/event.model';

@Component({
  selector: 'app-massive-event-config',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-3">
      <p class="text-sm text-slate-600">Evento masivo: gestione múltiples ambientes con horarios simultáneos o escalonados.</p>
      @if (environments().length === 0) {
        <p class="text-sm text-amber-600">Seleccione al menos un ambiente en el paso 3.</p>
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-left">
                <th class="py-2 px-2 text-xs font-semibold text-slate-500">Ambiente</th>
                <th class="py-2 px-2 text-xs font-semibold text-slate-500">Fecha</th>
                <th class="py-2 px-2 text-xs font-semibold text-slate-500">Desde</th>
                <th class="py-2 px-2 text-xs font-semibold text-slate-500">Hasta</th>
                <th class="py-2 px-2 text-xs font-semibold text-slate-500 text-right">Capacidad</th>
              </tr>
            </thead>
            <tbody>
              @for (env of environments(); track env.environmentId) {
                <tr class="border-b border-slate-50">
                  <td class="py-2 px-2 font-medium">{{ env.environmentName }}</td>
                  <td class="py-2 px-2">{{ env.startDate }}</td>
                  <td class="py-2 px-2">{{ env.startTime }}</td>
                  <td class="py-2 px-2">{{ env.endTime }}</td>
                  <td class="py-2 px-2 text-right">{{ env.capacity }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class MassiveEventConfigComponent {
  readonly environments = input<EventEnvironmentBooking[]>([]);
  readonly disabled = input(false);
}
