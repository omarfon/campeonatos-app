import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RetiroService } from '../../core/services/retiro.service';
import { MatriculaService } from '../../core/services/matricula.service';
import { SocioService } from '../../core/services/socio.service';
import { AcademiaService } from '../../core/services/academia.service';
import { Socio } from '../../core/models/socio.model';
import { Matricula } from '../../core/models/matricula.model';
import {
  CalculoRetiro,
  FormaDevolucion,
  FORMA_DEVOLUCION_LABELS,
  ResponsabilidadRetiro,
  RESPONSABILIDAD_RETIRO_LABELS,
} from '../../core/models/retiro.model';

@Component({
  selector: 'app-retiro-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="h-full flex flex-col">
      <!-- Cabecera -->
      <div class="px-6 py-5 border-b border-slate-100">
        <h2 class="text-lg font-semibold text-slate-800">Registrar Retiro / Anulación</h2>
        <p class="mt-0.5 text-sm text-slate-500">
          Prorrateo automático · Nota de Crédito generada al procesar
        </p>
      </div>

      <div class="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        <!-- Búsqueda de alumno -->
        <div>
          <label for="buscarRetiro" class="block text-sm font-medium text-slate-700 mb-1">
            Buscar alumno
          </label>
          <input
            id="buscarRetiro"
            type="text"
            [value]="busqueda()"
            (input)="busqueda.set($any($event.target).value)"
            placeholder="Nombre o DNI…"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
          />
          @if (resultadosBusqueda().length > 0 && !socioSeleccionado()) {
            <ul
              class="mt-1 rounded-lg border border-slate-200 bg-white shadow-sm divide-y divide-slate-100 max-h-40 overflow-y-auto"
              role="listbox"
              aria-label="Resultados de búsqueda"
            >
              @for (s of resultadosBusqueda(); track s.id) {
                <li>
                  <button
                    type="button"
                    (click)="seleccionarSocio(s)"
                    class="w-full text-left px-3 py-2 text-sm hover:bg-rose-50 transition-colors"
                  >
                    <span class="font-medium text-slate-800">{{ s.apellido }}, {{ s.nombre }}</span>
                    <span class="ml-2 text-slate-400 text-xs">DNI: {{ s.dni }}</span>
                  </button>
                </li>
              }
            </ul>
          }
        </div>

        <!-- Alumno seleccionado -->
        @if (socioSeleccionado(); as socio) {
          <div
            class="rounded-lg bg-rose-50 border border-rose-100 px-3 py-2 flex items-center justify-between"
          >
            <div class="text-sm">
              <span class="font-medium text-rose-800">{{ socio.apellido }}, {{ socio.nombre }}</span>
              <span class="ml-2 text-rose-600 text-xs">DNI: {{ socio.dni }}</span>
            </div>
            <button
              type="button"
              (click)="limpiarSocio()"
              class="text-xs text-rose-600 hover:text-rose-800 transition-colors"
            >
              Cambiar
            </button>
          </div>

          @if (matriculasActivas().length === 0) {
            <p class="text-sm text-slate-500 italic">
              Este alumno no tiene matrículas activas para retirar.
            </p>
          } @else {
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">
                Seleccionar matrícula a retirar
              </label>
              <div class="space-y-2">
                @for (m of matriculasActivas(); track m.id) {
                  <label
                    class="flex items-start gap-3 rounded-lg border border-slate-200 p-3 cursor-pointer hover:border-rose-400 transition-colors has-[:checked]:border-rose-500 has-[:checked]:bg-rose-50"
                  >
                    <input
                      type="radio"
                      name="retiro-matricula"
                      [value]="m.id"
                      (change)="seleccionarMatricula(m)"
                      class="mt-0.5 accent-rose-600"
                    />
                    <div class="text-sm flex-1">
                      <p class="font-medium text-slate-800">{{ getNombreCurso(m.claseId) }}</p>
                      <p class="text-slate-500 text-xs">{{ getNombreClase(m.claseId) }}</p>
                      <p class="text-slate-600 text-xs mt-0.5 font-mono">
                        Monto pagado: S/ {{ m.montoFinal.toFixed(2) }}
                      </p>
                    </div>
                  </label>
                }
              </div>
            </div>
          }
        }

        <!-- Formulario de cálculo -->
        @if (matriculaSeleccionada(); as mat) {
          <form [formGroup]="form" (ngSubmit)="procesar()" class="space-y-5">
            <!-- Sesiones -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="totalSesiones" class="block text-sm font-medium text-slate-700 mb-1">
                  Total sesiones del ciclo
                  <span class="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="totalSesiones"
                  formControlName="totalSesiones"
                  type="number"
                  min="1"
                  (input)="recalcular()"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
              <div>
                <label
                  for="sesionesAsistidas"
                  class="block text-sm font-medium text-slate-700 mb-1"
                >
                  Sesiones asistidas
                  <span class="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="sesionesAsistidas"
                  formControlName="sesionesAsistidas"
                  type="number"
                  min="0"
                  (input)="recalcular()"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
            </div>

            <!-- Responsabilidad -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Responsabilidad del retiro
              </label>
              <div class="space-y-2">
                @for (entry of responsabilidadEntries; track entry.valor) {
                  <label class="flex items-center gap-3 text-sm cursor-pointer">
                    <input
                      type="radio"
                      formControlName="responsabilidad"
                      [value]="entry.valor"
                      (change)="recalcular()"
                      class="accent-rose-600"
                    />
                    <span class="text-slate-700">{{ entry.label }}</span>
                    @if (entry.valor === 'cliente') {
                      <span class="text-xs text-amber-600">(aplica gasto administrativo)</span>
                    } @else {
                      <span class="text-xs text-green-600">(sin gasto administrativo)</span>
                    }
                  </label>
                }
              </div>
            </div>

            <!-- Resumen del cálculo -->
            @if (calculo(); as c) {
              <div class="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
                  Resumen del cálculo
                </p>
                <div class="space-y-1.5 text-sm">
                  <div class="flex justify-between">
                    <span class="text-slate-600">Costo por sesión</span>
                    <span class="font-mono text-slate-800">S/ {{ c.costoPorSesion.toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-600">{{ c.sesionesAsistidas }} sesiones tomadas</span>
                    <span class="font-mono text-slate-800">
                      S/ {{ c.costoSesionesAsistidas.toFixed(2) }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-600">
                      Saldo por {{ c.sesionesPendientes }} sesiones pendientes
                    </span>
                    <span class="font-mono font-medium text-slate-800">
                      S/ {{ c.saldoSesionesPendientes.toFixed(2) }}
                    </span>
                  </div>
                  @if (c.aplicaGastoAdministrativo) {
                    <div class="flex justify-between text-amber-700">
                      <span>Gasto administrativo (penalidad)</span>
                      <span class="font-mono">— S/ {{ c.gastoAdministrativo.toFixed(2) }}</span>
                    </div>
                  }
                  <div class="flex justify-between pt-2 border-t border-slate-200 font-semibold">
                    <span [class]="c.montoNotaCredito > 0 ? 'text-teal-700' : 'text-slate-500'">
                      Nota de Crédito a emitir
                    </span>
                    <span
                      class="font-mono"
                      [class]="c.montoNotaCredito > 0 ? 'text-teal-700' : 'text-slate-400'"
                    >
                      S/ {{ c.montoNotaCredito.toFixed(2) }}
                    </span>
                  </div>
                  @if (c.sesionesAsistidas === 0) {
                    <p class="text-xs text-center pt-1 text-blue-600 font-medium">
                      Anulación Total — devolución del 100%
                    </p>
                  }
                </div>
              </div>

              @if (c.aplicaGastoAdministrativo) {
                <p
                  class="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
                >
                  <strong>Gasto administrativo S/ {{ c.gastoAdministrativo.toFixed(2) }}:</strong>
                  Se emitirá una Boleta de Venta por concepto de penalidad por retiro voluntario,
                  la cual se descuenta del saldo a favor.
                </p>
              }
            }

            <!-- Forma de devolución -->
            <div>
              <label for="formaDevolucion" class="block text-sm font-medium text-slate-700 mb-1">
                Forma de devolución
                <span class="text-red-500" aria-hidden="true">*</span>
              </label>
              <select
                id="formaDevolucion"
                formControlName="formaDevolucion"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                @for (entry of devolucionEntries; track entry.valor) {
                  <option [value]="entry.valor">{{ entry.label }}</option>
                }
              </select>
              @if (form.get('formaDevolucion')?.value !== 'nota_credito') {
                <p class="mt-1 text-xs text-slate-500">
                  La entrega del dinero es gestionada manualmente por el área contable. El sistema
                  solo registra la Nota de Crédito.
                </p>
              }
            </div>

            <!-- Motivo -->
            <div>
              <label for="motivoRetiro" class="block text-sm font-medium text-slate-700 mb-1">
                Motivo del retiro
                <span class="text-red-500" aria-hidden="true">*</span>
              </label>
              <textarea
                id="motivoRetiro"
                formControlName="motivoRetiro"
                rows="2"
                placeholder="Descripción del motivo del retiro…"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
              ></textarea>
            </div>

            <!-- Aviso impacto docente -->
            <div class="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800">
              <strong>Impacto en liquidación docente:</strong> El monto de la Nota de Crédito se
              descontará de la base de comisión del docente en el corte mensual (del 22 al 21). El
              docente no recibirá comisión por las clases no tomadas y reembolsadas.
            </div>

            <div class="pt-2 flex gap-3">
              <button
                type="submit"
                [disabled]="form.invalid || !calculo()"
                class="flex-1 rounded-lg bg-rose-600 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Procesar retiro y emitir NC
              </button>
              <button
                type="button"
                (click)="cancelar()"
                class="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
})
export class RetiroFormComponent {
  private readonly svc = inject(RetiroService);
  private readonly matriculaService = inject(MatriculaService);
  private readonly socioService = inject(SocioService);
  private readonly academiaService = inject(AcademiaService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly busqueda = signal('');
  readonly socioSeleccionado = signal<Socio | null>(null);
  readonly matriculaSeleccionada = signal<Matricula | null>(null);
  readonly calculo = signal<CalculoRetiro | null>(null);

  readonly responsabilidadEntries = (
    Object.entries(RESPONSABILIDAD_RETIRO_LABELS) as [ResponsabilidadRetiro, string][]
  ).map(([valor, label]) => ({ valor, label }));

  readonly devolucionEntries = (
    Object.entries(FORMA_DEVOLUCION_LABELS) as [FormaDevolucion, string][]
  ).map(([valor, label]) => ({ valor, label }));

  readonly form = this.fb.nonNullable.group({
    totalSesiones: [16, [Validators.required, Validators.min(1)]],
    sesionesAsistidas: [0, [Validators.required, Validators.min(0)]],
    responsabilidad: ['cliente' as ResponsabilidadRetiro, Validators.required],
    formaDevolucion: ['nota_credito' as FormaDevolucion, Validators.required],
    motivoRetiro: ['', [Validators.required, Validators.minLength(5)]],
  });

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
      .slice(0, 8);
  });

  readonly matriculasActivas = computed(() => {
    const socio = this.socioSeleccionado();
    if (!socio) return [];
    return this.matriculaService
      .getMatriculasBySocio(socio.id)
      .filter((m) => m.estado === 'confirmada' || m.estado === 'pagada');
  });

  seleccionarSocio(socio: Socio): void {
    this.socioSeleccionado.set(socio);
    this.busqueda.set('');
    this.matriculaSeleccionada.set(null);
    this.calculo.set(null);
  }

  limpiarSocio(): void {
    this.socioSeleccionado.set(null);
    this.matriculaSeleccionada.set(null);
    this.busqueda.set('');
    this.calculo.set(null);
  }

  seleccionarMatricula(m: Matricula): void {
    this.matriculaSeleccionada.set(m);
    this.calculo.set(null);
  }

  getNombreCurso(claseId: string): string {
    const clase = this.academiaService.getClaseById(claseId);
    if (!clase) return claseId;
    return this.academiaService.getCursoById(clase.cursoId)?.nombre ?? claseId;
  }

  getNombreClase(claseId: string): string {
    return this.academiaService.getClaseById(claseId)?.periodo ?? claseId;
  }

  recalcular(): void {
    const mat = this.matriculaSeleccionada();
    if (!mat) return;
    const { totalSesiones, sesionesAsistidas, responsabilidad } = this.form.getRawValue();
    if (!totalSesiones || sesionesAsistidas === null) return;
    const asistidas = Math.min(sesionesAsistidas, totalSesiones);
    if (asistidas !== sesionesAsistidas) {
      this.form.patchValue({ sesionesAsistidas: asistidas });
    }
    this.calculo.set(
      this.svc.calcular({
        costoTotalPagado: mat.montoFinal,
        totalSesiones,
        sesionesAsistidas: asistidas,
        responsabilidad: responsabilidad as ResponsabilidadRetiro,
      }),
    );
  }

  procesar(): void {
    if (this.form.invalid) return;
    const socio = this.socioSeleccionado();
    const mat = this.matriculaSeleccionada();
    const c = this.calculo();
    if (!socio || !mat || !c) return;

    const { responsabilidad, formaDevolucion, motivoRetiro } = this.form.getRawValue();

    this.svc.procesar({
      matriculaId: mat.id,
      socioId: socio.id,
      nombreSocio: `${socio.apellido}, ${socio.nombre}`,
      cursoNombre: this.getNombreCurso(mat.claseId),
      claseNombre: this.getNombreClase(mat.claseId),
      responsabilidad: responsabilidad as ResponsabilidadRetiro,
      motivoRetiro,
      calculo: c,
      formaDevolucion: formaDevolucion as FormaDevolucion,
    });

    this.cancelar();
  }

  cancelar(): void {
    this.router.navigate(['/', { outlets: { panel: null } }]);
  }
}
