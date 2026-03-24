import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatriculaService } from '../../core/services/matricula.service';
import {
  EstadoMatricula,
  ESTADO_MATRICULA_LABELS,
  TIPO_MATRICULA_LABELS,
  CANAL_MATRICULA_LABELS,
} from '../../core/models/matricula.model';

@Component({
  selector: 'app-matricula-module-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Matrículas</h2>
          <p class="text-slate-500 mt-1">Gestión integral del proceso de matrícula</p>
        </div>
        <a [routerLink]="['/', { outlets: { primary: ['matricula'], panel: ['matricula', 'nueva'] } }]"
          class="inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors">
          <span aria-hidden="true">+</span> Nueva Matrícula
        </a>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl shadow-sm p-4">
          <p class="text-xs font-semibold text-slate-500 uppercase">Confirmadas</p>
          <p class="text-2xl font-bold text-green-600 mt-1">{{ service.totalConfirmadas() }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4">
          <p class="text-xs font-semibold text-slate-500 uppercase">Pendientes</p>
          <p class="text-2xl font-bold text-yellow-600 mt-1">{{ service.totalPendientes() }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4">
          <p class="text-xs font-semibold text-slate-500 uppercase">Anuladas</p>
          <p class="text-2xl font-bold text-red-600 mt-1">{{ service.totalAnuladas() }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4">
          <p class="text-xs font-semibold text-slate-500 uppercase">Retiradas</p>
          <p class="text-2xl font-bold text-slate-600 mt-1">{{ service.totalRetiradas() }}</p>
        </div>
      </div>

      <!-- Filtros -->
      <div class="flex flex-wrap gap-2">
        @for (f of filtros; track f.value) {
          <button
            class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            [class]="filtroEstado() === f.value ? 'bg-brand text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'"
            (click)="filtroEstado.set(f.value)"
          >{{ f.label }}</button>
        }
      </div>

      <!-- Tabla -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50 border-b">
                <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Socio</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">DNI</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Curso</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Tipo</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Canal</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Monto</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Estado</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Fecha</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (m of filteredMatriculas(); track m.id) {
                <tr class="hover:bg-slate-50">
                  <td class="px-6 py-3">
                    <a [routerLink]="[m.id]" class="font-medium text-brand hover:text-brand-700">
                      {{ m.socioNombre }}
                    </a>
                  </td>
                  <td class="px-6 py-3 text-slate-600 font-mono text-sm">{{ m.socioDni }}</td>
                  <td class="px-6 py-3 text-slate-600 text-sm">{{ m.cursoNombre }}</td>
                  <td class="px-6 py-3 text-sm">
                    <span class="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                      {{ tipoLabels[m.tipo] }}
                    </span>
                  </td>
                  <td class="px-6 py-3 text-sm text-slate-600">{{ canalLabels[m.canal] }}</td>
                  <td class="px-6 py-3 text-sm font-mono text-slate-700">S/ {{ m.montoFinal.toFixed(2) }}</td>
                  <td class="px-6 py-3">
                    <span class="text-xs px-2 py-0.5 rounded font-medium"
                      [class]="estadoClasses[m.estado]">
                      {{ estadoLabels[m.estado] }}
                    </span>
                  </td>
                  <td class="px-6 py-3 text-sm text-slate-500">{{ m.fechaRegistro }}</td>
                  <td class="px-6 py-3">
                    <a [routerLink]="[m.id]" class="text-brand hover:text-brand-700 text-sm font-medium">Ver</a>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="9" class="px-6 py-12 text-center text-slate-400">No hay matrículas registradas</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class MatriculaListComponent {
  protected readonly service = inject(MatriculaService);

  protected readonly filtroEstado = signal<string>('todos');

  protected readonly filtros: { value: string; label: string }[] = [
    { value: 'todos', label: 'Todas' },
    { value: 'reservada', label: 'Reservadas' },
    { value: 'pendiente_pago', label: 'Pendiente Pago' },
    { value: 'pagada', label: 'Pagadas' },
    { value: 'confirmada', label: 'Confirmadas' },
    { value: 'anulada', label: 'Anuladas' },
    { value: 'retirada', label: 'Retiradas' },
  ];

  protected readonly filteredMatriculas = computed(() => {
    const filtro = this.filtroEstado();
    const items = this.service.matriculasDetalladas();
    return filtro === 'todos' ? items : items.filter((m) => m.estado === filtro);
  });

  protected readonly estadoLabels = ESTADO_MATRICULA_LABELS;
  protected readonly tipoLabels = TIPO_MATRICULA_LABELS;
  protected readonly canalLabels = CANAL_MATRICULA_LABELS;

  protected readonly estadoClasses: Record<EstadoMatricula, string> = {
    reservada: 'bg-blue-100 text-blue-700',
    pendiente_pago: 'bg-yellow-100 text-yellow-700',
    pagada: 'bg-emerald-100 text-emerald-700',
    confirmada: 'bg-green-100 text-green-700',
    anulada: 'bg-red-100 text-red-700',
    retirada: 'bg-slate-100 text-slate-600',
  };
}
