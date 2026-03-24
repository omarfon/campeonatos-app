import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { SedeService } from '../../core/services/sede.service';
import { DisciplinaService } from '../../core/services/disciplina.service';
import { EstadoSede } from '../../core/models/sede.model';

@Component({
  selector: 'app-sede-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-3xl mx-auto">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-slate-900">{{ isEdit() ? 'Editar' : 'Nueva' }} Sede</h2>
      </div>

      <form [formGroup]="form" (ngSubmit)="guardar()" class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 class="text-lg font-semibold text-slate-900">Datos de la sede</h3>

          <div>
            <label for="nombre" class="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
            <input id="nombre" formControlName="nombre" type="text"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
          </div>

          <div>
            <label for="direccion" class="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
            <input id="direccion" formControlName="direccion" type="text"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label for="telefono" class="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
              <input id="telefono" formControlName="telefono" type="text"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input id="email" formControlName="email" type="email"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label for="estado" class="block text-sm font-medium text-slate-700 mb-1">Estado</label>
              <select id="estado" formControlName="estado"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                <option value="activa">Activa</option>
                <option value="inactiva">Inactiva</option>
                <option value="en_mantenimiento">En mantenimiento</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Campos -->
        @if (isEdit()) {
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-slate-900">Campos</h3>
              <button type="button" (click)="addCampo()"
                class="text-green-600 hover:text-green-800 text-sm font-medium">+ Agregar campo</button>
            </div>

            <div formArrayName="campos" class="space-y-3">
              @for (campo of camposArray.controls; track $index) {
                <div [formGroupName]="$index" class="border rounded-lg p-4 bg-slate-50">
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <input formControlName="nombre" placeholder="Nombre del campo"
                      class="rounded border-slate-300 border px-2 py-1.5 text-sm focus:ring-2 focus:ring-green-500" />
                    <input formControlName="capacidad" placeholder="Capacidad" type="number"
                      class="rounded border-slate-300 border px-2 py-1.5 text-sm focus:ring-2 focus:ring-green-500" />
                    <div class="flex gap-2 items-center">
                      <input formControlName="superficie" placeholder="Superficie"
                        class="flex-1 rounded border-slate-300 border px-2 py-1.5 text-sm focus:ring-2 focus:ring-green-500" />
                      <button type="button" (click)="removeCampo($index)"
                        class="text-red-500 hover:text-red-700 px-2" aria-label="Eliminar campo">✕</button>
                    </div>
                  </div>
                  <div class="mt-2">
                    <p class="text-xs text-slate-500 mb-1">Disciplinas</p>
                    <div class="flex flex-wrap gap-2">
                      @for (disc of disciplinas(); track disc.id) {
                        <label class="inline-flex items-center gap-1 text-xs">
                          <input type="checkbox" class="rounded text-green-600 focus:ring-green-500"
                            [checked]="isCampoDisciplina($index, disc.id)"
                            (change)="toggleCampoDisciplina($index, disc.id)" />
                          {{ disc.nombre }}
                        </label>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <div class="flex gap-3">
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
export class SedeFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly sedeService = inject(SedeService);
  private readonly disciplinaService = inject(DisciplinaService);

  protected readonly isEdit = signal(false);
  protected readonly disciplinas = this.disciplinaService.items;
  private editId = '';

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    direccion: ['', Validators.required],
    telefono: [''],
    email: [''],
    estado: ['activa' as EstadoSede],
    campos: this.fb.array<FormGroup>([]),
  });

  get camposArray(): FormArray<FormGroup> {
    return this.form.controls.campos;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const sede = this.sedeService.getById(id);
      if (sede) {
        this.isEdit.set(true);
        this.editId = id;
        this.form.patchValue(sede);
        sede.campos.forEach((c) => {
          this.camposArray.push(
            this.fb.group({
              nombre: [c.nombre],
              capacidad: [c.capacidad],
              superficie: [c.superficie ?? ''],
              disciplinaIds: [c.disciplinaIds],
            })
          );
        });
      }
    }
  }

  protected addCampo(): void {
    this.camposArray.push(
      this.fb.group({
        nombre: ['', Validators.required],
        capacidad: [null as number | null],
        superficie: [''],
        disciplinaIds: [[] as string[]],
      })
    );
  }

  protected removeCampo(index: number): void {
    this.camposArray.removeAt(index);
  }

  protected isCampoDisciplina(campoIndex: number, disciplinaId: string): boolean {
    const ids = this.camposArray.at(campoIndex).get('disciplinaIds')?.value as string[];
    return ids?.includes(disciplinaId) ?? false;
  }

  protected toggleCampoDisciplina(campoIndex: number, disciplinaId: string): void {
    const control = this.camposArray.at(campoIndex).get('disciplinaIds');
    const ids = (control?.value as string[]) ?? [];
    if (ids.includes(disciplinaId)) {
      control?.setValue(ids.filter((id) => id !== disciplinaId));
    } else {
      control?.setValue([...ids, disciplinaId]);
    }
  }

  protected guardar(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();

    if (this.isEdit()) {
      this.sedeService.update(this.editId, {
        nombre: value.nombre,
        direccion: value.direccion,
        telefono: value.telefono || undefined,
        email: value.email || undefined,
        estado: value.estado,
      });
    } else {
      this.sedeService.create({
        nombre: value.nombre,
        direccion: value.direccion,
        telefono: value.telefono || undefined,
        email: value.email || undefined,
        estado: value.estado,
      });
    }
    this.router.navigate(['/maestros/sedes']);
  }

  protected cancelar(): void {
    this.router.navigate(['/maestros/sedes']);
  }
}
