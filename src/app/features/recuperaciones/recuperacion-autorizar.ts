import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecuperacionService } from '../../core/services/recuperacion.service';
import { NotaCreditoService } from '../../core/services/nota-credito.service';
import { AcademiaService } from '../../core/services/academia.service';
import {
  Recuperacion,
  ESTADO_RECUPERACION_LABELS,
  MOTIVO_RECUPERACION_LABELS,
} from '../../core/models/recuperacion.model';
import { Clase } from '../../core/models/academia.model';

@Component({
  selector: 'app-recuperacion-autorizar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full flex flex-col">
      <!-- Cabecera -->
      <div class="px-6 py-5 border-b border-slate-100">
        <h2 class="text-lg font-semibold text-slate-800">Evaluar Solicitud de Recuperación</h2>
        <p class="mt-0.5 text-sm text-slate-500">
          Revisión administrativa — Solo se aprueban casos plenamente justificados
        </p>
      </div>

      @if (recuperacion(); as rec) {
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <!-- Datos del caso -->
          <div class="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Datos de la Solicitud
            </p>
            <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <span class="text-slate-500">Alumno:</span>
                <span class="ml-1 font-medium text-slate-800">{{ rec.nombreSocio }}</span>
              </div>
              <div>
                <span class="text-slate-500">Disciplina:</span>
                <span class="ml-1 font-medium text-slate-800">{{ rec.disciplina }}</span>
              </div>
              <div>
                <span class="text-slate-500">Clase original:</span>
                <span class="ml-1 font-medium text-slate-800">{{ rec.nombreClaseOriginal }}</span>
              </div>
              <div>
                <span class="text-slate-500">Sesión perdida:</span>
                <span class="ml-1 font-mono font-medium text-slate-800">
                  {{ rec.fechaSesionOriginal }}
                </span>
              </div>
              <div>
                <span class="text-slate-500">Motivo:</span>
                <span class="ml-1 font-medium text-slate-800">{{ motivoLabel(rec.motivo) }}</span>
              </div>
              <div>
                <span class="text-slate-500">Registrado:</span>
                <span class="ml-1 font-medium text-slate-800">{{ rec.fechaRegistro }}</span>
              </div>
            </div>
            <div class="pt-1 space-y-1">
              <p class="text-xs text-slate-500">
                Documento:
                <span class="font-medium text-slate-700">{{ rec.documentoJustificante }}</span>
              </p>
              <p class="text-xs text-slate-500">
                Comentario operador:
                <span class="italic text-slate-700">{{ rec.comentario }}</span>
              </p>
            </div>
          </div>

          <!-- Estado final (si ya está resuelto) -->
          @if (rec.estado === 'rechazada') {
            <div class="rounded-lg bg-red-50 border border-red-200 p-4">
              <p class="text-sm font-semibold text-red-800">Solicitud Rechazada</p>
              @if (rec.motivoRechazo) {
                <p class="text-xs mt-1 text-red-700">Motivo: {{ rec.motivoRechazo }}</p>
              }
              <p class="text-xs mt-1 text-red-600">Evaluado por: {{ rec.evaluadoPor }}</p>
            </div>
          }
          @if (rec.estado === 'ejecutada') {
            <div class="rounded-lg bg-green-50 border border-green-200 p-4">
              <p class="text-sm font-semibold text-green-800">Solicitud Ejecutada</p>
              <p class="text-xs mt-1 text-green-700">
                Clase asignada: {{ rec.nombreClaseRecuperacion }}
              </p>
              <p class="text-xs text-green-700">Fecha: {{ rec.fechaRecuperacion }}</p>
            </div>
          }
          @if (rec.estado === 'diferida') {
            <div class="rounded-lg bg-purple-50 border border-purple-200 p-4">
              <p class="text-sm font-semibold text-purple-800">Diferida al mes siguiente</p>
              <p class="text-xs mt-1 text-purple-700">
                Nota de Crédito emitida: {{ rec.notaCreditoId }}
              </p>
            </div>
          }

          <!-- Panel de acciones (solo si está pendiente de evaluación o aprobada) -->
          @if (
            rec.estado === 'pendiente_documentos' ||
            rec.estado === 'en_evaluacion' ||
            rec.estado === 'aprobada'
          ) {
            <div class="rounded-xl border border-slate-200 overflow-hidden">
              <!-- Pestañas -->
              <div class="flex border-b border-slate-100">
                @for (tab of tabs; track tab.valor) {
                  <button
                    type="button"
                    (click)="accion.set(tab.valor)"
                    class="flex-1 py-2.5 text-sm font-medium transition-colors"
                    [class]="
                      accion() === tab.valor
                        ? 'border-b-2 border-teal-500 text-teal-700 bg-white'
                        : 'text-slate-500 hover:text-slate-700 bg-slate-50'
                    "
                  >
                    {{ tab.label }}
                  </button>
                }
              </div>

              <div class="p-5">
                <!-- Pestaña: Aprobar -->
                @if (accion() === 'aprobar') {
                  <div class="space-y-4">
                    <div>
                      <p class="text-sm font-medium text-slate-700 mb-2">
                        ¿Hay cupo comodín disponible en este ciclo?
                      </p>
                      <div class="flex flex-col gap-2">
                        <label class="flex items-start gap-3 text-sm cursor-pointer">
                          <input
                            type="radio"
                            name="tieneCupoRec"
                            value="si"
                            (change)="tieneCupo.set(true)"
                            class="mt-0.5 accent-teal-600"
                          />
                          <div>
                            <span class="font-medium text-slate-700">Sí — asignar clase</span>
                            <p class="text-xs text-slate-500 mt-0.5">
                              Se descuenta del aforo comodín de la clase asignada.
                            </p>
                          </div>
                        </label>
                        <label class="flex items-start gap-3 text-sm cursor-pointer">
                          <input
                            type="radio"
                            name="tieneCupoRec"
                            value="no"
                            (change)="tieneCupo.set(false)"
                            class="mt-0.5 accent-teal-600"
                          />
                          <div>
                            <span class="font-medium text-slate-700">
                              No — diferir al mes siguiente
                            </span>
                            <p class="text-xs text-slate-500 mt-0.5">
                              Se genera una Nota de Crédito por el costo de la sesión.
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    @if (tieneCupo() === true) {
                      <div>
                        <label for="claseRec" class="block text-sm font-medium text-slate-700 mb-1">
                          Clase de recuperación
                          <span class="text-xs text-slate-400 ml-1"
                            >(misma disciplina y nivel)</span
                          >
                        </label>
                        <select
                          id="claseRec"
                          (change)="claseRecuperacionId.set($any($event.target).value)"
                          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                          <option value="">Seleccionar clase disponible…</option>
                          @for (c of clasesCompatibles(); track c.id) {
                            <option [value]="c.id">{{ getNombreClase(c) }}</option>
                          }
                        </select>
                        <p class="mt-1 text-xs text-slate-500">
                          Solo se muestran clases con vacantes disponibles.
                        </p>
                      </div>

                      <div>
                        <label for="fechaRec" class="block text-sm font-medium text-slate-700 mb-1">
                          Fecha de la clase de recuperación
                        </label>
                        <input
                          id="fechaRec"
                          type="date"
                          (change)="fechaRecuperacion.set($any($event.target).value)"
                          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>

                      <button
                        type="button"
                        (click)="confirmarAprobacion()"
                        [disabled]="!claseRecuperacionId() || !fechaRecuperacion()"
                        class="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Aprobar y asignar clase de recuperación
                      </button>
                    }

                    @if (tieneCupo() === false) {
                      <div
                        class="rounded-lg bg-purple-50 border border-purple-200 p-3.5 text-sm text-purple-800 space-y-1.5"
                      >
                        <p class="font-medium">Diferir al mes siguiente</p>
                        <p class="text-xs">
                          Se generará una Nota de Crédito por el costo de la sesión perdida. El
                          alumno podrá aplicarla como descuento al matricularse el mes siguiente, sin
                          recibir la penalidad del 10% por clases ya empezadas.
                        </p>
                      </div>
                      <button
                        type="button"
                        (click)="confirmarDiferido()"
                        class="w-full rounded-lg bg-purple-600 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                      >
                        Diferir y emitir Nota de Crédito
                      </button>
                    }
                  </div>
                }

                <!-- Pestaña: Rechazar -->
                @if (accion() === 'rechazar') {
                  <div class="space-y-3">
                    <div>
                      <label
                        for="motivoRechazoAdm"
                        class="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Motivo del rechazo
                        <span class="text-red-500" aria-hidden="true">*</span>
                      </label>
                      <textarea
                        id="motivoRechazoAdm"
                        rows="3"
                        (input)="motivoRechazo.set($any($event.target).value)"
                        placeholder="Especifique por qué no procede la solicitud…"
                        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                      ></textarea>
                    </div>
                    <button
                      type="button"
                      (click)="confirmarRechazo()"
                      [disabled]="motivoRechazo().trim().length < 5"
                      class="w-full rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Rechazar solicitud
                    </button>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="flex-1 flex items-center justify-center text-slate-400 text-sm">
          Solicitud no encontrada.
        </div>
      }

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-slate-100">
        <button
          type="button"
          (click)="cancelar()"
          class="w-full rounded-lg border border-slate-200 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  `,
})
export class RecuperacionAutorizarComponent implements OnInit {
  private readonly svc = inject(RecuperacionService);
  private readonly notaCreditoService = inject(NotaCreditoService);
  private readonly academiaService = inject(AcademiaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly recuperacion = signal<Recuperacion | null>(null);
  readonly accion = signal<'aprobar' | 'rechazar'>('aprobar');
  readonly tieneCupo = signal<boolean | null>(null);
  readonly claseRecuperacionId = signal('');
  readonly fechaRecuperacion = signal('');
  readonly motivoRechazo = signal('');

  readonly tabs = [
    { valor: 'aprobar' as const, label: 'Aprobar' },
    { valor: 'rechazar' as const, label: 'Rechazar' },
  ];

  /** Clases disponibles con vacantes (en una impl. completa se filtraría por disciplina/nivel) */
  readonly clasesCompatibles = computed(() => {
    const rec = this.recuperacion();
    if (!rec) return [];
    return this.academiaService
      .clases()
      .filter((c) => c.id !== rec.claseOriginalId && c.vacantes > c.matriculados);
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.recuperacion.set(this.svc.getById(id) ?? null);
    }
  }

  getNombreClase(clase: Clase): string {
    const curso = this.academiaService.getCursoById(clase.cursoId);
    return `${curso?.nombre ?? '—'} · ${clase.periodo}`;
  }

  motivoLabel(motivo: string): string {
    return (
      MOTIVO_RECUPERACION_LABELS[motivo as keyof typeof MOTIVO_RECUPERACION_LABELS] ?? motivo
    );
  }

  confirmarAprobacion(): void {
    const rec = this.recuperacion();
    if (!rec) return;
    const claseId = this.claseRecuperacionId();
    const clase = this.academiaService.getClaseById(claseId);
    const nombreClase = clase ? this.getNombreClase(clase) : '';
    this.svc.aprobar(rec.id, 'admin', claseId, nombreClase, this.fechaRecuperacion());
    this.cancelar();
  }

  confirmarDiferido(): void {
    const rec = this.recuperacion();
    if (!rec) return;
    // Costo estimado por sesión (en implementación real vendría del servicio de matrículas)
    const nc = this.notaCreditoService.crear({
      socioId: rec.socioId,
      nombreSocio: rec.nombreSocio,
      origen: 'recuperacion_diferida',
      origenId: rec.id,
      descripcionOrigen: `Recuperación diferida — ${rec.disciplina} (sesión ${rec.fechaSesionOriginal})`,
      monto: 6.75,
    });
    this.svc.diferir(rec.id, 'admin', nc.id);
    this.cancelar();
  }

  confirmarRechazo(): void {
    const rec = this.recuperacion();
    if (!rec) return;
    this.svc.rechazar(rec.id, 'admin', this.motivoRechazo());
    this.cancelar();
  }

  cancelar(): void {
    this.router.navigate(['/', { outlets: { panel: null } }]);
  }
}
