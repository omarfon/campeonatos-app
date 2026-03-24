import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CuotaSocietariaService } from '../../core/services/cuota-societaria.service';
import { SocioService } from '../../core/services/socio.service';
import {
  ESTADO_CUOTA_LABELS,
  ESTADO_CUOTA_CLASSES,
  EstadoCuota,
} from '../../core/models/cuota-societaria.model';

@Component({
  selector: 'app-cuota-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DecimalPipe],
  template: `
    <!-- Hero -->
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand via-brand-700 to-brand-900 p-8 shadow-lg shadow-brand-200 mb-8">
      <div class="relative z-10">
        <h1 class="text-3xl font-bold text-white tracking-tight">Cobranza de Cuotas</h1>
        <p class="text-brand-200 mt-1">Control de mensualidades societarias por período</p>
      </div>
      <div class="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-white/5"></div>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="section-card text-center">
        <p class="text-3xl font-bold text-slate-900">{{ cuotasDelPeriodo().length }}</p>
        <p class="text-xs text-slate-500 mt-1">Total cuotas</p>
      </div>
      <div class="section-card text-center">
        <p class="text-3xl font-bold text-green-600">{{ cantPagadas() }}</p>
        <p class="text-xs text-slate-500 mt-1">Pagadas</p>
      </div>
      <div class="section-card text-center">
        <p class="text-3xl font-bold text-amber-600">{{ cantPendientes() }}</p>
        <p class="text-xs text-slate-500 mt-1">Pendientes</p>
      </div>
      <div class="section-card text-center">
        <p class="text-3xl font-bold text-red-600">{{ cantVencidas() }}</p>
        <p class="text-xs text-slate-500 mt-1">Vencidas</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="section-card mb-6">
      <div class="flex flex-wrap gap-3 items-end">
        <!-- Selector de período -->
        <div class="flex flex-col gap-1">
          <label for="periodo" class="text-xs font-medium text-slate-600">Período</label>
          <input id="periodo" type="month" [value]="periodoSeleccionado()"
            (change)="periodoSeleccionado.set(getVal($event))"
            class="input-modern !w-44" />
        </div>
        <!-- Búsqueda por nombre/DNI -->
        <div class="flex flex-col gap-1 flex-1 min-w-48">
          <label for="buscar" class="text-xs font-medium text-slate-600">Buscar socio</label>
          <input id="buscar" type="text" [value]="busqueda()"
            (input)="busqueda.set(getVal($event))"
            placeholder="Nombre, apellido o DNI..."
            class="input-modern" />
        </div>
        <!-- Filtro estado -->
        <div class="flex flex-col gap-1">
          <label for="estado" class="text-xs font-medium text-slate-600">Estado</label>
          <select id="estado" [value]="filtroEstado()"
            (change)="filtroEstado.set(getVal($event))"
            class="input-modern !w-40">
            <option value="">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="pagada">Pagada</option>
            <option value="vencida">Vencida</option>
            <option value="exonerada">Exonerada</option>
          </select>
        </div>
      </div>
      <!-- Resumen cobrado -->
      <div class="mt-4 flex flex-wrap gap-4 text-sm border-t border-slate-100 pt-4">
        <span class="text-slate-600">Cobrado: <strong class="text-green-700">S/ {{ totalCobrado() | number:'1.2-2' }}</strong></span>
        <span class="text-slate-600">Pendiente: <strong class="text-amber-700">S/ {{ totalPorCobrar() | number:'1.2-2' }}</strong></span>
        <span class="text-slate-600">Vencido: <strong class="text-red-700">S/ {{ totalVencido() | number:'1.2-2' }}</strong></span>
      </div>
    </div>

    <!-- Tabla -->
    <div class="section-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Socio</th>
              <th class="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Monto</th>
              <th class="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Vencimiento</th>
              <th class="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Estado</th>
              <th class="px-5 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Pago</th>
              <th class="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (cuota of cuotasFiltradas(); track cuota.id) {
              @if (getSocio(cuota.socioId); as s) {
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-5 py-3">
                    <a [routerLink]="['/', { outlets: { primary: ['maestros', 'socios'], panel: ['maestros', 'socios', s.id, 'detalle'] } }]"
                      class="font-medium text-brand hover:text-brand-700 transition-colors">
                      {{ s.apellido }}, {{ s.nombre }}
                    </a>
                    <p class="text-xs text-slate-400 font-mono">{{ s.codigoSocio ?? s.dni }}</p>
                  </td>
                  <td class="px-5 py-3 font-semibold text-slate-800">S/ {{ cuota.monto | number:'1.2-2' }}</td>
                  <td class="px-5 py-3 text-slate-600">{{ cuota.fechaVencimiento }}</td>
                  <td class="px-5 py-3">
                    <span class="text-xs px-2.5 py-1 rounded-full font-semibold"
                      [class]="estadoClasses[cuota.estado]">
                      {{ estadoLabels[cuota.estado] }}
                    </span>
                  </td>
                  <td class="px-5 py-3 hidden md:table-cell text-slate-500 text-xs">
                    @if (cuota.fechaPago) {
                      {{ cuota.fechaPago }} · {{ cuota.metodoPago }}
                    } @else if (cuota.estado === 'exonerada') {
                      <span class="italic text-purple-600">{{ cuota.motivoExoneracion }}</span>
                    } @else {
                      <span class="text-slate-300">—</span>
                    }
                  </td>
                  <td class="px-5 py-3">
                    <div class="flex gap-2">
                      @if (cuota.estado === 'pendiente' || cuota.estado === 'vencida') {
                        <a [routerLink]="['/', { outlets: { primary: ['maestros', 'socios', 'cuotas'], panel: ['maestros', 'socios', 'cuota', cuota.id, 'pagar'] } }]"
                          class="text-xs font-semibold text-green-700 hover:text-green-900 transition-colors">
                          Registrar pago
                        </a>
                      }
                      @if (cuota.estado === 'pendiente') {
                        <a [routerLink]="['/', { outlets: { primary: ['maestros', 'socios', 'cuotas'], panel: ['maestros', 'socios', 'cuota', cuota.id, 'exonerar'] } }]"
                          class="text-xs text-slate-500 hover:text-purple-700 transition-colors">
                          Exonerar
                        </a>
                      }
                    </div>
                  </td>
                </tr>
              }
            } @empty {
              <tr>
                <td colspan="6" class="px-5 py-12 text-center text-slate-400 italic">
                  No hay cuotas para los filtros seleccionados.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class CuotaListComponent {
  private readonly cuotaService = inject(CuotaSocietariaService);
  private readonly socioService = inject(SocioService);

  protected readonly periodoSeleccionado = signal('2026-03');
  protected readonly busqueda = signal('');
  protected readonly filtroEstado = signal('');

  protected readonly estadoLabels = ESTADO_CUOTA_LABELS;
  protected readonly estadoClasses = ESTADO_CUOTA_CLASSES;

  protected readonly cuotasDelPeriodo = computed(() =>
    this.cuotaService.getByPeriodo(this.periodoSeleccionado())
  );

  protected readonly cuotasFiltradas = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const estado = this.filtroEstado() as EstadoCuota | '';
    return this.cuotasDelPeriodo().filter((c) => {
      if (estado && c.estado !== estado) return false;
      if (q) {
        const s = this.socioService.getById(c.socioId);
        if (!s) return false;
        const texto = `${s.nombre} ${s.apellido} ${s.dni} ${s.codigoSocio ?? ''}`.toLowerCase();
        if (!texto.includes(q)) return false;
      }
      return true;
    });
  });

  protected readonly cantPagadas = computed(() => this.cuotasDelPeriodo().filter((c) => c.estado === 'pagada').length);
  protected readonly cantPendientes = computed(() => this.cuotasDelPeriodo().filter((c) => c.estado === 'pendiente').length);
  protected readonly cantVencidas = computed(() => this.cuotasDelPeriodo().filter((c) => c.estado === 'vencida').length);

  protected readonly totalCobrado = computed(() =>
    this.cuotasDelPeriodo().filter((c) => c.estado === 'pagada').reduce((s, c) => s + c.monto, 0)
  );
  protected readonly totalPorCobrar = computed(() =>
    this.cuotasDelPeriodo().filter((c) => c.estado === 'pendiente').reduce((s, c) => s + c.monto, 0)
  );
  protected readonly totalVencido = computed(() =>
    this.cuotasDelPeriodo().filter((c) => c.estado === 'vencida').reduce((s, c) => s + c.monto, 0)
  );

  protected getSocio(id: string) {
    return this.socioService.getById(id);
  }

  protected getVal(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }
}
