import {
  Component,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConvenioService } from '../../core/services/convenio.service';

@Component({
  selector: 'app-convenio-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="flex flex-col h-full">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <div>
          <h2 class="text-lg font-semibold text-slate-800">Nuevo Convenio Institucional</h2>
          <p class="text-xs text-slate-500">Configure los datos generales del acuerdo</p>
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

      <form
        [formGroup]="form"
        (ngSubmit)="guardar()"
        class="flex-1 overflow-y-auto p-6 space-y-5"
        id="convenio-form"
      >
        <!-- Nombre -->
        <div class="space-y-1">
          <label for="nombre" class="block text-sm font-medium text-slate-700">Nombre del convenio <span class="text-red-500">*</span></label>
          <input
            id="nombre"
            type="text"
            formControlName="nombre"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
            placeholder="Ej. Convenio Royal 2026"
          />
          @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
            <p class="text-xs text-red-500">El nombre es obligatorio</p>
          }
        </div>

        <!-- Empresa -->
        <div class="space-y-1">
          <label for="empresa" class="block text-sm font-medium text-slate-700">Nombre de la empresa / institución <span class="text-red-500">*</span></label>
          <input
            id="empresa"
            type="text"
            formControlName="empresa"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
            placeholder="Ej. Royal, Colegio La Unión..."
          />
        </div>

        <!-- Descripción -->
        <div class="space-y-1">
          <label for="descripcion" class="block text-sm font-medium text-slate-700">Descripción</label>
          <textarea
            id="descripcion"
            formControlName="descripcion"
            rows="2"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none resize-none"
            placeholder="Descripción del acuerdo y sus condiciones..."
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
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
            />
          </div>
          <div class="space-y-1">
            <label for="fechaFin" class="block text-sm font-medium text-slate-700">Fecha fin <span class="text-red-500">*</span></label>
            <input
              id="fechaFin"
              type="date"
              formControlName="fechaFin"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
            />
          </div>
        </div>

        <!-- Contacto -->
        <hr class="border-slate-200" />
        <p class="text-xs text-slate-500 font-medium uppercase tracking-wide">Contacto</p>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <label for="contactoNombre" class="block text-sm font-medium text-slate-700">Nombre de contacto</label>
            <input
              id="contactoNombre"
              type="text"
              formControlName="contactoNombre"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
              placeholder="Recursos Humanos..."
            />
          </div>
          <div class="space-y-1">
            <label for="contactoEmail" class="block text-sm font-medium text-slate-700">Email de contacto</label>
            <input
              id="contactoEmail"
              type="email"
              formControlName="contactoEmail"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
              placeholder="rrhh@empresa.com"
            />
          </div>
        </div>

        <!-- Acumulación -->
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              formControlName="acumularConCampana"
              class="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
            />
            <div>
              <span class="text-sm font-medium text-slate-700">Permitir acumulación con campañas promocionales</span>
              <p class="text-xs text-slate-500 mt-0.5">
                Si está desactivado, el sistema aplica automáticamente el beneficio más ventajoso
                para el alumno (convenio o campaña), sin posibilidad de combinarlos.
              </p>
            </div>
          </label>
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
          form="convenio-form"
          class="px-5 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors disabled:opacity-50"
          [disabled]="form.invalid"
        >
          Crear Convenio
        </button>
      </div>
    </div>
  `,
})
export class ConvenioFormComponent {
  private readonly svc = inject(ConvenioService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    empresa: ['', Validators.required],
    descripcion: [''],
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required],
    contactoNombre: [''],
    contactoEmail: [''],
    acumularConCampana: [false],
  });

  guardar(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const creado = this.svc.crear({
      nombre: v.nombre,
      empresa: v.empresa,
      descripcion: v.descripcion || undefined,
      fechaInicio: v.fechaInicio,
      fechaFin: v.fechaFin,
      reglasBeneficios: [],
      acumularConCampana: v.acumularConCampana,
      estado: 'activo',
      contactoNombre: v.contactoNombre || undefined,
      contactoEmail: v.contactoEmail || undefined,
    });
    // Navegar al detalle para agregar las reglas
    this.router.navigate(['/', { outlets: { panel: ['comercial', 'convenios', creado.id, 'detalle'] } }]);
  }

  cancelar(): void {
    this.router.navigate(['/', { outlets: { panel: null } }]);
  }
}
