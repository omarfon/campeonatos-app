import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TarifaService } from '../../core/services/tarifa.service';
import { AcademiaService } from '../../core/services/academia.service';
import {
  CondicionCliente,
  CONDICION_CLIENTE_LABELS,
} from '../../core/models/tarifa.model';

@Component({
  selector: 'app-tarifa-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="flex flex-col h-full">
      <!-- Header panel -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <div>
          <h2 class="text-lg font-semibold text-slate-800">Nueva Regla de Tarifa</h2>
          <p class="text-xs text-slate-500">Defina el precio base para una combinación de variables</p>
        </div>
        <button
          class="text-slate-400 hover:text-slate-600 transition-colors"
          (click)="cancelar()"
          aria-label="Cerrar panel"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Formulario -->
      <form
        [formGroup]="form"
        (ngSubmit)="guardar()"
        class="flex-1 overflow-y-auto p-6 space-y-5"
        id="tarifa-form"
      >
        <!-- Nombre -->
        <div class="space-y-1">
          <label for="nombre" class="block text-sm font-medium text-slate-700">Nombre descriptivo <span class="text-red-500">*</span></label>
          <input
            id="nombre"
            type="text"
            formControlName="nombre"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            placeholder="Ej. Tenis de Mesa · 2x/sem · Socio"
          />
          @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
            <p class="text-xs text-red-500">El nombre es obligatorio</p>
          }
        </div>

        <!-- Condición del cliente -->
        <div class="space-y-1">
          <label for="condicionCliente" class="block text-sm font-medium text-slate-700">Condición del cliente <span class="text-red-500">*</span></label>
          <select
            id="condicionCliente"
            formControlName="condicionCliente"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            @for (c of condiciones; track c.value) {
              <option [value]="c.value">{{ c.label }}</option>
            }
          </select>
        </div>

        <hr class="border-slate-200" />
        <p class="text-xs text-slate-500 font-medium uppercase tracking-wide">Variables de Cruce (opcional — dejar vacío = aplica a todos)</p>

        <!-- Curso -->
        <div class="space-y-1">
          <label for="cursoId" class="block text-sm font-medium text-slate-700">Curso / Disciplina</label>
          <select
            id="cursoId"
            formControlName="cursoId"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="">— Todos los cursos —</option>
            @for (c of cursosActivos(); track c.id) {
              <option [value]="c.id">{{ c.nombre }}</option>
            }
          </select>
        </div>

        <!-- Categoría de Edad (solo si hay curso seleccionado) -->
        @if (form.get('cursoId')?.value && categoriasEdad().length > 0) {
          <div class="space-y-1">
            <label for="categoriaEdadId" class="block text-sm font-medium text-slate-700">Categoría de Edad</label>
            <select
              id="categoriaEdadId"
              formControlName="categoriaEdadId"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="">— Todas las categorías —</option>
              @for (cat of categoriasEdad(); track cat.id) {
                <option [value]="cat.id">{{ cat.nombre }} ({{ cat.edadMinima }}–{{ cat.edadMaxima }} años)</option>
              }
            </select>
          </div>
        }

        <!-- Frecuencia Semanal -->
        <div class="space-y-1">
          <label for="frecuenciaSemanal" class="block text-sm font-medium text-slate-700">Frecuencia Semanal</label>
          <select
            id="frecuenciaSemanal"
            formControlName="frecuenciaSemanal"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="">— Cualquier frecuencia —</option>
            <option value="1">1 vez / semana</option>
            <option value="2">2 veces / semana</option>
            <option value="3">3 veces / semana</option>
            <option value="4">4 veces / semana</option>
            <option value="5">5 veces / semana</option>
          </select>
        </div>

        <hr class="border-slate-200" />
        <p class="text-xs text-slate-500 font-medium uppercase tracking-wide">Monto</p>

        <!-- Monto y Matrícula -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <label for="monto" class="block text-sm font-medium text-slate-700">Precio mensual (S/) <span class="text-red-500">*</span></label>
            <input
              id="monto"
              type="number"
              formControlName="monto"
              min="0"
              step="0.01"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="0.00"
            />
          </div>
          <div class="space-y-1">
            <label for="montoMatricula" class="block text-sm font-medium text-slate-700">Derecho de matrícula (S/)</label>
            <input
              id="montoMatricula"
              type="number"
              formControlName="montoMatricula"
              min="0"
              step="0.01"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="0.00"
            />
          </div>
        </div>

        <!-- Prioridad -->
        <div class="space-y-1">
          <label for="prioridad" class="block text-sm font-medium text-slate-700">Prioridad de matching</label>
          <input
            id="prioridad"
            type="number"
            formControlName="prioridad"
            min="1"
            max="100"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            placeholder="10"
          />
          <p class="text-xs text-slate-400">Número mayor = se evalúa primero cuando existen varias reglas aplicables.</p>
        </div>

        <!-- Observaciones -->
        <div class="space-y-1">
          <label for="observaciones" class="block text-sm font-medium text-slate-700">Observaciones</label>
          <textarea
            id="observaciones"
            formControlName="observaciones"
            rows="2"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
            placeholder="Notas internas sobre esta regla..."
          ></textarea>
        </div>
      </form>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
        <button
          type="button"
          class="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-200 transition-colors"
          (click)="cancelar()"
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="tarifa-form"
          class="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          [disabled]="form.invalid"
        >
          Guardar Regla
        </button>
      </div>
    </div>
  `,
})
export class TarifaFormComponent {
  private readonly svc = inject(TarifaService);
  private readonly academiaService = inject(AcademiaService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly cursosActivos = this.academiaService.cursosActivos;

  readonly categoriasEdad = computed(() => {
    const cursoId = this.form.get('cursoId')?.value;
    if (!cursoId) return [];
    return this.academiaService.categoriasEdad().filter((c) => c.cursoId === cursoId);
  });

  protected readonly condiciones: { value: CondicionCliente; label: string }[] = [
    { value: 'socio', label: CONDICION_CLIENTE_LABELS.socio },
    { value: 'dependiente', label: CONDICION_CLIENTE_LABELS.dependiente },
    { value: 'no_socio', label: CONDICION_CLIENTE_LABELS.no_socio },
    { value: 'trabajador', label: CONDICION_CLIENTE_LABELS.trabajador },
  ];

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    condicionCliente: ['socio' as CondicionCliente, Validators.required],
    cursoId: [''],
    categoriaEdadId: [''],
    frecuenciaSemanal: ['' as unknown as number],
    monto: [null as unknown as number, [Validators.required, Validators.min(0.01)]],
    montoMatricula: [null as unknown as number],
    prioridad: [10, [Validators.required, Validators.min(1)]],
    observaciones: [''],
  });

  guardar(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.svc.crearTarifa({
      nombre: v.nombre,
      condicionCliente: v.condicionCliente,
      cursoId: v.cursoId || undefined,
      categoriaEdadId: v.categoriaEdadId || undefined,
      frecuenciaSemanal: v.frecuenciaSemanal ? Number(v.frecuenciaSemanal) : undefined,
      monto: Number(v.monto),
      montoMatricula: v.montoMatricula ? Number(v.montoMatricula) : undefined,
      prioridad: v.prioridad,
      observaciones: v.observaciones || undefined,
      vigente: true,
    });
    this.cancelar();
  }

  cancelar(): void {
    this.router.navigate(['/', { outlets: { panel: null } }]);
  }
}
