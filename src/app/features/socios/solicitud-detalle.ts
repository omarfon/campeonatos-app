import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { TramiteSocietarioService } from '../../core/services/tramite-societario.service';
import { SocioService } from '../../core/services/socio.service';
import { SolicitudSocietaria } from '../../core/models/tramite-societario.model';
import {
  TIPO_TRAMITE_LABELS,
  ESTADO_SOLICITUD_LABELS,
  ESTADO_SOLICITUD_CLASSES,
} from '../../core/models/tramite-societario.model';

@Component({
  selector: 'app-solicitud-detalle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, SlicePipe],
  template: `
    @if (solicitud(); as sol) {
      <div class="h-full flex flex-col">
        <!-- Cabecera -->
        <div class="px-6 py-5 border-b border-slate-100">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold text-slate-800">{{ tipoLabels[sol.tipo] }}</h2>
              @if (getSocio(sol.socioId); as s) {
                <p class="text-sm text-slate-500">{{ s.apellido }}, {{ s.nombre }} · DNI: {{ s.dni }}</p>
              }
            </div>
            <span class="text-xs px-2.5 py-1 rounded-full font-semibold shrink-0"
              [class]="estadoClasses[sol.estado]">
              {{ estadoLabels[sol.estado] }}
            </span>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          <!-- Descripción -->
          <div class="rounded-lg bg-slate-50 border border-slate-100 p-4">
            <p class="text-xs font-semibold text-slate-500 mb-1">Descripción del trámite</p>
            <p class="text-sm text-slate-800">{{ sol.descripcion }}</p>
            @if (sol.vigenciaInicio) {
              <p class="text-xs text-slate-500 mt-2">Vigencia: {{ sol.vigenciaInicio }} — {{ sol.vigenciaFin ?? 'indefinida' }}</p>
            }
          </div>

          <!-- Documentos adjuntos -->
          @if (sol.documentos.length > 0) {
            <div>
              <p class="text-sm font-semibold text-slate-700 mb-2">Documentos adjuntos ({{ sol.documentos.length }})</p>
              <ul class="space-y-2">
                @for (doc of sol.documentos; track doc.id) {
                  <li class="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                    <div>
                      <p class="font-medium text-slate-800">{{ doc.nombre }}</p>
                      <p class="text-xs text-slate-400">Cargado por {{ doc.cargadoPor }} el {{ doc.cargadoEn }}</p>
                    </div>
                    <span class="text-xs text-brand font-medium uppercase">{{ doc.tipo }}</span>
                  </li>
                }
              </ul>
            </div>
          } @else {
            <div class="rounded-lg bg-amber-50 border border-amber-100 p-3 text-xs text-amber-700">
              Sin documentos adjuntos. Verifique antes de aprobar.
            </div>
          }

          <!-- Historial de auditoría -->
          <div>
            <p class="text-sm font-semibold text-slate-700 mb-3">Historial de acciones</p>
            <ol class="relative border-l border-slate-200 ml-3 space-y-4">
              @for (entry of sol.auditoria; track entry.fechaHora) {
                <li class="ml-4">
                  <span class="absolute -left-1.5 mt-0.5 h-3 w-3 rounded-full border-2 border-white bg-brand"></span>
                  <p class="text-xs font-semibold text-slate-800">{{ entry.accion }}</p>
                  <p class="text-[10px] text-slate-400">{{ entry.usuario }} · {{ entry.fechaHora | slice:0:16 }}</p>
                  @if (entry.observacion) {
                    <p class="text-xs text-slate-600 mt-0.5 italic">{{ entry.observacion }}</p>
                  }
                </li>
              }
            </ol>
          </div>

          @if (sol.motivoRechazo) {
            <div class="rounded-lg bg-red-50 border border-red-100 p-4">
              <p class="text-xs font-semibold text-red-700 mb-1">Motivo de rechazo</p>
              <p class="text-sm text-red-800">{{ sol.motivoRechazo }}</p>
            </div>
          }

          <!-- Acciones según estado -->
          @if (sol.estado === 'enviada' || sol.estado === 'en_evaluacion') {
            <div class="rounded-xl border-2 border-brand-100 bg-brand-50/30 p-4 space-y-4">
              <p class="text-sm font-semibold text-brand-800">Resolución de solicitud</p>

              @if (sol.estado === 'enviada') {
                <button type="button"
                  class="btn-secondary !text-sm w-full"
                  (click)="derivar(sol.id)">
                  Derivar a evaluación
                </button>
              }

              <!-- Aprobar -->
              <form [formGroup]="aprobarForm" (ngSubmit)="aprobar(sol.id)" class="space-y-3">
                <div>
                  <label for="obsAprobacion" class="block text-xs font-medium text-slate-600 mb-1">Observación de aprobación (opcional)</label>
                  <textarea id="obsAprobacion" formControlName="observacion" rows="2"
                    class="input-modern !text-sm"
                    placeholder="Observaciones para la aprobación..."></textarea>
                </div>
                <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors">
                  Aprobar solicitud
                </button>
              </form>

              <!-- Rechazar -->
              <form [formGroup]="rechazarForm" (ngSubmit)="rechazar(sol.id)" class="space-y-3 border-t border-red-100 pt-4">
                <div>
                  <label for="motivoRechazo" class="block text-xs font-medium text-slate-600 mb-1">Motivo de rechazo *</label>
                  <textarea id="motivoRechazo" formControlName="motivo" rows="2"
                    class="input-modern !text-sm"
                    placeholder="Explique el motivo del rechazo..."></textarea>
                </div>
                <button type="submit"
                  [disabled]="rechazarForm.invalid"
                  class="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Rechazar solicitud
                </button>
              </form>
            </div>
          }

        </div>

        <!-- Footer -->
        <div class="border-t border-slate-100 px-6 py-4 flex justify-between items-center">
          <p class="text-xs text-slate-400">Creada: {{ sol.fechaCreacion }} · Última acción: {{ sol.fechaUltimaAccion }}</p>
          <button type="button" (click)="cerrar()" class="btn-secondary !text-sm">Cerrar</button>
        </div>
      </div>
    } @else {
      <div class="flex items-center justify-center h-full">
        <p class="text-slate-400">Solicitud no encontrada.</p>
      </div>
    }
  `,
})
export class SolicitudDetalleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tramiteService = inject(TramiteSocietarioService);
  private readonly socioService = inject(SocioService);
  private readonly fb = inject(FormBuilder);

  protected readonly solicitud = signal<SolicitudSocietaria | undefined>(undefined);

  protected readonly tipoLabels = TIPO_TRAMITE_LABELS;
  protected readonly estadoLabels = ESTADO_SOLICITUD_LABELS;
  protected readonly estadoClasses = ESTADO_SOLICITUD_CLASSES;

  protected readonly aprobarForm = this.fb.nonNullable.group({
    observacion: [''],
  });

  protected readonly rechazarForm = this.fb.nonNullable.group({
    motivo: ['', Validators.required],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.solicitud.set(this.tramiteService.getById(id));
    }
  }

  protected getSocio(socioId: string) {
    return this.socioService.getById(socioId);
  }

  protected derivar(id: string): void {
    this.tramiteService.derivarParaEvaluacion(id, 'Evaluador Asignado');
    this.solicitud.set(this.tramiteService.getById(id));
  }

  protected aprobar(id: string): void {
    const obs = this.aprobarForm.getRawValue().observacion;
    this.tramiteService.aprobar(id, 'Gerencia', obs || undefined);
    this.solicitud.set(this.tramiteService.getById(id));
    this.aprobarForm.reset();
  }

  protected rechazar(id: string): void {
    if (this.rechazarForm.invalid) return;
    const motivo = this.rechazarForm.getRawValue().motivo;
    this.tramiteService.rechazar(id, 'Evaluador', motivo);
    this.solicitud.set(this.tramiteService.getById(id));
    this.rechazarForm.reset();
  }

  protected cerrar(): void {
    this.router.navigate(['/', { outlets: { panel: null } }], {
      queryParamsHandling: 'merge',
    });
  }
}
