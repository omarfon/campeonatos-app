import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TramiteSocietarioService } from '../../core/services/tramite-societario.service';
import { SocioService } from '../../core/services/socio.service';
import { Socio } from '../../core/models/socio.model';
import {
  TIPO_TRAMITE_LABELS,
  TipoTramite,
} from '../../core/models/tramite-societario.model';

@Component({
  selector: 'app-solicitud-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="h-full flex flex-col">
      <!-- Cabecera -->
      <div class="px-6 py-5 border-b border-slate-100">
        <h2 class="text-lg font-semibold text-slate-800">Nueva Solicitud Societaria</h2>
        <p class="mt-0.5 text-sm text-slate-500">Ingrese los datos del trámite para su procesamiento.</p>
      </div>

      <div class="flex-1 overflow-y-auto px-6 py-6 space-y-5">

        <!-- Aviso política -->
        <div class="rounded-lg bg-brand-50 border border-brand-200 p-3 text-xs text-brand-800">
          <strong>Recuerde:</strong> Las solicitudes societarias no son autogestivas. Deben ser
          ingresadas por un operador autorizado y requieren documentación respaldatoria.
        </div>

        <!-- Búsqueda de socio -->
        <div>
          <label for="buscarSocio" class="block text-sm font-medium text-slate-700 mb-1">Buscar socio *</label>
          <input id="buscarSocio" type="search"
            [value]="busqueda()"
            (input)="busqueda.set($any($event.target).value)"
            placeholder="Nombre, apellido o DNI..."
            class="input-modern !text-sm" />
          @if (resultados().length > 0 && !socioSeleccionado()) {
            <ul class="mt-1 rounded-lg border border-slate-200 bg-white shadow-sm divide-y divide-slate-100 max-h-40 overflow-y-auto"
                role="listbox" aria-label="Resultados de búsqueda">
              @for (s of resultados(); track s.id) {
                <li>
                  <button type="button" (click)="seleccionarSocio(s)"
                    class="w-full text-left px-3 py-2 text-sm hover:bg-brand-50 transition-colors">
                    <span class="font-medium text-slate-800">{{ s.apellido }}, {{ s.nombre }}</span>
                    <span class="ml-2 text-slate-400 text-xs">DNI: {{ s.dni }}</span>
                  </button>
                </li>
              }
            </ul>
          }
        </div>

        @if (socioSeleccionado(); as s) {
          <div class="rounded-lg bg-brand-50 border border-brand-100 px-3 py-2 flex items-center justify-between">
            <div class="text-sm">
              <span class="font-semibold text-brand-800">{{ s.apellido }}, {{ s.nombre }}</span>
              <span class="ml-2 text-brand-600 text-xs">DNI: {{ s.dni }}</span>
            </div>
            <button type="button" (click)="limpiarSocio()" class="text-xs text-brand hover:text-brand-700 transition-colors">Cambiar</button>
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="guardar()" id="solicitudForm" class="space-y-5">

          <!-- Tipo de trámite -->
          <div>
            <label for="tipo" class="block text-sm font-medium text-slate-700 mb-1">Tipo de trámite *</label>
            <select id="tipo" formControlName="tipo" class="input-modern !text-sm">
              <option value="">— Seleccione —</option>
              @for (opt of tipoOpts; track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          </div>

          <!-- Descripción -->
          <div>
            <label for="descripcion" class="block text-sm font-medium text-slate-700 mb-1">Descripción *</label>
            <textarea id="descripcion" formControlName="descripcion" rows="3"
              class="input-modern !text-sm"
              placeholder="Describa el motivo o detalle del trámite..."></textarea>
          </div>

          <!-- Vigencia (para suspensiones y cambios) -->
          @if (requiereVigencia()) {
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="vigenciaInicio" class="block text-sm font-medium text-slate-700 mb-1">Inicio vigencia</label>
                <input id="vigenciaInicio" type="date" formControlName="vigenciaInicio" class="input-modern !text-sm" />
              </div>
              <div>
                <label for="vigenciaFin" class="block text-sm font-medium text-slate-700 mb-1">Fin vigencia</label>
                <input id="vigenciaFin" type="date" formControlName="vigenciaFin" class="input-modern !text-sm" />
              </div>
            </div>
          }

          <!-- Documentos adjuntos -->
          <div>
            <p class="text-sm font-medium text-slate-700 mb-2">Documentos adjuntos</p>
            @if (documentos().length > 0) {
              <ul class="space-y-2 mb-3">
                @for (doc of documentos(); track doc; let i = $index) {
                  <li class="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                    <span class="text-slate-700">{{ doc }}</span>
                    <button type="button" (click)="eliminarDocumento(i)"
                      class="text-red-400 hover:text-red-600 text-xs">Quitar</button>
                  </li>
                }
              </ul>
            }
            <div class="flex gap-2">
              <input type="text" class="input-modern flex-1 !text-sm !py-1.5"
                placeholder="Nombre del documento..."
                [value]="nuevoDoc()"
                (input)="nuevoDoc.set($any($event.target).value)" />
              <button type="button"
                class="btn-secondary !text-xs !px-3 !py-1.5"
                (click)="agregarDocumento()"
                [disabled]="!nuevoDoc()">
                Agregar
              </button>
            </div>
          </div>

        </form>
      </div>

      <!-- Footer acciones -->
      <div class="border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
        <button type="button" (click)="cancelar()" class="btn-secondary !text-sm">Cancelar</button>
        <button type="submit" form="solicitudForm"
          [disabled]="form.invalid || !socioSeleccionado()"
          class="btn-primary !text-sm">
          Crear Solicitud
        </button>
      </div>
    </div>
  `,
})
export class SolicitudFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly tramiteService = inject(TramiteSocietarioService);
  private readonly socioService = inject(SocioService);

  protected readonly busqueda = signal('');
  protected readonly socioSeleccionado = signal<Socio | undefined>(undefined);
  protected readonly documentos = signal<string[]>([]);
  protected readonly nuevoDoc = signal('');

  protected readonly tipoOpts = Object.entries(TIPO_TRAMITE_LABELS).map(([value, label]) => ({ value: value as TipoTramite, label }));

  readonly form = this.fb.nonNullable.group({
    tipo: ['' as TipoTramite | '', Validators.required],
    descripcion: ['', Validators.required],
    vigenciaInicio: [''],
    vigenciaFin: [''],
  });

  protected readonly requiereVigencia = computed(() => {
    const tipo = this.form.value.tipo;
    return tipo === 'suspension_viaje' || tipo === 'suspension_salud' || tipo === 'cambio_condicion';
  });

  protected readonly resultados = computed(() => {
    const q = this.busqueda().trim();
    if (!q) return [];
    return this.socioService.buscar(q).slice(0, 8);
  });

  ngOnInit(): void {
    const socioId = this.route.snapshot.queryParamMap.get('socioId');
    if (socioId) {
      const s = this.socioService.getById(socioId);
      if (s) this.socioSeleccionado.set(s);
    }
  }

  protected seleccionarSocio(s: Socio): void {
    this.socioSeleccionado.set(s);
    this.busqueda.set('');
  }

  protected limpiarSocio(): void {
    this.socioSeleccionado.set(undefined);
  }

  protected agregarDocumento(): void {
    const doc = this.nuevoDoc().trim();
    if (!doc) return;
    this.documentos.update((list) => [...list, doc]);
    this.nuevoDoc.set('');
  }

  protected eliminarDocumento(index: number): void {
    this.documentos.update((list) => list.filter((_, i) => i !== index));
  }

  protected guardar(): void {
    const socio = this.socioSeleccionado();
    if (!socio || this.form.invalid) return;
    const v = this.form.getRawValue();
    const hoy = new Date().toISOString().split('T')[0];

    this.tramiteService.crearSolicitud({
      socioId: socio.id,
      tipo: v.tipo as TipoTramite,
      estado: 'enviada',
      fechaCreacion: hoy,
      descripcion: v.descripcion,
      documentos: this.documentos().map((nombre, i) => ({
        id: `doc-${Date.now()}-${i}`,
        nombre,
        tipo: 'pdf',
        url: `/docs/${nombre.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        cargadoEn: hoy,
        cargadoPor: 'Operador Mesa',
      })),
      vigenciaInicio: v.vigenciaInicio || undefined,
      vigenciaFin: v.vigenciaFin || undefined,
      operador: 'Operador Mesa',
    });

    this.router.navigate(['/', { outlets: { panel: null } }], {
      queryParamsHandling: 'merge',
    });
  }

  protected cancelar(): void {
    this.router.navigate(['/', { outlets: { panel: null } }], {
      queryParamsHandling: 'merge',
    });
  }
}
