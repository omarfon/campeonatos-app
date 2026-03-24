import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CuotaSocietariaService } from '../../core/services/cuota-societaria.service';
import { SocioService } from '../../core/services/socio.service';
import { METODO_PAGO_LABELS, MetodoPago } from '../../core/models/cuota-societaria.model';

@Component({
  selector: 'app-cuota-pago-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (cuota(); as c) {
      <div class="space-y-5">
        <!-- Cabecera -->
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-xl font-bold text-slate-900">Registrar pago</h2>
            <p class="text-sm text-slate-500">Cuota del período {{ c.periodo }}</p>
          </div>
          <button type="button" (click)="cerrar()"
            aria-label="Cerrar panel"
            class="text-slate-400 hover:text-slate-700 transition-colors mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Info cuota -->
        <div class="section-card bg-slate-50 space-y-2 text-sm">
          @if (socio(); as s) {
            <div>
              <p class="text-xs text-slate-400">Socio</p>
              <p class="font-semibold text-slate-800">{{ s.apellido }}, {{ s.nombre }}</p>
              <p class="text-xs text-slate-500 font-mono">{{ s.codigoSocio ?? s.dni }}</p>
            </div>
          }
          <div class="grid grid-cols-3 gap-3 pt-1">
            <div>
              <p class="text-xs text-slate-400">Monto</p>
              <p class="font-bold text-slate-900">S/ {{ c.monto }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-400">Período</p>
              <p class="font-medium text-slate-700">{{ c.periodo }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-400">Vencimiento</p>
              <p class="font-medium" [class]="c.estado === 'vencida' ? 'text-red-600' : 'text-slate-700'">
                {{ c.fechaVencimiento }}
              </p>
            </div>
          </div>
        </div>

        <!-- Formulario de pago -->
        <form class="space-y-4" (submit)="guardar($event)">
          <div>
            <label for="metodo" class="block text-sm font-medium text-slate-700 mb-1">
              Método de pago <span class="text-red-500">*</span>
            </label>
            <select id="metodo" [value]="metodoPago()"
              (change)="metodoPago.set($any(getVal($event)))"
              class="input-modern"
              required>
              <option value="" disabled>Seleccionar método…</option>
              @for (opt of metodoPagoOpts; track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          </div>

          <div>
            <label for="referencia" class="block text-sm font-medium text-slate-700 mb-1">
              Referencia / N° operación
            </label>
            <input id="referencia" type="text"
              [value]="referenciaPago()"
              (input)="referenciaPago.set(getVal($event))"
              placeholder="Ej. TRF-123456"
              class="input-modern" />
          </div>

          <div>
            <label for="operador" class="block text-sm font-medium text-slate-700 mb-1">
              Operador / Cajero
            </label>
            <input id="operador" type="text"
              [value]="operadorPago()"
              (input)="operadorPago.set(getVal($event))"
              placeholder="Nombre de quien recibe"
              class="input-modern" />
          </div>

          @if (error()) {
            <p class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {{ error() }}
            </p>
          }

          <div class="flex gap-3 pt-2">
            <button type="submit"
              [disabled]="!metodoPago()"
              class="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
              Confirmar pago
            </button>
            <button type="button" (click)="cerrar()" class="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    } @else {
      <div class="text-center py-12">
        <p class="text-slate-400">Cuota no encontrada.</p>
        <button type="button" (click)="cerrar()" class="text-brand hover:text-brand-700 mt-2 text-sm">Volver</button>
      </div>
    }
  `,
})
export class CuotaPagoFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cuotaService = inject(CuotaSocietariaService);
  private readonly socioService = inject(SocioService);

  protected readonly cuota = signal(this.cuotaService.getById(''));
  protected readonly metodoPago = signal<MetodoPago | ''>('');
  protected readonly referenciaPago = signal('');
  protected readonly operadorPago = signal('');
  protected readonly error = signal('');

  protected readonly socio = computed(() => {
    const c = this.cuota();
    return c ? this.socioService.getById(c.socioId) : undefined;
  });

  protected readonly metodoPagoOpts = Object.entries(METODO_PAGO_LABELS).map(([value, label]) => ({ value, label }));

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.cuota.set(this.cuotaService.getById(id));
  }

  protected guardar(event: Event): void {
    event.preventDefault();
    const c = this.cuota();
    const metodo = this.metodoPago();
    if (!c || !metodo) {
      this.error.set('Selecciona un método de pago.');
      return;
    }
    this.cuotaService.registrarPago(c.id, {
      metodoPago: metodo,
      referenciaPago: this.referenciaPago() || undefined,
      operadorPago: this.operadorPago() || undefined,
    });
    this.cerrar();
  }

  protected cerrar(): void {
    this.router.navigate(['/', { outlets: { panel: null } }]);
  }

  protected getVal(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }
}
