import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AsistenciaService } from '../../core/services/asistencia.service';
import { AcademiaService } from '../../core/services/academia.service';
import {
  EstadoAsistenciaDocente,
  ESTADO_ASISTENCIA_DOCENTE_LABELS,
  ESTADO_ASISTENCIA_DOCENTE_COLORS,
} from '../../core/models/asistencia.model';

@Component({
  selector: 'app-docente-control-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="h-full flex flex-col">
      <!-- Cabecera -->
      <div class="px-6 py-5 border-b border-slate-100">
        <h2 class="text-lg font-semibold text-slate-800">Control de Asistencia Docente</h2>
        @if (sesion()) {
          <p class="mt-0.5 text-sm text-slate-500">
            {{ sesion()!.cursoNombre }} — {{ sesion()!.fecha }} · {{ sesion()!.horaInicio }}–{{ sesion()!.horaFin }}
          </p>
        }
      </div>

      <div class="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        @if (!sesion()) {
          <p class="text-sm text-red-500">Sesión no encontrada.</p>
        } @else {
          <!-- Aviso si ya tiene control registrado -->
          @if (controlExistente()) {
            <div class="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
              <strong>Ya existe un control registrado para esta sesión.</strong> Completar el formulario lo sobreescribirá.
              <div class="mt-1 flex gap-2 flex-wrap">
                <span class="rounded-full px-2 py-0.5 font-medium {{ estadoColor(controlExistente()!.estado) }}">
                  {{ estadoLabel(controlExistente()!.estado) }}
                </span>
                @if (controlExistente()!.minutosTardanza) {
                  <span class="text-blue-700">{{ controlExistente()!.minutosTardanza }} min tardanza</span>
                }
                @if (controlExistente()!.controladorNombre) {
                  <span class="text-blue-700">Controlador: {{ controlExistente()!.controladorNombre }}</span>
                }
              </div>
            </div>
          }

          <!-- Información del docente titular -->
          <div class="rounded-xl border border-slate-200 p-4 space-y-1 text-sm text-slate-700">
            <p class="font-semibold text-slate-800">Docente Titular</p>
            <p>{{ sesion()!.docenteNombre }}</p>
          </div>

          <!-- Formulario -->
          <form [formGroup]="form" (ngSubmit)="guardar()" class="space-y-4">
            <!-- Estado -->
            <div>
              <span class="block text-sm font-medium text-slate-700 mb-2">Estado del Docente</span>
              <div class="grid grid-cols-2 gap-2">
                @for (e of estadosDocente; track e.value) {
                  <button
                    type="button"
                    (click)="form.get('estado')!.setValue(e.value)"
                    [class]="'rounded-xl border-2 px-3 py-2 text-sm font-medium transition-all ' +
                      (form.get('estado')!.value === e.value
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300')"
                    [attr.aria-pressed]="form.get('estado')!.value === e.value"
                  >
                    {{ e.label }}
                  </button>
                }
              </div>
            </div>

            <!-- Minutos de tardanza (solo si estado = tardanza) -->
            @if (form.get('estado')!.value === 'tardanza') {
              <div>
                <label for="minutos" class="block text-sm font-medium text-slate-700 mb-1">
                  Minutos de tardanza
                </label>
                <input
                  id="minutos"
                  type="number"
                  formControlName="minutosTardanza"
                  min="1"
                  max="60"
                  class="input-modern w-full"
                  placeholder="Ej: 10"
                />
              </div>
            }

            <!-- Docente sustituto (solo si estado = con_suplente) -->
            @if (form.get('estado')!.value === 'con_suplente') {
              <div>
                <label for="suplente" class="block text-sm font-medium text-slate-700 mb-1">
                  Docente Suplente
                </label>
                <select id="suplente" formControlName="docenteSustitutoId" class="input-modern w-full">
                  <option value="">— Seleccionar suplente —</option>
                  @for (d of docentes(); track d.id) {
                    @if (d.id !== sesion()!.controlDocente?.docenteId) {
                      <option [value]="d.id">{{ d.nombre }} {{ d.apellido }}</option>
                    }
                  }
                </select>
                <p class="text-xs text-amber-700 mt-1">
                  ⚠ Es obligatorio registrar quién fue el suplente para control de pago y auditoría.
                </p>
              </div>
            }

            <!-- Controlador -->
            <div>
              <label for="controlador" class="block text-sm font-medium text-slate-700 mb-1">
                Nombre del Controlador
              </label>
              <input
                id="controlador"
                type="text"
                formControlName="controladorNombre"
                class="input-modern w-full"
                placeholder="Nombre del supervisor físico"
              />
            </div>

            <!-- Observaciones -->
            <div>
              <label for="obsDocente" class="block text-sm font-medium text-slate-700 mb-1">
                Observaciones
              </label>
              <textarea
                id="obsDocente"
                formControlName="observaciones"
                rows="3"
                class="input-modern w-full resize-none"
                placeholder="Ej: Llegó tarde por emergencia, se comunicó con anticipación..."
              ></textarea>
            </div>

            <!-- Alerta de auditoría -->
            @if (form.get('estado')!.value === 'ausente') {
              <div class="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                <strong>Falta registrada.</strong> Esta ausencia será considerada en el cierre de liquidación mensual.
                Si el docente reprogramó la clase, regístrelo en Observaciones.
              </div>
            }
          </form>
        }
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
        <button type="button" (click)="cerrar()" class="btn-secondary">Cancelar</button>
        <button
          type="button"
          [disabled]="form.invalid || !sesion()"
          (click)="guardar()"
          class="btn-primary disabled:opacity-50"
        >
          Registrar control
        </button>
      </div>
    </div>
  `,
})
export class DocenteControlFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly svc = inject(AsistenciaService);
  private readonly academiaSvc = inject(AcademiaService);
  private readonly fb = inject(FormBuilder);

  readonly sesionId = signal('');

  readonly sesion = computed(() => {
    const id = this.sesionId();
    return id ? (this.svc.sesionesDetalladas().find((s) => s.id === id) ?? null) : null;
  });

  readonly controlExistente = computed(() => this.svc.getControlBySesion(this.sesionId()));

  readonly docentes = this.academiaSvc.docentes;

  readonly estadosDocente: { value: EstadoAsistenciaDocente; label: string }[] = [
    { value: 'presente', label: ESTADO_ASISTENCIA_DOCENTE_LABELS.presente },
    { value: 'tardanza', label: ESTADO_ASISTENCIA_DOCENTE_LABELS.tardanza },
    { value: 'ausente', label: ESTADO_ASISTENCIA_DOCENTE_LABELS.ausente },
    { value: 'con_suplente', label: ESTADO_ASISTENCIA_DOCENTE_LABELS.con_suplente },
  ];

  readonly form = this.fb.group({
    estado: ['presente' as EstadoAsistenciaDocente, Validators.required],
    minutosTardanza: [null as number | null],
    docenteSustitutoId: [null as string | null],
    controladorNombre: ['', Validators.required],
    observaciones: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('sesionId') ?? '';
    this.sesionId.set(id);
    const existing = this.svc.getControlBySesion(id);
    if (existing) {
      this.form.patchValue({
        estado: existing.estado,
        minutosTardanza: existing.minutosTardanza ?? null,
        docenteSustitutoId: existing.docenteSustitutoId ?? null,
        controladorNombre: existing.controladorNombre ?? '',
        observaciones: existing.observaciones ?? '',
      });
    }
  }

  estadoLabel(estado: EstadoAsistenciaDocente): string {
    return ESTADO_ASISTENCIA_DOCENTE_LABELS[estado];
  }

  estadoColor(estado: EstadoAsistenciaDocente): string {
    return ESTADO_ASISTENCIA_DOCENTE_COLORS[estado];
  }

  guardar(): void {
    if (this.form.invalid || !this.sesion()) return;
    const val = this.form.getRawValue();
    const clase = this.academiaSvc.getClaseById(this.sesion()!.claseId);
    this.svc.registrarControlDocente({
      sesionId: this.sesionId(),
      docenteId: clase?.docenteId ?? '',
      estado: val.estado as EstadoAsistenciaDocente,
      minutosTardanza: val.minutosTardanza ?? undefined,
      docenteSustitutoId: val.docenteSustitutoId ?? undefined,
      controladorNombre: val.controladorNombre ?? undefined,
      observaciones: val.observaciones ?? undefined,
      fechaRegistro: new Date().toISOString(),
    });
    this.cerrar();
  }

  cerrar(): void {
    this.router.navigate(['/', { outlets: { panel: null } }]);
  }
}
