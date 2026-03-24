import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AcademiaService } from '../../core/services/academia.service';
import { TIPO_PROGRAMA_LABELS, TipoPrograma } from '../../core/models/academia.model';

@Component({
  selector: 'app-programa-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <div>
        <a routerLink="/academia/programas" class="text-green-600 hover:text-green-800 text-sm">&larr; Volver a programas</a>
        <h2 class="text-2xl font-bold text-slate-900 mt-1">Nuevo Programa Comercial</h2>
        <p class="text-slate-500 mt-1">Configure paquetes tipo vacacional, regular o intensivo y asocie cursos hijos.</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="guardar()" class="space-y-6">
        <section class="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 class="text-lg font-semibold text-slate-900">RF-08 · Datos del programa</h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label for="nombre" class="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input id="nombre" formControlName="nombre" type="text"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500" />
            </div>

            <div>
              <label for="tipo" class="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select id="tipo" formControlName="tipo"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500">
                @for (tipo of tiposPrograma; track tipo.key) {
                  <option [value]="tipo.key">{{ tipo.label }}</option>
                }
              </select>
            </div>

            <div>
              <label for="estado" class="block text-sm font-medium text-slate-700 mb-1">Estado</label>
              <select id="estado" formControlName="estado"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500">
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>

            <div>
              <label for="fechaInicio" class="block text-sm font-medium text-slate-700 mb-1">Fecha inicio</label>
              <input id="fechaInicio" formControlName="fechaInicio" type="date"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500" />
            </div>

            <div>
              <label for="fechaFin" class="block text-sm font-medium text-slate-700 mb-1">Fecha fin</label>
              <input id="fechaFin" formControlName="fechaFin" type="date"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div>
            <label for="descripcion" class="block text-sm font-medium text-slate-700 mb-1">Descripción comercial</label>
            <textarea id="descripcion" formControlName="descripcion" rows="4"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500"></textarea>
          </div>
        </section>

        <section class="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div class="flex items-center justify-between gap-4">
            <div>
              <h3 class="text-lg font-semibold text-slate-900">RF-09 · Cursos hijos del programa</h3>
              <p class="text-sm text-slate-500 mt-1">Seleccione las disciplinas internas que conforman el paquete.</p>
            </div>
            <span class="rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
              {{ selectedCursoIds().size }} curso(s)
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            @for (curso of cursosActivos(); track curso.id) {
              <label class="flex items-start gap-3 rounded-xl border border-slate-200 p-4 hover:border-green-300 hover:bg-green-50/40 transition-colors cursor-pointer">
                <input type="checkbox"
                  class="mt-1 rounded border-slate-300 text-green-600 focus:ring-green-500"
                  [checked]="selectedCursoIds().has(curso.id)"
                  (change)="toggleCurso(curso.id, $any($event.target).checked)" />
                <span class="min-w-0">
                  <span class="block font-medium text-slate-800">{{ curso.nombre }}</span>
                  <span class="block text-xs text-slate-500 font-mono mt-1">{{ curso.codigo }}</span>
                  <span class="block text-sm text-slate-500 mt-2">{{ curso.descripcion }}</span>
                </span>
              </label>
            }
          </div>

          @if (selectedCursos().length > 0) {
            <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p class="text-sm font-medium text-emerald-800">Cursos asociados</p>
              <p class="text-sm text-emerald-700 mt-1">{{ resumenCursosSeleccionados() }}</p>
            </div>
          }
        </section>

        <div class="flex gap-3">
          <button type="submit" [disabled]="form.invalid || selectedCursoIds().size === 0"
            class="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50">
            Crear programa
          </button>
          <a routerLink="/academia/programas"
            class="rounded-lg bg-slate-200 px-6 py-2 text-slate-700 hover:bg-slate-300">
            Cancelar
          </a>
        </div>
      </form>
    </div>
  `,
})
export class ProgramaFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly academiaService = inject(AcademiaService);

  protected readonly cursosActivos = this.academiaService.cursosActivos;
  protected readonly tiposPrograma = Object.entries(TIPO_PROGRAMA_LABELS).map(([key, label]) => ({
    key: key as TipoPrograma,
    label,
  }));
  protected readonly selectedCursoIds = signal(new Set<string>());
  protected readonly selectedCursos = computed(() =>
    this.cursosActivos().filter((curso) => this.selectedCursoIds().has(curso.id))
  );

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    tipo: ['vacacional' as TipoPrograma, Validators.required],
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required],
    estado: ['activo' as const, Validators.required],
  });

  protected toggleCurso(cursoId: string, checked: boolean): void {
    this.selectedCursoIds.update((actuales) => {
      const siguiente = new Set(actuales);
      if (checked) {
        siguiente.add(cursoId);
      } else {
        siguiente.delete(cursoId);
      }
      return siguiente;
    });
  }

  protected resumenCursosSeleccionados(): string {
    return this.selectedCursos()
      .map((curso) => curso.nombre)
      .join(', ');
  }

  protected guardar(): void {
    if (this.form.invalid || this.selectedCursoIds().size === 0) {
      return;
    }

    const value = this.form.getRawValue();
    this.academiaService.createPrograma({
      ...value,
      cursoIds: Array.from(this.selectedCursoIds()),
      claseIds: [],
    });

    this.router.navigate(['/academia/programas']);
  }
}
