import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { AcademiaService } from '../../core/services/academia.service';
import { TipoNomenclaturaNivel, EstadoCurso, TIPO_NOMENCLATURA_LABELS, TIPO_RUBRO_LABELS } from '../../core/models/academia.model';

@Component({
  selector: 'app-curso-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-3xl mx-auto">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-slate-900">{{ isEdit() ? 'Editar' : 'Nuevo' }} Curso</h2>
        <p class="text-slate-500 mt-1">Complete la ficha del curso con su configuración académica</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="guardar()" class="space-y-6">
        <!-- Info básica -->
        <div class="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 class="text-lg font-semibold text-slate-900">Información Básica</h3>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label for="codigo" class="block text-sm font-medium text-slate-700 mb-1">Código</label>
              <input id="codigo" formControlName="codigo" type="text" placeholder="DEP-001"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div class="sm:col-span-2">
              <label for="nombre" class="block text-sm font-medium text-slate-700 mb-1">Nombre del Curso</label>
              <input id="nombre" formControlName="nombre" type="text"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>

          <div>
            <label for="descripcion" class="block text-sm font-medium text-slate-700 mb-1">Descripción Comercial</label>
            <textarea id="descripcion" formControlName="descripcion" rows="3"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
          </div>

          <div>
            <label for="objetivos" class="block text-sm font-medium text-slate-700 mb-1">Objetivos Formativos</label>
            <textarea id="objetivos" formControlName="objetivos" rows="3"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
          </div>

          <div>
            <label for="publicoObjetivo" class="block text-sm font-medium text-slate-700 mb-1">Público Objetivo</label>
            <input id="publicoObjetivo" formControlName="publicoObjetivo" type="text"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
        </div>

        <!-- Clasificación -->
        <div class="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 class="text-lg font-semibold text-slate-900">Clasificación en el Árbol</h3>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label for="rubroId" class="block text-sm font-medium text-slate-700 mb-1">Rubro</label>
              <select id="rubroId" formControlName="rubroId"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                (change)="onRubroChange()">
                <option value="">Seleccionar rubro</option>
                @for (rubro of rubros(); track rubro.id) {
                  <option [value]="rubro.id">{{ rubro.nombre }}</option>
                }
              </select>
            </div>
            <div>
              <label for="categoriaId" class="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
              <select id="categoriaId" formControlName="categoriaId"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                (change)="onCategoriaChange()">
                <option value="">Seleccionar categoría</option>
                @for (cat of filteredCategorias(); track cat.id) {
                  <option [value]="cat.id">{{ cat.nombre }}</option>
                }
              </select>
            </div>
            <div>
              <label for="subcategoriaId" class="block text-sm font-medium text-slate-700 mb-1">Subcategoría <span class="text-slate-400">(opcional)</span></label>
              <select id="subcategoriaId" formControlName="subcategoriaId"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Sin subcategoría</option>
                @for (sub of filteredSubcategorias(); track sub.id) {
                  <option [value]="sub.id">{{ sub.nombre }}</option>
                }
              </select>
            </div>
          </div>
        </div>

        <!-- Requisitos y niveles -->
        <div class="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 class="text-lg font-semibold text-slate-900">Requisitos y Configuración</h3>

          <div class="flex flex-wrap gap-6">
            <label class="inline-flex items-center gap-2">
              <input type="checkbox" formControlName="requiereCertificadoMedico" class="rounded text-indigo-600 focus:ring-indigo-500" />
              <span class="text-sm text-slate-700">Requiere certificado médico</span>
            </label>
            <label class="inline-flex items-center gap-2">
              <input type="checkbox" formControlName="requiereDeclaracionJurada" class="rounded text-indigo-600 focus:ring-indigo-500" />
              <span class="text-sm text-slate-700">Requiere declaración jurada</span>
            </label>
            <label class="inline-flex items-center gap-2">
              <input type="checkbox" formControlName="manejaLevels" class="rounded text-indigo-600 focus:ring-indigo-500" />
              <span class="text-sm text-slate-700">Maneja niveles de habilidad</span>
            </label>
          </div>

          @if (form.value.requiereCertificadoMedico) {
            <div class="max-w-xs">
              <label for="edadCertificadoMedico" class="block text-sm font-medium text-slate-700 mb-1">Edad mínima para el certificado</label>
              <input id="edadCertificadoMedico" formControlName="edadCertificadoMedico" type="number" min="0"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          }

          @if (form.value.manejaLevels) {
            <div class="max-w-sm">
              <label for="tipoNomenclaturaNivel" class="block text-sm font-medium text-slate-700 mb-1">Tipo de Nomenclatura</label>
              <select id="tipoNomenclaturaNivel" formControlName="tipoNomenclaturaNivel"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                @for (nom of nomenclaturas; track nom.key) {
                  <option [value]="nom.key">{{ nom.label }}</option>
                }
              </select>
            </div>
          }

          <div class="max-w-xs">
            <label for="estado" class="block text-sm font-medium text-slate-700 mb-1">Estado</label>
            <select id="estado" formControlName="estado"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        <!-- Categorías por Edad -->
        <div class="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-slate-900">Categorías por Edad</h3>
            <button type="button" (click)="addCategoriaEdad()" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">+ Agregar</button>
          </div>
          <div formArrayName="categoriasEdad" class="space-y-3">
            @for (ce of categoriasEdadArray.controls; track $index) {
              <div [formGroupName]="$index" class="border rounded-lg p-3 bg-slate-50">
                <div class="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                  <div class="sm:col-span-2">
                    <label class="block text-xs text-slate-500 mb-1">Nombre</label>
                    <input formControlName="nombre" placeholder="Ej: Niños"
                      class="w-full rounded border-slate-300 border px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label class="block text-xs text-slate-500 mb-1">Edad mín.</label>
                    <input formControlName="edadMinima" type="number" min="0"
                      class="w-full rounded border-slate-300 border px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label class="block text-xs text-slate-500 mb-1">Edad máx.</label>
                    <input formControlName="edadMaxima" type="number" min="0"
                      class="w-full rounded border-slate-300 border px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div class="flex items-center gap-3">
                    <label class="inline-flex items-center gap-1 text-xs text-slate-600">
                      <input type="checkbox" formControlName="esUnica" class="rounded text-indigo-600 focus:ring-indigo-500" />
                      Única
                    </label>
                    <button type="button" (click)="removeCategoriaEdad($index)"
                      class="text-red-500 hover:text-red-700 text-sm px-2" aria-label="Eliminar categoría de edad">✕</button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Acciones -->
        <div class="flex gap-3">
          <button type="submit" [disabled]="form.invalid"
            class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {{ isEdit() ? 'Actualizar' : 'Crear' }} Curso
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
export class CursoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly svc = inject(AcademiaService);

  protected readonly isEdit = signal(false);
  private editId = '';

  protected readonly rubros = this.svc.rubros;

  protected readonly nomenclaturas = Object.entries(TIPO_NOMENCLATURA_LABELS).map(([key, label]) => ({ key, label }));

  readonly form = this.fb.nonNullable.group({
    codigo: ['', Validators.required],
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    objetivos: ['', Validators.required],
    rubroId: ['', Validators.required],
    categoriaId: ['', Validators.required],
    subcategoriaId: [''],
    publicoObjetivo: [''],
    requiereCertificadoMedico: [false],
    edadCertificadoMedico: [45],
    requiereDeclaracionJurada: [false],
    manejaLevels: [true],
    tipoNomenclaturaNivel: ['general' as TipoNomenclaturaNivel],
    estado: ['activo' as EstadoCurso],
    categoriasEdad: this.fb.array<FormGroup>([]),
  });

  get categoriasEdadArray(): FormArray<FormGroup> {
    return this.form.controls.categoriasEdad;
  }

  protected filteredCategorias = signal<{ id: string; nombre: string }[]>([]);
  protected filteredSubcategorias = signal<{ id: string; nombre: string }[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const curso = this.svc.getCursoById(id);
      if (curso) {
        this.isEdit.set(true);
        this.editId = id;
        this.form.patchValue(curso);
        this.updateFilteredCategorias();
        this.updateFilteredSubcategorias();

        const categoriasEdad = this.svc.getCategoriasEdadByCurso(id);
        categoriasEdad.forEach(ce => {
          this.categoriasEdadArray.push(this.fb.group({
            nombre: [ce.nombre, Validators.required],
            edadMinima: [ce.edadMinima, [Validators.required, Validators.min(0)]],
            edadMaxima: [ce.edadMaxima, [Validators.required, Validators.min(0)]],
            esUnica: [ce.esUnica],
          }));
        });
      }
    } else {
      this.updateFilteredCategorias();
    }
  }

  protected onRubroChange(): void {
    this.form.controls.categoriaId.setValue('');
    this.form.controls.subcategoriaId.setValue('');
    this.updateFilteredCategorias();
    this.filteredSubcategorias.set([]);
  }

  protected onCategoriaChange(): void {
    this.form.controls.subcategoriaId.setValue('');
    this.updateFilteredSubcategorias();
  }

  private updateFilteredCategorias(): void {
    const rubroId = this.form.value.rubroId;
    this.filteredCategorias.set(rubroId ? this.svc.getCategoriasByRubro(rubroId) : []);
  }

  private updateFilteredSubcategorias(): void {
    const catId = this.form.value.categoriaId;
    this.filteredSubcategorias.set(catId ? this.svc.getSubcategoriasByCategoria(catId) : []);
  }

  protected addCategoriaEdad(): void {
    this.categoriasEdadArray.push(this.fb.group({
      nombre: ['', Validators.required],
      edadMinima: [0, [Validators.required, Validators.min(0)]],
      edadMaxima: [0, [Validators.required, Validators.min(0)]],
      esUnica: [false],
    }));
  }

  protected removeCategoriaEdad(index: number): void {
    this.categoriasEdadArray.removeAt(index);
  }

  protected guardar(): void {
    if (this.form.invalid) return;
    const { categoriasEdad, subcategoriaId, ...val } = this.form.getRawValue();
    const cursoData = {
      ...val,
      subcategoriaId: subcategoriaId || undefined,
    };

    if (this.isEdit()) {
      this.svc.updateCurso(this.editId, cursoData);
    } else {
      this.svc.createCurso(cursoData);
    }

    // Handle categorias de edad
    if (this.isEdit()) {
      const existing = this.svc.getCategoriasEdadByCurso(this.editId);
      existing.forEach(ce => this.svc.removeCategoriaEdad(ce.id));
    }
    const cursoId = this.isEdit() ? this.editId : this.svc.cursos()[this.svc.cursos().length - 1]?.id;
    if (cursoId) {
      categoriasEdad.forEach(ce => {
        this.svc.addCategoriaEdad({
          cursoId,
          nombre: ce['nombre'],
          edadMinima: ce['edadMinima'],
          edadMaxima: ce['edadMaxima'],
          esUnica: ce['esUnica'],
        });
      });
    }

    this.router.navigate(['/academia/cursos']);
  }

  protected cancelar(): void {
    this.router.navigate(['/academia/cursos']);
  }
}
