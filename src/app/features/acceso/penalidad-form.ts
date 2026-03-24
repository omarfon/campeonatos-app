import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AccesoService } from '../../core/services/acceso.service';
import {
  ESTADO_PENALIDAD_LABELS,
  ESTADO_PENALIDAD_COLORS,
} from '../../core/models/acceso.model';

@Component({
  selector: 'app-penalidad-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="h-full flex flex-col">
      <!-- Cabecera -->
      <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-slate-800">Exonerar Penalidad</h2>
          @if (penalidad()) {
            <p class="mt-0.5 text-sm text-slate-500">{{ penalidad()!.socioNombre }}</p>
          }
        </div>
        <button
          type="button"
          (click)="cerrar()"
          class="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Cerrar panel"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Contenido -->
      <div class="flex-1 overflow-y-auto px-6 py-4 space-y-4">

        @if (!penalidad()) {
          <div class="py-12 text-center text-slate-400 text-sm">
            Penalidad no encontrada.
          </div>
        } @else {
          <!-- Detalles de la penalidad -->
          <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
            <div class="flex items-center justify-between">
              <p class="text-sm font-semibold text-amber-900">Detalle de la Penalidad</p>
              <span class="rounded-full text-xs px-2 py-0.5 font-medium {{ estadoColor(penalidad()!.estado) }}">
                {{ estadoLabel(penalidad()!.estado) }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p class="text-xs text-slate-500">Socio</p>
                <p class="font-semibold text-slate-800">{{ penalidad()!.socioNombre }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-500">DNI</p>
                <p class="font-medium text-slate-700">{{ penalidad()!.socioDni }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-500">Minutos excedidos</p>
                <p class="font-bold text-amber-800">{{ penalidad()!.minutosExcedidos }} min</p>
              </div>
              <div>
                <p class="text-xs text-slate-500">Monto original</p>
                <p class="font-bold text-amber-800">S/ {{ penalidad()!.montoCalculado }}</p>
              </div>
              <div class="col-span-2">
                <p class="text-xs text-slate-500">Fecha del evento</p>
                <p class="font-medium text-slate-700">{{ penalidad()!.fechaRegistro.substring(0, 16).replace('T', ' ') }}</p>
              </div>
              @if (penalidad()!.observaciones) {
                <div class="col-span-2">
                  <p class="text-xs text-slate-500">Observaciones</p>
                  <p class="text-slate-700 text-xs italic">{{ penalidad()!.observaciones }}</p>
                </div>
              }
            </div>
          </div>

          @if (penalidad()!.estado !== 'pendiente') {
            <div class="rounded-xl border border-green-200 bg-green-50 p-4 text-center text-sm text-green-700">
              Esta penalidad ya fue {{ estadoLabel(penalidad()!.estado).toLowerCase() }}.
              @if (penalidad()!.motivoExoneracion) {
                <p class="mt-1 italic text-xs">Motivo: {{ penalidad()!.motivoExoneracion }}</p>
              }
            </div>
          } @else {
            <!-- Formulario de exoneración -->
            <form [formGroup]="exoneracionForm" (ngSubmit)="confirmar()" class="space-y-4" id="exoneracionForm">
              <div>
                <label for="motivo" class="block text-sm font-medium text-slate-700 mb-1">
                  Motivo de exoneración <span class="text-red-500" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="motivo"
                  formControlName="motivo"
                  rows="4"
                  class="input-modern w-full resize-none"
                  placeholder="Describa el motivo de la exoneración (min. 10 caracteres). Ej: Clase especial autorizada por Coordinación Académica. Validado por gerencia el 22/03/2026."
                ></textarea>
                @if (exoneracionForm.get('motivo')?.touched && exoneracionForm.get('motivo')?.invalid) {
                  <p class="mt-1 text-xs text-red-600">Ingrese al menos 10 caracteres.</p>
                }
              </div>

              <div class="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700">
                <strong>Nota:</strong> La exoneración queda registrada en el historial de auditoría y no puede revertirse.
              </div>
            </form>
          }
        }
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-slate-100 flex justify-between items-center gap-3">
        <button type="button" (click)="cerrar()" class="btn-secondary">Cancelar</button>
        @if (penalidad()?.estado === 'pendiente') {
          <button
            type="submit"
            form="exoneracionForm"
            [disabled]="exoneracionForm.invalid || guardando()"
            class="btn-primary disabled:opacity-50"
          >
            {{ guardando() ? 'Guardando...' : 'Confirmar Exoneración' }}
          </button>
        }
      </div>
    </div>
  `,
})
export class PenalidadFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly svc = inject(AccesoService);
  private readonly fb = inject(FormBuilder);

  readonly penalidadId = signal('');
  readonly guardando = signal(false);

  readonly penalidad = computed(() => {
    const id = this.penalidadId();
    return id ? (this.svc.penalidadesDetalladas().find((p) => p.id === id) ?? null) : null;
  });

  readonly exoneracionForm = this.fb.group({
    motivo: ['', [Validators.required, Validators.minLength(10)]],
  });

  ngOnInit(): void {
    this.penalidadId.set(this.route.snapshot.paramMap.get('id') ?? '');
  }

  estadoLabel(estado: string): string {
    return ESTADO_PENALIDAD_LABELS[estado as keyof typeof ESTADO_PENALIDAD_LABELS] ?? estado;
  }

  estadoColor(estado: string): string {
    return ESTADO_PENALIDAD_COLORS[estado as keyof typeof ESTADO_PENALIDAD_COLORS] ?? '';
  }

  confirmar(): void {
    if (this.exoneracionForm.invalid) return;
    const id = this.penalidadId();
    if (!id) return;
    this.guardando.set(true);
    const motivo = this.exoneracionForm.getRawValue().motivo ?? '';
    this.svc.resolverPenalidad(id, 'exonerada', motivo);
    this.guardando.set(false);
    this.cerrar();
  }

  cerrar(): void {
    this.router.navigate(['/', { outlets: { panel: null } }]);
  }
}
