import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-general-event-config',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-600">
      <p class="font-semibold text-slate-800">Evento general / concierto</p>
      <p class="mt-1">Configure entradas, movilidad, comidas y actividades en el catálogo superior.</p>
    </div>
  `,
})
export class GeneralEventConfigComponent {
  readonly disabled = input(false);
}
