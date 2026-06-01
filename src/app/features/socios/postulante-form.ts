import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PostulanteService } from '../../core/services/postulante.service';
import { SocioService } from '../../core/services/socio.service';
import { TIPO_DOCUMENTO_LABELS, TipoDocumento } from '../../core/models/socio.model';

@Component({
  selector: 'app-postulante-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="h-full flex flex-col">
      <!-- Cabecera -->
      <div class="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
          <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"/>
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-semibold text-slate-800">Nuevo Postulante</h2>
          <p class="text-xs text-slate-500">Registro inicial. El postulante pasará por el proceso de aprobación.</p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="guardar()" class="flex-1 overflow-y-auto px-6 py-6 space-y-6">

        <!-- Aviso informativo -->
        <div class="rounded-lg bg-indigo-50 border border-indigo-200 p-3 text-xs text-indigo-800">
          <strong>Workflow de admisión:</strong> Ingresado → Doc. Pendiente → Doc. Completa → En Evaluación → Aprobado / Rechazado.
          Al aprobar se podrá convertir automáticamente en socio.
        </div>

        <!-- Datos personales -->
        <fieldset>
          <legend class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Datos personales</legend>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label for="p-apellido" class="block text-sm font-medium text-slate-700 mb-1">
                Apellido <span class="text-red-500">*</span>
              </label>
              <input id="p-apellido" type="text" formControlName="apellido"
                class="input-modern"
                [class]="form.get('apellido')!.invalid && form.get('apellido')!.touched ? '!border-red-400' : ''"
                placeholder="García" />
              @if (form.get('apellido')!.invalid && form.get('apellido')!.touched) {
                <p class="text-xs text-red-500 mt-1">El apellido es requerido.</p>
              }
            </div>

            <div>
              <label for="p-nombre" class="block text-sm font-medium text-slate-700 mb-1">
                Nombre <span class="text-red-500">*</span>
              </label>
              <input id="p-nombre" type="text" formControlName="nombre"
                class="input-modern"
                [class]="form.get('nombre')!.invalid && form.get('nombre')!.touched ? '!border-red-400' : ''"
                placeholder="Juan" />
              @if (form.get('nombre')!.invalid && form.get('nombre')!.touched) {
                <p class="text-xs text-red-500 mt-1">El nombre es requerido.</p>
              }
            </div>

            <div>
              <label for="p-tipo-doc" class="block text-sm font-medium text-slate-700 mb-1">Tipo de documento</label>
              <select id="p-tipo-doc" formControlName="tipoDocumento" class="input-modern">
                @for (entry of tipoDocEntries; track entry[0]) {
                  <option [value]="entry[0]">{{ entry[1] }}</option>
                }
              </select>
            </div>

            <div>
              <label for="p-dni" class="block text-sm font-medium text-slate-700 mb-1">
                Nro. de documento <span class="text-red-500">*</span>
              </label>
              <input id="p-dni" type="text" formControlName="dni"
                class="input-modern"
                [class]="form.get('dni')!.invalid && form.get('dni')!.touched ? '!border-red-400' : ''"
                placeholder="12345678" />
              @if (form.get('dni')!.invalid && form.get('dni')!.touched) {
                <p class="text-xs text-red-500 mt-1">El documento es requerido.</p>
              }
            </div>

            <div>
              <label for="p-fnac" class="block text-sm font-medium text-slate-700 mb-1">Fecha de nacimiento</label>
              <input id="p-fnac" type="date" formControlName="fechaNacimiento" class="input-modern" />
            </div>

            <div>
              <label for="p-sexo" class="block text-sm font-medium text-slate-700 mb-1">Sexo</label>
              <select id="p-sexo" formControlName="sexo" class="input-modern">
                <option value="">— No especificado —</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div>
              <label for="p-nac" class="block text-sm font-medium text-slate-700 mb-1">Nacionalidad</label>
              <input id="p-nac" type="text" formControlName="nacionalidad" class="input-modern" placeholder="Argentina" />
            </div>

            <div>
              <label for="p-dir" class="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
              <input id="p-dir" type="text" formControlName="direccion" class="input-modern" placeholder="Av. Ejemplo 123" />
            </div>
          </div>
        </fieldset>

        <!-- Contacto -->
        <fieldset>
          <legend class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Contacto</legend>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="p-email" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input id="p-email" type="email" formControlName="email"
                class="input-modern"
                [class]="form.get('email')!.invalid && form.get('email')!.touched ? '!border-red-400' : ''"
                placeholder="correo@ejemplo.com" />
              @if (form.get('email')!.invalid && form.get('email')!.touched) {
                <p class="text-xs text-red-500 mt-1">Ingrese un email válido.</p>
              }
            </div>
            <div>
              <label for="p-tel" class="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
              <input id="p-tel" type="tel" formControlName="telefono" class="input-modern" placeholder="11-1234-5678" />
            </div>
          </div>
        </fieldset>

        <!-- Membresía deseada -->
        <fieldset>
          <legend class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Membresía deseada</legend>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="p-condicion" class="block text-sm font-medium text-slate-700 mb-1">Condición societaria</label>
              <select id="p-condicion" formControlName="condicionDeseada" class="input-modern">
                <option value="">— Sin especificar —</option>
                <option value="individual">Individual</option>
                <option value="familiar">Familiar</option>
                <option value="transitorio_menor">Transitorio Menor</option>
                <option value="transitorio_mayor">Transitorio Mayor</option>
              </select>
            </div>
            <div>
              <label for="p-aval" class="block text-sm font-medium text-slate-700 mb-1">Avalado por socio (DNI)</label>
              <input id="p-aval" type="text" formControlName="avalDni" class="input-modern" placeholder="DNI del socio avalante" />
              @if (socioAval(); as sav) {
                <p class="text-xs text-green-700 mt-1">{{ sav.apellido }}, {{ sav.nombre }}</p>
              }
            </div>
          </div>
        </fieldset>

        <!-- Observaciones -->
        <div>
          <label for="p-obs" class="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
          <textarea id="p-obs" formControlName="observaciones" rows="3"
            class="input-modern !h-auto resize-none"
            placeholder="Referido por… / motivo de postulación / notas adicionales"></textarea>
        </div>

      </form>

      <!-- Footer de acciones -->
      <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
        <button type="button" (click)="cancelar()" class="btn-secondary !text-sm">Cancelar</button>
        <button type="button" (click)="guardar()" class="btn-primary !text-sm"
          [disabled]="form.invalid">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Registrar postulante
        </button>
      </div>
    </div>
  `,
})
export class PostulanteFormComponent {
  private readonly postulanteService = inject(PostulanteService);
  private readonly socioService = inject(SocioService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly tipoDocEntries = Object.entries(TIPO_DOCUMENTO_LABELS) as [TipoDocumento, string][];

  protected readonly form = this.fb.group({
    apellido: ['', Validators.required],
    nombre: ['', Validators.required],
    tipoDocumento: ['dni' as TipoDocumento],
    dni: ['', Validators.required],
    fechaNacimiento: [''],
    sexo: [''],
    nacionalidad: [''],
    direccion: [''],
    email: ['', Validators.email],
    telefono: [''],
    condicionDeseada: [''],
    avalDni: [''],
    observaciones: [''],
  });

  protected readonly socioAval = (() => {
    // Signal derivado — se evalúa al acceder
    return () => {
      const dni = this.form.get('avalDni')?.value ?? '';
      return dni.length >= 7 ? this.socioService.buscarPorDni(dni) : undefined;
    };
  })();

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const hoy = new Date().toISOString().split('T')[0];

    this.postulanteService.create({
      nombre: v.nombre!,
      apellido: v.apellido!,
      tipoDocumento: (v.tipoDocumento as TipoDocumento) ?? 'dni',
      dni: v.dni!,
      fechaNacimiento: v.fechaNacimiento ?? undefined,
      sexo: (v.sexo as 'masculino' | 'femenino' | 'otro') || undefined,
      nacionalidad: v.nacionalidad ?? undefined,
      direccion: v.direccion ?? undefined,
      email: v.email ?? undefined,
      telefono: v.telefono ?? undefined,
      condicionDeseada: (v.condicionDeseada as 'individual' | 'familiar' | 'transitorio_menor' | 'transitorio_mayor') || undefined,
      avaladoPorSocioId: this.socioAval()?.id,
      observaciones: v.observaciones ?? undefined,
      fechaIngreso: hoy,
    });

    this.router.navigate(['/', { outlets: { primary: ['maestros', 'socios', 'postulantes'], panel: null } }]);
  }

  protected cancelar(): void {
    this.router.navigate(['/', { outlets: { panel: null } }]);
  }
}
