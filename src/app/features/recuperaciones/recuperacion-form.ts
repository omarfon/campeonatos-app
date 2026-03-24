import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RecuperacionService } from '../../core/services/recuperacion.service';
import { MatriculaService } from '../../core/services/matricula.service';
import { SocioService } from '../../core/services/socio.service';
import { AcademiaService } from '../../core/services/academia.service';
import { Socio } from '../../core/models/socio.model';
import { Matricula } from '../../core/models/matricula.model';
import {
  MOTIVO_RECUPERACION_LABELS,
  MotivoRecuperacion,
} from '../../core/models/recuperacion.model';

@Component({
  selector: 'app-recuperacion-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="h-full flex flex-col">
      <!-- Cabecera -->
      <div class="px-6 py-5 border-b border-slate-100">
        <h2 class="text-lg font-semibold text-slate-800">Nueva Solicitud de Recuperación</h2>
        <p class="mt-0.5 text-sm text-slate-500">Solo para casos con documentación justificada</p>
      </div>

      <div class="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        <!-- Aviso de política -->
        <div class="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
          <strong>Recuerde:</strong> La política general de AELU no contempla recuperaciones. Este
          trámite es excepcional y requiere aprobación de la administración. El alumno no puede
          autogestionar este proceso.
        </div>

        <!-- Búsqueda de alumno -->
        <div>
          <label for="buscarAlumno" class="block text-sm font-medium text-slate-700 mb-1">
            Buscar alumno
          </label>
          <input
            id="buscarAlumno"
            type="text"
            [value]="busqueda()"
            (input)="busqueda.set($any($event.target).value)"
            placeholder="Nombre o DNI…"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          @if (resultadosBusqueda().length > 0 && !socioSeleccionado()) {
            <ul
              class="mt-1 rounded-lg border border-slate-200 bg-white shadow-sm divide-y divide-slate-100 max-h-40 overflow-y-auto"
              role="listbox"
              aria-label="Resultados de búsqueda"
            >
              @for (s of resultadosBusqueda(); track s.id) {
                <li>
                  <button
                    type="button"
                    (click)="seleccionarSocio(s)"
                    class="w-full text-left px-3 py-2 text-sm hover:bg-teal-50 transition-colors"
                  >
                    <span class="font-medium text-slate-800">{{ s.apellido }}, {{ s.nombre }}</span>
                    <span class="ml-2 text-slate-400 text-xs">DNI: {{ s.dni }}</span>
                  </button>
                </li>
              }
            </ul>
          }
        </div>

        <!-- Alumno seleccionado -->
        @if (socioSeleccionado(); as socio) {
          <div
            class="rounded-lg bg-teal-50 border border-teal-100 px-3 py-2 flex items-center justify-between"
          >
            <div class="text-sm">
              <span class="font-medium text-teal-800">{{ socio.apellido }}, {{ socio.nombre }}</span>
              <span class="ml-2 text-teal-600 text-xs">DNI: {{ socio.dni }}</span>
            </div>
            <button
              type="button"
              (click)="limpiarSocio()"
              class="text-xs text-teal-600 hover:text-teal-800 transition-colors"
            >
              Cambiar
            </button>
          </div>

          <!-- Matrículas activas -->
          @if (matriculasActivas().length === 0) {
            <p class="text-sm text-slate-500 italic">
              Este alumno no tiene matrículas activas.
            </p>
          } @else {
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">
                Seleccionar matrícula
              </label>
              <div class="space-y-2">
                @for (m of matriculasActivas(); track m.id) {
                  <label
                    class="flex items-start gap-3 rounded-lg border border-slate-200 p-3 cursor-pointer hover:border-teal-400 transition-colors has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50"
                  >
                    <input
                      type="radio"
                      name="recuperacion-matricula"
                      [value]="m.id"
                      (change)="seleccionarMatricula(m)"
                      class="mt-0.5 accent-teal-600"
                    />
                    <div class="text-sm">
                      <p class="font-medium text-slate-800">{{ getNombreCurso(m.claseId) }}</p>
                      <p class="text-slate-500 text-xs">{{ getNombreClase(m.claseId) }}</p>
                    </div>
                  </label>
                }
              </div>
            </div>
          }
        }

        <!-- Formulario de solicitud -->
        @if (matriculaSeleccionada()) {
          <form [formGroup]="form" (ngSubmit)="guardar()" class="space-y-4">
            <!-- Fecha de la sesión perdida -->
            <div>
              <label for="fechaSesion" class="block text-sm font-medium text-slate-700 mb-1">
                Fecha de la sesión a la que faltó <span class="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="fechaSesion"
                formControlName="fechaSesionOriginal"
                type="date"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <!-- Motivo -->
            <div>
              <label for="motivoRecuperacion" class="block text-sm font-medium text-slate-700 mb-1">
                Motivo justificado <span class="text-red-500" aria-hidden="true">*</span>
              </label>
              <select
                id="motivoRecuperacion"
                formControlName="motivo"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Seleccionar…</option>
                @for (entry of motivoEntries; track entry.valor) {
                  <option [value]="entry.valor">{{ entry.label }}</option>
                }
              </select>
            </div>

            <!-- Documento presentado -->
            <div>
              <label for="docJustificante" class="block text-sm font-medium text-slate-700 mb-1">
                Documento presentado <span class="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="docJustificante"
                formControlName="documentoJustificante"
                type="text"
                placeholder="Ej: Certificado médico Dr. Pérez — 10/03/2026"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <!-- Comentario del operador -->
            <div>
              <label for="comentarioRec" class="block text-sm font-medium text-slate-700 mb-1">
                Comentario del operador <span class="text-red-500" aria-hidden="true">*</span>
              </label>
              <textarea
                id="comentarioRec"
                formControlName="comentario"
                rows="3"
                placeholder="Descripción del caso para revisión de la administración…"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
              ></textarea>
            </div>

            <div class="pt-2 flex gap-3">
              <button
                type="submit"
                [disabled]="form.invalid"
                class="flex-1 rounded-lg bg-teal-600 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Registrar solicitud
              </button>
              <button
                type="button"
                (click)="cancelar()"
                class="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
})
export class RecuperacionFormComponent {
  private readonly svc = inject(RecuperacionService);
  private readonly matriculaService = inject(MatriculaService);
  private readonly socioService = inject(SocioService);
  private readonly academiaService = inject(AcademiaService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly busqueda = signal('');
  readonly socioSeleccionado = signal<Socio | null>(null);
  readonly matriculaSeleccionada = signal<Matricula | null>(null);

  readonly motivoEntries = (
    Object.entries(MOTIVO_RECUPERACION_LABELS) as [MotivoRecuperacion, string][]
  ).map(([valor, label]) => ({ valor, label }));

  readonly form = this.fb.nonNullable.group({
    fechaSesionOriginal: ['', Validators.required],
    motivo: ['', Validators.required],
    documentoJustificante: ['', Validators.required],
    comentario: ['', [Validators.required, Validators.minLength(10)]],
  });

  readonly resultadosBusqueda = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    if (q.length < 2) return [];
    return this.socioService
      .items()
      .filter(
        (s) =>
          s.nombre.toLowerCase().includes(q) ||
          s.apellido.toLowerCase().includes(q) ||
          s.dni.includes(q),
      )
      .slice(0, 8);
  });

  readonly matriculasActivas = computed(() => {
    const socio = this.socioSeleccionado();
    if (!socio) return [];
    return this.matriculaService
      .getMatriculasBySocio(socio.id)
      .filter((m) => m.estado === 'confirmada' || m.estado === 'pagada');
  });

  seleccionarSocio(socio: Socio): void {
    this.socioSeleccionado.set(socio);
    this.busqueda.set('');
    this.matriculaSeleccionada.set(null);
  }

  limpiarSocio(): void {
    this.socioSeleccionado.set(null);
    this.matriculaSeleccionada.set(null);
    this.busqueda.set('');
  }

  seleccionarMatricula(m: Matricula): void {
    this.matriculaSeleccionada.set(m);
  }

  getNombreCurso(claseId: string): string {
    const clase = this.academiaService.getClaseById(claseId);
    if (!clase) return claseId;
    return this.academiaService.getCursoById(clase.cursoId)?.nombre ?? claseId;
  }

  getNombreClase(claseId: string): string {
    return this.academiaService.getClaseById(claseId)?.periodo ?? claseId;
  }

  guardar(): void {
    if (this.form.invalid) return;
    const socio = this.socioSeleccionado();
    const matricula = this.matriculaSeleccionada();
    if (!socio || !matricula) return;

    const { fechaSesionOriginal, motivo, documentoJustificante, comentario } =
      this.form.getRawValue();

    this.svc.create({
      matriculaId: matricula.id,
      socioId: socio.id,
      nombreSocio: `${socio.apellido}, ${socio.nombre}`,
      disciplina: this.getNombreCurso(matricula.claseId),
      nivel: '—',
      claseOriginalId: matricula.claseId,
      nombreClaseOriginal: this.getNombreCurso(matricula.claseId),
      fechaSesionOriginal,
      motivo: motivo as MotivoRecuperacion,
      documentoJustificante,
      comentario,
      estado: 'en_evaluacion',
      aforoComodinDescontado: false,
      diferida: false,
      registradoPor: 'operador',
    });

    this.cancelar();
  }

  cancelar(): void {
    this.router.navigate(['/', { outlets: { panel: null } }]);
  }
}
