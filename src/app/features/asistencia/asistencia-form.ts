import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AsistenciaService } from '../../core/services/asistencia.service';
import { AcademiaService } from '../../core/services/academia.service';
import {
  EstadoAsistenciaAlumno,
  ESTADO_ASISTENCIA_ALUMNO_LABELS,
  ESTADO_ASISTENCIA_ALUMNO_COLORS,
  TipoIncidencia,
  TIPO_INCIDENCIA_LABELS,
} from '../../core/models/asistencia.model';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

interface FilaRoster {
  socioId: string;
  nombre: string;
  dni: string;
  condicion: string;
  estadoAsistencia: EstadoAsistenciaAlumno | null;
  observaciones: string;
}

@Component({
  selector: 'app-asistencia-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="h-full flex flex-col">
      <!-- Cabecera -->
      <div class="px-6 py-5 border-b border-slate-100">
        <h2 class="text-lg font-semibold text-slate-800">Registrar Asistencia</h2>
        @if (sesionInfo()) {
          <p class="mt-0.5 text-sm text-slate-500">
            {{ sesionInfo()!.cursoNombre }} — {{ sesionInfo()!.fecha }}
            {{ sesionInfo()!.horaInicio }} a {{ sesionInfo()!.horaFin }}
          </p>
        }
      </div>

      <div class="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        @if (!sesionInfo()) {
          <p class="text-sm text-red-500">Sesión no encontrada.</p>
        } @else {
          <!-- Tabla de alumnos -->
          <div>
            <h3 class="text-sm font-semibold text-slate-700 mb-2">Nómina de Alumnos ({{ filas().length }})</h3>
            <div class="overflow-x-auto rounded-xl border border-slate-200">
              <table class="w-full text-sm">
                <thead class="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500">Alumno</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500">DNI</th>
                    <th class="px-3 py-2 text-center text-xs font-semibold text-slate-500">Asistencia</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold text-slate-500">Observación</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (fila of filas(); track fila.socioId; let i = $index) {
                    <tr class="hover:bg-slate-50">
                      <td class="px-3 py-2 font-medium text-slate-800">{{ fila.nombre }}</td>
                      <td class="px-3 py-2 text-slate-500">{{ fila.dni }}</td>
                      <td class="px-3 py-2">
                        <div class="flex flex-wrap gap-1 justify-center">
                          @for (e of estadosAsistencia; track e.value) {
                            <button
                              type="button"
                              (click)="setEstado(i, e.value)"
                              [class]="(fila.estadoAsistencia === e.value ? e.activeClass : 'bg-slate-100 text-slate-500 hover:bg-slate-200') + ' rounded-lg px-2 py-0.5 text-xs font-medium transition-colors'"
                              [attr.aria-pressed]="fila.estadoAsistencia === e.value"
                            >
                              {{ e.label }}
                            </button>
                          }
                        </div>
                      </td>
                      <td class="px-3 py-2">
                        <input
                          type="text"
                          [value]="fila.observaciones"
                          (input)="setObservacion(i, $any($event.target).value)"
                          placeholder="Obs. opcional"
                          class="input-modern !py-1 !px-2 !text-xs w-full"
                          [attr.aria-label]="'Observación para ' + fila.nombre"
                        />
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Acciones rápidas -->
          <div class="flex gap-2 flex-wrap">
            <button
              type="button"
              (click)="marcarTodos('asistio')"
              class="rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 text-xs font-medium hover:bg-emerald-100 transition-colors"
            >
              ✓ Todos asistieron
            </button>
            <button
              type="button"
              (click)="marcarTodos('no_asistio')"
              class="rounded-lg bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 text-xs font-medium hover:bg-red-100 transition-colors"
            >
              ✗ Ninguno asistió
            </button>
            <span class="ml-auto text-xs text-slate-500 self-center">
              {{ resumen().asistieron }} asistieron · {{ resumen().noAsistieron }} no asistieron · {{ resumen().pendientes }} sin marcar
            </span>
          </div>

          <!-- Incidencias -->
          <div>
            <h3 class="text-sm font-semibold text-slate-700 mb-2">Agregar Incidencia</h3>
            <form [formGroup]="incidenciaForm" (ngSubmit)="agregarIncidencia()">
              <div class="rounded-xl border border-slate-200 p-4 space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label for="tipoInc" class="block text-xs font-medium text-slate-700 mb-1">Tipo</label>
                    <select id="tipoInc" formControlName="tipo" class="input-modern !py-1.5 !text-sm w-full">
                      @for (t of tiposIncidencia; track t.value) {
                        <option [value]="t.value">{{ t.label }}</option>
                      }
                    </select>
                  </div>
                  <div class="col-span-2">
                    <label for="descInc" class="block text-xs font-medium text-slate-700 mb-1">Descripción</label>
                    <textarea
                      id="descInc"
                      formControlName="descripcion"
                      rows="2"
                      class="input-modern !py-1.5 !text-sm w-full resize-none"
                      placeholder="Describa la incidencia..."
                    ></textarea>
                  </div>
                </div>
                <button
                  type="submit"
                  [disabled]="incidenciaForm.invalid"
                  class="btn-secondary !text-xs !px-3 !py-1.5 disabled:opacity-50"
                >
                  + Agregar incidencia
                </button>
              </div>
            </form>
            <!-- Lista de incidencias de la sesión -->
            @if (incidencias().length > 0) {
              <ul class="mt-2 space-y-1">
                @for (inc of incidencias(); track inc.id) {
                  <li class="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-700 flex items-start gap-2">
                    <span class="rounded-full bg-orange-100 text-orange-700 px-2 py-0.5 font-medium shrink-0">{{ tipoLabel(inc.tipo) }}</span>
                    <span>{{ inc.descripcion }}</span>
                  </li>
                }
              </ul>
            }
          </div>
        }
      </div>

      <!-- Acciones footer -->
      <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
        <button type="button" (click)="cerrar()" class="btn-secondary">Cancelar</button>
        <button
          type="button"
          [disabled]="!puedeGuardar()"
          (click)="guardar()"
          class="btn-primary disabled:opacity-50"
        >
          Guardar asistencia
        </button>
      </div>
    </div>
  `,
})
export class AsistenciaFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly svc = inject(AsistenciaService);
  private readonly academiaSvc = inject(AcademiaService);
  private readonly fb = inject(FormBuilder);

  readonly sesionId = signal('');

  readonly sesionInfo = computed(() => {
    const id = this.sesionId();
    if (!id) return null;
    return this.svc.sesionesDetalladas().find((s) => s.id === id) ?? null;
  });

  readonly incidencias = computed(() => this.svc.getIncidenciasBySesion(this.sesionId()));

  readonly filas = signal<FilaRoster[]>([]);

  readonly resumen = computed(() => ({
    asistieron: this.filas().filter((f) => f.estadoAsistencia === 'asistio').length,
    noAsistieron: this.filas().filter((f) => f.estadoAsistencia === 'no_asistio').length,
    pendientes: this.filas().filter((f) => f.estadoAsistencia === null).length,
  }));

  readonly puedeGuardar = computed(() =>
    this.filas().length > 0 && this.filas().every((f) => f.estadoAsistencia !== null)
  );

  readonly estadosAsistencia: { value: EstadoAsistenciaAlumno; label: string; activeClass: string }[] = [
    { value: 'asistio', label: 'Asistió', activeClass: 'bg-emerald-500 text-white' },
    { value: 'no_asistio', label: 'Faltó', activeClass: 'bg-red-500 text-white' },
    { value: 'tardanza', label: 'Tarde', activeClass: 'bg-amber-500 text-white' },
    { value: 'justificado', label: 'Justif.', activeClass: 'bg-blue-500 text-white' },
  ];

  readonly tiposIncidencia: { value: TipoIncidencia; label: string }[] = [
    { value: 'infraestructura', label: TIPO_INCIDENCIA_LABELS.infraestructura },
    { value: 'disciplina', label: TIPO_INCIDENCIA_LABELS.disciplina },
    { value: 'administrativo', label: TIPO_INCIDENCIA_LABELS.administrativo },
    { value: 'otro', label: TIPO_INCIDENCIA_LABELS.otro },
  ];

  readonly incidenciaForm = this.fb.group({
    tipo: ['infraestructura' as TipoIncidencia, Validators.required],
    descripcion: ['', [Validators.required, Validators.minLength(5)]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('sesionId') ?? '';
    this.sesionId.set(id);
    const roster = this.svc.getRoster(id);
    this.filas.set(roster.map((r) => ({ ...r, estadoAsistencia: r.estadoAsistencia as EstadoAsistenciaAlumno | null })));
  }

  setEstado(index: number, estado: EstadoAsistenciaAlumno): void {
    this.filas.update((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], estadoAsistencia: estado };
      return updated;
    });
  }

  setObservacion(index: number, obs: string): void {
    this.filas.update((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], observaciones: obs };
      return updated;
    });
  }

  marcarTodos(estado: EstadoAsistenciaAlumno): void {
    this.filas.update((prev) => prev.map((f) => ({ ...f, estadoAsistencia: estado })));
  }

  tipoLabel(tipo: TipoIncidencia): string {
    return TIPO_INCIDENCIA_LABELS[tipo];
  }

  agregarIncidencia(): void {
    if (this.incidenciaForm.invalid) return;
    const val = this.incidenciaForm.getRawValue();
    this.svc.agregarIncidencia(this.sesionId(), {
      sesionId: this.sesionId(),
      tipo: val.tipo as TipoIncidencia,
      descripcion: val.descripcion ?? '',
    });
    this.incidenciaForm.reset({ tipo: 'infraestructura', descripcion: '' });
  }

  guardar(): void {
    if (!this.puedeGuardar()) return;
    this.svc.guardarAsistencia(
      this.sesionId(),
      this.filas().map((f) => ({
        socioId: f.socioId,
        estado: f.estadoAsistencia!,
        observaciones: f.observaciones || undefined,
      }))
    );
    this.cerrar();
  }

  cerrar(): void {
    this.router.navigate(['/', { outlets: { panel: null } }]);
  }
}
