import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SocioService } from '../../core/services/socio.service';
import { AcademiaService } from '../../core/services/academia.service';
import { AcademiaMatriculaService } from '../../core/services/academia-matricula.service';
import { DIA_SEMANA_LABELS } from '../../core/models/academia.model';

@Component({
  selector: 'app-matricula-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <a routerLink="/academia/cursos" class="text-indigo-600 hover:text-indigo-800 text-sm">&larr; Volver al árbol</a>
          <h2 class="text-2xl font-bold text-slate-900 mt-1">Nueva Matrícula Académica</h2>
          <p class="text-slate-500 mt-1">Valide automáticamente edad, nivel y vacantes antes de confirmar la inscripción.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] gap-6">
        <section class="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <form [formGroup]="form" (ngSubmit)="guardar()" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="socioId" class="block text-sm font-medium text-slate-700 mb-1">Socio / Alumno</label>
                <select id="socioId" formControlName="socioId"
                  (change)="revalidar()"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500">
                  <option value="">Seleccionar socio</option>
                  @for (socio of sociosActivos(); track socio.id) {
                    <option [value]="socio.id">{{ socio.apellido }}, {{ socio.nombre }}</option>
                  }
                </select>
              </div>

              <div>
                <label for="claseId" class="block text-sm font-medium text-slate-700 mb-1">Clase consolidada</label>
                <select id="claseId" formControlName="claseId"
                  (change)="revalidar()"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500">
                  <option value="">Seleccionar clase</option>
                  @for (clase of clasesDisponibles(); track clase.id) {
                    <option [value]="clase.id">{{ etiquetaClase(clase.id) }}</option>
                  }
                </select>
              </div>
            </div>

            @if (resultadoValidacion(); as resultado) {
              <div class="rounded-xl border p-4"
                [class]="resultado.permitido ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'">
                <div class="flex items-center gap-2">
                  <span class="text-lg" aria-hidden="true">{{ resultado.permitido ? '✅' : '⚠️' }}</span>
                  <p class="font-semibold"
                    [class]="resultado.permitido ? 'text-emerald-800' : 'text-amber-800'">
                    {{ resultado.permitido ? 'Matrícula habilitada' : 'Matrícula bloqueada' }}
                  </p>
                </div>
                <ul class="mt-3 space-y-2 text-sm"
                  [class]="resultado.permitido ? 'text-emerald-700' : 'text-amber-800'">
                  @for (mensaje of resultado.mensajes; track mensaje) {
                    <li class="flex gap-2">
                      <span aria-hidden="true">•</span>
                      <span>{{ mensaje }}</span>
                    </li>
                  }
                </ul>
              </div>
            }

            <div class="flex gap-3">
              <button type="submit" [disabled]="form.invalid"
                class="rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
                Registrar matrícula
              </button>
              <button type="button" (click)="limpiar()"
                class="rounded-lg bg-slate-200 px-6 py-2 text-slate-700 hover:bg-slate-300">
                Limpiar
              </button>
            </div>
          </form>
        </section>

        <aside class="space-y-4">
          <section class="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h3 class="text-lg font-semibold text-slate-900">Detalle de validación</h3>
            @if (resultadoValidacion(); as resultado) {
              <dl class="space-y-3 text-sm">
                <div class="flex justify-between gap-3">
                  <dt class="text-slate-500">Edad del socio</dt>
                  <dd class="font-medium text-slate-800">{{ resultado.edadSocio ?? 'No disponible' }}</dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-slate-500">Categoría por edad</dt>
                  <dd class="font-medium text-slate-800">{{ resultado.categoriaEdad?.nombre ?? '—' }}</dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-slate-500">Nivel requerido</dt>
                  <dd class="font-medium text-slate-800">{{ resultado.nivelRequerido?.nombre ?? 'Sin nivel' }}</dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-slate-500">Nivel acreditado</dt>
                  <dd class="font-medium text-slate-800">{{ resultado.nivelAcreditado?.nombre ?? 'No registrado' }}</dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-slate-500">Vacantes disponibles</dt>
                  <dd class="font-medium text-slate-800">{{ resultado.vacantesDisponibles ?? '—' }}</dd>
                </div>
              </dl>
            } @else {
              <p class="text-sm text-slate-500">Seleccione un socio y una clase para visualizar la validación automática.</p>
            }
          </section>

          <section class="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-lg font-semibold text-slate-900">Matrículas recientes</h3>
              <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{{ matriculasRecientes().length }}</span>
            </div>

            <div class="space-y-3">
              @for (matricula of matriculasRecientes(); track matricula.id) {
                <div class="rounded-xl border border-slate-200 p-3">
                  <p class="font-medium text-slate-800">{{ matricula.socioNombre }}</p>
                  <p class="text-sm text-slate-500 mt-1">{{ matricula.cursoNombre }}</p>
                  <p class="text-xs text-slate-400 mt-1">{{ matricula.fechaRegistro }} · {{ matricula.periodo }}</p>
                </div>
              } @empty {
                <p class="text-sm text-slate-500">Aún no hay matrículas registradas.</p>
              }
            </div>
          </section>
        </aside>
      </div>
    </div>
  `,
})
export class MatriculaFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly socioService = inject(SocioService);
  private readonly academiaService = inject(AcademiaService);
  private readonly matriculaService = inject(AcademiaMatriculaService);

  private readonly cursoFiltroId = this.route.snapshot.queryParamMap.get('cursoId');

  protected readonly sociosActivos = computed(() =>
    this.socioService.items().filter((socio) => socio.estado === 'activo')
  );
  protected readonly clasesDisponibles = computed(() => {
    const clases = this.academiaService.clases();
    return this.cursoFiltroId ? clases.filter((clase) => clase.cursoId === this.cursoFiltroId) : clases;
  });
  protected readonly matriculasRecientes = computed(() => this.matriculaService.matriculasDetalladas().slice(0, 5));
  protected readonly resultadoValidacion = signal<ReturnType<AcademiaMatriculaService['validateMatricula']> | null>(null);

  readonly form = this.fb.nonNullable.group({
    socioId: ['', Validators.required],
    claseId: ['', Validators.required],
  });

  constructor() {
    const claseId = this.route.snapshot.queryParamMap.get('claseId');
    if (claseId) {
      this.form.controls.claseId.setValue(claseId);
    }
  }

  protected etiquetaClase(claseId: string): string {
    const clase = this.academiaService.getClaseById(claseId);
    if (!clase) {
      return claseId;
    }

    const curso = this.academiaService.getCursoById(clase.cursoId);
    const categoria = this.academiaService.getCategoriaEdadById(clase.categoriaEdadId);
    const nivel = clase.nivelId ? this.academiaService.getNivelById(clase.nivelId) : undefined;
    const horario = clase.horarios
      .map((item) => `${DIA_SEMANA_LABELS[item.dia]} ${item.horaInicio}`)
      .join(' · ');

    return [curso?.nombre, categoria?.nombre, nivel?.nombre, horario]
      .filter(Boolean)
      .join(' — ');
  }

  protected revalidar(): void {
    const { socioId, claseId } = this.form.getRawValue();
    if (!socioId || !claseId) {
      this.resultadoValidacion.set(null);
      return;
    }

    this.resultadoValidacion.set(this.matriculaService.validateMatricula(socioId, claseId));
  }

  protected guardar(): void {
    if (this.form.invalid) {
      return;
    }

    const { socioId, claseId } = this.form.getRawValue();
    const resultado = this.matriculaService.registrarMatricula(socioId, claseId);
    this.resultadoValidacion.set(resultado);
  }

  protected limpiar(): void {
    this.form.reset({ socioId: '', claseId: this.cursoFiltroId ? '' : '' });
    this.resultadoValidacion.set(null);
  }
}
