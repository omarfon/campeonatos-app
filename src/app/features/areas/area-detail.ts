import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AreaService } from '../../core/services/area.service';
import { SedeService } from '../../core/services/sede.service';
import { Area, ESTADO_AREA_LABELS, TIPO_AREA_LABELS, EstadoArea } from '../../core/models/area.model';

@Component({
  selector: 'app-area-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (area(); as a) {
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <a routerLink="/maestros/areas" class="text-indigo-600 hover:text-indigo-800 text-sm">&larr; Volver</a>
            <h2 class="text-2xl font-bold text-slate-900 mt-1">{{ a.nombre }}</h2>
            <p class="text-slate-500">{{ tipoLabels[a.tipo] }}</p>
          </div>
          <a [routerLink]="['editar']" class="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Editar
          </a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl shadow-sm p-4">
            <p class="text-sm text-slate-500">Estado</p>
            <p class="mt-1">
              <span class="text-xs px-2 py-0.5 rounded font-medium"
                [class]="estadoClasses[a.estado]">
                {{ estadoLabels[a.estado] }}
              </span>
            </p>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-4">
            <p class="text-sm text-slate-500">Sede</p>
            <p class="text-lg font-semibold">{{ a.sedeId ? getSedeNombre(a.sedeId) : 'Sin sede' }}</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-4">
            <p class="text-sm text-slate-500">Dimensiones</p>
            <p class="text-lg font-semibold">{{ a.dimensiones ?? 'No registradas' }}</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-4">
            <p class="text-sm text-slate-500">Capacidad</p>
            <p class="text-lg font-semibold">{{ a.capacidad ?? '-' }}</p>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Detalles del espacio</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <p class="text-slate-400">Superficie</p>
              <p class="font-medium">{{ a.superficie ?? 'No registrada' }}</p>
            </div>
            <div>
              <p class="text-slate-400">Techada</p>
              <p class="font-medium">{{ a.techada ? 'Sí' : 'No' }}</p>
            </div>
            <div>
              <p class="text-slate-400">Iluminación</p>
              <p class="font-medium">{{ a.iluminacion ? 'Sí' : 'No' }}</p>
            </div>
            @if (a.descripcion) {
              <div class="sm:col-span-2 lg:col-span-3">
                <p class="text-slate-400">Descripción</p>
                <p class="font-medium">{{ a.descripcion }}</p>
              </div>
            }
          </div>
        </div>
      </div>
    } @else {
      <div class="text-center py-12">
        <p class="text-slate-400 text-lg">Área no encontrada</p>
        <a routerLink="/maestros/areas" class="text-indigo-600 hover:text-indigo-800 mt-2 inline-block">Volver al listado</a>
      </div>
    }
  `,
})
export class AreaDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly areaService = inject(AreaService);
  private readonly sedeService = inject(SedeService);

  protected readonly area = signal<Area | undefined>(undefined);

  protected readonly estadoLabels = ESTADO_AREA_LABELS;
  protected readonly tipoLabels = TIPO_AREA_LABELS;
  protected readonly estadoClasses: Record<EstadoArea, string> = {
    disponible: 'bg-green-100 text-green-700',
    ocupada: 'bg-blue-100 text-blue-700',
    en_mantenimiento: 'bg-yellow-100 text-yellow-700',
    fuera_de_servicio: 'bg-red-100 text-red-700',
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.area.set(this.areaService.getById(id));
    }
  }

  protected getSedeNombre(id: string): string {
    return this.sedeService.getById(id)?.nombre ?? id;
  }
}
