import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SocioService } from '../../core/services/socio.service';
import { ESTADO_SOCIO_LABELS, EstadoSocio } from '../../core/models/socio.model';

@Component({
  selector: 'app-socio-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Socios</h2>
          <p class="text-slate-500 mt-1">Gestión de socios y membresías</p>
        </div>
        <a routerLink="nuevo" class="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          <span aria-hidden="true">+</span> Nuevo Socio
        </a>
      </div>

      <!-- Filtro estado -->
      <div class="flex flex-wrap gap-2">
        <button
          class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
          [class]="filtroEstado() === 'todos' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'"
          (click)="filtroEstado.set('todos')"
        >Todos</button>
        <button
          class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
          [class]="filtroEstado() === 'activo' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'"
          (click)="filtroEstado.set('activo')"
        >Activos</button>
        <button
          class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
          [class]="filtroEstado() === 'inactivo' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'"
          (click)="filtroEstado.set('inactivo')"
        >Inactivos</button>
        <button
          class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
          [class]="filtroEstado() === 'suspendido' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'"
          (click)="filtroEstado.set('suspendido')"
        >Suspendidos</button>
      </div>

      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50 border-b">
                <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Nombre</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">DNI</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Teléfono</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Estado</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Alta</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (socio of filteredSocios(); track socio.id) {
                <tr class="hover:bg-slate-50">
                  <td class="px-6 py-3">
                    <a [routerLink]="[socio.id]" class="font-medium text-indigo-600 hover:text-indigo-800">
                      {{ socio.apellido }}, {{ socio.nombre }}
                    </a>
                  </td>
                  <td class="px-6 py-3 text-slate-600 font-mono text-sm">{{ socio.dni }}</td>
                  <td class="px-6 py-3 text-slate-600 text-sm">{{ socio.email ?? '-' }}</td>
                  <td class="px-6 py-3 text-slate-600 text-sm">{{ socio.telefono ?? '-' }}</td>
                  <td class="px-6 py-3">
                    <span class="text-xs px-2 py-0.5 rounded font-medium"
                      [class]="estadoClasses[socio.estado]">
                      {{ estadoLabels[socio.estado] }}
                    </span>
                  </td>
                  <td class="px-6 py-3 text-sm text-slate-500">{{ socio.fechaAlta }}</td>
                  <td class="px-6 py-3">
                    <div class="flex gap-2">
                      <a [routerLink]="[socio.id, 'editar']" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Editar</a>
                      <button (click)="eliminar(socio.id)" class="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-6 py-12 text-center text-slate-400">No hay socios registrados</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class SocioListComponent {
  private readonly socioService = inject(SocioService);

  protected readonly filtroEstado = signal<string>('todos');

  protected readonly filteredSocios = computed(() => {
    const filtro = this.filtroEstado();
    const socios = this.socioService.items();
    return filtro === 'todos' ? socios : socios.filter((s) => s.estado === filtro);
  });

  protected readonly estadoLabels = ESTADO_SOCIO_LABELS;
  protected readonly estadoClasses: Record<EstadoSocio, string> = {
    activo: 'bg-green-100 text-green-700',
    inactivo: 'bg-slate-100 text-slate-600',
    suspendido: 'bg-yellow-100 text-yellow-700',
  };

  protected eliminar(id: string): void {
    if (confirm('¿Está seguro de eliminar este socio?')) {
      this.socioService.delete(id);
    }
  }
}
