import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { AcademiaService } from '../../core/services/academia.service';
import { DiaSemana, DIA_SEMANA_LABELS } from '../../core/models/academia.model';

@Component({
  selector: 'app-clase-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-slate-900">Nueva Clase</h2>
        <p class="text-slate-500 mt-1">Configure la clase asignando curso, categoría, nivel, docente, ambiente y horarios</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="guardar()" class="space-y-6">
        <!-- Curso y clasificación -->
        <div class="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 class="text-lg font-semibold text-slate-900">Curso y Clasificación</h3>

          <div>
            <label for="cursoId" class="block text-sm font-medium text-slate-700 mb-1">Curso</label>
            <select id="cursoId" formControlName="cursoId"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Seleccionar categoría</option>
                @for (ce of filteredCategoriasEdad(); track ce.id) {
                  <option [value]="ce.id">{{ ce.nombre }} ({{ ce.edadMinima }}-{{ ce.edadMaxima }})</option>
                }
              </select>
            </div>
            <div>
              <label for="nivelId" class="block text-sm font-medium text-slate-700 mb-1">Nivel <span class="text-slate-400">(si aplica)</span></label>
              <select id="nivelId" formControlName="nivelId"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Sin nivel</option>
                @for (niv of filteredNiveles(); track niv.id) {
                  <option [value]="niv.id">{{ niv.nombre }}</option>
                }
              </select>
            </div>
          </div>
        </div>

        <!-- Docente y ambiente -->
        <div class="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 class="text-lg font-semibold text-slate-900">Docente y Ambiente</h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="docenteId" class="block text-sm font-medium text-slate-700 mb-1">Docente</label>
              <select id="docenteId" formControlName="docenteId"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Seleccionar docente</option>
                @for (doc of docentes(); track doc.id) {
                  <option [value]="doc.id">{{ doc.nombre }} {{ doc.apellido }}</option>
                }
              </select>
            </div>
            <div>
              <label for="ambienteId" class="block text-sm font-medium text-slate-700 mb-1">Ambiente</label>
              <select id="ambienteId" formControlName="ambienteId"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Seleccionar ambiente</option>
                @for (amb of ambientes(); track amb.id) {
                  <option [value]="amb.id">{{ amb.nombre }} (cap. {{ amb.capacidad }})</option>
                }
              </select>
            </div>
          </div>
        </div>

        <!-- Horarios -->
        <div class="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-slate-900">Horarios</h3>
            <button type="button" (click)="addHorario()" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">+ Agregar</button>
          </div>
          <div formArrayName="horarios" class="space-y-3">
            @for (h of horariosArray.controls; track $index) {
              <div [formGroupName]="$index" class="border rounded-lg p-3 bg-slate-50">
                <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                  <div>
                    <label class="block text-xs text-slate-500 mb-1">Día</label>
                    <select formControlName="dia"
                      class="w-full rounded border-slate-300 border px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500">
                      @for (d of dias; track d.key) {
                        <option [value]="d.key">{{ d.label }}</option>
                      }
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs text-slate-500 mb-1">Hora inicio</label>
                    <input formControlName="horaInicio" type="time"
                      class="w-full rounded border-slate-300 border px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label class="block text-xs text-slate-500 mb-1">Hora fin</label>
                    <input formControlName="horaFin" type="time"
                      class="w-full rounded border-slate-300 border px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div class="flex items-end">
                    <button type="button" (click)="removeHorario($index)"
                      class="text-red-500 hover:text-red-700 text-sm px-2 py-1.5" aria-label="Eliminar horario">✕</button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Vacantes y tarifas -->
        <div class="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 class="text-lg font-semibold text-slate-900">Vacantes y Tarifas</h3>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label for="vacantes" class="block text-sm font-medium text-slate-700 mb-1">Vacantes</label>
              <input id="vacantes" formControlName="vacantes" type="number" min="1"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label for="tarifaMensual" class="block text-sm font-medium text-slate-700 mb-1">Tarifa Mensual</label>
              <input id="tarifaMensual" formControlName="tarifaMensual" type="number" min="0"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label for="tarifaMatricula" class="block text-sm font-medium text-slate-700 mb-1">Tarifa Matrícula</label>
              <input id="tarifaMatricula" formControlName="tarifaMatricula" type="number" min="0"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="periodo" class="block text-sm font-medium text-slate-700 mb-1">Periodo</label>
              <input id="periodo" formControlName="periodo" type="text" placeholder="2026-I"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label for="estado" class="block text-sm font-medium text-slate-700 mb-1">Estado</label>
              <select id="estado" formControlName="estado"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="abierta">Abierta</option>
                <option value="cerrada">Cerrada</option>
                <option value="llena">Llena</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="flex gap-3">
          <button type="submit" [disabled]="form.invalid"
            class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Crear Clase
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

  protected readonly filteredCategoriasEdad = signal<{ id: string; nombre: string; edadMinima: number; edadMaxima: number }[]>([]);
  protected readonly filteredNiveles = signal<{ id: string; nombre: string }[]>([]);

  protected readonly dias = Object.entries(DIA_SEMANA_LABELS).map(([key, label]) => ({ key, label }));

  readonly form = this.fb.nonNullable.group({
    cursoId: ['', Validators.required],
    categoriaEdadId: ['', Validators.required],
    nivelId: [''],
    docenteId: ['', Validators.required],
    ambienteId: ['', Validators.required],
    horarios: this.fb.array<FormGroup>([], Validators.required),
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

  protected addHorario(): void {
    this.horariosArray.push(this.fb.group({
      dia: ['lunes' as DiaSemana],
      horaInicio: ['08:00', Validators.required],
      horaFin: ['09:30', Validators.required],
    }));
  }

  protected removeHorario(index: number): void {
    this.horariosArray.removeAt(index);
  }

  protected guardar(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    this.svc.createClase({
      ...val,
      nivelId: val.nivelId || undefined,
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

  protected cancelar(): void {
    const cursoId = this.form.value.cursoId;
    if (cursoId) {
      this.router.navigate(['/academia/cursos', cursoId]);
    } else {
      this.router.navigate(['/academia/cursos']);
    }
  }
}
