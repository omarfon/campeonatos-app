import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TramiteAcademicoService } from '../../core/services/tramite-academico.service';
import {
  TIPO_TRAMITE_ACADEMICO_LABELS,
  TipoTramiteAcademico,
} from '../../core/models/tramite-academico.model';

@Component({
  selector: 'app-tramite-academico-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="h-full flex flex-col">

      <!-- Cabecera -->
      <div class="px-6 py-5 border-b border-slate-100">
        <h2 class="text-lg font-semibold text-slate-800">Nueva Solicitud Académica</h2>
        <p class="mt-0.5 text-sm text-slate-500">Complete los datos del trámite para su registro y procesamiento.</p>
      </div>

      <div class="flex-1 overflow-y-auto px-6 py-6 space-y-5">

        <!-- Aviso -->
        <div class="rounded-lg bg-indigo-50 border border-indigo-200 p-3 text-xs text-indigo-800">
          <strong>Importante:</strong> Las solicitudes ingresadas por ventanilla son registradas por un
          operador autorizado. Las solicitudes del portal son enviadas directamente por el apoderado o alumno.
        </div>

        <form [formGroup]="form" (ngSubmit)="guardar()" id="tramiteForm" class="space-y-5">

          <!-- Datos del alumno -->
          <fieldset class="space-y-4">
            <legend class="text-sm font-semibold text-slate-700">Datos del alumno</legend>
            <div>
              <label for="alumnoNombre" class="block text-sm font-medium text-slate-700 mb-1">Nombre completo *</label>
              <input id="alumnoNombre" type="text" formControlName="alumnoNombre"
                class="input-modern !text-sm" placeholder="Ej: Juan Carlos Pérez López" />
              @if (form.controls.alumnoNombre.touched && form.controls.alumnoNombre.invalid) {
                <p class="mt-1 text-xs text-red-600" role="alert">El nombre es requerido.</p>
              }
            </div>
            <div>
              <label for="alumnoDni" class="block text-sm font-medium text-slate-700 mb-1">DNI *</label>
              <input id="alumnoDni" type="text" formControlName="alumnoDni"
                class="input-modern !text-sm" placeholder="00000000" maxlength="8" />
              @if (form.controls.alumnoDni.touched && form.controls.alumnoDni.invalid) {
                <p class="mt-1 text-xs text-red-600" role="alert">Ingrese un DNI válido (8 dígitos).</p>
              }
            </div>
            <div>
              <label for="cursoNombre" class="block text-sm font-medium text-slate-700 mb-1">Curso / Clase <span class="text-slate-400">(opcional)</span></label>
              <input id="cursoNombre" type="text" formControlName="cursoNombre"
                class="input-modern !text-sm" placeholder="Ej: Natación Nivel Inicial — Grupo A" />
            </div>
          </fieldset>

          <!-- Tipo de trámite -->
          <div>
            <label for="tipo" class="block text-sm font-medium text-slate-700 mb-1">Tipo de trámite *</label>
            <select id="tipo" formControlName="tipo" class="input-modern !text-sm">
              <option value="">— Seleccione un tipo —</option>
              @for (opt of tipoOpts; track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
            @if (form.controls.tipo.touched && form.controls.tipo.invalid) {
              <p class="mt-1 text-xs text-red-600" role="alert">Seleccione el tipo de trámite.</p>
            }
          </div>

          <!-- Canal -->
          <div>
            <label for="operador" class="block text-sm font-medium text-slate-700 mb-1">Canal de ingreso *</label>
            <select id="operador" formControlName="operador" class="input-modern !text-sm">
              <option value="">— Seleccione —</option>
              <option value="Recepción">Ventanilla / Recepción</option>
              <option value="Portal Web">Portal Web (apoderado/alumno)</option>
              <option value="Correo electrónico">Correo electrónico</option>
            </select>
          </div>

          <!-- Descripción -->
          <div>
            <label for="descripcion" class="block text-sm font-medium text-slate-700 mb-1">Descripción / Motivo *</label>
            <textarea id="descripcion" formControlName="descripcion" rows="4"
              class="input-modern !text-sm"
              placeholder="Describa detalladamente el motivo o lo que solicita el alumno/apoderado..."></textarea>
            @if (form.controls.descripcion.touched && form.controls.descripcion.invalid) {
              <p class="mt-1 text-xs text-red-600" role="alert">La descripción es requerida (mínimo 10 caracteres).</p>
            }
          </div>

        </form>
      </div>

      <!-- Pie con acciones -->
      <div class="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <button type="button" (click)="cancelar()"
          class="text-sm text-slate-500 hover:text-slate-700 transition-colors px-3 py-2 rounded-lg hover:bg-slate-100">
          Cancelar
        </button>
        <button type="submit" form="tramiteForm"
          class="btn-primary !text-sm"
          [disabled]="form.invalid || guardando()">
          @if (guardando()) {
            <span>Guardando...</span>
          } @else {
            <span>Registrar solicitud</span>
          }
        </button>
      </div>
    </div>
  `,
})
export class TramiteAcademicoFormComponent {
  private readonly service = inject(TramiteAcademicoService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly guardando = signal(false);

  protected readonly tipoOpts = Object.entries(TIPO_TRAMITE_ACADEMICO_LABELS).map(
    ([value, label]) => ({ value: value as TipoTramiteAcademico, label })
  );

  protected readonly form = this.fb.group({
    alumnoNombre: ['', Validators.required],
    alumnoDni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    cursoNombre: [''],
    tipo: ['', Validators.required],
    operador: ['', Validators.required],
    descripcion: ['', [Validators.required, Validators.minLength(10)]],
  });

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    const v = this.form.getRawValue();
    this.service.crear({
      alumnoNombre: v.alumnoNombre!,
      alumnoDni: v.alumnoDni!,
      cursoNombre: v.cursoNombre ?? undefined,
      tipo: v.tipo as TipoTramiteAcademico,
      operador: v.operador ?? undefined,
      descripcion: v.descripcion!,
      estado: 'enviada',
      fechaCreacion: new Date().toISOString().slice(0, 10),
    });
    this.guardando.set(false);
    this.router.navigate([{ outlets: { primary: ['tramites'], panel: null } }]);
  }

  protected cancelar(): void {
    this.router.navigate([{ outlets: { panel: null } }]);
  }
}
