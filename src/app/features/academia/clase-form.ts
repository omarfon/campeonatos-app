import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { AcademiaService } from '../../core/services/academia.service';
import {
  DiaSemana,
  DIA_SEMANA_LABELS,
  TIPO_HORARIO_CLASE_LABELS,
  TIPO_DURACION_CLASE_LABELS,
  TipoHorarioClase,
  TipoDuracionClase,
} from '../../core/models/academia.model';

@Component({
  selector: 'app-clase-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-slate-900">Nueva Clase Consolidada</h2>
        <p class="text-slate-500 mt-1">Combine curso, nivel, edad, docente, ambiente y horario con control de aforo pedagógico y cupos comodín.</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="guardar()" class="space-y-6">
        <!-- Curso y clasificación -->
        <div class="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 class="text-lg font-semibold text-slate-900">Curso y Clasificación</h3>

          <div>
            <label for="cursoId" class="block text-sm font-medium text-slate-700 mb-1">Curso</label>
            <select id="cursoId" formControlName="cursoId"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              (change)="onCursoChange()">
              <option value="">Seleccionar curso</option>
              @for (curso of cursosActivos(); track curso.id) {
                <option [value]="curso.id">{{ curso.codigo }} — {{ curso.nombre }}</option>
              }
            </select>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="categoriaEdadId" class="block text-sm font-medium text-slate-700 mb-1">Categoría de Edad</label>
              <select id="categoriaEdadId" formControlName="categoriaEdadId"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                <option value="">Seleccionar categoría</option>
                @for (ce of filteredCategoriasEdad(); track ce.id) {
                  <option [value]="ce.id">{{ ce.nombre }} ({{ ce.edadMinima }}-{{ ce.edadMaxima }})</option>
                }
              </select>
            </div>
            <div>
              <label for="nivelId" class="block text-sm font-medium text-slate-700 mb-1">Nivel <span class="text-slate-400">(si aplica)</span></label>
              <select id="nivelId" formControlName="nivelId"
                [disabled]="filteredNiveles().length === 0"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-slate-100 disabled:text-slate-400">
                <option value="">{{ filteredNiveles().length === 0 ? 'Curso sin niveles configurados' : 'Sin nivel' }}</option>
                @for (niv of filteredNiveles(); track niv.id) {
                  <option [value]="niv.id">{{ niv.nombre }}</option>
                }
              </select>
            </div>
          </div>
        </div>

        <!-- Docente y ambiente -->
        <div class="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 class="text-lg font-semibold text-slate-900">Control de Zonas y Aforo</h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="docenteId" class="block text-sm font-medium text-slate-700 mb-1">Docente</label>
              <select id="docenteId" formControlName="docenteId"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                <option value="">Seleccionar docente</option>
                @for (doc of docentes(); track doc.id) {
                  <option [value]="doc.id">{{ doc.nombre }} {{ doc.apellido }}</option>
                }
              </select>
            </div>
            <div>
              <label for="ambienteId" class="block text-sm font-medium text-slate-700 mb-1">Ambiente</label>
              <select id="ambienteId" formControlName="ambienteId"
                (change)="onAmbienteChange()"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                <option value="">Seleccionar ambiente</option>
                @for (amb of ambientes(); track amb.id) {
                  <option [value]="amb.id">{{ amb.nombre }} · {{ amb.zona }} (físico: {{ amb.aforoFisico }}, pedagógico: {{ amb.aforoPedagogico }})</option>
                }
              </select>
            </div>
          </div>

          @if (ambienteSeleccionado(); as ambiente) {
            <div class="rounded-xl border border-green-100 bg-green-50 p-4">
              <p class="text-sm font-semibold text-green-800">Aforo del ambiente</p>
              <div class="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <p class="text-green-700">Físico: <span class="font-semibold">{{ ambiente.aforoFisico }}</span></p>
                <p class="text-green-700">Pedagógico: <span class="font-semibold">{{ ambiente.aforoPedagogico }}</span></p>
                <p class="text-green-700">Comodín reservado: <span class="font-semibold">{{ ambiente.aforoComodin }}</span></p>
              </div>
              <p class="text-xs text-green-700 mt-2">Cupo regular máximo para matrícula pública: {{ aforoRegularMaximo() }} alumno(s).</p>
            </div>
          }
        </div>

        <!-- Horarios -->
        <div class="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 class="text-lg font-semibold text-slate-900">Tipología y Configuración de Horarios</h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="tipoHorario" class="block text-sm font-medium text-slate-700 mb-1">Modalidad de horario</label>
              <select id="tipoHorario" formControlName="tipoHorario"
                (change)="onTipoHorarioChange()"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                @for (item of tiposHorario; track item.key) {
                  <option [value]="item.key">{{ item.label }}</option>
                }
              </select>
            </div>
            <div>
              <label for="frecuenciaSemanal" class="block text-sm font-medium text-slate-700 mb-1">Frecuencia semanal <span class="text-slate-400">(horario abierto)</span></label>
              <input id="frecuenciaSemanal" formControlName="frecuenciaSemanal" type="number" min="1" max="7"
                [disabled]="form.controls.tipoHorario.value !== 'abierto'"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-slate-100 disabled:text-slate-400" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label for="tipoDuracion" class="block text-sm font-medium text-slate-700 mb-1">Duración del curso</label>
              <select id="tipoDuracion" formControlName="tipoDuracion"
                (change)="onTipoDuracionChange()"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                @for (item of tiposDuracion; track item.key) {
                  <option [value]="item.key">{{ item.label }}</option>
                }
              </select>
            </div>
            <div>
              <label for="fechaInicio" class="block text-sm font-medium text-slate-700 mb-1">Fecha inicio</label>
              <input id="fechaInicio" formControlName="fechaInicio" type="date"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label for="fechaFin" class="block text-sm font-medium text-slate-700 mb-1">Fecha fin</label>
              <input id="fechaFin" formControlName="fechaFin" type="date"
                [disabled]="form.controls.tipoDuracion.value !== 'finita'"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-slate-100 disabled:text-slate-400" />
            </div>
          </div>

          <div class="flex items-center justify-between">
            <h4 class="text-base font-semibold text-slate-900">Bloques horarios</h4>
            <button type="button" (click)="addHorario()" class="text-green-600 hover:text-green-800 text-sm font-medium">+ Agregar</button>
          </div>
          @if (form.controls.tipoHorario.value === 'abierto') {
            <p class="text-sm text-slate-500">En horario abierto, estos bloques definen ventanas de asistencia disponibles.</p>
          }
          <div formArrayName="horarios" class="space-y-3">
            @for (h of horariosArray.controls; track $index) {
              <div [formGroupName]="$index" class="border rounded-lg p-3 bg-slate-50">
                <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                  <div>
                    <label class="block text-xs text-slate-500 mb-1">Día</label>
                    <select formControlName="dia"
                      class="w-full rounded border-slate-300 border px-2 py-1.5 text-sm focus:ring-2 focus:ring-green-500">
                      @for (d of dias; track d.key) {
                        <option [value]="d.key">{{ d.label }}</option>
                      }
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs text-slate-500 mb-1">Hora inicio</label>
                    <input formControlName="horaInicio" type="time"
                      class="w-full rounded border-slate-300 border px-2 py-1.5 text-sm focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label class="block text-xs text-slate-500 mb-1">Hora fin</label>
                    <input formControlName="horaFin" type="time"
                      class="w-full rounded border-slate-300 border px-2 py-1.5 text-sm focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div class="flex items-end">
                    <button type="button" (click)="removeHorario($index)"
                      class="text-red-500 hover:text-red-700 text-sm px-2 py-1.5" aria-label="Eliminar horario">✕</button>
                  </div>
                </div>
              </div>
            }
          </div>

          @if (validacionProgramacion(); as validacion) {
            <div class="rounded-xl border p-4"
              [class]="validacion.permitido ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'">
              <p class="text-sm font-semibold"
                [class]="validacion.permitido ? 'text-emerald-800' : 'text-amber-800'">
                {{ validacion.permitido ? 'Programación válida' : 'Programación con restricciones' }}
              </p>
              @if (form.controls.tipoDuracion.value === 'finita') {
                <p class="text-xs mt-1"
                  [class]="validacion.permitido ? 'text-emerald-700' : 'text-amber-700'">
                  RF-15 · Réplica masiva estimada: {{ validacion.sesionesReplica }} sesión(es) entre inicio y fin.
                </p>
              }
              <ul class="mt-2 space-y-1 text-sm"
                [class]="validacion.permitido ? 'text-emerald-700' : 'text-amber-800'">
                @for (mensaje of validacion.mensajes; track mensaje) {
                  <li>• {{ mensaje }}</li>
                }
              </ul>
            </div>
          }
        </div>

        <!-- Vacantes y tarifas -->
        <div class="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 class="text-lg font-semibold text-slate-900">Vacantes y Tarifas</h3>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label for="vacantes" class="block text-sm font-medium text-slate-700 mb-1">Vacantes</label>
              <input id="vacantes" formControlName="vacantes" type="number" min="1"
                [attr.max]="aforoRegularMaximo()"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
              @if (aforoRegularMaximo() !== null) {
                <p class="text-xs text-slate-500 mt-1">Máximo de matrícula regular permitido: {{ aforoRegularMaximo() }}</p>
              }
            </div>
            <div>
              <label for="tarifaMensual" class="block text-sm font-medium text-slate-700 mb-1">Tarifa Mensual</label>
              <input id="tarifaMensual" formControlName="tarifaMensual" type="number" min="0"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label for="tarifaMatricula" class="block text-sm font-medium text-slate-700 mb-1">Tarifa Matrícula</label>
              <input id="tarifaMatricula" formControlName="tarifaMatricula" type="number" min="0"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="periodo" class="block text-sm font-medium text-slate-700 mb-1">Periodo</label>
              <input id="periodo" formControlName="periodo" type="text" placeholder="2026-I"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label for="estado" class="block text-sm font-medium text-slate-700 mb-1">Estado</label>
              <select id="estado" formControlName="estado"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                <option value="abierta">Abierta</option>
                <option value="cerrada">Cerrada</option>
                <option value="llena">Llena</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="flex gap-3">
          <button type="submit" [disabled]="form.invalid || !puedeGuardarProgramacion()"
            class="bg-brand text-white px-6 py-2 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Crear Clase Consolidada
          </button>
          <button type="button" (click)="cancelar()"
            class="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `,
})
export class ClaseFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly svc = inject(AcademiaService);

  protected readonly cursosActivos = this.svc.cursosActivos;
  protected readonly docentes = this.svc.docentes;
  protected readonly ambientes = this.svc.ambientes;
  protected readonly tiposHorario = Object.entries(TIPO_HORARIO_CLASE_LABELS).map(([key, label]) => ({ key, label }));
  protected readonly tiposDuracion = Object.entries(TIPO_DURACION_CLASE_LABELS).map(([key, label]) => ({ key, label }));

  protected readonly filteredCategoriasEdad = signal<{ id: string; nombre: string; edadMinima: number; edadMaxima: number }[]>([]);
  protected readonly filteredNiveles = signal<{ id: string; nombre: string }[]>([]);
  protected readonly ambienteSeleccionado = signal<ReturnType<AcademiaService['getAmbienteById']>>(undefined);
  protected readonly aforoRegularMaximo = signal<number | null>(null);
  protected readonly validacionProgramacion = signal<ReturnType<AcademiaService['validateProgramacionClase']> | null>(null);

  protected readonly dias = Object.entries(DIA_SEMANA_LABELS).map(([key, label]) => ({ key, label }));

  readonly form = this.fb.nonNullable.group({
    cursoId: ['', Validators.required],
    categoriaEdadId: ['', Validators.required],
    nivelId: [''],
    docenteId: ['', Validators.required],
    ambienteId: ['', Validators.required],
    tipoHorario: ['cerrado' as TipoHorarioClase, Validators.required],
    horarios: this.fb.array<FormGroup>([], Validators.required),
    frecuenciaSemanal: [3],
    tipoDuracion: ['continua' as TipoDuracionClase, Validators.required],
    fechaInicio: ['2026-03-01', Validators.required],
    fechaFin: [''],
    vacantes: [20, [Validators.required, Validators.min(1)]],
    tarifaMensual: [0],
    tarifaMatricula: [0],
    estado: ['abierta' as const],
    periodo: ['2026-I', Validators.required],
  });

  get horariosArray(): FormArray<FormGroup> {
    return this.form.controls.horarios;
  }

  ngOnInit(): void {
    this.addHorario();
    this.onTipoHorarioChange();
    this.onTipoDuracionChange();
    this.revalidarProgramacion();

    this.form.valueChanges.subscribe(() => {
      this.revalidarProgramacion();
    });

    const cursoId = this.route.snapshot.queryParamMap.get('cursoId');
    if (cursoId) {
      this.form.controls.cursoId.setValue(cursoId);
      this.onCursoChange();
    }
  }

  protected onCursoChange(): void {
    const cursoId = this.form.value.cursoId;
    if (cursoId) {
      this.filteredCategoriasEdad.set(this.svc.getCategoriasEdadByCurso(cursoId));
      this.filteredNiveles.set(this.svc.getNivelesByCurso(cursoId));
    } else {
      this.filteredCategoriasEdad.set([]);
      this.filteredNiveles.set([]);
    }
    this.form.controls.categoriaEdadId.setValue('');
    this.form.controls.nivelId.setValue('');
  }

  protected onAmbienteChange(): void {
    const ambienteId = this.form.controls.ambienteId.value;
    if (!ambienteId) {
      this.ambienteSeleccionado.set(undefined);
      this.aforoRegularMaximo.set(null);
      return;
    }

    const ambiente = this.svc.getAmbienteById(ambienteId);
    this.ambienteSeleccionado.set(ambiente);
    const maximo = this.svc.getAforoRegularDisponibleAmbiente(ambienteId);
    this.aforoRegularMaximo.set(maximo);
    const vacantesActuales = this.form.controls.vacantes.value;
    this.form.controls.vacantes.setValue(Math.min(vacantesActuales, maximo));
    this.revalidarProgramacion();
  }

  protected onTipoHorarioChange(): void {
    const tipoHorario = this.form.controls.tipoHorario.value;
    if (tipoHorario === 'abierto') {
      this.form.controls.frecuenciaSemanal.addValidators([Validators.required, Validators.min(1), Validators.max(7)]);
      this.horariosArray.clearValidators();
    } else {
      this.form.controls.frecuenciaSemanal.clearValidators();
      this.horariosArray.addValidators(Validators.required);
      if (this.horariosArray.length === 0) {
        this.addHorario();
      }
    }

    this.form.controls.frecuenciaSemanal.updateValueAndValidity();
    this.horariosArray.updateValueAndValidity();
    this.revalidarProgramacion();
  }

  protected onTipoDuracionChange(): void {
    const tipoDuracion = this.form.controls.tipoDuracion.value;
    if (tipoDuracion === 'finita') {
      this.form.controls.fechaFin.addValidators([Validators.required]);
    } else {
      this.form.controls.fechaFin.clearValidators();
      this.form.controls.fechaFin.setValue('');
    }
    this.form.controls.fechaFin.updateValueAndValidity();
    this.revalidarProgramacion();
  }

  protected addHorario(): void {
    this.horariosArray.push(this.fb.group({
      dia: ['lunes' as DiaSemana],
      horaInicio: ['08:00', Validators.required],
      horaFin: ['09:30', Validators.required],
    }));
    this.revalidarProgramacion();
  }

  protected removeHorario(index: number): void {
    this.horariosArray.removeAt(index);
    this.revalidarProgramacion();
  }

  protected guardar(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    const validacion = this.svc.validateProgramacionClase({
      ambienteId: val.ambienteId,
      horarios: val.horarios.map(h => ({
        dia: h['dia'] as DiaSemana,
        horaInicio: h['horaInicio'] as string,
        horaFin: h['horaFin'] as string,
      })),
      periodo: val.periodo,
      tipoDuracion: val.tipoDuracion,
      fechaInicio: val.fechaInicio,
      fechaFin: val.fechaFin || undefined,
    });

    this.validacionProgramacion.set(validacion);
    if (!validacion.permitido) {
      return;
    }

    const vacantesMaximas = val.ambienteId ? this.svc.getAforoRegularDisponibleAmbiente(val.ambienteId) : val.vacantes;
    const vacantesDefinitivas = Math.min(val.vacantes, vacantesMaximas);
    const sesionesProgramadas =
      val.tipoDuracion === 'finita'
        ? this.svc.generarReplicaSemanal(
            val.horarios.map(h => ({
              dia: h['dia'] as DiaSemana,
              horaInicio: h['horaInicio'] as string,
              horaFin: h['horaFin'] as string,
            })),
            val.fechaInicio,
            val.fechaFin || undefined
          )
        : [];

    this.svc.createClase({
      ...val,
      nivelId: val.nivelId || undefined,
      frecuenciaSemanal: val.tipoHorario === 'abierto' ? val.frecuenciaSemanal : undefined,
      fechaFin: val.tipoDuracion === 'finita' ? val.fechaFin : undefined,
      sesionesProgramadas,
      vacantes: vacantesDefinitivas,
      matriculados: 0,
      horarios: val.horarios.map(h => ({
        dia: h['dia'] as DiaSemana,
        horaInicio: h['horaInicio'] as string,
        horaFin: h['horaFin'] as string,
      })),
    });
    const cursoId = val.cursoId;
    this.router.navigate(['/academia/cursos', cursoId]);
  }

  protected puedeGuardarProgramacion(): boolean {
    const validacion = this.validacionProgramacion();
    return validacion ? validacion.permitido : true;
  }

  private revalidarProgramacion(): void {
    const val = this.form.getRawValue();
    if (!val.ambienteId || !val.periodo || val.horarios.length === 0) {
      this.validacionProgramacion.set(null);
      return;
    }

    this.validacionProgramacion.set(this.svc.validateProgramacionClase({
      ambienteId: val.ambienteId,
      horarios: val.horarios.map(h => ({
        dia: h['dia'] as DiaSemana,
        horaInicio: h['horaInicio'] as string,
        horaFin: h['horaFin'] as string,
      })),
      periodo: val.periodo,
      tipoDuracion: val.tipoDuracion,
      fechaInicio: val.fechaInicio,
      fechaFin: val.fechaFin || undefined,
    }));
  }

  protected cancelar(): void {
    const cursoId = this.form.value.cursoId;
    if (cursoId) {
      this.router.navigate(['/academia/cursos', cursoId]);
    } else {
      this.router.navigate(['/academia/cursos']);
    }
  }
}
