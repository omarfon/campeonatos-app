import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-events-config',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-extrabold">Configuración de Eventos</h1>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        @for (item of configItems; track item.path) {
          <a [routerLink]="item.path" class="section-card p-5 card-hover block">
            <span class="text-2xl">{{ item.icon }}</span>
            <h3 class="font-bold text-slate-900 mt-2">{{ item.label }}</h3>
            <p class="text-sm text-slate-500 mt-1">{{ item.desc }}</p>
          </a>
        }
      </div>
    </div>
  `,
})
export class EventsConfigComponent {
  protected readonly configItems = [
    { path: '/eventos/config/tipos', label: 'Tipos de Evento', desc: 'Clasificación general de eventos', icon: '📋' },
    { path: '/eventos/config/categorias', label: 'Categorías de Evento', desc: 'General, Masivo, Comida, etc.', icon: '🏷️' },
    { path: '/eventos/config/tarifas', label: 'Tarifas', desc: 'Plantillas de tarifas', icon: '💰' },
    { path: '/eventos/config/consumos', label: 'Opciones de Consumo', desc: 'Menús, bebidas, movilidad', icon: '🍽️' },
  ];
}
