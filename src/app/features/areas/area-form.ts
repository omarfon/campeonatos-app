import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AreaService } from '../../core/services/area.service';
import { SedeService } from '../../core/services/sede.service';
import { EstadoArea, TipoArea } from '../../core/models/area.model';

@Component({
  selector: 'app-area-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-slate-900">{{ isEdit() ? 'Editar' : 'Nueva' }} Área</h2>
      </div>

      <form [formGroup]="form" (ngSubmit)="guardar()" class="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="nombre" class="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
            <input id="nombre" formControlName="nombre" type="text"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
          </div>
          <div>
            <label for="tipo" class="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
            <select id="tipo" formControlName="tipo"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
              <option value="cancha_futbol">Cancha de fútbol</option>
              <option value="cancha_voley">Cancha de vóley</option>
              <option value="cancha_basquet">Cancha de básquet</option>
              <option value="piscina">Piscina</option>
              <option value="pista_atletismo">Pista de atletismo</option>
              <option value="gimnasio">Gimnasio</option>
              <option value="multiproposito">Multipropósito</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="sedeId" class="block text-sm font-medium text-slate-700 mb-1">Sede</label>
            <select id="sedeId" formControlName="sedeId"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
              <option value="">Sin sede</option>
              @for (sede of sedes(); track sede.id) {
                <option [value]="sede.id">{{ sede.nombre }}</option>
              }
            </select>
          </div>
          <div>
            <label for="estado" class="block text-sm font-medium text-slate-700 mb-1">Estado</label>
            <select id="estado" formControlName="estado"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
              <option value="disponible">Disponible</option>
              <option value="ocupada">Ocupada</option>
              <option value="en_mantenimiento">En mantenimiento</option>
              <option value="fuera_de_servicio">Fuera de servicio</option>
            </select>
          </div>
        </div>

        <div>
          <label for="descripcion" class="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
          <textarea id="descripcion" formControlName="descripcion" rows="2"
            class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"></textarea>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label for="superficie" class="block text-sm font-medium text-slate-700 mb-1">Superficie</label>
            <input id="superficie" formControlName="superficie" type="text" placeholder="Ej: césped natural"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
          </div>
          <div>
            <label for="dimensiones" class="block text-sm font-medium text-slate-700 mb-1">Dimensiones</label>
            <input id="dimensiones" formControlName="dimensiones" type="text" placeholder="Ej: 105m x 68m"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
          </div>
          <div>
            <label for="capacidad" class="block text-sm font-medium text-slate-700 mb-1">Capacidad</label>
            <input id="capacidad" formControlName="capacidad" type="number"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
          </div>
        </div>

        <div class="flex gap-6">
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" formControlName="techada" class="rounded text-green-600 focus:ring-green-500" />
            <span class="text-sm text-slate-700">Techada</span>
          </label>
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" formControlName="iluminacion" class="rounded text-green-600 focus:ring-green-500" />
            <span class="text-sm text-slate-700">Iluminación</span>
          </label>
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
export class AreaFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly areaService = inject(AreaService);
  private readonly sedeService = inject(SedeService);

  protected readonly isEdit = signal(false);
  protected readonly sedes = this.sedeService.items;
  private editId = '';

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    tipo: ['cancha_futbol' as TipoArea, Validators.required],
    sedeId: [''],
    descripcion: [''],
    superficie: [''],
    dimensiones: [''],
    capacidad: [0],
    techada: [false],
    iluminacion: [false],
    estado: ['disponible' as EstadoArea],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const area = this.areaService.getById(id);
      if (area) {
        this.isEdit.set(true);
        this.editId = id;
        this.form.patchValue({
          ...area,
          sedeId: area.sedeId ?? '',
          descripcion: area.descripcion ?? '',
          superficie: area.superficie ?? '',
          dimensiones: area.dimensiones ?? '',
          capacidad: area.capacidad ?? 0,
        });
      }
    }
  }

  protected guardar(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const data = {
      ...value,
      sedeId: value.sedeId || undefined,
      descripcion: value.descripcion || undefined,
      superficie: value.superficie || undefined,
      dimensiones: value.dimensiones || undefined,
      capacidad: value.capacidad || undefined,
    };

    if (this.isEdit()) {
      this.areaService.update(this.editId, data);
    } else {
      this.areaService.create(data);
    }
    this.router.navigate(['/maestros/areas']);
  }

  protected cancelar(): void {
    this.router.navigate(['/maestros/areas']);
  }
}
