import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AcademiaService } from '../../core/services/academia.service';
import { TIPO_RUBRO_LABELS, TipoRubro } from '../../core/models/academia.model';

@Component({
  selector: 'app-estructura-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <a routerLink="/academia/cursos" class="text-indigo-600 hover:text-indigo-800 text-sm">&larr; Volver al árbol</a>
          <h2 class="text-2xl font-bold text-slate-900 mt-1">Configurar Estructura Académica</h2>
          <p class="text-slate-500 mt-1">Cree rubros, categorías y subcategorías para organizar disciplinas y cursos.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section class="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">RF-01 · Crear Rubros Académicos</h3>
            <p class="text-sm text-slate-500 mt-1">Grandes líneas como deportes, cultura, música o tecnología.</p>
          </div>

          <form [formGroup]="rubroForm" (ngSubmit)="guardarRubro()" class="space-y-4">
            <div>
              <label for="rubroNombre" class="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input id="rubroNombre" formControlName="nombre" type="text"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label for="rubroTipo" class="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select id="rubroTipo" formControlName="tipo"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500">
                @for (tipo of tiposRubro; track tipo.key) {
                  <option [value]="tipo.key">{{ tipo.label }}</option>
                }
              </select>
            </div>

            <div>
              <label for="rubroDescripcion" class="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
              <textarea id="rubroDescripcion" formControlName="descripcion" rows="3"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"></textarea>
            </div>

            <button type="submit" [disabled]="rubroForm.invalid"
              class="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
              Crear rubro
            </button>
          </form>

          <div class="border-t border-slate-100 pt-4 space-y-2">
            @for (rubro of rubros(); track rubro.id) {
              <div class="rounded-lg border border-slate-200 px-3 py-2">
                <p class="font-medium text-slate-800">{{ rubro.nombre }}</p>
                <p class="text-xs text-slate-500">{{ tipoRubroLabel(rubro.tipo) }}</p>
              </div>
            }
          </div>
        </section>

        <section class="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">RF-02 · Categorías</h3>
            <p class="text-sm text-slate-500 mt-1">Agrupe disciplinas por tipo dentro de cada rubro.</p>
          </div>

          <form [formGroup]="categoriaForm" (ngSubmit)="guardarCategoria()" class="space-y-4">
            <div>
              <label for="categoriaRubro" class="block text-sm font-medium text-slate-700 mb-1">Rubro</label>
              <select id="categoriaRubro" formControlName="rubroId"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500">
                <option value="">Seleccionar rubro</option>
                @for (rubro of rubros(); track rubro.id) {
                  <option [value]="rubro.id">{{ rubro.nombre }}</option>
                }
              </select>
            </div>

            <div>
              <label for="categoriaNombre" class="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input id="categoriaNombre" formControlName="nombre" type="text"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label for="categoriaDescripcion" class="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
              <textarea id="categoriaDescripcion" formControlName="descripcion" rows="3"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"></textarea>
            </div>

            <button type="submit" [disabled]="categoriaForm.invalid"
              class="w-full rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
              Crear categoría
            </button>
          </form>

          <div class="border-t border-slate-100 pt-4 space-y-2">
            @for (categoria of categorias(); track categoria.id) {
              <div class="rounded-lg border border-slate-200 px-3 py-2">
                <p class="font-medium text-slate-800">{{ categoria.nombre }}</p>
                <p class="text-xs text-slate-500">{{ rubroNombre(categoria.rubroId) }}</p>
              </div>
            }
          </div>
        </section>

        <section class="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">RF-02 · Subcategorías</h3>
            <p class="text-sm text-slate-500 mt-1">Detalle interno para segmentar disciplinas o variantes.</p>
          </div>

          <form [formGroup]="subcategoriaForm" (ngSubmit)="guardarSubcategoria()" class="space-y-4">
            <div>
              <label for="subcategoriaCategoria" class="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
              <select id="subcategoriaCategoria" formControlName="categoriaId"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500">
                <option value="">Seleccionar categoría</option>
                @for (categoria of categorias(); track categoria.id) {
                  <option [value]="categoria.id">{{ categoria.nombre }}</option>
                }
              </select>
            </div>

            <div>
              <label for="subcategoriaNombre" class="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input id="subcategoriaNombre" formControlName="nombre" type="text"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label for="subcategoriaDescripcion" class="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
              <textarea id="subcategoriaDescripcion" formControlName="descripcion" rows="3"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"></textarea>
            </div>

            <button type="submit" [disabled]="subcategoriaForm.invalid"
              class="w-full rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
              Crear subcategoría
            </button>
          </form>

          <div class="border-t border-slate-100 pt-4 space-y-2">
            @for (subcategoria of subcategorias(); track subcategoria.id) {
              <div class="rounded-lg border border-slate-200 px-3 py-2">
                <p class="font-medium text-slate-800">{{ subcategoria.nombre }}</p>
                <p class="text-xs text-slate-500">{{ categoriaNombre(subcategoria.categoriaId) }}</p>
              </div>
            }
          </div>
        </section>
      </div>
    </div>
  `,
})
export class EstructuraFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly academiaService = inject(AcademiaService);

  protected readonly rubros = this.academiaService.rubros;
  protected readonly categorias = computed(() =>
    this.academiaService
      .categorias()
      .slice()
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  );
  protected readonly subcategorias = computed(() =>
    this.academiaService
      .subcategorias()
      .slice()
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  );
  protected readonly tiposRubro = Object.entries(TIPO_RUBRO_LABELS).map(([key, label]) => ({
    key: key as TipoRubro,
    label,
  }));

  readonly rubroForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    tipo: ['deportivo' as TipoRubro, Validators.required],
    descripcion: [''],
  });

  readonly categoriaForm = this.fb.nonNullable.group({
    rubroId: ['', Validators.required],
    nombre: ['', Validators.required],
    descripcion: [''],
  });

  readonly subcategoriaForm = this.fb.nonNullable.group({
    categoriaId: ['', Validators.required],
    nombre: ['', Validators.required],
    descripcion: [''],
  });

  protected guardarRubro(): void {
    if (this.rubroForm.invalid) {
      return;
    }

    const value = this.rubroForm.getRawValue();
    this.academiaService.createRubro({
      ...value,
      descripcion: value.descripcion || undefined,
      orden: this.rubros().length + 1,
    });
    this.rubroForm.reset({ nombre: '', tipo: 'deportivo', descripcion: '' });
  }

  protected guardarCategoria(): void {
    if (this.categoriaForm.invalid) {
      return;
    }

    const value = this.categoriaForm.getRawValue();
    const orden = this.academiaService.getCategoriasByRubro(value.rubroId).length + 1;
    this.academiaService.createCategoria({
      ...value,
      descripcion: value.descripcion || undefined,
      orden,
    });
    this.categoriaForm.reset({ rubroId: '', nombre: '', descripcion: '' });
  }

  protected guardarSubcategoria(): void {
    if (this.subcategoriaForm.invalid) {
      return;
    }

    const value = this.subcategoriaForm.getRawValue();
    const orden = this.academiaService.getSubcategoriasByCategoria(value.categoriaId).length + 1;
    this.academiaService.createSubcategoria({
      ...value,
      descripcion: value.descripcion || undefined,
      orden,
    });
    this.subcategoriaForm.reset({ categoriaId: '', nombre: '', descripcion: '' });
  }

  protected tipoRubroLabel(tipo: TipoRubro): string {
    return TIPO_RUBRO_LABELS[tipo];
  }

  protected rubroNombre(rubroId: string): string {
    return this.academiaService.getRubroById(rubroId)?.nombre ?? rubroId;
  }

  protected categoriaNombre(categoriaId: string): string {
    return this.academiaService.getCategoriaById(categoriaId)?.nombre ?? categoriaId;
  }
}
