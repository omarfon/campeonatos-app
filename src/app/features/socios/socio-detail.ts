import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SocioService } from '../../core/services/socio.service';
import { Socio, ESTADO_SOCIO_LABELS, EstadoSocio } from '../../core/models/socio.model';

@Component({
  selector: 'app-socio-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (socio(); as s) {
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <a routerLink="/maestros/socios" class="text-indigo-600 hover:text-indigo-800 text-sm">&larr; Volver</a>
            <h2 class="text-2xl font-bold text-slate-900 mt-1">{{ s.apellido }}, {{ s.nombre }}</h2>
            <p class="text-slate-500">DNI: {{ s.dni }}</p>
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
                [class]="estadoClasses[s.estado]">
                {{ estadoLabels[s.estado] }}
              </span>
            </p>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-4">
            <p class="text-sm text-slate-500">Fecha de alta</p>
            <p class="text-lg font-semibold">{{ s.fechaAlta }}</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-4">
            <p class="text-sm text-slate-500">Fecha de nacimiento</p>
            <p class="text-lg font-semibold">{{ s.fechaNacimiento ?? 'No registrada' }}</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-4">
            <p class="text-sm text-slate-500">Fecha de baja</p>
            <p class="text-lg font-semibold">{{ s.fechaBaja ?? '-' }}</p>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Información de contacto</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-slate-400">Email</p>
              <p class="font-medium">{{ s.email ?? 'No registrado' }}</p>
            </div>
            <div>
              <p class="text-slate-400">Teléfono</p>
              <p class="font-medium">{{ s.telefono ?? 'No registrado' }}</p>
            </div>
            <div class="sm:col-span-2">
              <p class="text-slate-400">Dirección</p>
              <p class="font-medium">{{ s.direccion ?? 'No registrada' }}</p>
            </div>
          </div>
        </div>

        @if (s.observaciones) {
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-slate-900 mb-2">Observaciones</h3>
            <p class="text-slate-600">{{ s.observaciones }}</p>
          </div>
        }
      </div>
    } @else {
      <div class="text-center py-12">
        <p class="text-slate-400 text-lg">Socio no encontrado</p>
        <a routerLink="/maestros/socios" class="text-indigo-600 hover:text-indigo-800 mt-2 inline-block">Volver al listado</a>
      </div>
    }
  `,
})
export class SocioDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly socioService = inject(SocioService);

  protected readonly socio = signal<Socio | undefined>(undefined);

  protected readonly estadoLabels = ESTADO_SOCIO_LABELS;
  protected readonly estadoClasses: Record<EstadoSocio, string> = {
    activo: 'bg-green-100 text-green-700',
    inactivo: 'bg-slate-100 text-slate-600',
    suspendido: 'bg-yellow-100 text-yellow-700',
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.socio.set(this.socioService.getById(id));
    }
  }
}
