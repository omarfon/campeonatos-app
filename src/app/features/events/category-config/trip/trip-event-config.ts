import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-trip-event-config',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
      <p class="text-sm font-bold text-amber-800">Entradas personales e intransferibles</p>
      <p class="text-sm text-amber-700">Cada ticket estará asociado obligatoriamente a una persona (nombre y documento).</p>
      <ul class="text-xs text-amber-600 list-disc list-inside">
        <li>No se permiten entradas genéricas</li>
        <li>El ticket mostrará: código, evento, persona, documento, fecha y estado</li>
      </ul>
    </div>
  `,
})
export class TripEventConfigComponent {
  readonly disabled = input(false);
}
