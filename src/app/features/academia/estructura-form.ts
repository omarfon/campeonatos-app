import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AcademiaService } from '../../core/services/academia.service';
import { TIPO_RUBRO_LABELS, TipoRubro } from '../../core/models/academia.model';
import { confirmDialog } from '../../shared/confirm-dialog';

@Component({
  selector: 'app-estructura-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <a routerLink="/academia/cursos" class="text-green-600 hover:text-green-800 text-sm">&larr; Volver al árbol</a>
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
                class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500" />
            </div>

            <div>
              <label for="rubroTipo" class="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select id="rubroTipo" formControlName="tipo"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500">
                @for (tipo of tiposRubro; track tipo.key) {
                  <option [value]="tipo.key">{{ tipo.label }}</option>
                }
              </select>
            </div>

            <div>
              <label for="rubroDescripcion" class="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
              <textarea id="rubroDescripcion" formControlName="descripcion" rows="3"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500"></textarea>
            </div>

            <button type="submit" [disabled]="rubroForm.invalid"
              class="w-full rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50">
              Crear rubro
            </button>
          </form>

          <div class="border-t border-slate-100 pt-4 space-y-2">
            @for (rubro of rubros(); track rubro.id) {
              <div class="rounded-lg border border-slate-200 px-3 py-2">
                @if (editandoRubroId() === rubro.id) {
                  <form [formGroup]="editRubroForm" (ngSubmit)="confirmarEditRubro()" class="space-y-2">
                    <input formControlName="nombre" type="text" class="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500" />
                    <select formControlName="tipo" class="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500">
                      @for (tipo of tiposRubro; track tipo.key) {
                        <option [value]="tipo.key">{{ tipo.label }}</option>
                      }
                    </select>
                    <textarea formControlName="descripcion" rows="2" class="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"></textarea>
                    <div class="flex gap-2">
                      <button type="submit" [disabled]="editRubroForm.invalid" class="rounded-lg bg-green-600 px-3 py-1 text-xs text-white hover:bg-brand-600 disabled:opacity-50">Guardar</button>
                      <button type="button" (click)="editandoRubroId.set(null)" class="rounded-lg border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50">Cancelar</button>
                    </div>
                  </form>
                } @else {
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-slate-800">{{ rubro.nombre }}</p>
                      <p class="text-xs text-slate-500">{{ tipoRubroLabel(rubro.tipo) }}</p>
                    </div>
                    <div class="flex gap-1">
                      <button (click)="iniciarEditRubro(rubro)" class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-green-600 transition-colors" aria-label="Editar rubro">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"/></svg>
                      </button>
                      <button (click)="eliminarRubro(rubro.id)" class="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors" aria-label="Eliminar rubro">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
                      </button>
                    </div>
                  </div>
                }
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
                class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500">
                <option value="">Seleccionar rubro</option>
                @for (rubro of rubros(); track rubro.id) {
                  <option [value]="rubro.id">{{ rubro.nombre }}</option>
                }
              </select>
            </div>

            <div>
              <label for="categoriaNombre" class="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input id="categoriaNombre" formControlName="nombre" type="text"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500" />
            </div>

            <div>
              <label for="categoriaDescripcion" class="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
              <textarea id="categoriaDescripcion" formControlName="descripcion" rows="3"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500"></textarea>
            </div>

            <button type="submit" [disabled]="categoriaForm.invalid"
              class="w-full rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
              Crear categoría
            </button>
          </form>

          <div class="border-t border-slate-100 pt-4 space-y-2">
            @for (categoria of categorias(); track categoria.id) {
              <div class="rounded-lg border border-slate-200 px-3 py-2">
                @if (editandoCategoriaId() === categoria.id) {
                  <form [formGroup]="editCategoriaForm" (ngSubmit)="confirmarEditCategoria()" class="space-y-2">
                    <select formControlName="rubroId" class="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500">
                      @for (rubro of rubros(); track rubro.id) {
                        <option [value]="rubro.id">{{ rubro.nombre }}</option>
                      }
                    </select>
                    <input formControlName="nombre" type="text" class="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500" />
                    <textarea formControlName="descripcion" rows="2" class="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"></textarea>
                    <div class="flex gap-2">
                      <button type="submit" [disabled]="editCategoriaForm.invalid" class="rounded-lg bg-slate-900 px-3 py-1 text-xs text-white hover:bg-slate-800 disabled:opacity-50">Guardar</button>
                      <button type="button" (click)="editandoCategoriaId.set(null)" class="rounded-lg border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50">Cancelar</button>
                    </div>
                  </form>
                } @else {
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-slate-800">{{ categoria.nombre }}</p>
                      <p class="text-xs text-slate-500">{{ rubroNombre(categoria.rubroId) }}</p>
                    </div>
                    <div class="flex gap-1">
                      <button (click)="iniciarEditCategoria(categoria)" class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-green-600 transition-colors" aria-label="Editar categoría">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"/></svg>
                      </button>
                      <button (click)="eliminarCategoria(categoria.id)" class="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors" aria-label="Eliminar categoría">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
                      </button>
                    </div>
                  </div>
                }
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
                class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500">
                <option value="">Seleccionar categoría</option>
                @for (categoria of categorias(); track categoria.id) {
                  <option [value]="categoria.id">{{ categoria.nombre }}</option>
                }
              </select>
            </div>

            <div>
              <label for="subcategoriaNombre" class="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input id="subcategoriaNombre" formControlName="nombre" type="text"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500" />
            </div>

            <div>
              <label for="subcategoriaDescripcion" class="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
              <textarea id="subcategoriaDescripcion" formControlName="descripcion" rows="3"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500"></textarea>
            </div>

            <button type="submit" [disabled]="subcategoriaForm.invalid"
              class="w-full rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
              Crear subcategoría
            </button>
          </form>

          <div class="border-t border-slate-100 pt-4 space-y-2">
            @for (subcategoria of subcategorias(); track subcategoria.id) {
              <div class="rounded-lg border border-slate-200 px-3 py-2">
                @if (editandoSubcategoriaId() === subcategoria.id) {
                  <form [formGroup]="editSubcategoriaForm" (ngSubmit)="confirmarEditSubcategoria()" class="space-y-2">
                    <select formControlName="categoriaId" class="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500">
                      @for (cat of categorias(); track cat.id) {
                        <option [value]="cat.id">{{ cat.nombre }}</option>
                      }
                    </select>
                    <input formControlName="nombre" type="text" class="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500" />
                    <textarea formControlName="descripcion" rows="2" class="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"></textarea>
                    <div class="flex gap-2">
                      <button type="submit" [disabled]="editSubcategoriaForm.invalid" class="rounded-lg bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-700 disabled:opacity-50">Guardar</button>
                      <button type="button" (click)="editandoSubcategoriaId.set(null)" class="rounded-lg border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50">Cancelar</button>
                    </div>
                  </form>
                } @else {
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-slate-800">{{ subcategoria.nombre }}</p>
                      <p class="text-xs text-slate-500">{{ categoriaNombre(subcategoria.categoriaId) }}</p>
                    </div>
                    <div class="flex gap-1">
                      <button (click)="iniciarEditSubcategoria(subcategoria)" class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-green-600 transition-colors" aria-label="Editar subcategoría">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"/></svg>
                      </button>
                      <button (click)="eliminarSubcategoria(subcategoria.id)" class="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors" aria-label="Eliminar subcategoría">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
                      </button>
                    </div>
                  </div>
                }
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

  // ── Edición inline de Rubros ──
  protected readonly editandoRubroId = signal<string | null>(null);
  readonly editRubroForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    tipo: ['deportivo' as TipoRubro, Validators.required],
    descripcion: [''],
  });

  protected iniciarEditRubro(rubro: { id: string; nombre: string; tipo: TipoRubro; descripcion?: string }): void {
    this.editandoRubroId.set(rubro.id);
    this.editRubroForm.setValue({ nombre: rubro.nombre, tipo: rubro.tipo, descripcion: rubro.descripcion ?? '' });
  }

  protected confirmarEditRubro(): void {
    const id = this.editandoRubroId();
    if (!id || this.editRubroForm.invalid) return;
    const v = this.editRubroForm.getRawValue();
    this.academiaService.updateRubro(id, { nombre: v.nombre, tipo: v.tipo, descripcion: v.descripcion || undefined });
    this.editandoRubroId.set(null);
  }

  protected async eliminarRubro(id: string): Promise<void> {
    const ok = await confirmDialog({ title: 'Eliminar rubro', text: '¿Eliminar este rubro y sus categorías asociadas? Esta acción no se puede deshacer.' });
    if (ok) {
      this.academiaService.deleteRubro(id);
    }
  }

  // ── Edición inline de Categorías ──
  protected readonly editandoCategoriaId = signal<string | null>(null);
  readonly editCategoriaForm = this.fb.nonNullable.group({
    rubroId: ['', Validators.required],
    nombre: ['', Validators.required],
    descripcion: [''],
  });

  protected iniciarEditCategoria(cat: { id: string; rubroId: string; nombre: string; descripcion?: string }): void {
    this.editandoCategoriaId.set(cat.id);
    this.editCategoriaForm.setValue({ rubroId: cat.rubroId, nombre: cat.nombre, descripcion: cat.descripcion ?? '' });
  }

  protected confirmarEditCategoria(): void {
    const id = this.editandoCategoriaId();
    if (!id || this.editCategoriaForm.invalid) return;
    const v = this.editCategoriaForm.getRawValue();
    this.academiaService.updateCategoria(id, { rubroId: v.rubroId, nombre: v.nombre, descripcion: v.descripcion || undefined });
    this.editandoCategoriaId.set(null);
  }

  protected async eliminarCategoria(id: string): Promise<void> {
    const ok = await confirmDialog({ title: 'Eliminar categoría', text: '¿Eliminar esta categoría y sus subcategorías asociadas? Esta acción no se puede deshacer.' });
    if (ok) {
      this.academiaService.deleteCategoria(id);
    }
  }

  // ── Edición inline de Subcategorías ──
  protected readonly editandoSubcategoriaId = signal<string | null>(null);
  readonly editSubcategoriaForm = this.fb.nonNullable.group({
    categoriaId: ['', Validators.required],
    nombre: ['', Validators.required],
    descripcion: [''],
  });

  protected iniciarEditSubcategoria(sub: { id: string; categoriaId: string; nombre: string; descripcion?: string }): void {
    this.editandoSubcategoriaId.set(sub.id);
    this.editSubcategoriaForm.setValue({ categoriaId: sub.categoriaId, nombre: sub.nombre, descripcion: sub.descripcion ?? '' });
  }

  protected confirmarEditSubcategoria(): void {
    const id = this.editandoSubcategoriaId();
    if (!id || this.editSubcategoriaForm.invalid) return;
    const v = this.editSubcategoriaForm.getRawValue();
    this.academiaService.updateSubcategoria(id, { categoriaId: v.categoriaId, nombre: v.nombre, descripcion: v.descripcion || undefined });
    this.editandoSubcategoriaId.set(null);
  }

  protected async eliminarSubcategoria(id: string): Promise<void> {
    const ok = await confirmDialog({ title: 'Eliminar subcategoría', text: '¿Eliminar esta subcategoría? Esta acción no se puede deshacer.' });
    if (ok) {
      this.academiaService.deleteSubcategoria(id);
    }
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
