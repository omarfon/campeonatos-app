import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { RetiroService } from '../../core/services/retiro.service';
import {
  EstadoRetiro,
  ESTADO_RETIRO_LABELS,
  TIPO_RETIRO_LABELS,
  FORMA_DEVOLUCION_LABELS,
} from '../../core/models/retiro.model';

type Filtro = EstadoRetiro | 'todos';

const BADGE_RETIRO: Record<EstadoRetiro, string> = {
  borrador: 'bg-slate-100 text-slate-600',
  pendiente_aprobacion: 'bg-yellow-100 text-yellow-800',
  procesado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
};

@Component({
  selector: 'app-retiro-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <!-- Cabecera -->
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Anulaciones y Retiros</h1>
          <p class="mt-1 text-sm text-slate-500">
            Cálculo de prorrateo de clases, gasto administrativo y generación de Nota de Crédito
          </p>
        </div>
        <button
          (click)="nuevo()"
          class="shrink-0 flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors"
        >
          <svg
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14" />
          </svg>
          Registrar Retiro
        </button>
      </div>

      <!-- Alerta informativa -->
      <div class="rounded-xl border border-blue-200 bg-blue-50 p-4 flex gap-3">
        <svg
          class="w-5 h-5 mt-0.5 shrink-0 text-blue-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path stroke-linecap="round" d="M12 16v-4M12 8h.01" />
        </svg>
        <div class="text-sm text-blue-800">
          <p class="font-semibold">Proceso presencial y administrativo</p>
          <p class="mt-0.5">
            El sistema calcula el prorrateo exacto de clases asistidas y emite automáticamente la
            Nota de Crédito. Si el retiro es por responsabilidad AELU, no se cobra gasto
            administrativo. La devolución en efectivo la gestiona el área contable externamente.
            Los retiros impactan la liquidación mensual de docentes.
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
                ? 'rounded-full px-4 py-1.5 text-sm font-medium bg-rose-600 text-white'
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
            <p class="text-sm font-medium">No hay retiros registrados para este filtro</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th
                    class="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs"
                  >
                    Alumno
                  </th>
                  <th
                    class="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs"
                  >
                    Curso
                  </th>
                  <th
                    class="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs"
                  >
                    Tipo
                  </th>
                  <th
                    class="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs"
                  >
                    Sesiones
                  </th>
                  <th
                    class="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs"
                  >
                    Nota de Crédito
                  </th>
                  <th
                    class="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs"
                  >
                    Devolución
                  </th>
                  <th
                    class="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs"
                  >
                    Estado
                  </th>
                  <th
                    class="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs"
                  >
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                @for (r of listFiltrada(); track r.id) {
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-5 py-3 font-medium text-slate-800">{{ r.nombreSocio }}</td>
                    <td class="px-5 py-3 text-slate-600">{{ r.cursoNombre }}</td>
                    <td class="px-5 py-3">
                      <span
                        class="text-xs font-medium"
                        [class]="r.tipo === 'total' ? 'text-red-600' : 'text-amber-700'"
                      >
                        {{ tipoLabel(r.tipo) }}
                      </span>
                    </td>
                    <td class="px-5 py-3 text-xs text-slate-600">
                      {{ r.calculo.sesionesAsistidas }}/{{ r.calculo.totalSesiones }} tomadas
                    </td>
                    <td class="px-5 py-3 font-mono font-medium">
                      @if (r.calculo.montoNotaCredito > 0) {
                        <span class="text-teal-700">
                          S/ {{ r.calculo.montoNotaCredito.toFixed(2) }}
                        </span>
                      } @else {
                        <span class="text-slate-400">—</span>
                      }
                    </td>
                    <td class="px-5 py-3 text-slate-600 text-xs">
                      {{ devolucionLabel(r.formaDevolucion) }}
                    </td>
                    <td class="px-5 py-3">
                      <span
                        class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                        [class]="badgeClass(r.estado)"
                      >
                        {{ estadoLabel(r.estado) }}
                      </span>
                    </td>
                    <td class="px-5 py-3 font-mono text-xs text-slate-500">
                      {{ r.fechaProcesamiento }}
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
export class RetiroListComponent {
  private readonly svc = inject(RetiroService);
  private readonly router = inject(Router);

  readonly filtroActivo = signal<Filtro>('todos');

  readonly filtros: { valor: Filtro; label: string }[] = [
    { valor: 'todos', label: 'Todos' },
    { valor: 'procesado', label: 'Procesados' },
    { valor: 'pendiente_aprobacion', label: 'Pendientes' },
    { valor: 'cancelado', label: 'Cancelados' },
  ];

  readonly listFiltrada = computed(() => {
    const f = this.filtroActivo();
    const all = this.svc.retiros();
    return f === 'todos' ? all : all.filter((r) => r.estado === f);
  });

  estadoLabel(estado: EstadoRetiro): string {
    return ESTADO_RETIRO_LABELS[estado];
  }

  tipoLabel(tipo: string): string {
    return TIPO_RETIRO_LABELS[tipo as keyof typeof TIPO_RETIRO_LABELS] ?? tipo;
  }

  devolucionLabel(f: string): string {
    return FORMA_DEVOLUCION_LABELS[f as keyof typeof FORMA_DEVOLUCION_LABELS] ?? f;
  }

  badgeClass(estado: EstadoRetiro): string {
    return BADGE_RETIRO[estado] ?? 'bg-slate-100 text-slate-600';
  }

  nuevo(): void {
    this.router.navigate(['/', { outlets: { panel: ['operaciones', 'retiros', 'nuevo'] } }]);
  }
}
