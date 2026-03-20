import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SedeService } from '../../core/services/sede.service';
import { DisciplinaService } from '../../core/services/disciplina.service';
import { Sede, ESTADO_SEDE_LABELS, EstadoSede } from '../../core/models/sede.model';

@Component({
  selector: 'app-sede-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (sede(); as s) {
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <a routerLink="/maestros/sedes" class="text-indigo-600 hover:text-indigo-800 text-sm">&larr; Volver</a>
            <h2 class="text-2xl font-bold text-slate-900 mt-1">{{ s.nombre }}</h2>
            <p class="text-slate-500">{{ s.direccion }}</p>
          </div>
          <a [routerLink]="['editar']" class="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Editar
          </a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl shadow-sm p-4">
            <p class="text-sm text-slate-500">Estado</p>
            <p class="text-lg font-semibold">
              <span class="text-xs px-2 py-0.5 rounded font-medium"
                [class]="estadoClasses[s.estado]">
                {{ estadoLabels[s.estado] }}
              </span>
            </p>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-4">
            <p class="text-sm text-slate-500">Campos</p>
            <p class="text-lg font-semibold">{{ s.campos.length }}</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-4">
            <p class="text-sm text-slate-500">Teléfono</p>
            <p class="text-lg font-semibold">{{ s.telefono ?? 'No registrado' }}</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-4">
            <p class="text-sm text-slate-500">Email</p>
            <p class="text-lg font-semibold">{{ s.email ?? 'No registrado' }}</p>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b bg-slate-50">
            <h3 class="text-lg font-semibold text-slate-900">Campos deportivos</h3>
          </div>
          @if (s.campos.length > 0) {
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead>
                  <tr class="border-b">
                    <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Nombre</th>
                    <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Capacidad</th>
                    <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Superficie</th>
                    <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Disciplinas</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (campo of s.campos; track campo.id) {
                    <tr class="hover:bg-slate-50">
                      <td class="px-6 py-3 font-medium">{{ campo.nombre }}</td>
                      <td class="px-6 py-3 text-slate-600">{{ campo.capacidad ?? '-' }}</td>
                      <td class="px-6 py-3 text-slate-600">{{ campo.superficie ?? '-' }}</td>
                      <td class="px-6 py-3">
                        <div class="flex flex-wrap gap-1">
                          @for (dId of campo.disciplinaIds; track dId) {
                            <span class="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs">
                              {{ getDisciplinaNombre(dId) }}
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
            <div class="px-6 py-8 text-center text-slate-400">
              No hay campos registrados en esta sede
            </div>
          }
        </div>
      </div>
    } @else {
      <div class="text-center py-12">
        <p class="text-slate-400 text-lg">Sede no encontrada</p>
        <a routerLink="/maestros/sedes" class="text-indigo-600 hover:text-indigo-800 mt-2 inline-block">Volver al listado</a>
      </div>
    }
  `,
})
export class SedeDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly sedeService = inject(SedeService);
  private readonly disciplinaService = inject(DisciplinaService);

  protected readonly sede = signal<Sede | undefined>(undefined);

  protected readonly estadoLabels = ESTADO_SEDE_LABELS;
  protected readonly estadoClasses: Record<EstadoSede, string> = {
    activa: 'bg-green-100 text-green-700',
    inactiva: 'bg-slate-100 text-slate-600',
    en_mantenimiento: 'bg-yellow-100 text-yellow-700',
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.sede.set(this.sedeService.getById(id));
    }
  }

  protected getDisciplinaNombre(id: string): string {
    return this.disciplinaService.getById(id)?.nombre ?? id;
  }
}
