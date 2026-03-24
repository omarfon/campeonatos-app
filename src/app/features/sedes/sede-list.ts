import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SedeService } from '../../core/services/sede.service';
import { ESTADO_SEDE_LABELS, EstadoSede } from '../../core/models/sede.model';
import { confirmDialog } from '../../shared/confirm-dialog';

@Component({
  selector: 'app-sede-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Sedes</h2>
          <p class="text-slate-500 mt-1">Gestión de sedes y campos deportivos</p>
        </div>
        <a [routerLink]="['/', { outlets: { primary: ['maestros', 'sedes'], panel: ['maestros', 'sedes', 'nueva'] } }]" class="inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors">
          <span aria-hidden="true">+</span> Nueva Sede
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (sede of sedes(); track sede.id) {
          <div class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div class="bg-gradient-to-r from-brand to-brand-700 px-6 py-4">
              <a [routerLink]="[sede.id]" class="text-lg font-bold text-white hover:underline">{{ sede.nombre }}</a>
              <p class="text-slate-300 text-sm mt-1">{{ sede.direccion }}</p>
            </div>
            <div class="p-4 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs px-2 py-0.5 rounded font-medium"
                  [class]="estadoClasses[sede.estado]">
                  {{ estadoLabels[sede.estado] }}
                </span>
                <span class="text-sm text-slate-500">{{ sede.campos.length }} campo(s)</span>
              </div>

              @if (sede.telefono || sede.email) {
                <div class="text-sm text-slate-600 space-y-1">
                  @if (sede.telefono) {
                    <p>📞 {{ sede.telefono }}</p>
                  }
                  @if (sede.email) {
                    <p>✉️ {{ sede.email }}</p>
                  }
                </div>
              }

              @if (sede.campos.length > 0) {
                <div class="space-y-1">
                  @for (campo of sede.campos; track campo.id) {
                    <div class="flex items-center justify-between text-sm py-1 px-2 bg-slate-50 rounded">
                      <span class="font-medium text-slate-700">{{ campo.nombre }}</span>
                      <span class="text-xs text-slate-500">{{ campo.capacidad ? campo.capacidad + ' cap.' : '' }} {{ campo.superficie ?? '' }}</span>
                    </div>
                  }
                </div>
              }

              <div class="pt-3 border-t flex gap-3">
                <a [routerLink]="[sede.id, 'editar']" class="text-green-600 hover:text-green-800 text-sm font-medium">Editar</a>
                <button (click)="eliminar(sede.id)" class="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
              </div>
            </div>
          </div>
        } @empty {
          <div class="col-span-full text-center py-12 text-slate-400">
            No hay sedes registradas
          </div>
        }
      </div>
    </div>
  `,
})
export class SedeListComponent {
  private readonly sedeService = inject(SedeService);
  protected readonly sedes = this.sedeService.items;

  protected readonly estadoLabels = ESTADO_SEDE_LABELS;
  protected readonly estadoClasses: Record<EstadoSede, string> = {
    activa: 'bg-green-100 text-green-700',
    inactiva: 'bg-slate-100 text-slate-600',
    en_mantenimiento: 'bg-yellow-100 text-yellow-700',
  };

  protected async eliminar(id: string): Promise<void> {
    const ok = await confirmDialog({ title: 'Eliminar sede', text: '¿Está seguro de eliminar esta sede? Esta acción no se puede deshacer.' });
    if (ok) {
      this.sedeService.delete(id);
    }
  }
}
