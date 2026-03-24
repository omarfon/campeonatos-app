import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AsistenciaService } from '../../core/services/asistencia.service';
import { ESTADO_ASISTENCIA_ALUMNO_COLORS, ESTADO_ASISTENCIA_ALUMNO_LABELS } from '../../core/models/asistencia.model';

@Component({
  selector: 'app-roster-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UpperCasePipe],
  template: `
    <div class="h-full flex flex-col">
      <!-- Cabecera -->
      <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-slate-800">Lista de Asistencia</h2>
          @if (sesion()) {
            <p class="mt-0.5 text-sm text-slate-500">
              {{ sesion()!.cursoNombre }} · {{ sesion()!.fecha }} · {{ sesion()!.horaInicio }}–{{ sesion()!.horaFin }}
            </p>
          }
        </div>
        <button
          type="button"
          (click)="imprimir()"
          class="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 text-xs font-semibold transition-colors"
          aria-label="Imprimir lista"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2m2 4h6a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2zm1-4h.01"/></svg>
          Imprimir
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-6 py-6 space-y-4 print:px-0 print:py-0">
        @if (!sesion()) {
          <p class="text-sm text-red-500">Sesión no encontrada.</p>
        } @else {
          <!-- Encabezado del roster -->
          <div class="rounded-xl border border-slate-200 p-4 space-y-1 text-sm print:border-0">
            <div class="grid grid-cols-2 gap-1 text-slate-700">
              <div><span class="font-semibold">Curso:</span> {{ sesion()!.cursoNombre }}</div>
              <div><span class="font-semibold">Docente:</span> {{ sesion()!.docenteNombre }}</div>
              <div><span class="font-semibold">Fecha:</span> {{ sesion()!.fecha }}</div>
              <div><span class="font-semibold">Horario:</span> {{ sesion()!.horaInicio }} – {{ sesion()!.horaFin }}</div>
              <div><span class="font-semibold">Período:</span> {{ sesion()!.periodo }}</div>
              <div><span class="font-semibold">Total inscritos:</span> {{ roster().length }}</div>
            </div>
          </div>

          <!-- Tabla de nómina -->
          <div class="overflow-hidden rounded-xl border border-slate-200 print:border">
            <table class="w-full text-sm print:text-xs">
              <thead class="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500 w-8">#</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500">Apellidos y Nombres</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500">DNI</th>
                  <th class="px-3 py-2 text-center text-xs font-semibold text-slate-500">Condición</th>
                  @if (sesion()!.estado === 'tomada') {
                    <th class="px-3 py-2 text-center text-xs font-semibold text-slate-500">Asistencia</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500">Observación</th>
                  } @else {
                    <th class="px-3 py-2 text-center text-xs font-semibold text-slate-500 print:w-20">Asistió</th>
                    <th class="px-3 py-2 text-center text-xs font-semibold text-slate-500 print:w-20">Faltó</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500">Observación</th>
                  }
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (alumno of roster(); track alumno.socioId; let i = $index) {
                  <tr class="hover:bg-slate-50 print:hover:bg-transparent">
                    <td class="px-3 py-2 text-center text-slate-500 text-xs">{{ i + 1 }}</td>
                    <td class="px-3 py-2 font-medium text-slate-800">{{ alumno.nombre }}</td>
                    <td class="px-3 py-2 text-slate-600">{{ alumno.dni }}</td>
                    <td class="px-3 py-2 text-center">
                      <span class="text-xs rounded-full px-1.5 py-0.5
                        {{ alumno.condicion === 'socio' ? 'bg-blue-50 text-blue-600' :
                           alumno.condicion === 'dependiente' ? 'bg-purple-50 text-purple-600' :
                           'bg-slate-100 text-slate-600' }}">
                        {{ condicionLabel(alumno.condicion) }}
                      </span>
                    </td>
                    @if (sesion()!.estado === 'tomada') {
                      <td class="px-3 py-2 text-center">
                        @if (alumno.estadoAsistencia) {
                          <span class="rounded-full px-2 py-0.5 text-xs font-medium
                            {{ estadoColor(alumno.estadoAsistencia) }}">
                            {{ estadoLabel(alumno.estadoAsistencia) }}
                          </span>
                        } @else {
                          <span class="text-xs text-slate-400">—</span>
                        }
                      </td>
                      <td class="px-3 py-2 text-xs text-slate-500">{{ alumno.observaciones || '—' }}</td>
                    } @else {
                      <td class="px-3 py-2 text-center print:border print:border-slate-300 print:h-8"></td>
                      <td class="px-3 py-2 text-center print:border print:border-slate-300 print:h-8"></td>
                      <td class="px-3 py-2 print:border print:border-slate-300 print:h-8"></td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Firma del docente -->
          <div class="flex justify-between pt-8 print:pt-16 text-sm text-slate-600 border-t border-slate-200 print:border-t-0">
            <div class="text-center">
              <div class="border-t border-slate-400 w-48 mb-1 print:border-slate-800"></div>
              <p class="font-medium">{{ sesion()!.docenteNombre }}</p>
              <p class="text-xs text-slate-500">Firma del Docente</p>
            </div>
            <div class="text-center">
              <div class="border-t border-slate-400 w-48 mb-1 print:border-slate-800"></div>
              <p class="font-medium">Personal Administrativo</p>
              <p class="text-xs text-slate-500">Firma y Sello</p>
            </div>
          </div>

          @if (incidencias().length > 0) {
            <div class="rounded-xl border border-orange-200 bg-orange-50 p-4">
              <h3 class="text-sm font-semibold text-orange-800 mb-2">Incidencias Registradas</h3>
              <ul class="space-y-1">
                @for (inc of incidencias(); track inc.id) {
                  <li class="text-xs text-orange-700">
                    <strong>[{{ inc.tipo | uppercase }}]</strong> {{ inc.descripcion }}
                  </li>
                }
              </ul>
            </div>
          }
        }
      </div>

      <div class="px-6 py-4 border-t border-slate-100 flex justify-between">
        <button type="button" (click)="cerrar()" class="btn-secondary">Cerrar</button>
        <button
          type="button"
          (click)="irARegistrar()"
          class="btn-primary !text-xs"
          [disabled]="sesion()?.estado === 'tomada'"
        >
          Registrar asistencia →
        </button>
      </div>
    </div>
  `,
})
export class RosterViewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly svc = inject(AsistenciaService);

  readonly sesionId = signal('');

  readonly sesion = computed(() => {
    const id = this.sesionId();
    return id ? (this.svc.sesionesDetalladas().find((s) => s.id === id) ?? null) : null;
  });

  readonly roster = computed(() => this.svc.getRoster(this.sesionId()));

  readonly incidencias = computed(() => this.svc.getIncidenciasBySesion(this.sesionId()));

  ngOnInit(): void {
    this.sesionId.set(this.route.snapshot.paramMap.get('sesionId') ?? '');
  }

  condicionLabel(condicion: string): string {
    const map: Record<string, string> = { socio: 'Socio', dependiente: 'Dep.', no_socio: 'Ext.' };
    return map[condicion] ?? condicion;
  }

  estadoLabel(estado: string): string {
    return ESTADO_ASISTENCIA_ALUMNO_LABELS[estado as keyof typeof ESTADO_ASISTENCIA_ALUMNO_LABELS] ?? estado;
  }

  estadoColor(estado: string): string {
    return ESTADO_ASISTENCIA_ALUMNO_COLORS[estado as keyof typeof ESTADO_ASISTENCIA_ALUMNO_COLORS] ?? '';
  }

  imprimir(): void {
    window.print();
  }

  irARegistrar(): void {
    this.router.navigate(['/', { outlets: { panel: ['asistencia', this.sesionId(), 'registrar'] } }]);
  }

  cerrar(): void {
    this.router.navigate(['/', { outlets: { panel: null } }]);
  }
}
