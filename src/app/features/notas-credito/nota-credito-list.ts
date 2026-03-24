import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NotaCreditoService } from '../../core/services/nota-credito.service';
import {
  EstadoNotaCredito,
  ESTADO_NC_LABELS,
  ORIGEN_NC_LABELS,
  OrigenNotaCredito,
} from '../../core/models/nota-credito.model';

type Filtro = EstadoNotaCredito | 'todos';

const BADGE_NC: Record<EstadoNotaCredito, string> = {
  activa: 'bg-green-100 text-green-800',
  aplicada_parcial: 'bg-blue-100 text-blue-800',
  aplicada_total: 'bg-slate-100 text-slate-600',
  vencida: 'bg-red-100 text-red-800',
  anulada: 'bg-red-50 text-red-500',
};

@Component({
  selector: 'app-nota-credito-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <!-- Cabecera -->
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Notas de Crédito</h1>
          <p class="mt-1 text-sm text-slate-500">
            Generadas automáticamente por retiros, anulaciones y recuperaciones diferidas
          </p>
        </div>
        <div class="text-right shrink-0">
          <p class="text-xs text-slate-500">Saldo total disponible</p>
          <p class="text-xl font-bold font-mono text-teal-700">
            S/ {{ svc.saldoTotalDisponible().toFixed(2) }}
          </p>
          <p class="text-xs text-slate-400">{{ svc.totalActivas() }} notas activas</p>
        </div>
      </div>

      <!-- Nota tributaria -->
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 flex gap-3">
        <svg
          class="w-5 h-5 mt-0.5 shrink-0 text-slate-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path stroke-linecap="round" d="M12 16v-4M12 8h.01" />
        </svg>
        <div class="text-sm text-slate-700">
          <p class="font-semibold">Restricciones tributarias</p>
          <p class="mt-0.5 text-slate-600">
            Las notas de crédito no son de libre transferencia. Deben aplicarse a la misma persona
            (o titular que realizó el pago) para evitar riesgos contables. No se pueden ceder a
            terceros.
          </p>
        </div>
      </div>

      <!-- Filtros -->
      <div class="flex flex-wrap gap-2">
        @for (f of filtros; track f.valor) {
          <button
            (click)="filtroActivo.set(f.valor)"
            [class]="
              filtroActivo() === f.valor
                ? 'rounded-full px-4 py-1.5 text-sm font-medium bg-teal-600 text-white'
                : 'rounded-full px-4 py-1.5 text-sm font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            "
          >
            {{ f.label }}
          </button>
        }
      </div>

      <!-- Tabla -->
      <div class="rounded-xl bg-white shadow-sm overflow-hidden border border-slate-100">
        @if (listFiltrada().length === 0) {
          <div class="py-16 text-center text-slate-400">
            <p class="text-sm font-medium">No hay notas de crédito para este filtro</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th
                    class="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs"
                  >
                    Número
                  </th>
                  <th
                    class="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs"
                  >
                    Alumno
                  </th>
                  <th
                    class="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs"
                  >
                    Origen
                  </th>
                  <th
                    class="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs"
                  >
                    Monto total
                  </th>
                  <th
                    class="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs"
                  >
                    Saldo disponible
                  </th>
                  <th
                    class="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs"
                  >
                    Estado
                  </th>
                  <th
                    class="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs"
                  >
                    Emisión
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                @for (nc of listFiltrada(); track nc.id) {
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-5 py-3 font-mono font-medium text-teal-700">{{ nc.numero }}</td>
                    <td class="px-5 py-3 font-medium text-slate-800">{{ nc.nombreSocio }}</td>
                    <td class="px-5 py-3">
                      <span class="text-xs font-medium text-slate-600">
                        {{ origenLabel(nc.origen) }}
                      </span>
                      <p class="text-xs text-slate-400 truncate max-w-52">
                        {{ nc.descripcionOrigen }}
                      </p>
                    </td>
                    <td class="px-5 py-3 font-mono text-slate-700">
                      S/ {{ nc.monto.toFixed(2) }}
                    </td>
                    <td
                      class="px-5 py-3 font-mono font-semibold"
                      [class]="nc.saldoDisponible > 0 ? 'text-teal-700' : 'text-slate-400'"
                    >
                      S/ {{ nc.saldoDisponible.toFixed(2) }}
                    </td>
                    <td class="px-5 py-3">
                      <span
                        class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                        [class]="badgeClass(nc.estado)"
                      >
                        {{ estadoLabel(nc.estado) }}
                      </span>
                    </td>
                    <td class="px-5 py-3 font-mono text-xs text-slate-500">
                      {{ nc.fechaEmision }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
})
export class NotaCreditoListComponent {
  protected readonly svc = inject(NotaCreditoService);

  readonly filtroActivo = signal<Filtro>('todos');

  readonly filtros: { valor: Filtro; label: string }[] = [
    { valor: 'todos', label: 'Todas' },
    { valor: 'activa', label: 'Activas' },
    { valor: 'aplicada_parcial', label: 'Aplicadas parcialmente' },
    { valor: 'aplicada_total', label: 'Aplicadas totalmente' },
    { valor: 'vencida', label: 'Vencidas' },
    { valor: 'anulada', label: 'Anuladas' },
  ];

  readonly listFiltrada = computed(() => {
    const f = this.filtroActivo();
    const all = this.svc.notas();
    return f === 'todos' ? all : all.filter((nc) => nc.estado === f);
  });

  estadoLabel(estado: EstadoNotaCredito): string {
    return ESTADO_NC_LABELS[estado];
  }

  origenLabel(origen: OrigenNotaCredito): string {
    return ORIGEN_NC_LABELS[origen];
  }

  badgeClass(estado: EstadoNotaCredito): string {
    return BADGE_NC[estado] ?? 'bg-slate-100 text-slate-600';
  }
}
