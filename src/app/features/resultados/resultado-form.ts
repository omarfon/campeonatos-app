import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ResultadoService } from '../../core/services/resultado.service';
import { EncuentroService } from '../../core/services/encuentro.service';
import { EquipoService } from '../../core/services/equipo.service';
import { EstadoResultado } from '../../core/models/resultado.model';

@Component({
  selector: 'app-resultado-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-slate-900">{{ isEdit() ? 'Editar' : 'Registrar' }} Resultado</h2>
      </div>

      <form [formGroup]="form" (ngSubmit)="guardar()" class="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <label for="encuentro" class="block text-sm font-medium text-slate-700 mb-1">Encuentro</label>
          <select id="encuentro" formControlName="encuentroId"
            class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
            <option value="">Seleccionar...</option>
            @for (enc of encuentros(); track enc.id) {
              <option [value]="enc.id">
                {{ getEquipoNombre(enc.equipoLocalId) }} vs {{ getEquipoNombre(enc.equipoVisitanteId) }} (F{{ enc.numeroFecha }})
              </option>
            }
          </select>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div class="text-center">
            <label for="golesLocal" class="block text-sm font-medium text-slate-700 mb-1">Goles Local</label>
            <input id="golesLocal" formControlName="golesLocal" type="number" min="0"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 text-center text-2xl font-bold focus:ring-2 focus:ring-green-500 focus:border-green-500" />
          </div>
          <div class="text-center">
            <label for="golesVisitante" class="block text-sm font-medium text-slate-700 mb-1">Goles Visitante</label>
            <input id="golesVisitante" formControlName="golesVisitante" type="number" min="0"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 text-center text-2xl font-bold focus:ring-2 focus:ring-green-500 focus:border-green-500" />
          </div>
        </div>

        <label class="inline-flex items-center gap-2">
          <input type="checkbox" formControlName="tiempoExtra" class="rounded text-green-600 focus:ring-green-500" />
          <span class="text-sm text-slate-700">Hubo tiempo extra</span>
        </label>

        <div class="grid grid-cols-2 gap-6">
          <div class="text-center">
            <label for="penalesLocal" class="block text-sm font-medium text-slate-700 mb-1">Penales Local</label>
            <input id="penalesLocal" formControlName="penalesLocal" type="number" min="0"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 text-center font-bold focus:ring-2 focus:ring-green-500 focus:border-green-500" />
          </div>
          <div class="text-center">
            <label for="penalesVisitante" class="block text-sm font-medium text-slate-700 mb-1">Penales Visitante</label>
            <input id="penalesVisitante" formControlName="penalesVisitante" type="number" min="0"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 text-center font-bold focus:ring-2 focus:ring-green-500 focus:border-green-500" />
          </div>
        </div>

        <div>
          <label for="estado" class="block text-sm font-medium text-slate-700 mb-1">Estado</label>
          <select id="estado" formControlName="estado"
            class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
            <option value="parcial">Parcial</option>
            <option value="oficial">Oficial</option>
            <option value="cerrado">Cerrado</option>
          </select>
        </div>

        <div>
          <label for="observaciones" class="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
          <textarea id="observaciones" formControlName="observaciones" rows="3"
            class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"></textarea>
        </div>

        <div class="flex gap-3 pt-4">
          <button type="submit" [disabled]="form.invalid"
            class="bg-brand text-white px-6 py-2 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {{ isEdit() ? 'Actualizar' : 'Registrar' }}
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
export class ResultadoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly resultadoService = inject(ResultadoService);
  private readonly encuentroService = inject(EncuentroService);
  private readonly equipoService = inject(EquipoService);

  protected readonly isEdit = signal(false);
  protected readonly encuentros = this.encuentroService.encuentros;
  private editId = '';

  readonly form = this.fb.nonNullable.group({
    encuentroId: ['', Validators.required],
    golesLocal: [0, [Validators.required, Validators.min(0)]],
    golesVisitante: [0, [Validators.required, Validators.min(0)]],
    penalesLocal: [0],
    penalesVisitante: [0],
    tiempoExtra: [false],
    estado: ['parcial' as EstadoResultado],
    observaciones: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const res = this.resultadoService.getById(id);
      if (res) {
        this.isEdit.set(true);
        this.editId = id;
        this.form.patchValue(res);
      }
    }

    const encuentroId = this.route.snapshot.queryParamMap.get('encuentroId');
    if (encuentroId) {
      this.form.patchValue({ encuentroId });
    }
  }

  protected getEquipoNombre(id: string): string {
    return this.equipoService.getEquipoById(id)?.nombre ?? 'Desconocido';
  }

  protected guardar(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();

    if (this.isEdit()) {
      this.resultadoService.update(this.editId, value);
    } else {
      this.resultadoService.create(value);
    }
    this.router.navigate(['/gestion/resultados']);
  }

  protected cancelar(): void {
    this.router.navigate(['/gestion/resultados']);
  }
}
