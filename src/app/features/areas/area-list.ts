import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AreaService } from '../../core/services/area.service';
import { SedeService } from '../../core/services/sede.service';
import { ESTADO_AREA_LABELS, TIPO_AREA_LABELS, EstadoArea, TipoArea } from '../../core/models/area.model';

@Component({
  selector: 'app-area-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Áreas</h2>
          <p class="text-slate-500 mt-1">Espacios deportivos: canchas, piscinas, pistas y más</p>
        </div>
        <a [routerLink]="['/', { outlets: { primary: ['maestros', 'areas'], panel: ['maestros', 'areas', 'nueva'] } }]" class="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          <span aria-hidden="true">+</span> Nueva Área
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (area of areas(); track area.id) {
          <div class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div class="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
              <a [routerLink]="[area.id]" class="text-lg font-bold text-white hover:underline">{{ area.nombre }}</a>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-indigo-200 text-xs">{{ tipoLabels[area.tipo] }}</span>
                @if (area.sedeId) {
                  <span class="text-indigo-300 text-xs">·</span>
                  <span class="text-indigo-200 text-xs">{{ getSedeNombre(area.sedeId) }}</span>
                }
              </div>
            </div>
            <div class="p-4 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs px-2 py-0.5 rounded font-medium"
                  [class]="estadoClasses[area.estado]">
                  {{ estadoLabels[area.estado] }}
                </span>
              </div>

              @if (area.descripcion) {
                <p class="text-sm text-slate-500">{{ area.descripcion }}</p>
              }

              <div class="grid grid-cols-2 gap-2 text-sm">
                @if (area.dimensiones) {
                  <div>
                    <p class="text-slate-400">Dimensiones</p>
                    <p class="font-medium">{{ area.dimensiones }}</p>
                  </div>
                }
                @if (area.capacidad) {
                  <div>
                    <p class="text-slate-400">Capacidad</p>
                    <p class="font-medium">{{ area.capacidad }}</p>
                  </div>
                }
                @if (area.superficie) {
                  <div>
                    <p class="text-slate-400">Superficie</p>
                    <p class="font-medium">{{ area.superficie }}</p>
                  </div>
                }
                <div>
                  <p class="text-slate-400">Características</p>
                  <p class="font-medium">
                    {{ area.techada ? 'Techada' : 'Al aire libre' }}
                    {{ area.iluminacion ? '· Iluminada' : '' }}
                  </p>
                </div>
              </div>

              <div class="pt-3 border-t flex gap-3">
                <a [routerLink]="[area.id, 'editar']" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Editar</a>
                <button (click)="eliminar(area.id)" class="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
              </div>
            </div>
          </div>
        } @empty {
          <div class="col-span-full text-center py-12 text-slate-400">
            No hay áreas registradas
          </div>
        }
      </div>
    </div>
  `,
})
export class AreaListComponent {
  private readonly areaService = inject(AreaService);
  private readonly sedeService = inject(SedeService);
  protected readonly areas = this.areaService.items;

  protected readonly estadoLabels = ESTADO_AREA_LABELS;
  protected readonly tipoLabels = TIPO_AREA_LABELS;
  protected readonly estadoClasses: Record<EstadoArea, string> = {
    disponible: 'bg-green-100 text-green-700',
    ocupada: 'bg-blue-100 text-blue-700',
    en_mantenimiento: 'bg-yellow-100 text-yellow-700',
    fuera_de_servicio: 'bg-red-100 text-red-700',
  };

  protected getSedeNombre(id: string): string {
    return this.sedeService.getById(id)?.nombre ?? id;
  }

  protected eliminar(id: string): void {
    if (confirm('¿Está seguro de eliminar esta área?')) {
      this.areaService.delete(id);
    }
  }
}
