import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { EstadisticaService } from '../../core/services/estadistica.service';
import { EquipoService } from '../../core/services/equipo.service';
import { CompetenciaService } from '../../core/services/competencia.service';
import { DisciplinaService } from '../../core/services/disciplina.service';

@Component({
  selector: 'app-estadisticas-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-900">Estadísticas y Tablas</h2>
        <p class="text-slate-500 mt-1">Posiciones, goleadores, amonestados y rankings</p>
      </div>

      <!-- Selectors -->
      <div class="flex gap-4 flex-wrap">
        <div class="flex gap-2 flex-wrap">
          <span class="self-center text-sm font-medium text-slate-500">Competencia:</span>
          @for (camp of competencias(); track camp.id) {
            <button
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              [class]="selectedCompetencia() === camp.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50 border'"
              (click)="selectedCompetencia.set(camp.id)"
            >{{ camp.nombre }}</button>
          }
        </div>
        <div class="flex gap-2 flex-wrap">
          <span class="self-center text-sm font-medium text-slate-500">Disciplina:</span>
          @for (disc of disciplinas(); track disc.id) {
            <button
              class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              [class]="selectedDisciplina() === disc.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50 border'"
              (click)="selectedDisciplina.set(disc.id)"
            >{{ disc.nombre }}</button>
          }
        </div>
      </div>

      <!-- Tabla de posiciones -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b">
          <h3 class="text-lg font-semibold text-slate-900">Tabla de Posiciones</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50 border-b">
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase w-12">#</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Equipo</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">PJ</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">G</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">E</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">P</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">GF</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">GC</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">DG</th>
                <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center font-bold">Pts</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (row of posiciones(); track row.equipoId; let i = $index) {
                <tr class="hover:bg-slate-50" [class]="i < 2 ? 'bg-green-50/50' : i >= posiciones().length - 1 ? 'bg-red-50/50' : ''">
                  <td class="px-4 py-3 text-slate-500 font-medium">{{ i + 1 }}</td>
                  <td class="px-4 py-3 font-semibold text-slate-900">{{ row.equipoNombre }}</td>
                  <td class="px-4 py-3 text-center">{{ row.partidosJugados }}</td>
                  <td class="px-4 py-3 text-center text-green-700">{{ row.ganados }}</td>
                  <td class="px-4 py-3 text-center text-yellow-600">{{ row.empatados }}</td>
                  <td class="px-4 py-3 text-center text-red-600">{{ row.perdidos }}</td>
                  <td class="px-4 py-3 text-center">{{ row.golesAFavor }}</td>
                  <td class="px-4 py-3 text-center">{{ row.golesEnContra }}</td>
                  <td class="px-4 py-3 text-center font-medium" [class]="row.diferenciaGoles > 0 ? 'text-green-700' : row.diferenciaGoles < 0 ? 'text-red-600' : ''">
                    {{ row.diferenciaGoles > 0 ? '+' : '' }}{{ row.diferenciaGoles }}
                  </td>
                  <td class="px-4 py-3 text-center font-bold text-lg">{{ row.puntos }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="10" class="px-4 py-8 text-center text-slate-400">Sin datos de posiciones</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Goleadores -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b">
            <h3 class="text-lg font-semibold text-slate-900">Tabla de Goleadores</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-50 border-b">
                  <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase w-12">#</th>
                  <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Jugador</th>
                  <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Equipo</th>
                  <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Goles</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (g of goleadores(); track g.participanteId; let i = $index) {
                  <tr class="hover:bg-slate-50" [class]="i === 0 ? 'bg-yellow-50/50' : ''">
                    <td class="px-4 py-3 text-slate-500">{{ i + 1 }}</td>
                    <td class="px-4 py-3 font-medium text-slate-900">{{ g.apellido }}, {{ g.nombre }}</td>
                    <td class="px-4 py-3 text-slate-600">{{ g.equipoNombre }}</td>
                    <td class="px-4 py-3 text-center font-bold text-lg">{{ g.goles }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="px-4 py-8 text-center text-slate-400">Sin datos</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Amonestados -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b">
            <h3 class="text-lg font-semibold text-slate-900">Amonestados / Fair Play</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-50 border-b">
                  <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase w-12">#</th>
                  <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Jugador</th>
                  <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Amarillas</th>
                  <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Rojas</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (a of amonestados(); track a.participanteId; let i = $index) {
                  <tr class="hover:bg-slate-50">
                    <td class="px-4 py-3 text-slate-500">{{ i + 1 }}</td>
                    <td class="px-4 py-3 font-medium text-slate-900">{{ a.apellido }}, {{ a.nombre }}</td>
                    <td class="px-4 py-3 text-center font-semibold text-yellow-600">{{ a.amarillas }}</td>
                    <td class="px-4 py-3 text-center font-semibold text-red-600">{{ a.rojas }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="px-4 py-8 text-center text-slate-400">Sin datos</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class EstadisticasDashboardComponent {
  private readonly estadisticaService = inject(EstadisticaService);
  private readonly competenciaService = inject(CompetenciaService);
  private readonly disciplinaService = inject(DisciplinaService);

  protected readonly competencias = this.competenciaService.items;
  protected readonly disciplinas = this.disciplinaService.items;
  protected readonly selectedCompetencia = signal('camp-1');
  protected readonly selectedDisciplina = signal('disc-futbol');

  protected readonly posiciones = computed(() => {
    const tabla = this.estadisticaService.calcularTablaPosiciones(
      this.selectedCompetencia(),
      this.selectedDisciplina()
    );
    return tabla.posiciones;
  });

  protected readonly goleadores = computed(() =>
    this.estadisticaService.calcularGoleadores(this.selectedCompetencia(), this.selectedDisciplina())
  );

  protected readonly amonestados = computed(() =>
    this.estadisticaService.calcularAmonestados(this.selectedCompetencia())
  );
}
