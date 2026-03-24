import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SancionService } from '../../core/services/sancion.service';
import { EncuentroService } from '../../core/services/encuentro.service';
import { EquipoService } from '../../core/services/equipo.service';
import { TipoTarjeta } from '../../core/models/sancion.model';

@Component({
  selector: 'app-tarjeta-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-slate-900">Registrar Tarjeta</h2>
      </div>

      <form [formGroup]="form" (ngSubmit)="guardar()" class="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <label for="encuentro" class="block text-sm font-medium text-slate-700 mb-1">Encuentro</label>
          <select id="encuentro" formControlName="encuentroId"
            class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
            <option value="">Seleccionar...</option>
            @for (enc of encuentros(); track enc.id) {
              <option [value]="enc.id">
                {{ getEquipoNombre(enc.equipoLocalId) }} vs {{ getEquipoNombre(enc.equipoVisitanteId) }}
              </option>
            }
          </select>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="equipo" class="block text-sm font-medium text-slate-700 mb-1">Equipo</label>
            <select id="equipo" formControlName="equipoId"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
              <option value="">Seleccionar...</option>
              @for (eq of equipos(); track eq.id) {
                <option [value]="eq.id">{{ eq.nombre }}</option>
              }
            </select>
          </div>
          <div>
            <label for="participante" class="block text-sm font-medium text-slate-700 mb-1">Jugador</label>
            <select id="participante" formControlName="participanteId"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
              <option value="">Seleccionar...</option>
              @for (p of participantes(); track p.id) {
                <option [value]="p.id">{{ p.apellido }}, {{ p.nombre }}</option>
              }
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="tipo" class="block text-sm font-medium text-slate-700 mb-1">Tipo de tarjeta</label>
            <select id="tipo" formControlName="tipo"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
              <option value="amarilla">Amarilla</option>
              <option value="roja_directa">Roja directa</option>
              <option value="doble_amarilla">Doble amarilla</option>
            </select>
          </div>
          <div>
            <label for="minuto" class="block text-sm font-medium text-slate-700 mb-1">Minuto</label>
            <input id="minuto" formControlName="minuto" type="number" min="0"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
          </div>
        </div>

        <div>
          <label for="motivo" class="block text-sm font-medium text-slate-700 mb-1">Motivo</label>
          <textarea id="motivo" formControlName="motivo" rows="2"
            class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"></textarea>
        </div>

        <div class="flex gap-3 pt-4">
          <button type="submit" [disabled]="form.invalid"
            class="bg-brand text-white px-6 py-2 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Registrar
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
export class TarjetaFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly sancionService = inject(SancionService);
  private readonly encuentroService = inject(EncuentroService);
  private readonly equipoService = inject(EquipoService);

  protected readonly encuentros = this.encuentroService.encuentros;
  protected readonly equipos = this.equipoService.equipos;
  protected readonly participantes = computed(() => this.equipoService.getAllParticipantes());

  readonly form = this.fb.nonNullable.group({
    encuentroId: ['', Validators.required],
    participanteId: ['', Validators.required],
    equipoId: ['', Validators.required],
    tipo: ['amarilla' as TipoTarjeta],
    minuto: [0, [Validators.required, Validators.min(0)]],
    motivo: ['', Validators.required],
  });

  protected getEquipoNombre(id: string): string {
    return this.equipoService.getEquipoById(id)?.nombre ?? id;
  }

  protected guardar(): void {
    if (this.form.invalid) return;
    this.sancionService.addTarjeta(this.form.getRawValue());
    this.cerrar();
  }

  protected cancelar(): void {
    this.cerrar();
  }

  private cerrar(): void {
    if (this.route.outlet === 'panel') {
      const urlTree = this.router.parseUrl(this.router.url);
      delete urlTree.root.children['panel'];
      this.router.navigateByUrl(urlTree);
    } else {
      this.router.navigate(['/gestion/sanciones']);
    }
  }
}
