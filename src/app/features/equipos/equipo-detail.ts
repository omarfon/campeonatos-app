import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EquipoService } from '../../core/services/equipo.service';
import { CompetenciaService } from '../../core/services/competencia.service';
import { DisciplinaService } from '../../core/services/disciplina.service';
import { Equipo, HistorialParticipante } from '../../core/models/equipo.model';

@Component({
  selector: 'app-equipo-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (equipo(); as eq) {
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <a routerLink="/maestros/equipos" class="text-indigo-600 hover:text-indigo-800 text-sm">&larr; Volver</a>
            <h2 class="text-2xl font-bold text-slate-900 mt-1">{{ eq.nombre }}</h2>
            <p class="text-slate-500">{{ getCompetenciaNombre(eq.competenciaId) }} · {{ getDisciplinaNombre(eq.disciplinaId) }}</p>
          </div>
          <a [routerLink]="['editar']" class="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Editar
          </a>
        </div>

        <!-- Plantilla -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b bg-slate-50">
            <h3 class="text-lg font-semibold text-slate-900">Plantilla ({{ eq.participantes.length }})</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="border-b">
                  <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">#</th>
                  <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Nombre</th>
                  <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">DNI</th>
                  <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Tipo</th>
                  <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Posición</th>
                  <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Elegibilidad</th>
                  <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Registro</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (p of eq.participantes; track p.id) {
                  <tr class="hover:bg-slate-50">
                    <td class="px-6 py-3 font-mono text-sm">{{ p.numeroCamiseta ?? '-' }}</td>
                    <td class="px-6 py-3 font-medium">{{ p.apellido }}, {{ p.nombre }}</td>
                    <td class="px-6 py-3 text-slate-600">{{ p.dni }}</td>
                    <td class="px-6 py-3">
                      <span class="text-xs px-2 py-0.5 rounded"
                        [class]="p.tipo === 'socio' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'">
                        {{ p.tipo }}
                      </span>
                    </td>
                    <td class="px-6 py-3 text-slate-600">{{ p.posicion ?? '-' }}</td>
                    <td class="px-6 py-3">
                      <span class="text-xs px-2 py-0.5 rounded font-medium"
                        [class]="elegibilidadClasses[p.elegibilidad]">
                        {{ p.elegibilidad }}
                      </span>
                    </td>
                    <td class="px-6 py-3 text-sm text-slate-500">{{ p.fechaRegistro }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="px-6 py-8 text-center text-slate-400">Sin participantes</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Historial -->
        @if (historial().length > 0) {
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-slate-900 mb-3">Historial de participantes</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead>
                  <tr class="border-b">
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Jugador</th>
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Temporada</th>
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">PJ</th>
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Goles</th>
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">TA</th>
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">TR</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  @for (h of historial(); track h.id) {
                    <tr>
                      <td class="px-4 py-2">{{ getParticipanteNombre(h.participanteId) }}</td>
                      <td class="px-4 py-2">{{ h.temporada }}</td>
                      <td class="px-4 py-2">{{ h.partidosJugados }}</td>
                      <td class="px-4 py-2">{{ h.goles }}</td>
                      <td class="px-4 py-2">{{ h.tarjetasAmarillas }}</td>
                      <td class="px-4 py-2">{{ h.tarjetasRojas }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="text-center py-12">
        <p class="text-slate-400 text-lg">Equipo no encontrado</p>
        <a routerLink="/maestros/equipos" class="text-indigo-600 hover:text-indigo-800 mt-2 inline-block">Volver al listado</a>
      </div>
    }
  `,
})
export class EquipoDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly equipoService = inject(EquipoService);
  private readonly competenciaService = inject(CompetenciaService);
  private readonly disciplinaService = inject(DisciplinaService);

  protected readonly equipo = signal<Equipo | undefined>(undefined);
  protected readonly historial = signal<HistorialParticipante[]>([]);

  protected readonly elegibilidadClasses: Record<string, string> = {
    elegible: 'bg-green-100 text-green-700',
    no_elegible: 'bg-red-100 text-red-700',
    suspendido: 'bg-yellow-100 text-yellow-700',
    transferido: 'bg-purple-100 text-purple-700',
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.equipo.set(this.equipoService.getEquipoById(id));
      const eq = this.equipo();
      if (eq) {
        const allHistorial = eq.participantes.flatMap((p) =>
          this.equipoService.getHistorialByParticipante(p.id)
        );
        this.historial.set(allHistorial);
      }
    }
  }

  protected getCompetenciaNombre(id: string): string {
    return this.competenciaService.getById(id)?.nombre ?? id;
  }

  protected getDisciplinaNombre(id: string): string {
    return this.disciplinaService.getById(id)?.nombre ?? id;
  }

  protected getParticipanteNombre(id: string): string {
    const p = this.equipoService.getParticipante(id);
    return p ? `${p.apellido}, ${p.nombre}` : id;
  }
}
