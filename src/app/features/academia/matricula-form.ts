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
          <a routerLink="/academia/cursos" class="text-green-600 hover:text-green-800 text-sm">&larr; Volver al árbol</a>
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
                  (change)="onSocioChange()"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500">
                  <option value="">Seleccionar socio</option>
                  @for (socio of sociosActivos(); track socio.id) {
                    <option [value]="socio.id">{{ socio.apellido }}, {{ socio.nombre }}</option>
                  }
                </select>
                @if (edadAlumno() !== null) {
                  <p class="mt-1.5 text-sm text-slate-600">
                    Edad: <span class="font-semibold text-slate-800">{{ edadAlumno() }} años</span>
                  </p>
                }
              </div>

              <div class="relative">
                <label for="claseIdInput" class="block text-sm font-medium text-slate-700 mb-1">Clase consolidada</label>
                <input
                  id="claseIdInput"
                  type="text"
                  autocomplete="off"
                  [value]="claseInputValue"
                  (input)="onClaseInput($event)"
                  (blur)="onClaseBlur()"
                  (focus)="claseInputFocused = true"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500"
                  aria-autocomplete="list"
                  aria-controls="clase-suggestions"
                  aria-expanded="{{claseInputFocused && claseSuggestions.length > 0}}"
                  aria-activedescendant="clase-suggestion-{{claseActiveIndex}}"
                  role="combobox"
                />
                @if (claseInputFocused && claseSuggestions.length > 0) {
                  <ul
                    id="clase-suggestions"
                    class="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-56 overflow-auto"
                    role="listbox"
                  >
                    @for (sug of claseSuggestions; track sug.id) {
                      <li
                        id="clase-suggestion-{{claseSuggestions.indexOf(sug)}}"
                        role="option"
                        [attr.aria-selected]="claseSuggestions.indexOf(sug) === claseActiveIndex"
                        [class]="'px-3 py-2 cursor-pointer ' + (claseSuggestions.indexOf(sug) === claseActiveIndex ? 'bg-green-100 text-green-900' : 'hover:bg-slate-100')"
                        (mousedown)="onClaseSelect(sug)"
                      >
                        {{ etiquetaClase(sug.id) }}
                      </li>
                    }
                  </ul>
                }
                <input type="hidden" formControlName="claseId" />
                @if (form.controls.claseId.invalid && (form.controls.claseId.touched || form.controls.claseId.dirty)) {
                  <p class="text-xs text-red-600 mt-1">Seleccione una clase válida.</p>
                }
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
                class="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50">
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
            <dl class="space-y-3 text-sm">
              <div class="flex justify-between gap-3">
                <dt class="text-slate-500">Edad del socio</dt>
                <dd class="font-medium text-slate-800">{{ edadAlumno() !== null ? edadAlumno() + ' años' : 'No disponible' }}</dd>
              </div>
              @if (resultadoValidacion(); as resultado) {
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
              } @else {
                <div class="flex justify-between gap-3">
                  <dt class="text-slate-500">Categoría por edad</dt>
                  <dd class="font-medium text-slate-800">—</dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-slate-500">Nivel requerido</dt>
                  <dd class="font-medium text-slate-800">Sin nivel</dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-slate-500">Nivel acreditado</dt>
                  <dd class="font-medium text-slate-800">No registrado</dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-slate-500">Vacantes disponibles</dt>
                  <dd class="font-medium text-slate-800">—</dd>
                </div>
              }
            </dl>
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
    // Autocomplete para clase
    claseInputValue = '';
    claseInputFocused = false;
    claseSuggestions: Array<{id: string}> = [];
    claseActiveIndex = 0;

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly socioService = inject(SocioService);
  private readonly academiaService = inject(AcademiaService);
  private readonly matriculaService = inject(AcademiaMatriculaService);

  private readonly cursoFiltroId = this.route.snapshot.queryParamMap.get('cursoId');

  protected readonly sociosActivos = computed(() =>
    this.socioService.items().filter((socio) => socio.estado === 'activo')
  );
  protected readonly socioSeleccionado = signal<string>('');
  protected readonly edadAlumno = computed(() => {
    const socioId = this.socioSeleccionado();
    if (!socioId) return null;
    const socio = this.socioService.items().find((s) => s.id === socioId);
    if (!socio?.fechaNacimiento) return null;
    const hoy = new Date();
    const nacimiento = new Date(socio.fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesActual = hoy.getMonth() - nacimiento.getMonth();
    if (mesActual < 0 || (mesActual === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  });
  protected readonly clasesDisponibles = computed(() => {
    const clases = this.academiaService.clases();
    return this.cursoFiltroId ? clases.filter((clase) => clase.cursoId === this.cursoFiltroId) : clases;
  });

  // Filtra clases según el input
  private filtrarClases(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return this.clasesDisponibles();
    return this.clasesDisponibles().filter(clase =>
      this.etiquetaClase(clase.id).toLowerCase().includes(q)
    );
  }

  onClaseInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.claseInputValue = value;
    this.claseSuggestions = this.filtrarClases(value);
    this.claseActiveIndex = 0;
    // Si el input coincide exactamente con una clase, selecciona
    const match = this.claseSuggestions.find(c => this.etiquetaClase(c.id).toLowerCase() === value.trim().toLowerCase());
    if (match) {
      this.form.controls.claseId.setValue(match.id);
      this.revalidar();
    } else {
      this.form.controls.claseId.setValue('');
      this.resultadoValidacion.set(null);
    }
  }

  onClaseSelect(clase: {id: string}) {
    this.claseInputValue = this.etiquetaClase(clase.id);
    this.form.controls.claseId.setValue(clase.id);
    this.revalidar();
    this.claseSuggestions = [];
    this.claseInputFocused = false;
  }

  onClaseBlur() {
    setTimeout(() => {
      this.claseInputFocused = false;
      // Si el valor no es válido, limpia
      const claseId = this.form.controls.claseId.value;
      if (!claseId || !this.clasesDisponibles().some(c => c.id === claseId)) {
        this.claseInputValue = '';
        this.form.controls.claseId.setValue('');
        this.resultadoValidacion.set(null);
      }
    }, 150);
  }

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
      const clase = this.academiaService.getClaseById(claseId);
      if (clase) {
        this.claseInputValue = this.etiquetaClase(claseId);
      }
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

  protected onSocioChange(): void {
    this.socioSeleccionado.set(this.form.getRawValue().socioId);
    this.revalidar();
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
    this.form.reset({ socioId: '', claseId: '' });
    this.socioSeleccionado.set('');
    this.resultadoValidacion.set(null);
    this.claseInputValue = '';
    this.claseSuggestions = [];
    this.claseActiveIndex = 0;
  }
}
