import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ConvenioService } from '../../core/services/convenio.service';
import { SocioService } from '../../core/services/socio.service';
import { BeneficiarioConvenio } from '../../core/models/convenio.model';
import { CONDICION_CLIENTE_LABELS, CondicionCliente } from '../../core/models/tarifa.model';

@Component({
  selector: 'app-convenio-beneficiarios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <div>
          <h2 class="text-lg font-semibold text-slate-800">Beneficiarios del Convenio</h2>
          @if (convenio()) {
            <p class="text-xs text-slate-500">{{ convenio()!.empresa }}</p>
          }
        </div>
        <button
          class="text-slate-400 hover:text-slate-600 transition-colors"
          (click)="cerrar()"
          aria-label="Cerrar panel"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-5">
        <!-- Lista actual -->
        <div>
          <h3 class="text-sm font-semibold text-slate-700 mb-3">
            Beneficiarios registrados ({{ beneficiarios().length }})
          </h3>
          @if (beneficiarios().length === 0) {
            <p class="text-sm text-slate-400 italic">Sin beneficiarios cargados aún.</p>
          }
          <div class="space-y-2">
            @for (b of beneficiarios(); track b.id) {
              <div class="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
                <div>
                  <p class="text-sm font-medium text-slate-800">{{ b.nombreSocio }}</p>
                  <p class="text-xs text-slate-500">DNI: {{ b.dniSocio }} · {{ condicionLabel(b.condicionEnConvenio) }}</p>
                  <p class="text-xs text-slate-400">Registrado: {{ b.fechaRegistro }}</p>
                </div>
                <div class="flex items-center gap-3">
                  <span
                    class="px-2 py-0.5 rounded-full text-xs font-medium"
                    [class.bg-emerald-100]="b.activo"
                    [class.text-emerald-700]="b.activo"
                    [class.bg-slate-100]="!b.activo"
                    [class.text-slate-500]="!b.activo"
                  >
                    {{ b.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                  <button
                    class="text-xs text-slate-500 hover:text-slate-700 underline transition-colors"
                    (click)="svc.toggleBeneficiario(b.id)"
                  >
                    {{ b.activo ? 'Desactivar' : 'Activar' }}
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Agregar beneficiario -->
        <div class="border border-dashed border-slate-300 rounded-xl p-4 space-y-4">
          <h3 class="text-sm font-semibold text-slate-700">+ Agregar Beneficiario</h3>

          <!-- Búsqueda de socio -->
          <div class="space-y-1">
            <label for="busqueda" class="block text-xs font-medium text-slate-600">Buscar socio por nombre o DNI</label>
            <input
              id="busqueda"
              type="text"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
              placeholder="Mínimo 2 caracteres..."
              [value]="busqueda()"
              (input)="busqueda.set($any($event.target).value)"
            />
          </div>

          @if (resultadosBusqueda().length > 0 && !socioSeleccionado()) {
            <ul class="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100" role="listbox" aria-label="Resultados de búsqueda">
              @for (s of resultadosBusqueda(); track s.id) {
                <li>
                  <button
                    type="button"
                    role="option"
                    [attr.aria-selected]="false"
                    class="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors"
                    (click)="seleccionarSocio(s)"
                  >
                    <span class="font-medium text-slate-800">{{ s.apellido }}, {{ s.nombre }}</span>
                    <span class="text-slate-400 ml-2">DNI: {{ s.dni }}</span>
                  </button>
                </li>
              }
            </ul>
          }

          @if (socioSeleccionado(); as socio) {
            <div class="bg-cyan-50 rounded-lg px-4 py-3 flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-cyan-800">{{ socio.apellido }}, {{ socio.nombre }}</p>
                <p class="text-xs text-cyan-600">DNI: {{ socio.dni }}</p>
              </div>
              <button class="text-xs text-cyan-500 hover:text-cyan-700" (click)="limpiarSocio()">Cambiar</button>
            </div>

            <!-- Condición en el convenio -->
            <div class="space-y-1">
              <label for="condicion" class="block text-xs font-medium text-slate-600">Condición dentro del convenio</label>
              <select
                id="condicion"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                [value]="condicionSeleccionada()"
                (change)="condicionSeleccionada.set($any($event.target).value)"
              >
                @for (c of condiciones; track c.value) {
                  <option [value]="c.value">{{ c.label }}</option>
                }
              </select>
            </div>

            <button
              class="px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors"
              (click)="agregar()"
            >
              Registrar Beneficiario
            </button>
          }
        </div>
      </div>
    </div>
  `,
})
export class ConvenioBeneficiariosComponent implements OnInit {
  protected readonly svc = inject(ConvenioService);
  private readonly socioService = inject(SocioService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly convenioId = signal<string | null>(null);
  readonly convenio = computed(() => {
    const id = this.convenioId();
    return id ? this.svc.getById(id) : undefined;
  });

  readonly beneficiarios = computed(() => {
    const id = this.convenioId();
    return id ? this.svc.getBeneficiariosByConvenio(id) : [];
  });

  readonly busqueda = signal('');
  readonly socioSeleccionado = signal<{ id: string; nombre: string; apellido: string; dni: string } | null>(null);
  readonly condicionSeleccionada = signal<CondicionCliente>('no_socio');

  readonly resultadosBusqueda = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    if (q.length < 2) return [];
    return this.socioService
      .items()
      .filter(
        (s) =>
          s.nombre.toLowerCase().includes(q) ||
          s.apellido.toLowerCase().includes(q) ||
          s.dni.includes(q),
      )
      .slice(0, 6);
  });

  protected readonly condiciones: { value: CondicionCliente; label: string }[] = [
    { value: 'socio', label: CONDICION_CLIENTE_LABELS.socio },
    { value: 'dependiente', label: CONDICION_CLIENTE_LABELS.dependiente },
    { value: 'no_socio', label: CONDICION_CLIENTE_LABELS.no_socio },
    { value: 'trabajador', label: CONDICION_CLIENTE_LABELS.trabajador },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.convenioId.set(id);
  }

  seleccionarSocio(s: { id: string; nombre: string; apellido: string; dni: string }): void {
    this.socioSeleccionado.set(s);
    this.busqueda.set('');
  }

  limpiarSocio(): void {
    this.socioSeleccionado.set(null);
  }

  agregar(): void {
    const convenioId = this.convenioId();
    const socio = this.socioSeleccionado();
    if (!convenioId || !socio) return;
    this.svc.agregarBeneficiario({
      convenioId,
      socioId: socio.id,
      nombreSocio: `${socio.apellido}, ${socio.nombre}`,
      dniSocio: socio.dni,
      condicionEnConvenio: this.condicionSeleccionada(),
      activo: true,
    });
    this.socioSeleccionado.set(null);
    this.busqueda.set('');
  }

  condicionLabel(c: string): string {
    return CONDICION_CLIENTE_LABELS[c as keyof typeof CONDICION_CLIENTE_LABELS] ?? c;
  }

  cerrar(): void {
    this.router.navigate(['/', { outlets: { panel: null } }]);
  }
}
