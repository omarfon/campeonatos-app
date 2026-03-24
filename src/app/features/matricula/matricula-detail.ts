import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatriculaService } from '../../core/services/matricula.service';
import { SocioService } from '../../core/services/socio.service';
import { AcademiaService } from '../../core/services/academia.service';
import {
  Matricula,
  EstadoMatricula,
  ESTADO_MATRICULA_LABELS,
  TIPO_MATRICULA_LABELS,
  CANAL_MATRICULA_LABELS,
  METODO_PAGO_LABELS,
  MetodoPago,
} from '../../core/models/matricula.model';

@Component({
  selector: 'app-matricula-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    @if (matricula(); as m) {
      <div class="space-y-6 max-w-4xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <a routerLink="/matricula" class="text-sm text-brand hover:text-brand-700 font-medium">&larr; Volver a matrículas</a>
            <h2 class="text-2xl font-bold text-slate-900 mt-1">Matrícula {{ m.id.slice(0, 8) }}</h2>
            <p class="text-slate-500 mt-1">Registrada el {{ m.fechaRegistro }}</p>
          </div>
          <span class="self-start text-sm px-3 py-1 rounded-full font-semibold"
            [class]="estadoClasses[m.estado]">
            {{ estadoLabels[m.estado] }}
          </span>
        </div>

        <!-- Info General -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section class="bg-white rounded-xl shadow-sm p-6 space-y-3">
            <h3 class="text-lg font-semibold text-slate-800">Datos del Alumno</h3>
            <div class="grid grid-cols-2 gap-y-2 text-sm">
              <span class="text-slate-500">Nombre</span>
              <span class="text-slate-800 font-medium">{{ socioNombre() }}</span>
              <span class="text-slate-500">DNI</span>
              <span class="text-slate-800 font-mono">{{ socioDni() }}</span>
            </div>
          </section>

          <section class="bg-white rounded-xl shadow-sm p-6 space-y-3">
            <h3 class="text-lg font-semibold text-slate-800">Datos de la Clase</h3>
            <div class="grid grid-cols-2 gap-y-2 text-sm">
              <span class="text-slate-500">Curso</span>
              <span class="text-slate-800 font-medium">{{ cursoNombre() }}</span>
              <span class="text-slate-500">Período</span>
              <span class="text-slate-800">{{ periodo() }}</span>
              <span class="text-slate-500">Tipo</span>
              <span class="text-slate-800">{{ tipoLabels[m.tipo] }}</span>
              <span class="text-slate-500">Canal</span>
              <span class="text-slate-800">{{ canalLabels[m.canal] }}</span>
            </div>
          </section>
        </div>

        <!-- Financiero -->
        <section class="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 class="text-lg font-semibold text-slate-800">Información Financiera</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div class="rounded-lg bg-slate-50 p-3">
              <p class="text-xs text-slate-500">Tarifa base</p>
              <p class="text-lg font-bold font-mono text-slate-700">S/ {{ m.tarifaBase.toFixed(2) }}</p>
            </div>
            <div class="rounded-lg bg-slate-50 p-3">
              <p class="text-xs text-slate-500">Descuentos</p>
              <p class="text-lg font-bold font-mono text-green-600">{{ totalDescuento() }}%</p>
            </div>
            <div class="rounded-lg bg-brand-50 p-3">
              <p class="text-xs text-brand-700">Monto final</p>
              <p class="text-lg font-bold font-mono text-brand">S/ {{ m.montoFinal.toFixed(2) }}</p>
            </div>
            <div class="rounded-lg p-3" [class]="m.estadoPago === 'pagado' ? 'bg-green-50' : 'bg-yellow-50'">
              <p class="text-xs" [class]="m.estadoPago === 'pagado' ? 'text-green-600' : 'text-yellow-600'">Pagado</p>
              <p class="text-lg font-bold font-mono" [class]="m.estadoPago === 'pagado' ? 'text-green-700' : 'text-yellow-700'">S/ {{ totalPagado().toFixed(2) }}</p>
            </div>
          </div>

          @if (m.descuentos.length > 0) {
            <div class="text-sm space-y-1">
              <p class="font-medium text-slate-600">Descuentos aplicados:</p>
              @for (d of m.descuentos; track d.tipo) {
                <p class="text-green-600">{{ d.descripcion }} (-{{ d.porcentaje }}%)</p>
              }
            </div>
          }
        </section>

        <!-- Pagos -->
        <section class="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-slate-800">Pagos Registrados</h3>
            @if (puedeRecibirPago()) {
              <button type="button" (click)="mostrarFormPago.set(!mostrarFormPago())"
                class="text-sm bg-brand text-white px-3 py-1.5 rounded-lg hover:bg-brand-600 transition-colors">
                + Registrar Pago
              </button>
            }
          </div>

          @if (m.pagos.length > 0) {
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead>
                  <tr class="bg-slate-50 border-b">
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Fecha</th>
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Método</th>
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Monto</th>
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Referencia</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (p of m.pagos; track p.id) {
                    <tr>
                      <td class="px-4 py-2 text-slate-600">{{ p.fecha }}</td>
                      <td class="px-4 py-2 text-slate-600">{{ metodoPagoLabels[p.metodo] }}</td>
                      <td class="px-4 py-2 font-mono text-slate-800">S/ {{ p.monto.toFixed(2) }}</td>
                      <td class="px-4 py-2 text-slate-500">{{ p.referencia ?? '—' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <p class="text-sm text-slate-400">No hay pagos registrados</p>
          }

          @if (mostrarFormPago()) {
            <form [formGroup]="pagoForm" (ngSubmit)="registrarPago()" class="border-t pt-4 space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label for="pagoMonto" class="block text-sm font-medium text-slate-700 mb-1">Monto</label>
                  <input id="pagoMonto" formControlName="monto" type="number" step="0.01" min="0.01"
                    class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-400 focus:border-brand-400" />
                </div>
                <div>
                  <label for="pagoMetodo" class="block text-sm font-medium text-slate-700 mb-1">Método</label>
                  <select id="pagoMetodo" formControlName="metodo"
                    class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-400 focus:border-brand-400">
                    @for (mp of metodoPagoOptions; track mp.value) {
                      <option [value]="mp.value">{{ mp.label }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label for="pagoRef" class="block text-sm font-medium text-slate-700 mb-1">Referencia</label>
                  <input id="pagoRef" formControlName="referencia" type="text"
                    class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-400 focus:border-brand-400" />
                </div>
              </div>
              <div class="flex gap-3">
                <button type="submit" [disabled]="pagoForm.invalid"
                  class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm">
                  Confirmar Pago
                </button>
                <button type="button" (click)="mostrarFormPago.set(false)"
                  class="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors text-sm">
                  Cancelar
                </button>
              </div>
            </form>
          }
        </section>

        <!-- Acciones sobre la matrícula -->
        <section class="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 class="text-lg font-semibold text-slate-800">Acciones</h3>
          <div class="flex flex-wrap gap-3">
            @if (m.estado === 'pagada') {
              <button type="button" (click)="confirmarMatricula()"
                class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                Confirmar Matrícula
              </button>
            }
            @if (m.estado !== 'anulada' && m.estado !== 'retirada') {
              <button type="button" (click)="anularMatricula()"
                class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm">
                Anular
              </button>
            }
            @if (m.estado === 'confirmada') {
              <button type="button" (click)="retirarMatricula()"
                class="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm">
                Retirar
              </button>
            }
          </div>
        </section>

        @if (m.observaciones) {
          <section class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-slate-800 mb-2">Observaciones</h3>
            <p class="text-sm text-slate-600">{{ m.observaciones }}</p>
          </section>
        }
      </div>
    } @else {
      <div class="text-center py-12">
        <p class="text-slate-400 text-lg">Matrícula no encontrada</p>
        <a routerLink="/matricula" class="text-brand hover:text-brand-700 text-sm font-medium mt-2 inline-block">&larr; Volver</a>
      </div>
    }
  `,
})
export class MatriculaDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly matriculaService = inject(MatriculaService);
  private readonly socioService = inject(SocioService);
  private readonly academiaService = inject(AcademiaService);

  protected readonly matricula = signal<Matricula | undefined>(undefined);
  protected readonly mostrarFormPago = signal(false);

  readonly pagoForm = this.fb.nonNullable.group({
    monto: [0, [Validators.required, Validators.min(0.01)]],
    metodo: ['efectivo' as MetodoPago, Validators.required],
    referencia: [''],
  });

  protected readonly estadoLabels = ESTADO_MATRICULA_LABELS;
  protected readonly tipoLabels = TIPO_MATRICULA_LABELS;
  protected readonly canalLabels = CANAL_MATRICULA_LABELS;
  protected readonly metodoPagoLabels = METODO_PAGO_LABELS;

  protected readonly metodoPagoOptions = Object.entries(METODO_PAGO_LABELS).map(([value, label]) => ({ value, label }));

  protected readonly estadoClasses: Record<EstadoMatricula, string> = {
    reservada: 'bg-blue-100 text-blue-700',
    pendiente_pago: 'bg-yellow-100 text-yellow-700',
    pagada: 'bg-emerald-100 text-emerald-700',
    confirmada: 'bg-green-100 text-green-700',
    anulada: 'bg-red-100 text-red-700',
    retirada: 'bg-slate-100 text-slate-600',
  };

  protected readonly socioNombre = computed(() => {
    const m = this.matricula();
    if (!m) return '—';
    const s = this.socioService.getById(m.socioId);
    return s ? `${s.apellido}, ${s.nombre}` : '—';
  });

  protected readonly socioDni = computed(() => {
    const m = this.matricula();
    if (!m) return '—';
    return this.socioService.getById(m.socioId)?.dni ?? '—';
  });

  protected readonly cursoNombre = computed(() => {
    const m = this.matricula();
    if (!m) return '—';
    const clase = this.academiaService.getClaseById(m.claseId);
    const curso = clase ? this.academiaService.getCursoById(clase.cursoId) : undefined;
    return curso?.nombre ?? '—';
  });

  protected readonly periodo = computed(() => {
    const m = this.matricula();
    if (!m) return '—';
    return this.academiaService.getClaseById(m.claseId)?.periodo ?? '—';
  });

  protected readonly totalDescuento = computed(() => {
    const m = this.matricula();
    return m ? m.descuentos.reduce((s, d) => s + d.porcentaje, 0) : 0;
  });

  protected readonly totalPagado = computed(() => {
    const m = this.matricula();
    return m ? m.pagos.reduce((s, p) => s + p.monto, 0) : 0;
  });

  protected readonly puedeRecibirPago = computed(() => {
    const m = this.matricula();
    if (!m) return false;
    return m.estado === 'reservada' || m.estado === 'pendiente_pago';
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.matricula.set(this.matriculaService.getById(id));
    }
  }

  private reloadMatricula(): void {
    const m = this.matricula();
    if (m) {
      this.matricula.set(this.matriculaService.getById(m.id));
    }
  }

  protected registrarPago(): void {
    const m = this.matricula();
    if (!m || this.pagoForm.invalid) return;
    const v = this.pagoForm.getRawValue();
    this.matriculaService.registrarPago(m.id, v.monto, v.metodo, v.referencia || undefined);
    this.pagoForm.reset({ monto: 0, metodo: 'efectivo' as MetodoPago, referencia: '' });
    this.mostrarFormPago.set(false);
    this.reloadMatricula();
  }

  protected confirmarMatricula(): void {
    const m = this.matricula();
    if (!m) return;
    this.matriculaService.confirmar(m.id);
    this.reloadMatricula();
  }

  protected anularMatricula(): void {
    const m = this.matricula();
    if (!m) return;
    const motivo = prompt('Motivo de anulación:');
    if (motivo !== null) {
      this.matriculaService.anular(m.id, motivo);
      this.reloadMatricula();
    }
  }

  protected retirarMatricula(): void {
    const m = this.matricula();
    if (!m) return;
    const motivo = prompt('Motivo de retiro:');
    if (motivo !== null) {
      this.matriculaService.retirar(m.id, motivo);
      this.reloadMatricula();
    }
  }
}
