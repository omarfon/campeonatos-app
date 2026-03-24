import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SancionService } from '../../core/services/sancion.service';

@Component({
  selector: 'app-resolucion-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-slate-900">Resolución de Comisión</h2>
      </div>

      <form [formGroup]="form" (ngSubmit)="guardar()" class="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <label for="resolucion" class="block text-sm font-medium text-slate-700 mb-1">Resolución</label>
          <textarea id="resolucion" formControlName="resolucion" rows="4"
            class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"></textarea>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="dictamen" class="block text-sm font-medium text-slate-700 mb-1">Dictamen</label>
            <select id="dictamen" formControlName="dictamen"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
              <option value="confirmada">Confirmada</option>
              <option value="reducida">Reducida</option>
              <option value="revocada">Revocada</option>
              <option value="ampliada">Ampliada</option>
            </select>
          </div>
          <div>
            <label for="fecha" class="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
            <input id="fecha" formControlName="fecha" type="date"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
          </div>
        </div>

        <div>
          <label for="miembros" class="block text-sm font-medium text-slate-700 mb-1">Miembros de la comisión (separados por coma)</label>
          <input id="miembros" formControlName="miembrosComision" type="text"
            class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Juan Pérez, María García, ..." />
        </div>

        <div class="flex gap-3 pt-4">
          <button type="submit" [disabled]="form.invalid"
            class="bg-brand text-white px-6 py-2 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Registrar Resolución
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
export class ResolucionFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly sancionService = inject(SancionService);

  readonly form = this.fb.nonNullable.group({
    resolucion: ['', Validators.required],
    dictamen: ['confirmada' as 'confirmada' | 'reducida' | 'revocada' | 'ampliada'],
    fecha: ['', Validators.required],
    miembrosComision: ['', Validators.required],
  });

  protected guardar(): void {
    if (this.form.invalid) return;
    const sancionId = this.route.snapshot.queryParamMap.get('sancionId');
    if (!sancionId) return;

    const value = this.form.getRawValue();
    this.sancionService.addResolucion({
      sancionId,
      resolucion: value.resolucion,
      dictamen: value.dictamen,
      fecha: value.fecha,
      miembrosComision: value.miembrosComision.split(',').map((m) => m.trim()),
    });
    this.router.navigate(['/gestion/sanciones']);
  }

  protected cancelar(): void {
    this.router.navigate(['/gestion/sanciones']);
  }
}
