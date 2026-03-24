import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CuotaSocietariaService } from '../../core/services/cuota-societaria.service';
import { SocioService } from '../../core/services/socio.service';

@Component({
  selector: 'app-cuota-exonerar-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (cuota(); as c) {
      <div class="space-y-5">
        <!-- Cabecera -->
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-xl font-bold text-slate-900">Exonerar cuota</h2>
            <p class="text-sm text-slate-500">Período {{ c.periodo }}</p>
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
        <div class="section-card bg-amber-50 border border-amber-200 space-y-2 text-sm">
          @if (socio(); as s) {
            <p class="font-semibold text-slate-800">{{ s.apellido }}, {{ s.nombre }}</p>
          }
          <div class="grid grid-cols-2 gap-3">
            <div>
              <p class="text-xs text-slate-400">Monto a exonerar</p>
              <p class="font-bold text-amber-800">S/ {{ c.monto }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-400">Período</p>
              <p class="font-medium text-slate-700">{{ c.periodo }}</p>
            </div>
          </div>
        </div>

        <!-- Formulario -->
        <form class="space-y-4" (submit)="guardar($event)">
          <div>
            <label for="motivo" class="block text-sm font-medium text-slate-700 mb-1">
              Motivo de exoneración <span class="text-red-500">*</span>
            </label>
            <textarea id="motivo" rows="3"
              [value]="motivo()"
              (input)="motivo.set(getVal($event))"
              placeholder="Ej. Convenio institucional, situación especial aprobada por directiva…"
              class="input-modern resize-none"
              required></textarea>
          </div>

          @if (error()) {
            <p class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {{ error() }}
            </p>
          }

          <div class="flex gap-3 pt-2">
            <button type="submit"
              [disabled]="!motivo().trim()"
              class="btn-primary flex-1 !bg-amber-600 hover:!bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed">
              Confirmar exoneración
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
export class CuotaExonerarFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cuotaService = inject(CuotaSocietariaService);
  private readonly socioService = inject(SocioService);

  protected readonly cuota = signal(this.cuotaService.getById(''));
  protected readonly motivo = signal('');
  protected readonly error = signal('');

  protected readonly socio = computed(() => {
    const c = this.cuota();
    return c ? this.socioService.getById(c.socioId) : undefined;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.cuota.set(this.cuotaService.getById(id));
  }

  protected guardar(event: Event): void {
    event.preventDefault();
    const c = this.cuota();
    const motivo = this.motivo().trim();
    if (!c || !motivo) {
      this.error.set('Ingresa el motivo de exoneración.');
      return;
    }
    this.cuotaService.exonerar(c.id, motivo);
    this.cerrar();
  }

  protected cerrar(): void {
    this.router.navigate(['/', { outlets: { panel: null } }]);
  }

  protected getVal(event: Event): string {
    return (event.target as HTMLTextAreaElement).value;
  }
}
