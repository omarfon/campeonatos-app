import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CuotaSocietariaService } from '../../core/services/cuota-societaria.service';
import { SocioService } from '../../core/services/socio.service';
import {
  CuotaSocietaria,
  ESTADO_CUOTA_LABELS,
  ESTADO_CUOTA_CLASSES,
  EstadoCuota,
  MetodoPago,
} from '../../core/models/cuota-societaria.model';

interface DeudorResumen {
  socioId: string;
  cuotas: CuotaSocietaria[];
  totalDeuda: number;
  mesesDeuda: number;
  mesesVencidos: number;
  periodoMasAntiguo: string;
}

@Component({
  selector: 'app-cuota-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DecimalPipe],
  template: `
    <!-- Hero con tab switcher -->
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand via-brand-700 to-brand-900 p-8 shadow-lg shadow-brand-200 mb-6">
      <div class="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-white tracking-tight">Cobranza de Cuotas</h1>
          <p class="text-brand-200 mt-1">Control de mensualidades societarias</p>
        </div>
        <!-- Tab switcher -->
        <div class="flex gap-1 bg-white/10 rounded-xl p-1 self-start" role="tablist" aria-label="Vistas de cobranza">
          <button type="button" role="tab"
            [attr.aria-selected]="vistaActiva() === 'periodo'"
            [class]="vistaActiva() === 'periodo'
              ? 'px-4 py-2 rounded-lg bg-white text-brand font-semibold text-sm shadow-sm'
              : 'px-4 py-2 rounded-lg text-white/80 hover:text-white font-medium text-sm transition-colors'"
            (click)="vistaActiva.set('periodo')">
            Por período
          </button>
          <button type="button" role="tab"
            [attr.aria-selected]="vistaActiva() === 'deudas'"
            [class]="vistaActiva() === 'deudas'
              ? 'px-4 py-2 rounded-lg bg-white text-red-600 font-semibold text-sm shadow-sm'
              : 'px-4 py-2 rounded-lg text-white/80 hover:text-white font-medium text-sm transition-colors'">
            <span (click)="vistaActiva.set('deudas')">Deudas acumuladas</span>
            @if (deudores().length > 0) {
              <span class="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold"
                aria-label="{{ deudores().length }} socios con deuda">{{ deudores().length }}</span>
            }
          </button>
        </div>
      </div>
      <div class="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-white/5"></div>
    </div>

    <!-- ═══════════════ VISTA: POR PERÍODO ═══════════════ -->
    @if (vistaActiva() === 'periodo') {
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
          <div class="flex flex-col gap-1">
            <label for="periodo" class="text-xs font-medium text-slate-600">Período</label>
            <input id="periodo" type="month" [value]="periodoSeleccionado()"
              (change)="periodoSeleccionado.set(getVal($event))"
              class="input-modern !w-44" />
          </div>
          <div class="flex flex-col gap-1 flex-1 min-w-48">
            <label for="buscar" class="text-xs font-medium text-slate-600">Buscar socio</label>
            <input id="buscar" type="text" [value]="busqueda()"
              (input)="busqueda.set(getVal($event))"
              placeholder="Nombre, apellido o DNI..."
              class="input-modern" />
          </div>
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
    }

    <!-- ═══════════════ VISTA: DEUDAS ACUMULADAS ═══════════════ -->
    @if (vistaActiva() === 'deudas') {
      <!-- KPIs deudas -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="section-card text-center">
          <p class="text-3xl font-bold text-red-600">{{ deudores().length }}</p>
          <p class="text-xs text-slate-500 mt-1">Socios en deuda</p>
        </div>
        <div class="section-card text-center">
          <p class="text-3xl font-bold text-slate-900">S/ {{ totalDeudaAcumulada() | number:'1.2-2' }}</p>
          <p class="text-xs text-slate-500 mt-1">Total adeudado</p>
        </div>
        <div class="section-card text-center">
          <p class="text-3xl font-bold text-red-600">{{ cantCuotasVencidasTotal() }}</p>
          <p class="text-xs text-slate-500 mt-1">Cuotas vencidas</p>
        </div>
        <div class="section-card text-center">
          <p class="text-3xl font-bold text-amber-600">{{ cantCuotasPendientesTotal() }}</p>
          <p class="text-xs text-slate-500 mt-1">Cuotas por vencer</p>
        </div>
      </div>

      <!-- Filtros deudas -->
      <div class="section-card mb-6">
        <div class="flex flex-wrap gap-3 items-end">
          <div class="flex flex-col gap-1 flex-1 min-w-48">
            <label for="buscar-deudas" class="text-xs font-medium text-slate-600">Buscar socio</label>
            <input id="buscar-deudas" type="search" [value]="busquedaDeudas()"
              (input)="busquedaDeudas.set(getVal($event))"
              placeholder="Nombre, apellido o DNI..."
              class="input-modern" />
          </div>
          <div class="flex flex-col gap-1">
            <label for="orden-deudas" class="text-xs font-medium text-slate-600">Ordenar por</label>
            <select id="orden-deudas" [value]="ordenDeudas()"
              (change)="ordenDeudas.set(getVal($event))"
              class="input-modern !w-44">
              <option value="monto">Mayor deuda total</option>
              <option value="meses">Más meses adeudados</option>
              <option value="antiguedad">Deuda más antigua</option>
              <option value="apellido">Apellido A–Z</option>
            </select>
          </div>
          <div class="flex flex-col gap-1">
            <label for="tipo-deuda" class="text-xs font-medium text-slate-600">Mostrar</label>
            <select id="tipo-deuda" [value]="filtroTipoDeuda()"
              (change)="filtroTipoDeuda.set(getVal($event))"
              class="input-modern !w-48">
              <option value="todas">Vencidas + Pendientes</option>
              <option value="vencidas">Solo vencidas</option>
              <option value="multimes">3 o más meses</option>
            </select>
          </div>
        </div>
        @if (deudoresFiltrados().length !== deudores().length) {
          <p class="text-xs text-slate-400 mt-3">{{ deudoresFiltrados().length }} resultado(s) de {{ deudores().length }}</p>
        }
      </div>

      <!-- Sin deudas -->
      @if (deudores().length === 0) {
        <div class="section-card text-center py-16">
          <svg class="w-14 h-14 text-green-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
          </svg>
          <p class="text-slate-500 font-medium">¡Sin deudas pendientes!</p>
          <p class="text-xs text-slate-400 mt-1">Todos los socios están al día con sus cuotas.</p>
        </div>
      }
      @if (deudoresFiltrados().length === 0 && deudores().length > 0) {
        <div class="section-card text-center py-10">
          <p class="text-slate-400 text-sm italic">No hay deudores que coincidan con los filtros.</p>
        </div>
      }

      <!-- Lista de deudores agrupados -->
      <div class="space-y-3">
        @for (deudor of deudoresFiltrados(); track deudor.socioId) {
          @if (getSocio(deudor.socioId); as s) {
            <div class="section-card overflow-hidden !p-0">
              <!-- Cabecera del deudor -->
              <button type="button"
                class="w-full flex items-center justify-between gap-4 px-4 py-4 text-left"
                [attr.aria-expanded]="expandedDeudorIds().has(deudor.socioId)"
                [attr.aria-controls]="'deudor-detalle-' + deudor.socioId"
                (click)="toggleDeudor(deudor.socioId)">
                <!-- Identidad -->
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
                    [class]="deudor.mesesVencidos >= 3
                      ? 'bg-red-100 text-red-700'
                      : deudor.mesesVencidos >= 1
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'"
                    aria-hidden="true">
                    {{ s.nombre[0] }}{{ s.apellido[0] }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-semibold text-slate-800 text-sm leading-tight">{{ s.apellido }}, {{ s.nombre }}</p>
                    <p class="text-xs text-slate-400 font-mono">{{ s.codigoSocio ?? s.dni }}</p>
                  </div>
                </div>
                <!-- Resumen de meses y monto -->
                <div class="flex items-center gap-3 shrink-0">
                  <!-- Pills de períodos (oculto en móvil) -->
                  <div class="hidden sm:flex gap-1 flex-wrap max-w-56 justify-end">
                    @for (c of deudor.cuotas; track c.id) {
                      <span class="text-[10px] px-1.5 py-0.5 rounded font-semibold leading-tight"
                        [class]="c.estado === 'vencida' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'"
                        [title]="c.periodo + ' — ' + estadoLabels[c.estado]">
                        {{ c.periodo }}
                      </span>
                    }
                  </div>
                  <!-- Conteo de meses -->
                  <div class="text-center shrink-0">
                    <p class="text-lg font-bold leading-tight"
                      [class]="deudor.mesesDeuda >= 3 ? 'text-red-700' : 'text-amber-700'">
                      {{ deudor.mesesDeuda }}
                    </p>
                    <p class="text-[10px] text-slate-400 leading-tight">{{ deudor.mesesDeuda === 1 ? 'mes' : 'meses' }}</p>
                  </div>
                  <!-- Monto total -->
                  <div class="text-right shrink-0">
                    <p class="text-sm font-bold text-red-700">S/ {{ deudor.totalDeuda | number:'1.2-2' }}</p>
                    @if (deudor.mesesVencidos > 0) {
                      <p class="text-[10px] text-red-500">{{ deudor.mesesVencidos }} vencida(s)</p>
                    }
                  </div>
                  <!-- Chevron -->
                  <svg xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0"
                    [class]="expandedDeudorIds().has(deudor.socioId) ? 'rotate-180' : ''"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </button>

              <!-- Detalle expandido: selección de meses y pago parcial -->
              @if (expandedDeudorIds().has(deudor.socioId)) {
                <div [id]="'deudor-detalle-' + deudor.socioId"
                  class="border-t border-slate-100 bg-slate-50/50 px-4 py-3">

                  <!-- Cabecera: selección masiva -->
                  <div class="flex items-center justify-between pb-2 mb-1 border-b border-slate-200">
                    <label class="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                      <input type="checkbox"
                        [attr.aria-label]="'Seleccionar todos los meses de ' + s.apellido"
                        [checked]="todasSeleccionadas(deudor.cuotas)"
                        (change)="todasSeleccionadas(deudor.cuotas) ? deseleccionarTodas(deudor.cuotas) : seleccionarTodas(deudor.cuotas)"
                        class="rounded border-slate-300 text-brand focus:ring-brand" />
                      Seleccionar todos los meses
                    </label>
                    @if (getCuotasSeleccionadas(deudor.cuotas).length > 0) {
                      <span class="text-xs font-semibold text-brand">
                        {{ getCuotasSeleccionadas(deudor.cuotas).length }} seleccionado(s)
                      </span>
                    }
                  </div>

                  <!-- Lista de cuotas con checkbox -->
                  <div class="space-y-1 mt-1">
                    @for (c of deudor.cuotas; track c.id) {
                      <label [for]="'chk-' + c.id"
                        class="flex items-center gap-3 py-2.5 px-2 rounded-lg cursor-pointer transition-colors"
                        [class]="selectedCuotaIds().has(c.id) ? 'bg-green-50 border border-green-200' : 'border border-transparent hover:bg-white'">
                        <input type="checkbox"
                          [id]="'chk-' + c.id"
                          [checked]="selectedCuotaIds().has(c.id)"
                          (change)="toggleCuota(c.id)"
                          class="rounded border-slate-300 text-brand focus:ring-brand shrink-0" />
                        <div class="flex items-center gap-2 flex-1 flex-wrap min-w-0">
                          <span class="w-2 h-2 rounded-full shrink-0"
                            [class]="c.estado === 'vencida' ? 'bg-red-500' : 'bg-amber-400'"></span>
                          <span class="text-sm font-semibold text-slate-800">{{ c.periodo }}</span>
                          <span class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                            [class]="estadoClasses[c.estado]">{{ estadoLabels[c.estado] }}</span>
                          <span class="text-xs text-slate-400">Vence: {{ c.fechaVencimiento }}</span>
                        </div>
                        <span class="text-sm font-bold text-slate-800 shrink-0">S/ {{ c.monto | number:'1.2-2' }}</span>
                      </label>
                    }
                  </div>

                  <!-- Barra de acción: aparece cuando hay selección y no hay pago activo -->
                  @if (getCuotasSeleccionadas(deudor.cuotas).length > 0 && pagoActivoSocioId() !== deudor.socioId) {
                    <div class="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3
                               bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                      <div>
                        <p class="text-sm font-semibold text-slate-800">
                          {{ getCuotasSeleccionadas(deudor.cuotas).length }} mes(es) seleccionado(s)
                        </p>
                        <p class="text-xs text-slate-500">
                          Total a pagar:
                          <strong class="text-green-700">S/ {{ getTotalSeleccionado(deudor.cuotas) | number:'1.2-2' }}</strong>
                        </p>
                      </div>
                      <button type="button" class="btn-primary text-sm whitespace-nowrap"
                        (click)="iniciarPago(deudor.socioId)">
                        Registrar pago parcial
                      </button>
                    </div>
                  }

                  <!-- Formulario inline de pago -->
                  @if (pagoActivoSocioId() === deudor.socioId) {
                    <div class="mt-3 bg-white border border-brand/20 rounded-xl p-4 shadow-sm"
                      role="region" [attr.aria-label]="'Registrar pago de ' + s.apellido">
                      <p class="font-semibold text-slate-800 text-sm mb-3">
                        Confirmar pago — {{ getCuotasSeleccionadas(deudor.cuotas).length }} mes(es)
                      </p>

                      <!-- Resumen de meses a pagar -->
                      <div class="bg-slate-50 rounded-lg px-3 py-2 mb-4 space-y-1">
                        @for (c of getCuotasSeleccionadas(deudor.cuotas); track c.id) {
                          <div class="flex justify-between text-xs">
                            <span class="text-slate-600">
                              {{ c.periodo }}
                              <span class="ml-1 text-slate-400">({{ estadoLabels[c.estado] }})</span>
                            </span>
                            <span class="font-medium text-slate-800">S/ {{ c.monto | number:'1.2-2' }}</span>
                          </div>
                        }
                        <div class="border-t border-slate-200 pt-1 mt-1 flex justify-between text-sm font-bold">
                          <span class="text-slate-700">Total</span>
                          <span class="text-green-700">S/ {{ getTotalSeleccionado(deudor.cuotas) | number:'1.2-2' }}</span>
                        </div>
                      </div>

                      <!-- Campos del formulario -->
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <div>
                          <label [for]="'metodo-' + deudor.socioId"
                            class="block text-xs font-medium text-slate-600 mb-1">Método de pago</label>
                          <select [id]="'metodo-' + deudor.socioId"
                            class="input-modern w-full"
                            [value]="metodoPagoForm()"
                            (change)="metodoPagoForm.set(getVal($event))">
                            <option value="efectivo">Efectivo</option>
                            <option value="transferencia">Transferencia bancaria</option>
                            <option value="tarjeta">Tarjeta</option>
                            <option value="cheque">Cheque</option>
                          </select>
                        </div>
                        <div>
                          <label [for]="'ref-' + deudor.socioId"
                            class="block text-xs font-medium text-slate-600 mb-1">
                            Comprobante / referencia
                          </label>
                          <input type="text"
                            [id]="'ref-' + deudor.socioId"
                            class="input-modern w-full"
                            placeholder="Número o referencia (opcional)"
                            [value]="referenciaPagoForm()"
                            (input)="referenciaPagoForm.set(getVal($event))" />
                        </div>
                      </div>

                      <!-- Botones -->
                      <div class="flex gap-2 justify-end">
                        <button type="button" class="btn-secondary text-sm"
                          (click)="cancelarPago()">Cancelar</button>
                        <button type="button" class="btn-primary text-sm"
                          (click)="confirmarPago(deudor.cuotas)">
                          Confirmar pago
                        </button>
                      </div>
                    </div>
                  }

                  <!-- Pie: link al perfil del socio y total acumulado -->
                  <div class="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
                    <a [routerLink]="['/', { outlets: { primary: ['maestros', 'socios'], panel: ['maestros', 'socios', s.id, 'detalle'] } }]"
                      class="text-xs text-brand hover:text-brand-700 font-medium transition-colors">
                      Ver ficha del socio →
                    </a>
                    <div class="text-right">
                      <span class="text-xs text-slate-500 mr-2">Total acumulado:</span>
                      <span class="font-bold text-red-700 text-sm">S/ {{ deudor.totalDeuda | number:'1.2-2' }}</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        }
      </div>
    }
  `,
})
export class CuotaListComponent {
  private readonly cuotaService = inject(CuotaSocietariaService);
  private readonly socioService = inject(SocioService);

  // ── Vista activa ──────────────────────────────────────────────────────────
  protected readonly vistaActiva = signal<'periodo' | 'deudas'>('periodo');

  // ── Vista "Por período" ───────────────────────────────────────────────────
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

  // ── Vista "Deudas acumuladas" ─────────────────────────────────────────────
  protected readonly busquedaDeudas = signal('');
  protected readonly ordenDeudas = signal('monto');
  protected readonly filtroTipoDeuda = signal('todas');
  protected readonly expandedDeudorIds = signal<Set<string>>(new Set<string>());
  protected readonly selectedCuotaIds = signal<Set<string>>(new Set<string>());
  protected readonly pagoActivoSocioId = signal<string | null>(null);
  protected readonly metodoPagoForm = signal<string>('efectivo');
  protected readonly referenciaPagoForm = signal('');

  /** Agrupa TODAS las cuotas pendientes + vencidas por socio */
  protected readonly deudores = computed((): DeudorResumen[] => {
    const todas = [
      ...this.cuotaService.cuotasVencidas(),
      ...this.cuotaService.cuotasPendientes(),
    ];
    const porSocio = new Map<string, CuotaSocietaria[]>();
    for (const c of todas) {
      if (!porSocio.has(c.socioId)) porSocio.set(c.socioId, []);
      porSocio.get(c.socioId)!.push(c);
    }
    return Array.from(porSocio.entries()).map(([socioId, cuotas]) => {
      const sorted = cuotas.slice().sort((a, b) => a.periodo.localeCompare(b.periodo));
      return {
        socioId,
        cuotas: sorted,
        totalDeuda: cuotas.reduce((s, c) => s + c.monto, 0),
        mesesDeuda: cuotas.length,
        mesesVencidos: cuotas.filter((c) => c.estado === 'vencida').length,
        periodoMasAntiguo: sorted[0]?.periodo ?? '',
      };
    });
  });

  protected readonly deudoresFiltrados = computed((): DeudorResumen[] => {
    const q = this.busquedaDeudas().toLowerCase().trim();
    const orden = this.ordenDeudas();
    const tipo = this.filtroTipoDeuda();

    let lista = this.deudores().filter((d) => {
      if (tipo === 'vencidas' && d.mesesVencidos === 0) return false;
      if (tipo === 'multimes' && d.mesesDeuda < 3) return false;
      if (q) {
        const s = this.socioService.getById(d.socioId);
        if (!s) return false;
        const texto = `${s.nombre} ${s.apellido} ${s.dni} ${s.codigoSocio ?? ''}`.toLowerCase();
        if (!texto.includes(q)) return false;
      }
      return true;
    });

    return lista.slice().sort((a, b) => {
      if (orden === 'monto') return b.totalDeuda - a.totalDeuda;
      if (orden === 'meses') return b.mesesDeuda - a.mesesDeuda;
      if (orden === 'antiguedad') return a.periodoMasAntiguo.localeCompare(b.periodoMasAntiguo);
      if (orden === 'apellido') {
        const sa = this.socioService.getById(a.socioId);
        const sb = this.socioService.getById(b.socioId);
        return (sa?.apellido ?? '').localeCompare(sb?.apellido ?? '');
      }
      return 0;
    });
  });

  protected readonly totalDeudaAcumulada = computed(() =>
    this.deudores().reduce((s, d) => s + d.totalDeuda, 0)
  );
  protected readonly cantCuotasVencidasTotal = computed(() =>
    this.deudores().reduce((s, d) => s + d.mesesVencidos, 0)
  );
  protected readonly cantCuotasPendientesTotal = computed(() =>
    this.deudores().reduce((s, d) => s + (d.mesesDeuda - d.mesesVencidos), 0)
  );

  protected toggleDeudor(socioId: string): void {
    this.expandedDeudorIds.update((set) => {
      const next = new Set(set);
      next.has(socioId) ? next.delete(socioId) : next.add(socioId);
      return next;
    });
  }

  protected toggleCuota(cuotaId: string): void {
    this.selectedCuotaIds.update((set) => {
      const next = new Set(set);
      next.has(cuotaId) ? next.delete(cuotaId) : next.add(cuotaId);
      return next;
    });
  }

  protected seleccionarTodas(cuotas: CuotaSocietaria[]): void {
    this.selectedCuotaIds.update((set) => {
      const next = new Set(set);
      cuotas.forEach((c) => next.add(c.id));
      return next;
    });
  }

  protected deseleccionarTodas(cuotas: CuotaSocietaria[]): void {
    this.selectedCuotaIds.update((set) => {
      const next = new Set(set);
      cuotas.forEach((c) => next.delete(c.id));
      return next;
    });
  }

  protected todasSeleccionadas(cuotas: CuotaSocietaria[]): boolean {
    if (cuotas.length === 0) return false;
    const selected = this.selectedCuotaIds();
    return cuotas.every((c) => selected.has(c.id));
  }

  protected getCuotasSeleccionadas(cuotas: CuotaSocietaria[]): CuotaSocietaria[] {
    const selected = this.selectedCuotaIds();
    return cuotas.filter((c) => selected.has(c.id));
  }

  protected getTotalSeleccionado(cuotas: CuotaSocietaria[]): number {
    return this.getCuotasSeleccionadas(cuotas).reduce((s, c) => s + c.monto, 0);
  }

  protected iniciarPago(socioId: string): void {
    this.pagoActivoSocioId.set(socioId);
    this.metodoPagoForm.set('efectivo');
    this.referenciaPagoForm.set('');
  }

  protected confirmarPago(deudorCuotas: CuotaSocietaria[]): void {
    const cuotas = this.getCuotasSeleccionadas(deudorCuotas);
    const metodo = this.metodoPagoForm() as MetodoPago;
    const ref = this.referenciaPagoForm().trim() || undefined;
    for (const c of cuotas) {
      this.cuotaService.registrarPago(c.id, { metodoPago: metodo, referenciaPago: ref });
    }
    this.selectedCuotaIds.update((set) => {
      const next = new Set(set);
      cuotas.forEach((c) => next.delete(c.id));
      return next;
    });
    this.pagoActivoSocioId.set(null);
  }

  protected cancelarPago(): void {
    this.pagoActivoSocioId.set(null);
  }

  protected getSocio(id: string) {
    return this.socioService.getById(id);
  }

  protected getVal(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }
}
