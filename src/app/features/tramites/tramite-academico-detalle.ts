import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { TramiteAcademicoService } from '../../core/services/tramite-academico.service';
import { TramiteAcademico } from '../../core/models/tramite-academico.model';
import {
  TIPO_TRAMITE_ACADEMICO_LABELS,
  ESTADO_TRAMITE_ACADEMICO_LABELS,
  ESTADO_TRAMITE_ACADEMICO_CLASSES,
} from '../../core/models/tramite-academico.model';

@Component({
  selector: 'app-tramite-academico-detalle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, SlicePipe],
  template: `
    @if (tramite(); as t) {
      <div class="h-full flex flex-col">

        <!-- Cabecera -->
        <div class="px-6 py-5 border-b border-slate-100">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-base font-semibold text-slate-800">{{ tipoLabels[t.tipo] }}</h2>
              <p class="text-xs text-slate-500 mt-0.5">{{ t.alumnoNombre }} · DNI {{ t.alumnoDni }}</p>
              @if (t.cursoNombre) {
                <p class="text-xs text-indigo-600 mt-0.5">{{ t.cursoNombre }}</p>
              }
            </div>
            <span class="text-[10px] px-2.5 py-1 rounded-full font-semibold shrink-0"
              [class]="estadoClasses[t.estado]">
              {{ estadoLabels[t.estado] }}
            </span>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          <!-- Descripción -->
          <div class="rounded-lg bg-slate-50 border border-slate-100 p-4">
            <p class="text-xs font-semibold text-slate-500 mb-1">Descripción / Motivo</p>
            <p class="text-sm text-slate-800">{{ t.descripcion }}</p>
          </div>

          <!-- Datos del trámite -->
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-lg border border-slate-100 p-3">
              <p class="text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Creado</p>
              <p class="text-sm font-medium text-slate-800">{{ t.fechaCreacion }}</p>
            </div>
            <div class="rounded-lg border border-slate-100 p-3">
              <p class="text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Última acción</p>
              <p class="text-sm font-medium text-slate-800">{{ t.fechaUltimaAccion }}</p>
            </div>
            @if (t.operador) {
              <div class="rounded-lg border border-slate-100 p-3">
                <p class="text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Operador</p>
                <p class="text-sm font-medium text-slate-800">{{ t.operador }}</p>
              </div>
            }
            @if (t.evaluador) {
              <div class="rounded-lg border border-slate-100 p-3">
                <p class="text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Evaluador</p>
                <p class="text-sm font-medium text-slate-800">{{ t.evaluador }}</p>
              </div>
            }
          </div>

          <!-- Motivo de rechazo -->
          @if (t.motivoRechazo) {
            <div class="rounded-lg bg-red-50 border border-red-100 p-4">
              <p class="text-xs font-semibold text-red-700 mb-1">Motivo de rechazo</p>
              <p class="text-sm text-red-800">{{ t.motivoRechazo }}</p>
            </div>
          }

          <!-- Historial de auditoría -->
          <div>
            <p class="text-sm font-semibold text-slate-700 mb-3">Historial de acciones</p>
            <ol class="relative border-l border-slate-200 ml-3 space-y-4">
              @for (entry of t.auditoria; track entry.fechaHora) {
                <li class="ml-4">
                  <span class="absolute -left-1.5 mt-0.5 h-3 w-3 rounded-full border-2 border-white bg-indigo-500"></span>
                  <p class="text-xs font-semibold text-slate-800">{{ entry.accion }}</p>
                  <p class="text-[10px] text-slate-400">{{ entry.usuario }} · {{ entry.fechaHora | slice:0:16 }}</p>
                  @if (entry.observacion) {
                    <p class="text-xs text-slate-600 mt-0.5 italic">{{ entry.observacion }}</p>
                  }
                </li>
              }
            </ol>
          </div>

          <!-- Acciones según estado -->
          @if (t.estado === 'enviada' || t.estado === 'en_revision') {
            <div class="rounded-xl border-2 border-indigo-100 bg-indigo-50/40 p-4 space-y-4">
              <p class="text-sm font-semibold text-indigo-800">Resolución de solicitud</p>

              @if (t.estado === 'enviada') {
                <button type="button"
                  class="w-full text-sm text-center bg-amber-50 border border-amber-200 text-amber-800 font-medium py-2 rounded-lg hover:bg-amber-100 transition-colors"
                  (click)="derivarARevision(t.id)">
                  Derivar a revisión
                </button>
              }

              <!-- Formulario de aprobación/rechazo -->
              <form [formGroup]="resolucionForm" (ngSubmit)="submitResolucion(t)" class="space-y-3">
                <div>
                  <label for="evaluadorNombre" class="block text-xs font-medium text-slate-700 mb-1">Nombre del evaluador *</label>
                  <input id="evaluadorNombre" type="text" formControlName="evaluador"
                    class="input-modern !text-xs !py-1.5" placeholder="Nombre del responsable" />
                </div>
                <div>
                  <label for="observacionRes" class="block text-xs font-medium text-slate-700 mb-1">Observaciones / Motivo de rechazo</label>
                  <textarea id="observacionRes" formControlName="observacion" rows="2"
                    class="input-modern !text-xs" placeholder="(opcional para aprobar, requerido para rechazar)"></textarea>
                </div>
                <div class="flex gap-2">
                  <button type="submit"
                    [disabled]="resolucionForm.invalid"
                    (click)="accion.set('aprobar')"
                    class="flex-1 text-xs font-semibold py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50">
                    Aprobar
                  </button>
                  <button type="submit"
                    [disabled]="resolucionForm.invalid || !resolucionForm.value.observacion"
                    (click)="accion.set('rechazar')"
                    class="flex-1 text-xs font-semibold py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50">
                    Rechazar
                  </button>
                </div>
              </form>
            </div>
          }

        </div>

        <!-- Pie -->
        <div class="px-6 py-4 border-t border-slate-100">
          <button type="button" (click)="cerrar()"
            class="text-sm text-slate-500 hover:text-slate-700 transition-colors px-3 py-2 rounded-lg hover:bg-slate-100">
            ← Volver al listado
          </button>
        </div>
      </div>
    } @else {
      <div class="flex items-center justify-center h-full">
        <p class="text-slate-400 text-sm">Trámite no encontrado.</p>
      </div>
    }
  `,
})
export class TramiteAcademicoDetalleComponent implements OnInit {
  private readonly service = inject(TramiteAcademicoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly tramite = signal<TramiteAcademico | undefined>(undefined);
  protected readonly accion = signal<'aprobar' | 'rechazar'>('aprobar');

  protected readonly tipoLabels = TIPO_TRAMITE_ACADEMICO_LABELS;
  protected readonly estadoLabels = ESTADO_TRAMITE_ACADEMICO_LABELS;
  protected readonly estadoClasses = ESTADO_TRAMITE_ACADEMICO_CLASSES;

  protected readonly resolucionForm = this.fb.group({
    evaluador: ['', Validators.required],
    observacion: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.tramite.set(this.service.getById(id));
    }
  }

  protected derivarARevision(id: string): void {
    this.service.derivarARevision(id, 'Mesa de partes');
    this.tramite.set(this.service.getById(id));
  }

  protected submitResolucion(t: TramiteAcademico): void {
    if (this.resolucionForm.invalid) return;
    const { evaluador, observacion } = this.resolucionForm.getRawValue();
    if (this.accion() === 'aprobar') {
      this.service.aprobar(t.id, evaluador!, observacion ?? undefined);
    } else {
      if (!observacion) return;
      this.service.rechazar(t.id, evaluador!, observacion);
    }
    this.tramite.set(this.service.getById(t.id));
    this.resolucionForm.reset();
  }

  protected cerrar(): void {
    this.router.navigate([{ outlets: { panel: null } }]);
  }
}
