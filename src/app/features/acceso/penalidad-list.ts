import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AccesoService } from '../../core/services/acceso.service';
import {
  EstadoPenalidad,
  ESTADO_PENALIDAD_LABELS,
  ESTADO_PENALIDAD_COLORS,
} from '../../core/models/acceso.model';

@Component({
  selector: 'app-penalidad-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand via-brand-700 to-brand-900 p-4 text-white shadow-xl shadow-brand-200">
        <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,white_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        <div class="relative">
          <h2 class="text-xl font-extrabold tracking-tight">Penalidades de Acceso</h2>
          <p class="text-brand-200 text-xs mt-0.5">Por exceso de permanencia post-clase</p>
        </div>
        <div class="relative mt-3 grid grid-cols-3 gap-3">
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1.5 text-center">
            <p class="text-lg font-bold">{{ stats().pendientes }}</p>
            <p class="text-[10px] text-brand-200">Pendientes</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1.5 text-center">
            <p class="text-lg font-bold text-emerald-300">{{ stats().pagadas }}</p>
            <p class="text-[10px] text-brand-200">Pagadas</p>
          </div>
          <div class="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-1.5 text-center">
            <p class="text-lg font-bold text-amber-300">S/ {{ stats().montoPendiente }}</p>
            <p class="text-[10px] text-brand-200">Por cobrar</p>
          </div>
        </div>
      </div>

      <!-- Filtro -->
      <div class="section-card">
        <div class="flex gap-2">
          <select
            class="input-modern !py-1.5 !text-sm"
            [value]="filtroEstado()"
            (change)="filtroEstado.set($any($event.target).value)"
            aria-label="Filtrar penalidades"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="pagada">Pagadas</option>
            <option value="exonerada">Exoneradas</option>
          </select>
        </div>
      </div>

      <!-- Lista de penalidades -->
      <div class="space-y-3">
        @for (p of penalidadesFiltered(); track p.id) {
          <div class="section-card space-y-3">
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="font-semibold text-slate-800">{{ p.socioNombre }}</p>
                <p class="text-xs text-slate-500">DNI: {{ p.socioDni }} · {{ p.fechaRegistro.substring(0, 16).replace('T', ' ') }}</p>
              </div>
              <span class="rounded-full text-xs px-2 py-0.5 font-medium {{ estadoColor(p.estado) }}">
                {{ estadoLabel(p.estado) }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="rounded-lg bg-slate-50 px-3 py-2">
                <p class="text-xs text-slate-500">Minutos excedidos</p>
                <p class="font-bold text-slate-800">{{ p.minutosExcedidos }} min</p>
              </div>
              <div class="rounded-lg bg-amber-50 px-3 py-2">
                <p class="text-xs text-amber-600">Monto a cobrar</p>
                <p class="font-bold text-amber-800">S/ {{ p.montoCalculado }}</p>
              </div>
            </div>

            @if (p.observaciones) {
              <p class="text-xs text-slate-600 bg-slate-50 rounded px-2 py-1">{{ p.observaciones }}</p>
            }

            @if (p.estado === 'pendiente') {
              <div class="flex gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  (click)="pago(p.id)"
                  class="btn-primary flex-1 !text-xs !py-1.5"
                >
                  ✓ Registrar Pago (S/ {{ p.montoCalculado }})
                </button>
                <button
                  type="button"
                  (click)="abrirExoneracion(p.id)"
                  class="btn-secondary !text-xs !py-1.5"
                >
                  Exonerar
                </button>
              </div>
            }
            @if (p.estado === 'exonerada' && p.motivoExoneracion) {
              <p class="text-xs text-blue-700 italic">Motivo: {{ p.motivoExoneracion }}</p>
            }
          </div>
        } @empty {
          <div class="py-12 text-center text-slate-400 text-sm section-card">
            No hay penalidades para este filtro.
          </div>
        }
      </div>

      <!-- Modal de exoneración -->
      @if (idExonerando()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modalExoneracionTitle"
        >
          <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 space-y-4">
            <h3 id="modalExoneracionTitle" class="text-base font-semibold text-slate-800">Exonerar Penalidad</h3>
            <form [formGroup]="exoneracionForm" (ngSubmit)="confirmarExoneracion()" class="space-y-3">
              <div>
                <label for="motivoExon" class="block text-sm font-medium text-slate-700 mb-1">
                  Motivo de exoneración
                </label>
                <textarea
                  id="motivoExon"
                  formControlName="motivo"
                  rows="3"
                  class="input-modern w-full resize-none"
                  placeholder="Ej: Reunión autorizada con coordinación. Validado por gerencia."
                ></textarea>
              </div>
              <div class="flex gap-2 justify-end">
                <button type="button" (click)="idExonerando.set(null)" class="btn-secondary !text-sm">
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="exoneracionForm.invalid"
                  class="btn-primary !text-sm disabled:opacity-50"
                >
                  Confirmar exoneración
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class PenalidadListComponent {
  private readonly router = inject(Router);
  private readonly svc = inject(AccesoService);
  private readonly fb = inject(FormBuilder);

  readonly filtroEstado = signal<string>('todos');
  readonly idExonerando = signal<string | null>(null);

  readonly exoneracionForm = this.fb.group({
    motivo: ['', [Validators.required, Validators.minLength(10)]],
  });

  readonly penalidadesFiltered = computed(() => {
    const f = this.filtroEstado();
    return this.svc.penalidadesDetalladas().filter((p) => f === 'todos' || p.estado === f);
  });

  readonly stats = computed(() => ({
    pendientes: this.svc.penalidades().filter((p) => p.estado === 'pendiente').length,
    pagadas: this.svc.penalidades().filter((p) => p.estado === 'pagada').length,
    montoPendiente: this.svc.penalidades()
      .filter((p) => p.estado === 'pendiente')
      .reduce((a, p) => a + p.montoCalculado, 0),
  }));

  estadoLabel(e: EstadoPenalidad): string {
    return ESTADO_PENALIDAD_LABELS[e];
  }

  estadoColor(e: EstadoPenalidad): string {
    return ESTADO_PENALIDAD_COLORS[e];
  }

  pago(id: string): void {
    this.svc.resolverPenalidad(id, 'pagada');
  }

  abrirExoneracion(id: string): void {
    this.exoneracionForm.reset({ motivo: '' });
    this.idExonerando.set(id);
  }

  confirmarExoneracion(): void {
    const id = this.idExonerando();
    if (!id || this.exoneracionForm.invalid) return;
    const motivo = this.exoneracionForm.getRawValue().motivo ?? '';
    this.svc.resolverPenalidad(id, 'exonerada', motivo);
    this.idExonerando.set(null);
  }
}
