import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AcademiaService } from '../../core/services/academia.service';
import { TIPO_BLOQUEO_INSTITUCIONAL_LABELS, TipoBloqueoInstitucional } from '../../core/models/academia.model';

@Component({
  selector: 'app-ambiente-config',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <a routerLink="/academia/cursos" class="text-green-600 hover:text-green-800 text-sm">&larr; Volver al árbol</a>
          <h2 class="text-2xl font-bold text-slate-900 mt-1">Control de Ambientes y Zonas</h2>
          <p class="text-slate-500 mt-1">Configure locaciones con aforo físico, aforo pedagógico y cupo comodín.</p>
        </div>
        <a
          routerLink="/academia/calendario"
          class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          📅 Ver calendario
        </a>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-6">
        <section class="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 class="text-lg font-semibold text-slate-900">Nuevo ambiente</h3>

          @if (errorAforo()) {
            <div class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {{ errorAforo() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="guardar()" class="space-y-4">
            <div>
              <label for="nombre" class="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input id="nombre" formControlName="nombre" type="text"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label for="zona" class="block text-sm font-medium text-slate-700 mb-1">Zona</label>
                <input id="zona" formControlName="zona" type="text"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label for="tipo" class="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                <input id="tipo" formControlName="tipo" type="text"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label for="aforoFisico" class="block text-sm font-medium text-slate-700 mb-1">Aforo físico</label>
                <input id="aforoFisico" formControlName="aforoFisico" type="number" min="1"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label for="aforoPedagogico" class="block text-sm font-medium text-slate-700 mb-1">Aforo pedagógico</label>
                <input id="aforoPedagogico" formControlName="aforoPedagogico" type="number" min="1"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label for="aforoComodin" class="block text-sm font-medium text-slate-700 mb-1">Cupo comodín</label>
                <input id="aforoComodin" formControlName="aforoComodin" type="number" min="0"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500" />
              </div>
            </div>

            <button type="submit" [disabled]="form.invalid"
              class="w-full rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50">
              Guardar ambiente
            </button>
          </form>
        </section>

        <section class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-900">Ambientes configurados</h3>
            <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{{ ambientesOrdenados().length }}</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="bg-slate-50 border-b">
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Ambiente</th>
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Zona</th>
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Tipo</th>
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Físico</th>
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Pedagógico</th>
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Comodín</th>
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Regular</th>
                  <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (ambiente of ambientesOrdenados(); track ambiente.id) {
                  <tr class="hover:bg-slate-50">
                    <td class="px-4 py-3 font-medium text-slate-800">{{ ambiente.nombre }}</td>
                    <td class="px-4 py-3 text-slate-600">{{ ambiente.zona }}</td>
                    <td class="px-4 py-3 text-slate-600">{{ ambiente.tipo }}</td>
                    <td class="px-4 py-3 text-slate-700">{{ ambiente.aforoFisico }}</td>
                    <td class="px-4 py-3 text-slate-700">{{ ambiente.aforoPedagogico }}</td>
                    <td class="px-4 py-3 text-slate-700">{{ ambiente.aforoComodin }}</td>
                    <td class="px-4 py-3 text-green-700 font-semibold">{{ aforoRegular(ambiente.id) }}</td>
                    <td class="px-4 py-3">
                      <button type="button" (click)="eliminar(ambiente.id)" class="text-sm font-medium text-red-600 hover:text-red-700">Eliminar</button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8" class="px-4 py-8 text-center text-slate-500">No hay ambientes registrados.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section class="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">Bloqueos institucionales</h3>
            <p class="text-sm text-slate-500 mt-1">Registre feriados y eventos internos para bloquear programación académica.</p>
          </div>
          <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{{ bloqueosOrdenados().length }}</span>
        </div>

        <form [formGroup]="bloqueoForm" (ngSubmit)="guardarBloqueo()" class="grid grid-cols-1 lg:grid-cols-5 gap-3">
          <div>
            <label for="bloqFecha" class="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
            <input id="bloqFecha" formControlName="fecha" type="date"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label for="bloqTipo" class="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
            <select id="bloqTipo" formControlName="tipo"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500">
              @for (item of tiposBloqueo; track item.key) {
                <option [value]="item.key">{{ item.label }}</option>
              }
            </select>
          </div>
          <div>
            <label for="bloqZona" class="block text-sm font-medium text-slate-700 mb-1">Zona <span class="text-slate-400">(opcional)</span></label>
            <input id="bloqZona" formControlName="zona" type="text" placeholder="Todas"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500" />
          </div>
          <div class="lg:col-span-2">
            <label for="bloqMotivo" class="block text-sm font-medium text-slate-700 mb-1">Motivo</label>
            <input id="bloqMotivo" formControlName="motivo" type="text"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500" />
          </div>
          <div class="lg:col-span-5">
            <button type="submit" [disabled]="bloqueoForm.invalid"
              class="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
              Registrar bloqueo institucional
            </button>
          </div>
        </form>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="bg-slate-50 border-b">
                <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Fecha</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Tipo</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Zona</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Motivo</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (bloqueo of bloqueosOrdenados(); track bloqueo.id) {
                <tr class="hover:bg-slate-50">
                  <td class="px-4 py-3 text-slate-700">{{ bloqueo.fecha }}</td>
                  <td class="px-4 py-3 text-slate-700">{{ tipoBloqueoLabel(bloqueo.tipo) }}</td>
                  <td class="px-4 py-3 text-slate-600">{{ bloqueo.zona || 'Todas las zonas' }}</td>
                  <td class="px-4 py-3 text-slate-700">{{ bloqueo.motivo }}</td>
                  <td class="px-4 py-3">
                    <button type="button" (click)="eliminarBloqueo(bloqueo.id)" class="text-sm font-medium text-red-600 hover:text-red-700">Eliminar</button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-4 py-8 text-center text-slate-500">No hay bloqueos institucionales registrados.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
})
export class AmbienteConfigComponent {
  private readonly fb = inject(FormBuilder);
  private readonly academiaService = inject(AcademiaService);

  protected readonly errorAforo = signal<string | null>(null);
  protected readonly tiposBloqueo = Object.entries(TIPO_BLOQUEO_INSTITUCIONAL_LABELS).map(([key, label]) => ({
    key: key as TipoBloqueoInstitucional,
    label,
  }));
  protected readonly ambientesOrdenados = computed(() =>
    this.academiaService
      .ambientes()
      .slice()
      .sort((a, b) => a.zona.localeCompare(b.zona) || a.nombre.localeCompare(b.nombre))
  );
  protected readonly bloqueosOrdenados = computed(() =>
    this.academiaService
      .bloqueosInstitucionales()
      .slice()
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
  );

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    zona: ['', Validators.required],
    tipo: ['', Validators.required],
    aforoFisico: [20, [Validators.required, Validators.min(1)]],
    aforoPedagogico: [15, [Validators.required, Validators.min(1)]],
    aforoComodin: [2, [Validators.required, Validators.min(0)]],
  });

  readonly bloqueoForm = this.fb.nonNullable.group({
    fecha: ['', Validators.required],
    tipo: ['feriado' as TipoBloqueoInstitucional, Validators.required],
    motivo: ['', Validators.required],
    zona: [''],
  });

  protected guardar(): void {
    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    if (value.aforoPedagogico > value.aforoFisico) {
      this.errorAforo.set('El aforo pedagógico no puede superar el aforo físico.');
      return;
    }

    if (value.aforoComodin >= value.aforoPedagogico) {
      this.errorAforo.set('El aforo comodín debe ser menor que el aforo pedagógico.');
      return;
    }

    this.errorAforo.set(null);
    this.academiaService.createAmbiente(value);
    this.form.reset({
      nombre: '',
      zona: '',
      tipo: '',
      aforoFisico: 20,
      aforoPedagogico: 15,
      aforoComodin: 2,
    });
  }

  protected aforoRegular(ambienteId: string): number {
    return this.academiaService.getAforoRegularDisponibleAmbiente(ambienteId);
  }

  protected eliminar(ambienteId: string): void {
    const claseAsociada = this.academiaService.clases().some(clase => clase.ambienteId === ambienteId);
    if (claseAsociada) {
      this.errorAforo.set('No se puede eliminar un ambiente que ya está asignado a clases.');
      return;
    }

    this.errorAforo.set(null);
    this.academiaService.deleteAmbiente(ambienteId);
  }

  protected guardarBloqueo(): void {
    if (this.bloqueoForm.invalid) {
      return;
    }

    const value = this.bloqueoForm.getRawValue();
    this.academiaService.createBloqueoInstitucional({
      fecha: value.fecha,
      tipo: value.tipo,
      motivo: value.motivo,
      zona: value.zona || undefined,
    });

    this.bloqueoForm.reset({
      fecha: '',
      tipo: 'feriado',
      motivo: '',
      zona: '',
    });
  }

  protected eliminarBloqueo(id: string): void {
    this.academiaService.deleteBloqueoInstitucional(id);
  }

  protected tipoBloqueoLabel(tipo: TipoBloqueoInstitucional): string {
    return TIPO_BLOQUEO_INSTITUCIONAL_LABELS[tipo];
  }
}
