import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { Router } from '@angular/router';
import { ConvenioService } from '../../core/services/convenio.service';
import {
  Convenio,
  ESTADO_CONVENIO_LABELS,
  TIPO_BENEFICIO_LABELS,
  EstadoConvenio,
} from '../../core/models/convenio.model';
import { CONDICION_CLIENTE_LABELS } from '../../core/models/tarifa.model';

type FiltroEstado = 'todos' | EstadoConvenio;

@Component({
  selector: 'app-convenio-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Convenios Institucionales</h1>
          <p class="text-sm text-slate-500 mt-0.5">Gestión de acuerdos comerciales con empresas aliadas</p>
        </div>
        <button
          class="px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors"
          (click)="nuevoConvenio()"
        >
          + Nuevo Convenio
        </button>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="text-2xl font-bold text-cyan-600">{{ svc.totalConvenios() }}</div>
          <div class="text-xs text-slate-500 mt-0.5">Convenios totales</div>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="text-2xl font-bold text-emerald-600">{{ svc.conveniosActivos().length }}</div>
          <div class="text-xs text-slate-500 mt-0.5">Convenios activos</div>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="text-2xl font-bold text-indigo-600">{{ svc.totalBeneficiarios() }}</div>
          <div class="text-xs text-slate-500 mt-0.5">Beneficiarios activos</div>
        </div>
      </div>

      <!-- Banner -->
      <div class="rounded-xl bg-cyan-50 border border-cyan-200 p-4 text-sm text-cyan-800">
        <strong>Nota sobre acumulación:</strong> cuando un convenio tiene
        <em>no acumular con campañas</em>, el motor de precios aplicará automáticamente el beneficio
        más ventajoso para el alumno (convenio o campaña), sin necesidad de intervención del cajero.
      </div>

      <!-- Filtros -->
      <div class="flex flex-wrap gap-2">
        @for (f of filtros; track f.value) {
          <button
            class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors border"
            [class.bg-cyan-600]="filtroEstado() === f.value"
            [class.text-white]="filtroEstado() === f.value"
            [class.border-cyan-600]="filtroEstado() === f.value"
            [class.bg-white]="filtroEstado() !== f.value"
            [class.text-slate-600]="filtroEstado() !== f.value"
            [class.border-slate-200]="filtroEstado() !== f.value"
            (click)="filtroEstado.set(f.value)"
          >
            {{ f.label }}
          </button>
        }
      </div>

      <!-- Lista de convenios -->
      <div class="space-y-4">
        @if (conveniosFiltrados().length === 0) {
          <div class="py-16 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            <p class="font-medium">No hay convenios para este filtro.</p>
          </div>
        }
        @for (c of conveniosFiltrados(); track c.id) {
          <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <!-- Cabecera del convenio -->
            <div class="flex items-start justify-between p-5 gap-3">
              <div class="space-y-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-semibold text-slate-800 text-lg">{{ c.nombre }}</span>
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                    [class.bg-emerald-100]="c.estado === 'activo'"
                    [class.text-emerald-700]="c.estado === 'activo'"
                    [class.bg-slate-100]="c.estado === 'vencido'"
                    [class.text-slate-500]="c.estado === 'vencido'"
                    [class.bg-amber-100]="c.estado === 'suspendido'"
                    [class.text-amber-700]="c.estado === 'suspendido'"
                  >
                    {{ estadoLabel(c.estado) }}
                  </span>
                  @if (!c.acumularConCampana) {
                    <span class="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-600 font-medium">
                      No acumula con campañas
                    </span>
                  }
                </div>
                <p class="text-sm text-slate-500">🏢 {{ c.empresa }}</p>
                @if (c.descripcion) {
                  <p class="text-sm text-slate-500">{{ c.descripcion }}</p>
                }
                <p class="text-xs text-slate-400">📅 {{ c.fechaInicio }} → {{ c.fechaFin }}</p>
              </div>
              <div class="flex gap-2 shrink-0">
                <button
                  class="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                  (click)="verBeneficiarios(c.id)"
                >
                  Beneficiarios ({{ beneficiarioCount(c.id) }})
                </button>
                <button
                  class="text-xs px-3 py-1.5 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors"
                  (click)="verConvenio(c.id)"
                >
                  Configurar
                </button>
              </div>
            </div>

            <!-- Reglas de beneficio -->
            <div class="border-t border-slate-100 px-5 pb-5">
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-4 mb-3">Reglas de Beneficio</p>
              @if (c.reglasBeneficios.length === 0) {
                <p class="text-sm text-slate-400 italic">Sin reglas configuradas.</p>
              }
              <div class="grid gap-2">
                @for (r of c.reglasBeneficios; track r.id) {
                  <div class="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                      {{ condicionLabel(r.condicionCliente) }}
                    </span>
                    <span class="text-sm text-slate-700">→</span>
                    <span class="text-sm font-medium text-slate-800">{{ tipoBeneficioLabel(r.tipo) }}</span>
                    @if (r.tipo === 'descuento_porcentaje') {
                      <span class="text-sm font-bold text-cyan-700">{{ r.valor }}%</span>
                    } @else if (r.tipo === 'tarifa_neta') {
                      <span class="text-sm font-bold text-cyan-700">S/ {{ r.valor.toFixed(2) }}</span>
                    }
                    @if (r.cursoIds.length > 0) {
                      <span class="text-xs text-slate-400">({{ r.cursoIds.length }} cursos)</span>
                    } @else {
                      <span class="text-xs text-slate-400">(todos los cursos)</span>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class ConvenioListComponent {
  protected readonly svc = inject(ConvenioService);
  private readonly router = inject(Router);

  readonly filtroEstado = signal<FiltroEstado>('todos');

  protected readonly filtros: { value: FiltroEstado; label: string }[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'activo', label: 'Activos' },
    { value: 'suspendido', label: 'Suspendidos' },
    { value: 'vencido', label: 'Vencidos' },
  ];

  readonly conveniosFiltrados = computed(() => {
    const f = this.filtroEstado();
    const cs = this.svc.convenios();
    if (f === 'todos') return cs;
    return cs.filter((c) => c.estado === f);
  });

  beneficiarioCount(convenioId: string): number {
    return this.svc.getBeneficiariosByConvenio(convenioId).filter((b) => b.activo).length;
  }

  estadoLabel(e: string): string {
    return ESTADO_CONVENIO_LABELS[e as keyof typeof ESTADO_CONVENIO_LABELS] ?? e;
  }

  condicionLabel(c: string): string {
    return CONDICION_CLIENTE_LABELS[c as keyof typeof CONDICION_CLIENTE_LABELS] ?? c;
  }

  tipoBeneficioLabel(t: string): string {
    return TIPO_BENEFICIO_LABELS[t as keyof typeof TIPO_BENEFICIO_LABELS] ?? t;
  }

  nuevoConvenio(): void {
    this.router.navigate(['/', { outlets: { panel: ['comercial', 'convenios', 'nuevo'] } }]);
  }

  verConvenio(id: string): void {
    this.router.navigate(['/', { outlets: { panel: ['comercial', 'convenios', id, 'detalle'] } }]);
  }

  verBeneficiarios(id: string): void {
    this.router.navigate(['/', { outlets: { panel: ['comercial', 'convenios', id, 'beneficiarios'] } }]);
  }
}
