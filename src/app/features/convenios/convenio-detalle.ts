import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ConvenioService } from '../../core/services/convenio.service';
import { AcademiaService } from '../../core/services/academia.service';
import {
  Convenio,
  ReglaBeneficio,
  TipoBeneficio,
  TIPO_BENEFICIO_LABELS,
  ESTADO_CONVENIO_LABELS,
} from '../../core/models/convenio.model';
import {
  CondicionCliente,
  CONDICION_CLIENTE_LABELS,
} from '../../core/models/tarifa.model';

@Component({
  selector: 'app-convenio-detalle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="flex flex-col h-full">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <div>
          <h2 class="text-lg font-semibold text-slate-800">
            {{ convenio()?.nombre ?? 'Convenio' }}
          </h2>
          <p class="text-xs text-slate-500">Configuración de reglas de beneficio</p>
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

      @if (convenio(); as c) {
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <!-- Datos generales -->
          <div class="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-500">Empresa</span>
              <span class="font-medium text-slate-800">{{ c.empresa }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Vigencia</span>
              <span class="font-medium text-slate-800">{{ c.fechaInicio }} → {{ c.fechaFin }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Estado</span>
              <span class="font-medium text-slate-800">{{ estadoLabel(c.estado) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Acumula con campaña</span>
              <span [class.text-emerald-600]="c.acumularConCampana" [class.text-orange-600]="!c.acumularConCampana" class="font-medium">
                {{ c.acumularConCampana ? 'Sí' : 'No — sistema elige el mejor' }}
              </span>
            </div>
          </div>

          <!-- Acciones de estado -->
          <div class="flex gap-2">
            @if (c.estado !== 'activo') {
              <button
                class="px-3 py-1.5 rounded-lg text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                (click)="svc.cambiarEstado(c.id, 'activo')"
              >
                Activar
              </button>
            }
            @if (c.estado !== 'suspendido') {
              <button
                class="px-3 py-1.5 rounded-lg text-xs bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                (click)="svc.cambiarEstado(c.id, 'suspendido')"
              >
                Suspender
              </button>
            }
            @if (c.estado !== 'vencido') {
              <button
                class="px-3 py-1.5 rounded-lg text-xs bg-slate-400 text-white hover:bg-slate-500 transition-colors"
                (click)="svc.cambiarEstado(c.id, 'vencido')"
              >
                Marcar como Vencido
              </button>
            }
          </div>

          <!-- Reglas actuales -->
          <div>
            <h3 class="text-sm font-semibold text-slate-700 mb-3">Reglas de Beneficio</h3>
            @if (c.reglasBeneficios.length === 0) {
              <p class="text-sm text-slate-400 italic">Sin reglas. Agrega la primera abajo.</p>
            }
            <div class="space-y-2">
              @for (r of c.reglasBeneficios; track r.id) {
                <div class="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
                  <div class="text-sm">
                    <span class="font-medium text-slate-800">{{ condicionLabel(r.condicionCliente) }}</span>
                    <span class="text-slate-400 mx-2">→</span>
                    <span class="text-slate-700">{{ tipoBeneficioLabel(r.tipo) }}</span>
                    @if (r.tipo === 'descuento_porcentaje') {
                      <span class="ml-2 font-bold text-cyan-700">{{ r.valor }}%</span>
                    } @else if (r.tipo === 'tarifa_neta') {
                      <span class="ml-2 font-bold text-cyan-700">S/ {{ r.valor.toFixed(2) }}</span>
                    }
                    <span class="ml-2 text-xs text-slate-400">
                      {{ r.cursoIds.length === 0 ? '(todos los cursos)' : '(' + r.cursoIds.length + ' cursos)' }}
                    </span>
                  </div>
                  <button
                    class="text-xs text-red-500 hover:text-red-700 transition-colors"
                    (click)="svc.eliminarRegla(c.id, r.id)"
                    [attr.aria-label]="'Eliminar regla ' + r.id"
                  >
                    Eliminar
                  </button>
                </div>
              }
            </div>
          </div>

          <!-- Agregar regla -->
          <div class="border border-dashed border-slate-300 rounded-xl p-4 space-y-4">
            <h3 class="text-sm font-semibold text-slate-700">+ Agregar Regla de Beneficio</h3>
            <form
              [formGroup]="reglaForm"
              (ngSubmit)="agregarRegla(c.id)"
              class="space-y-4"
              id="regla-form"
            >
              <div class="grid grid-cols-2 gap-3">
                <!-- Condición -->
                <div class="space-y-1">
                  <label for="condicion" class="block text-xs font-medium text-slate-600">Condición del cliente</label>
                  <select
                    id="condicion"
                    formControlName="condicionCliente"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    @for (c of condiciones; track c.value) {
                      <option [value]="c.value">{{ c.label }}</option>
                    }
                  </select>
                </div>
                <!-- Tipo beneficio -->
                <div class="space-y-1">
                  <label for="tipo" class="block text-xs font-medium text-slate-600">Tipo de beneficio</label>
                  <select
                    id="tipo"
                    formControlName="tipo"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    @for (t of tiposBeneficio; track t.value) {
                      <option [value]="t.value">{{ t.label }}</option>
                    }
                  </select>
                </div>
              </div>

              <!-- Valor solo si no es tarifa_socio -->
              @if (reglaForm.get('tipo')?.value !== 'tarifa_socio') {
                <div class="space-y-1">
                  <label for="valor" class="block text-xs font-medium text-slate-600">
                    {{ reglaForm.get('tipo')?.value === 'descuento_porcentaje' ? 'Porcentaje (%)' : 'Tarifa neta (S/)' }}
                  </label>
                  <input
                    id="valor"
                    type="number"
                    formControlName="valor"
                    min="0"
                    step="0.01"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                    placeholder="0"
                  />
                </div>
              }

              <!-- Cursos (opcional) -->
              <div class="space-y-2">
                <label class="block text-xs font-medium text-slate-600">Restringir a cursos (opcional)</label>
                <div class="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2">
                  @for (curso of cursosActivos(); track curso.id) {
                    <label class="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        [value]="curso.id"
                        [checked]="cursosReglaSeleccionados().has(curso.id)"
                        (change)="toggleCursoRegla(curso.id)"
                        class="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span class="text-slate-700">{{ curso.nombre }}</span>
                    </label>
                  }
                </div>
              </div>

              <button
                type="submit"
                form="regla-form"
                class="px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors disabled:opacity-50"
                [disabled]="reglaForm.invalid"
              >
                Agregar Regla
              </button>
            </form>
          </div>
        </div>
      } @else {
        <div class="flex-1 flex items-center justify-center text-slate-400">
          <p>Convenio no encontrado.</p>
        </div>
      }
    </div>
  `,
})
export class ConvenioDetalleComponent implements OnInit {
  protected readonly svc = inject(ConvenioService);
  private readonly academiaService = inject(AcademiaService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly convenioId = signal<string | null>(null);
  readonly convenio = computed(() => {
    const id = this.convenioId();
    return id ? this.svc.getById(id) : undefined;
  });

  readonly cursosActivos = this.academiaService.cursosActivos;
  readonly cursosReglaSeleccionados = signal<Set<string>>(new Set());

  protected readonly condiciones: { value: CondicionCliente; label: string }[] = [
    { value: 'socio', label: CONDICION_CLIENTE_LABELS.socio },
    { value: 'dependiente', label: CONDICION_CLIENTE_LABELS.dependiente },
    { value: 'no_socio', label: CONDICION_CLIENTE_LABELS.no_socio },
    { value: 'trabajador', label: CONDICION_CLIENTE_LABELS.trabajador },
  ];

  protected readonly tiposBeneficio: { value: TipoBeneficio; label: string }[] = [
    { value: 'descuento_porcentaje', label: TIPO_BENEFICIO_LABELS.descuento_porcentaje },
    { value: 'tarifa_neta', label: TIPO_BENEFICIO_LABELS.tarifa_neta },
    { value: 'tarifa_socio', label: TIPO_BENEFICIO_LABELS.tarifa_socio },
  ];

  readonly reglaForm = this.fb.nonNullable.group({
    condicionCliente: ['socio' as CondicionCliente, Validators.required],
    tipo: ['descuento_porcentaje' as TipoBeneficio, Validators.required],
    valor: [0 as number],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.convenioId.set(id);
  }

  agregarRegla(convenioId: string): void {
    if (this.reglaForm.invalid) return;
    const v = this.reglaForm.getRawValue();
    this.svc.agregarRegla(convenioId, {
      condicionCliente: v.condicionCliente,
      tipo: v.tipo,
      valor: Number(v.valor),
      cursoIds: [...this.cursosReglaSeleccionados()],
    });
    this.reglaForm.reset({ condicionCliente: 'socio', tipo: 'descuento_porcentaje', valor: 0 });
    this.cursosReglaSeleccionados.set(new Set());
  }

  toggleCursoRegla(id: string): void {
    this.cursosReglaSeleccionados.update((s) => {
      const copia = new Set(s);
      if (copia.has(id)) copia.delete(id);
      else copia.add(id);
      return copia;
    });
  }

  estadoLabel(e: string): string {
    return ESTADO_CONVENIO_LABELS[e as keyof typeof ESTADO_CONVENIO_LABELS] ?? e;
  }

  condicionLabel(c: string): string {
    return CONDICION_CLIENTE_LABELS[c as keyof typeof CONDICION_CLIENTE_LABELS] ?? c;
  }

  tipoBeneficioLabel(t: string): string {
    return TIPO_BENEFICIO_LABELS[t as keyof typeof TIPO_BENEFICIO_LABELS] ?? t;
  }

  cerrar(): void {
    this.router.navigate(['/', { outlets: { panel: null } }]);
  }
}
