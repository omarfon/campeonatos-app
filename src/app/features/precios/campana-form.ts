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
import { CONDICION_CLIENTE_LABELS, CondicionCliente } from '../../core/models/tarifa.model';

@Component({
  selector: 'app-campana-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="flex flex-col h-full">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <div>
          <h2 class="text-lg font-semibold text-slate-800">Nueva Campaña Promocional</h2>
          <p class="text-xs text-slate-500">Precio especial para un rango de fechas</p>
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

      <!-- Form -->
      <form
        [formGroup]="form"
        (ngSubmit)="guardar()"
        class="flex-1 overflow-y-auto p-6 space-y-5"
        id="campana-form"
      >
        <!-- Nombre -->
        <div class="space-y-1">
          <label for="nombre" class="block text-sm font-medium text-slate-700">Nombre de la campaña <span class="text-red-500">*</span></label>
          <input
            id="nombre"
            type="text"
            formControlName="nombre"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            placeholder="Ej. Campaña Verano 2026"
          />
          @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
            <p class="text-xs text-red-500">El nombre es obligatorio</p>
          }
        </div>

        <!-- Descripción -->
        <div class="space-y-1">
          <label for="descripcion" class="block text-sm font-medium text-slate-700">Descripción</label>
          <textarea
            id="descripcion"
            formControlName="descripcion"
            rows="2"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
            placeholder="Descripción interna de la campaña..."
          ></textarea>
        </div>

        <!-- Fechas -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <label for="fechaInicio" class="block text-sm font-medium text-slate-700">Fecha inicio <span class="text-red-500">*</span></label>
            <input
              id="fechaInicio"
              type="date"
              formControlName="fechaInicio"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
          </div>
          <div class="space-y-1">
            <label for="fechaFin" class="block text-sm font-medium text-slate-700">Fecha fin <span class="text-red-500">*</span></label>
            <input
              id="fechaFin"
              type="date"
              formControlName="fechaFin"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
          </div>
        </div>

        <!-- Precio promo -->
        <div class="space-y-1">
          <label for="montoPromo" class="block text-sm font-medium text-slate-700">Precio promocional (S/) <span class="text-red-500">*</span></label>
          <input
            id="montoPromo"
            type="number"
            formControlName="montoPromo"
            min="0"
            step="0.01"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            placeholder="0.00"
          />
        </div>

        <!-- Filtros opcionales -->
        <hr class="border-slate-200" />
        <p class="text-xs text-slate-500 font-medium uppercase tracking-wide">Filtros opcionales</p>

        <!-- Condición cliente -->
        <div class="space-y-1">
          <label for="condicionCliente" class="block text-sm font-medium text-slate-700">Restringir a condición</label>
          <select
            id="condicionCliente"
            formControlName="condicionCliente"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
          >
            <option value="">— Todas las condiciones —</option>
            @for (c of condiciones; track c.value) {
              <option [value]="c.value">{{ c.label }}</option>
            }
          </select>
        </div>

        <!-- Curso -->
        <div class="space-y-1">
          <label for="cursoId" class="block text-sm font-medium text-slate-700">Restringir a curso</label>
          <select
            id="cursoId"
            formControlName="cursoId"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
          >
            <option value="">— Todos los cursos —</option>
            @for (c of cursosActivos(); track c.id) {
              <option [value]="c.id">{{ c.nombre }}</option>
            }
          </select>
        </div>

        <!-- Tarifas específicas -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700">Aplicar a tarifas específicas</label>
          <p class="text-xs text-slate-400">Dejar sin seleccionar = aplica a todas las tarifas vigentes</p>
          <div class="space-y-1 max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-3">
            @for (t of tarifas(); track t.id) {
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  [value]="t.id"
                  [checked]="tarifasSeleccionadas().has(t.id)"
                  (change)="toggleTarifa(t.id)"
                  class="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span class="text-slate-700">{{ t.nombre }}</span>
              </label>
            }
          </div>
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
          form="campana-form"
          class="px-5 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
          [disabled]="form.invalid"
        >
          Guardar Campaña
        </button>
      </div>
    </div>
  `,
})
export class CampanaFormComponent {
  private readonly svc = inject(TarifaService);
  private readonly academiaService = inject(AcademiaService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly cursosActivos = this.academiaService.cursosActivos;
  readonly tarifas = this.svc.tarifas;

  readonly tarifasSeleccionadas = signal<Set<string>>(new Set());

  protected readonly condiciones: { value: CondicionCliente; label: string }[] = [
    { value: 'socio', label: CONDICION_CLIENTE_LABELS.socio },
    { value: 'dependiente', label: CONDICION_CLIENTE_LABELS.dependiente },
    { value: 'no_socio', label: CONDICION_CLIENTE_LABELS.no_socio },
    { value: 'trabajador', label: CONDICION_CLIENTE_LABELS.trabajador },
  ];

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required],
    montoPromo: [null as unknown as number, [Validators.required, Validators.min(0.01)]],
    condicionCliente: [''],
    cursoId: [''],
  });

  toggleTarifa(id: string): void {
    this.tarifasSeleccionadas.update((s) => {
      const copia = new Set(s);
      if (copia.has(id)) copia.delete(id);
      else copia.add(id);
      return copia;
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.svc.crearCampana({
      nombre: v.nombre,
      descripcion: v.descripcion || undefined,
      fechaInicio: v.fechaInicio,
      fechaFin: v.fechaFin,
      montoPromo: Number(v.montoPromo),
      tarifaIds: [...this.tarifasSeleccionadas()],
      condicionCliente: (v.condicionCliente as CondicionCliente) || undefined,
      cursoId: v.cursoId || undefined,
      activa: true,
    });
    this.cancelar();
  }

  cancelar(): void {
    this.router.navigate(['/', { outlets: { panel: null } }]);
  }
}
