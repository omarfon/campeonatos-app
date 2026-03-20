import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ControlPrePartidoService } from '../../core/services/control-pre-partido.service';
import {
  ReportePrePartido,
  InhabilitacionJugador,
  CAUSAL_INHABILITACION_LABELS,
  CausalInhabilitacion,
} from '../../core/models/control-pre-partido.model';

@Component({
  selector: 'app-control-pre-partido',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (reporte(); as r) {
      <!-- No-print toolbar -->
      <div class="no-print mb-6 flex items-center justify-between">
        <a [routerLink]="['/gestion/encuentros', r.encuentroId]" class="btn-ghost text-sm">← Volver al encuentro</a>
        <button type="button" class="btn-primary text-sm" (click)="imprimir()">
          <span class="mr-1.5">🖨️</span> Imprimir Planilla
        </button>
      </div>

      <!-- Printable report -->
      <div class="reporte-container max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm print:shadow-none print:border-0 print:rounded-none">

        <!-- Header -->
        <div class="border-b border-slate-200 p-6 print:p-4 text-center">
          <h1 class="text-lg font-bold text-slate-900 uppercase tracking-wide">Control Pre-Partido</h1>
          <p class="text-xs text-slate-500 mt-1">Filtro de Inhabilitaciones — Planilla de Juego</p>
          <div class="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-slate-600">
            <span><strong>Campeonato:</strong> {{ r.campeonatoNombre }}</span>
            <span><strong>Disciplina:</strong> {{ r.disciplinaNombre }}</span>
          </div>
        </div>

        <!-- Match info -->
        <div class="border-b border-slate-200 p-6 print:p-4">
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <div class="text-center sm:text-right flex-1">
              <p class="text-lg font-bold text-slate-900">{{ r.equipoLocalNombre }}</p>
              <p class="text-xs text-slate-400">Local</p>
            </div>
            <div class="text-center px-4">
              <span class="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-semibold">VS</span>
            </div>
            <div class="text-center sm:text-left flex-1">
              <p class="text-lg font-bold text-slate-900">{{ r.equipoVisitanteNombre }}</p>
              <p class="text-xs text-slate-400">Visitante</p>
            </div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
            <div>
              <span class="font-semibold text-slate-500 uppercase">Fecha Nro.</span>
              <p class="mt-0.5">{{ r.numeroFecha }}</p>
            </div>
            <div>
              <span class="font-semibold text-slate-500 uppercase">Fase</span>
              <p class="mt-0.5">{{ r.fase }}</p>
            </div>
            <div>
              <span class="font-semibold text-slate-500 uppercase">Día y Hora</span>
              <p class="mt-0.5">{{ formatFecha(r.fechaHora) }}</p>
            </div>
            <div>
              <span class="font-semibold text-slate-500 uppercase">Sede</span>
              <p class="mt-0.5">{{ r.sede ?? 'Sin asignar' }}{{ r.campo ? ' — ' + r.campo : '' }}</p>
            </div>
          </div>
          @if (r.arbitro) {
            <p class="text-xs text-slate-500 mt-3"><strong>Árbitro:</strong> {{ r.arbitro }}</p>
          }
        </div>

        <!-- Summary -->
        <div class="border-b border-slate-200 p-6 print:p-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="rounded-xl p-3 text-center"
                 [class]="r.inhabilitadosLocal.length > 0 ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'">
              <p class="text-2xl font-bold" [class]="r.inhabilitadosLocal.length > 0 ? 'text-red-700' : 'text-emerald-700'">
                {{ r.inhabilitadosLocal.length }}
              </p>
              <p class="text-xs text-slate-600 mt-0.5">Inhabilitados {{ r.equipoLocalNombre }}</p>
              <p class="text-xs text-slate-400">{{ r.habilitadosLocal }} de {{ r.totalJugadoresLocal }} habilitados</p>
            </div>
            <div class="rounded-xl p-3 text-center"
                 [class]="r.inhabilitadosVisitante.length > 0 ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'">
              <p class="text-2xl font-bold" [class]="r.inhabilitadosVisitante.length > 0 ? 'text-red-700' : 'text-emerald-700'">
                {{ r.inhabilitadosVisitante.length }}
              </p>
              <p class="text-xs text-slate-600 mt-0.5">Inhabilitados {{ r.equipoVisitanteNombre }}</p>
              <p class="text-xs text-slate-400">{{ r.habilitadosVisitante }} de {{ r.totalJugadoresVisitante }} habilitados</p>
            </div>
          </div>
        </div>

        <!-- Disqualified players - Local -->
        <div class="border-b border-slate-200 p-6 print:p-4">
          <h3 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-indigo-500 inline-block"></span>
            {{ r.equipoLocalNombre }} — Jugadores Inhabilitados
          </h3>
          @if (r.inhabilitadosLocal.length > 0) {
            <div class="overflow-x-auto">
              <table class="w-full text-xs" role="grid" aria-label="Jugadores inhabilitados equipo local">
                <thead>
                  <tr class="border-b border-slate-200">
                    <th scope="col" class="text-left py-2 px-2 font-semibold text-slate-500 uppercase tracking-wider">Nro.</th>
                    <th scope="col" class="text-left py-2 px-2 font-semibold text-slate-500 uppercase tracking-wider">Jugador</th>
                    <th scope="col" class="text-left py-2 px-2 font-semibold text-slate-500 uppercase tracking-wider">DNI</th>
                    <th scope="col" class="text-left py-2 px-2 font-semibold text-slate-500 uppercase tracking-wider">Posición</th>
                    <th scope="col" class="text-left py-2 px-2 font-semibold text-slate-500 uppercase tracking-wider">Causales de Inhabilitación</th>
                  </tr>
                </thead>
                <tbody>
                  @for (j of r.inhabilitadosLocal; track j.participanteId) {
                    <tr class="border-b border-slate-100">
                      <td class="py-2 px-2 text-slate-700 font-medium">{{ j.numeroCamiseta ?? '—' }}</td>
                      <td class="py-2 px-2 text-slate-800 font-semibold">{{ j.apellido }}, {{ j.nombre }}</td>
                      <td class="py-2 px-2 text-slate-600">{{ j.dni }}</td>
                      <td class="py-2 px-2 text-slate-600">{{ j.posicion ?? '—' }}</td>
                      <td class="py-2 px-2">
                        <div class="flex flex-wrap gap-1">
                          @for (c of j.causales; track c) {
                            <span class="inline-block px-1.5 py-0.5 rounded text-xs font-medium" [class]="getCausalClass(c)">
                              {{ getCausalLabel(c) }}
                            </span>
                          }
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-center">
              <p class="text-xs text-emerald-700 font-medium">✓ Todos los jugadores están habilitados</p>
            </div>
          }
        </div>

        <!-- Disqualified players - Visitante -->
        <div class="border-b border-slate-200 p-6 print:p-4">
          <h3 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-slate-500 inline-block"></span>
            {{ r.equipoVisitanteNombre }} — Jugadores Inhabilitados
          </h3>
          @if (r.inhabilitadosVisitante.length > 0) {
            <div class="overflow-x-auto">
              <table class="w-full text-xs" role="grid" aria-label="Jugadores inhabilitados equipo visitante">
                <thead>
                  <tr class="border-b border-slate-200">
                    <th scope="col" class="text-left py-2 px-2 font-semibold text-slate-500 uppercase tracking-wider">Nro.</th>
                    <th scope="col" class="text-left py-2 px-2 font-semibold text-slate-500 uppercase tracking-wider">Jugador</th>
                    <th scope="col" class="text-left py-2 px-2 font-semibold text-slate-500 uppercase tracking-wider">DNI</th>
                    <th scope="col" class="text-left py-2 px-2 font-semibold text-slate-500 uppercase tracking-wider">Posición</th>
                    <th scope="col" class="text-left py-2 px-2 font-semibold text-slate-500 uppercase tracking-wider">Causales de Inhabilitación</th>
                  </tr>
                </thead>
                <tbody>
                  @for (j of r.inhabilitadosVisitante; track j.participanteId) {
                    <tr class="border-b border-slate-100">
                      <td class="py-2 px-2 text-slate-700 font-medium">{{ j.numeroCamiseta ?? '—' }}</td>
                      <td class="py-2 px-2 text-slate-800 font-semibold">{{ j.apellido }}, {{ j.nombre }}</td>
                      <td class="py-2 px-2 text-slate-600">{{ j.dni }}</td>
                      <td class="py-2 px-2 text-slate-600">{{ j.posicion ?? '—' }}</td>
                      <td class="py-2 px-2">
                        <div class="flex flex-wrap gap-1">
                          @for (c of j.causales; track c) {
                            <span class="inline-block px-1.5 py-0.5 rounded text-xs font-medium" [class]="getCausalClass(c)">
                              {{ getCausalLabel(c) }}
                            </span>
                          }
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-center">
              <p class="text-xs text-emerald-700 font-medium">✓ Todos los jugadores están habilitados</p>
            </div>
          }
        </div>

        <!-- Footer / signatures -->
        <div class="p-6 print:p-4">
          <div class="flex items-center justify-between text-xs text-slate-400 mb-6">
            <span>Generado: {{ formatFechaCompleta(r.fechaGeneracion) }}</span>
            <span>Documento de uso interno</span>
          </div>
          <div class="grid grid-cols-3 gap-6 mt-8 print:mt-12">
            <div class="text-center">
              <div class="border-b border-slate-300 mb-1 h-8"></div>
              <p class="text-xs text-slate-500">Delegado de Mesa</p>
            </div>
            <div class="text-center">
              <div class="border-b border-slate-300 mb-1 h-8"></div>
              <p class="text-xs text-slate-500">Delegado {{ r.equipoLocalNombre }}</p>
            </div>
            <div class="text-center">
              <div class="border-b border-slate-300 mb-1 h-8"></div>
              <p class="text-xs text-slate-500">Delegado {{ r.equipoVisitanteNombre }}</p>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="section-card text-center py-16">
        <p class="text-slate-500 text-lg">No se pudo generar el reporte</p>
        <a routerLink="/gestion/encuentros" class="btn-primary mt-4 inline-flex">Volver a encuentros</a>
      </div>
    }
  `,
  styles: [`
    @media print {
      :host { display: block; }
      .no-print { display: none !important; }
      .reporte-container {
        max-width: 100% !important;
        margin: 0 !important;
        box-shadow: none !important;
      }
    }
  `],
})
export class ControlPrePartidoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly controlService = inject(ControlPrePartidoService);

  protected readonly reporte = signal<ReportePrePartido | null>(null);

  protected readonly causalLabels = CAUSAL_INHABILITACION_LABELS;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.reporte.set(this.controlService.generarReporte(id));
    }
  }

  protected getCausalLabel(causal: CausalInhabilitacion): string {
    return this.causalLabels[causal];
  }

  protected getCausalClass(causal: CausalInhabilitacion): string {
    switch (causal) {
      case 'deuda_pendiente': return 'bg-amber-100 text-amber-800';
      case 'falta_declaracion_salud': return 'bg-orange-100 text-orange-800';
      case 'suspension_tarjetas': return 'bg-red-100 text-red-800';
    }
  }

  protected formatFecha(iso: string): string {
    const [date, time] = iso.split('T');
    return `${date} ${time?.substring(0, 5) ?? ''} hs`;
  }

  protected formatFechaCompleta(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  protected imprimir(): void {
    window.print();
  }
}
