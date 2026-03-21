import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SancionService } from '../../core/services/sancion.service';
import { EquipoService } from '../../core/services/equipo.service';
import { CompetenciaService } from '../../core/services/competencia.service';
import { TipoSancion, EstadoSancion } from '../../core/models/sancion.model';

@Component({
  selector: 'app-sancion-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-slate-900">Crear Sanción</h2>
      </div>

      <form [formGroup]="form" (ngSubmit)="guardar()" class="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="participante" class="block text-sm font-medium text-slate-700 mb-1">Jugador</label>
            <select id="participante" formControlName="participanteId"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">Seleccionar...</option>
              @for (p of participantes; track p.id) {
                <option [value]="p.id">{{ p.apellido }}, {{ p.nombre }}</option>
              }
            </select>
          </div>
          <div>
            <label for="competencia" class="block text-sm font-medium text-slate-700 mb-1">Competencia</label>
            <select id="competencia" formControlName="competenciaId"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              @for (camp of competencias(); track camp.id) {
                <option [value]="camp.id">{{ camp.nombre }}</option>
              }
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="tipo" class="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
            <select id="tipo" formControlName="tipo"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="deportiva">Deportiva</option>
              <option value="economica">Económica</option>
            </select>
          </div>
          <div>
            <label for="estado" class="block text-sm font-medium text-slate-700 mb-1">Estado</label>
            <select id="estado" formControlName="estado"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="activa">Activa</option>
              <option value="cumplida">Cumplida</option>
              <option value="apelada">Apelada</option>
              <option value="revocada">Revocada</option>
            </select>
          </div>
        </div>

        <div>
          <label for="descripcion" class="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
          <textarea id="descripcion" formControlName="descripcion" rows="3"
            class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label for="fechas" class="block text-sm font-medium text-slate-700 mb-1">Fechas inhabilitación</label>
            <input id="fechas" formControlName="fechasInhabilitacion" type="number" min="0"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label for="fechaInicio" class="block text-sm font-medium text-slate-700 mb-1">Fecha inicio</label>
            <input id="fechaInicio" formControlName="fechaInicio" type="date"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label for="montoEconomico" class="block text-sm font-medium text-slate-700 mb-1">Monto ($)</label>
            <input id="montoEconomico" formControlName="montoEconomico" type="number" min="0"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
        </div>

        <div class="flex gap-3 pt-4">
          <button type="submit" [disabled]="form.invalid"
            class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Crear Sanción
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
export class SancionFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly sancionService = inject(SancionService);
  private readonly equipoService = inject(EquipoService);
  private readonly competenciaService = inject(CompetenciaService);

  protected readonly participantes = this.equipoService.getAllParticipantes();
  protected readonly competencias = this.competenciaService.items;

  readonly form = this.fb.nonNullable.group({
    participanteId: ['', Validators.required],
    competenciaId: ['', Validators.required],
    tipo: ['deportiva' as TipoSancion],
    estado: ['activa' as EstadoSancion],
    descripcion: ['', Validators.required],
    fechasInhabilitacion: [1, [Validators.required, Validators.min(0)]],
    fechaInicio: ['', Validators.required],
    montoEconomico: [0],
  });

  protected guardar(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    this.sancionService.createSancion({
      ...value,
      tarjetaIds: [],
    });
    this.router.navigate(['/gestion/sanciones']);
  }

  protected cancelar(): void {
    this.router.navigate(['/gestion/sanciones']);
  }
}
