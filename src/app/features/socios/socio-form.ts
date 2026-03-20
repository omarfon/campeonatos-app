import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SocioService } from '../../core/services/socio.service';
import { EstadoSocio } from '../../core/models/socio.model';

@Component({
  selector: 'app-socio-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-slate-900">{{ isEdit() ? 'Editar' : 'Nuevo' }} Socio</h2>
      </div>

      <form [formGroup]="form" (ngSubmit)="guardar()" class="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="nombre" class="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
            <input id="nombre" formControlName="nombre" type="text"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label for="apellido" class="block text-sm font-medium text-slate-700 mb-1">Apellido</label>
            <input id="apellido" formControlName="apellido" type="text"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="dni" class="block text-sm font-medium text-slate-700 mb-1">DNI</label>
            <input id="dni" formControlName="dni" type="text"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label for="fechaNacimiento" class="block text-sm font-medium text-slate-700 mb-1">Fecha de nacimiento</label>
            <input id="fechaNacimiento" formControlName="fechaNacimiento" type="date"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input id="email" formControlName="email" type="email"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label for="telefono" class="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
            <input id="telefono" formControlName="telefono" type="text"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
        </div>

        <div>
          <label for="direccion" class="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
          <input id="direccion" formControlName="direccion" type="text"
            class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="estado" class="block text-sm font-medium text-slate-700 mb-1">Estado</label>
            <select id="estado" formControlName="estado"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="suspendido">Suspendido</option>
            </select>
          </div>
          <div>
            <label for="fechaAlta" class="block text-sm font-medium text-slate-700 mb-1">Fecha de alta</label>
            <input id="fechaAlta" formControlName="fechaAlta" type="date"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
        </div>

        <div>
          <label for="observaciones" class="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
          <textarea id="observaciones" formControlName="observaciones" rows="3"
            class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
        </div>

        <div class="flex gap-3 pt-4">
          <button type="submit" [disabled]="form.invalid"
            class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
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
export class SocioFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly socioService = inject(SocioService);

  protected readonly isEdit = signal(false);
  private editId = '';

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    dni: ['', Validators.required],
    email: [''],
    telefono: [''],
    fechaNacimiento: [''],
    direccion: [''],
    estado: ['activo' as EstadoSocio],
    fechaAlta: [new Date().toISOString().split('T')[0], Validators.required],
    observaciones: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const socio = this.socioService.getById(id);
      if (socio) {
        this.isEdit.set(true);
        this.editId = id;
        this.form.patchValue({
          ...socio,
          email: socio.email ?? '',
          telefono: socio.telefono ?? '',
          fechaNacimiento: socio.fechaNacimiento ?? '',
          direccion: socio.direccion ?? '',
          observaciones: socio.observaciones ?? '',
        });
      }
    }
  }

  protected guardar(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const data = {
      ...value,
      email: value.email || undefined,
      telefono: value.telefono || undefined,
      fechaNacimiento: value.fechaNacimiento || undefined,
      direccion: value.direccion || undefined,
      observaciones: value.observaciones || undefined,
    };

    if (this.isEdit()) {
      this.socioService.update(this.editId, data);
    } else {
      this.socioService.create(data);
    }
    this.router.navigate(['/maestros/socios']);
  }

  protected cancelar(): void {
    this.router.navigate(['/maestros/socios']);
  }
}
