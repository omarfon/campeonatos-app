import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { RecuperacionService } from '../../core/services/recuperacion.service';
import {
  ESTADO_RECUPERACION_LABELS,
  EstadoRecuperacion,
  MOTIVO_RECUPERACION_LABELS,
} from '../../core/models/recuperacion.model';

type Filtro = EstadoRecuperacion | 'todos';

const BADGE_CLASSES: Record<EstadoRecuperacion, string> = {
  pendiente_documentos: 'bg-yellow-100 text-yellow-800',
  en_evaluacion: 'bg-blue-100 text-blue-800',
  aprobada: 'bg-teal-100 text-teal-800',
  rechazada: 'bg-red-100 text-red-800',
  ejecutada: 'bg-green-100 text-green-800',
  diferida: 'bg-purple-100 text-purple-800',
};

@Component({
  selector: 'app-recuperacion-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <!-- Cabecera -->
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Recuperación de Clases</h1>
          <p class="mt-1 text-sm text-slate-500">
            Proceso excepcional y administrativo — Solo con documentación justificada
          </p>
        </div>
        <button
          (click)="nueva()"
          class="shrink-0 flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
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
          Nueva Solicitud
        </button>
      </div>

      <!-- Alerta de política -->
      <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
        <svg
          class="w-5 h-5 mt-0.5 shrink-0 text-amber-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"
          />
        </svg>
        <div class="text-sm text-amber-800">
          <p class="font-semibold">Política general: no se brindan recuperaciones ni devoluciones.</p>
          <p class="mt-0.5">
            Las recuperaciones son excepcionales. Requieren evaluación de documentos por la
            administración (certificado médico, carta laboral o historial clínico por viaje de salud).
            <strong>El alumno no puede autogestionar este trámite.</strong> El proceso inicia con un
            correo a la administración; el Counter solo puede ejecutar si existe una autorización
            previa en sistema.
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
            @if (contarPorEstado(f.valor) > 0) {
              <span
                class="ml-1.5 rounded-full px-1.5 py-0.5 text-xs"
                [class]="
                  filtroActivo() === f.valor
                    ? 'bg-teal-500 text-white'
                    : 'bg-slate-100 text-slate-500'
                "
              >
                {{ contarPorEstado(f.valor) }}
              </span>
            }
          </button>
        }
      </div>

      <!-- Tabla -->
      <div class="rounded-xl bg-white shadow-sm overflow-hidden border border-slate-100">
        @if (listFiltrada().length === 0) {
          <div class="py-16 text-center text-slate-400">
            <svg
              class="w-10 h-10 mx-auto mb-3 text-slate-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12h6m-3-3v6M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"
              />
            </svg>
            <p class="text-sm font-medium">No hay solicitudes para este filtro</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th class="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs">
                    Alumno
                  </th>
                  <th class="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs">
                    Disciplina / Nivel
                  </th>
                  <th class="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs">
                    Sesión perdida
                  </th>
                  <th class="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs">
                    Motivo
                  </th>
                  <th class="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs">
                    Estado
                  </th>
                  <th class="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs">
                    Registrado
                  </th>
                  <th class="px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                @for (r of listFiltrada(); track r.id) {
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-5 py-3 font-medium text-slate-800">{{ r.nombreSocio }}</td>
                    <td class="px-5 py-3 text-slate-600">
                      {{ r.disciplina }}
                      <span class="text-slate-400"> · {{ r.nivel }}</span>
                    </td>
                    <td class="px-5 py-3 font-mono text-slate-700">{{ r.fechaSesionOriginal }}</td>
                    <td class="px-5 py-3 text-slate-600 text-xs">{{ motivoLabel(r.motivo) }}</td>
                    <td class="px-5 py-3">
                      <span
                        class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                        [class]="badgeClass(r.estado)"
                      >
                        {{ estadoLabel(r.estado) }}
                      </span>
                    </td>
                    <td class="px-5 py-3 text-slate-500 text-xs">{{ r.fechaRegistro }}</td>
                    <td class="px-5 py-3">
                      <div class="flex items-center gap-2">
                        @if (
                          r.estado === 'pendiente_documentos' || r.estado === 'en_evaluacion'
                        ) {
                          <button
                            (click)="evaluar(r.id)"
                            class="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                          >
                            Evaluar
                          </button>
                        }
                        @if (r.estado === 'aprobada') {
                          <button
                            (click)="evaluar(r.id)"
                            class="rounded-md bg-teal-600 px-3 py-1 text-xs font-medium text-white hover:bg-teal-700 transition-colors"
                          >
                            Asignar clase
                          </button>
                        }
                        @if (r.diferida && r.notaCreditoId) {
                          <span
                            class="rounded-md bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700"
                          >
                            NC emitida
                          </span>
                        }
                        @if (r.estado === 'ejecutada') {
                          <span class="text-xs text-green-700">
                            <svg
                              class="inline w-3.5 h-3.5 mr-0.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              aria-hidden="true"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            {{ r.fechaRecuperacion }}
                          </span>
                        }
                      </div>
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
export class RecuperacionListComponent {
  private readonly svc = inject(RecuperacionService);
  private readonly router = inject(Router);

  readonly filtroActivo = signal<Filtro>('todos');

  readonly filtros: { valor: Filtro; label: string }[] = [
    { valor: 'todos', label: 'Todos' },
    { valor: 'pendiente_documentos', label: 'Pend. Documentos' },
    { valor: 'en_evaluacion', label: 'En Evaluación' },
    { valor: 'aprobada', label: 'Aprobada' },
    { valor: 'ejecutada', label: 'Ejecutada' },
    { valor: 'rechazada', label: 'Rechazada' },
    { valor: 'diferida', label: 'Diferida' },
  ];

  readonly listFiltrada = computed(() => {
    const f = this.filtroActivo();
    const all = this.svc.recuperaciones();
    return f === 'todos' ? all : all.filter((r) => r.estado === f);
  });

  contarPorEstado(filtro: Filtro): number {
    const all = this.svc.recuperaciones();
    if (filtro === 'todos') return all.length;
    return all.filter((r) => r.estado === filtro).length;
  }

  estadoLabel(estado: EstadoRecuperacion): string {
    return ESTADO_RECUPERACION_LABELS[estado];
  }

  motivoLabel(motivo: string): string {
    return (
      MOTIVO_RECUPERACION_LABELS[motivo as keyof typeof MOTIVO_RECUPERACION_LABELS] ?? motivo
    );
  }

  badgeClass(estado: EstadoRecuperacion): string {
    return BADGE_CLASSES[estado] ?? 'bg-slate-100 text-slate-700';
  }

  nueva(): void {
    this.router.navigate(['/', { outlets: { panel: ['operaciones', 'recuperaciones', 'nueva'] } }]);
  }

  evaluar(id: string): void {
    this.router.navigate([
      '/',
      { outlets: { panel: ['operaciones', 'recuperaciones', id, 'evaluar'] } },
    ]);
  }
}
