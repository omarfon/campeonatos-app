import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { DisciplinaService } from '../../core/services/disciplina.service';
import { TipoPlanilla } from '../../core/models/disciplina.model';

@Component({
  selector: 'app-disciplina-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-slate-900">{{ isEdit() ? 'Editar' : 'Nueva' }} Disciplina</h2>
      </div>

      <form [formGroup]="form" (ngSubmit)="guardar()" class="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <label for="nombre" class="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
          <input id="nombre" formControlName="nombre" type="text"
            class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
        </div>

        <div>
          <label for="descripcion" class="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
          <textarea id="descripcion" formControlName="descripcion" rows="2"
            class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"></textarea>
        </div>

        <div>
          <label for="tipoPlanilla" class="block text-sm font-medium text-slate-700 mb-1">Tipo de Planilla</label>
          <select id="tipoPlanilla" formControlName="tipoPlanilla"
            class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
            <option value="futbol">Fútbol</option>
            <option value="voley">Vóley</option>
            <option value="basquet">Básquet</option>
            <option value="atletismo">Atletismo</option>
            <option value="general">General</option>
          </select>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="minJugadores" class="block text-sm font-medium text-slate-700 mb-1">Mín. Jugadores</label>
            <input id="minJugadores" formControlName="minJugadoresPorEquipo" type="number"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
          </div>
          <div>
            <label for="maxJugadores" class="block text-sm font-medium text-slate-700 mb-1">Máx. Jugadores</label>
            <input id="maxJugadores" formControlName="maxJugadoresPorEquipo" type="number"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
          </div>
        </div>

        <div>
          <label for="duracion" class="block text-sm font-medium text-slate-700 mb-1">Duración partido (min)</label>
          <input id="duracion" formControlName="duracionPartidoMinutos" type="number"
            class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
        </div>

        <div class="flex gap-6">
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" formControlName="tiemposExtra" class="rounded text-green-600 focus:ring-green-500" />
            <span class="text-sm text-slate-700">Tiempos extra</span>
          </label>
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" formControlName="penales" class="rounded text-green-600 focus:ring-green-500" />
            <span class="text-sm text-slate-700">Penales</span>
          </label>
        </div>

        <!-- Reglas -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-medium text-slate-700">Reglas</h3>
            <button type="button" (click)="addRegla()"
              class="text-green-600 hover:text-green-800 text-sm font-medium">+ Agregar regla</button>
          </div>
          <div formArrayName="reglas" class="space-y-3">
            @for (regla of reglasArray.controls; track $index) {
              <div [formGroupName]="$index" class="border rounded-lg p-3 bg-slate-50">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input formControlName="nombre" placeholder="Nombre" class="rounded border-slate-300 border px-2 py-1 text-sm focus:ring-2 focus:ring-green-500" />
                  <input formControlName="descripcion" placeholder="Descripción" class="rounded border-slate-300 border px-2 py-1 text-sm focus:ring-2 focus:ring-green-500" />
                  <div class="flex gap-2">
                    <input formControlName="valor" placeholder="Valor" class="flex-1 rounded border-slate-300 border px-2 py-1 text-sm focus:ring-2 focus:ring-green-500" />
                    <button type="button" (click)="removeRegla($index)"
                      class="text-red-500 hover:text-red-700 text-sm px-2" aria-label="Eliminar regla">✕</button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <div class="flex gap-3 pt-4">
          <button type="submit" [disabled]="form.invalid"
            class="bg-brand text-white px-6 py-2 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {{ isEdit() ? 'Actualizar' : 'Crear' }}
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
export class DisciplinaFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly disciplinaService = inject(DisciplinaService);

  protected readonly isEdit = signal(false);
  private editId = '';

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    tipoPlanilla: ['general' as TipoPlanilla],
    minJugadoresPorEquipo: [1, [Validators.required, Validators.min(1)]],
    maxJugadoresPorEquipo: [25, [Validators.required, Validators.min(1)]],
    duracionPartidoMinutos: [0],
    tiemposExtra: [false],
    penales: [false],
    reglas: this.fb.array<FormGroup>([]),
  });

  get reglasArray(): FormArray<FormGroup> {
    return this.form.controls.reglas;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const disc = this.disciplinaService.getById(id);
      if (disc) {
        this.isEdit.set(true);
        this.editId = id;
        this.form.patchValue(disc);
        disc.reglas.forEach((r) => {
          this.reglasArray.push(
            this.fb.group({
              nombre: [r.nombre],
              descripcion: [r.descripcion],
              valor: [r.valor],
            })
          );
        });
      }
    }
  }

  protected addRegla(): void {
    this.reglasArray.push(
      this.fb.group({ nombre: [''], descripcion: [''], valor: [''] })
    );
  }

  protected removeRegla(index: number): void {
    this.reglasArray.removeAt(index);
  }

  protected guardar(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const data = {
      ...value,
      reglas: value.reglas.map((r) => ({
        id: crypto.randomUUID(),
        disciplinaId: this.editId || '',
        nombre: (r as Record<string, string>)['nombre'] ?? '',
        descripcion: (r as Record<string, string>)['descripcion'] ?? '',
        valor: (r as Record<string, string>)['valor'] ?? '',
      })),
    };

    if (this.isEdit()) {
      this.disciplinaService.update(this.editId, data);
    } else {
      this.disciplinaService.create(data as Parameters<DisciplinaService['create']>[0]);
    }
    this.router.navigate(['/maestros/disciplinas']);
  }

  protected cancelar(): void {
    this.router.navigate(['/maestros/disciplinas']);
  }
}
