import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DisciplinaService } from '../../core/services/disciplina.service';
import { Disciplina } from '../../core/models/disciplina.model';

@Component({
  selector: 'app-disciplina-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (disciplina(); as disc) {
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <a routerLink="/maestros/disciplinas" class="text-indigo-600 hover:text-indigo-800 text-sm">&larr; Volver</a>
            <h2 class="text-2xl font-bold text-slate-900 mt-1">{{ disc.nombre }}</h2>
            <p class="text-slate-500">{{ disc.descripcion }}</p>
          </div>
          <a [routerLink]="['editar']" class="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Editar
          </a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl shadow-sm p-4">
            <p class="text-sm text-slate-500">Tipo de Planilla</p>
            <p class="text-lg font-semibold capitalize">{{ disc.tipoPlanilla }}</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-4">
            <p class="text-sm text-slate-500">Jugadores por equipo</p>
            <p class="text-lg font-semibold">{{ disc.minJugadoresPorEquipo }} - {{ disc.maxJugadoresPorEquipo }}</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-4">
            <p class="text-sm text-slate-500">Duración</p>
            <p class="text-lg font-semibold">{{ disc.duracionPartidoMinutos ? disc.duracionPartidoMinutos + ' min' : 'Variable' }}</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-4">
            <p class="text-sm text-slate-500">Extras</p>
            <p class="text-lg font-semibold">
              {{ disc.tiemposExtra ? 'T. Extra' : '' }}{{ disc.tiemposExtra && disc.penales ? ' / ' : '' }}{{ disc.penales ? 'Penales' : '' }}{{ !disc.tiemposExtra && !disc.penales ? 'Ninguno' : '' }}
            </p>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Reglas de la Disciplina</h3>
          @if (disc.reglas.length > 0) {
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead>
                  <tr class="bg-slate-50 border-b">
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Nombre</th>
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Descripción</th>
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Valor</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (regla of disc.reglas; track regla.id) {
                    <tr class="hover:bg-slate-50">
                      <td class="px-4 py-3 font-medium">{{ regla.nombre }}</td>
                      <td class="px-4 py-3 text-slate-600">{{ regla.descripcion }}</td>
                      <td class="px-4 py-3">
                        <span class="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-sm font-medium">{{ regla.valor }}</span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <p class="text-slate-400">No hay reglas configuradas para esta disciplina</p>
          }
        </div>
      </div>
    } @else {
      <div class="text-center py-12">
        <p class="text-slate-400 text-lg">Disciplina no encontrada</p>
        <a routerLink="/maestros/disciplinas" class="text-indigo-600 hover:text-indigo-800 mt-2 inline-block">Volver al listado</a>
      </div>
    }
  `,
})
export class DisciplinaDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly disciplinaService = inject(DisciplinaService);

  protected readonly disciplina = signal<Disciplina | undefined>(undefined);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.disciplina.set(this.disciplinaService.getById(id));
    }
  }
}
