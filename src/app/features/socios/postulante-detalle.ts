import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PostulanteService } from '../../core/services/postulante.service';
import { SocioService } from '../../core/services/socio.service';
import {
  Postulante,
  DependientePostulante,
  EstadoPostulante,
  ESTADO_POSTULANTE_LABELS,
  ESTADO_POSTULANTE_CLASSES,
  ESTADO_DEP_POSTULANTE_LABELS,
  ESTADO_DEP_POSTULANTE_CLASSES,
  WORKFLOW_STEPS,
} from '../../core/models/postulante.model';
import {
  TIPO_DOCUMENTO_LABELS,
  RELACION_DEPENDIENTE_LABELS,
  RelacionDependiente,
} from '../../core/models/socio.model';

@Component({
  selector: 'app-postulante-detalle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    @if (postulante(); as p) {
      <div class="h-full flex flex-col">

        <!-- Cabecera -->
        <div class="px-6 py-5 border-b border-slate-100">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold text-slate-800">{{ p.apellido }}, {{ p.nombre }}</h2>
              <p class="text-xs text-slate-500">
                {{ tipoDocLabels[p.tipoDocumento] }}: {{ p.dni }}
                @if (p.codigoPostulante) { · {{ p.codigoPostulante }} }
                · Ingreso: {{ p.fechaIngreso }}
              </p>
            </div>
            <span class="text-xs px-2.5 py-1 rounded-full font-semibold shrink-0"
              [class]="estadoClasses[p.estado]">
              {{ estadoLabels[p.estado] }}
            </span>
          </div>

          <!-- Workflow stepper -->
          <div class="mt-4">
            <ol class="flex items-center gap-0 w-full overflow-x-auto" aria-label="Progreso del workflow">
              @for (step of workflowSteps; track step; let i = $index; let last = $last) {
                <li class="flex items-center flex-1 min-w-0">
                  <div class="flex flex-col items-center flex-1 min-w-0">
                    <div class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold transition-colors"
                      [class]="getStepBubble(p.estado, step)">
                      @if (isStepCompleted(p.estado, step)) {
                        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd"/></svg>
                      } @else {
                        {{ i + 1 }}
                      }
                    </div>
                    <span class="text-[9px] font-medium text-center leading-tight mt-1 text-slate-500 hidden sm:block">
                      {{ estadoLabels[step] }}
                    </span>
                  </div>
                  @if (!last) {
                    <div class="h-0.5 flex-1 mx-1 rounded transition-colors"
                      [class]="isStepCompleted(p.estado, step) && !isStepCurrent(p.estado, step) ? 'bg-indigo-400' : 'bg-slate-200'">
                    </div>
                  }
                </li>
              }
            </ol>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          <!-- Datos personales -->
          <div class="rounded-xl border border-slate-100 overflow-hidden">
            <button type="button"
              class="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-semibold text-slate-700"
              (click)="datosPlegados.set(!datosPlegados())"
              [attr.aria-expanded]="!datosPlegados()">
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/></svg>
                Datos personales
              </span>
              <svg class="w-4 h-4 text-slate-400 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                [style.transform]="datosPlegados() ? '' : 'rotate(180deg)'">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
              </svg>
            </button>
            @if (!datosPlegados()) {
              <div class="px-4 py-4 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                @if (p.email) {
                  <div><span class="text-xs text-slate-400 block">Email</span><span class="text-slate-700">{{ p.email }}</span></div>
                }
                @if (p.telefono) {
                  <div><span class="text-xs text-slate-400 block">Teléfono</span><span class="text-slate-700">{{ p.telefono }}</span></div>
                }
                @if (p.fechaNacimiento) {
                  <div><span class="text-xs text-slate-400 block">Fecha de nacimiento</span><span class="text-slate-700">{{ p.fechaNacimiento }}</span></div>
                }
                @if (p.sexo) {
                  <div><span class="text-xs text-slate-400 block">Sexo</span><span class="text-slate-700 capitalize">{{ p.sexo }}</span></div>
                }
                @if (p.nacionalidad) {
                  <div><span class="text-xs text-slate-400 block">Nacionalidad</span><span class="text-slate-700">{{ p.nacionalidad }}</span></div>
                }
                @if (p.direccion) {
                  <div class="col-span-2"><span class="text-xs text-slate-400 block">Dirección</span><span class="text-slate-700">{{ p.direccion }}</span></div>
                }
                @if (p.condicionDeseada) {
                  <div><span class="text-xs text-slate-400 block">Condición deseada</span><span class="text-slate-700 capitalize">{{ p.condicionDeseada }}</span></div>
                }
                @if (p.observaciones) {
                  <div class="col-span-2"><span class="text-xs text-slate-400 block">Observaciones</span><span class="text-slate-600 italic text-xs">{{ p.observaciones }}</span></div>
                }
              </div>
            }
          </div>

          <!-- Documentos -->
          <div>
            <p class="text-sm font-semibold text-slate-700 mb-2">
              Documentos adjuntos
              <span class="ml-1 text-xs font-normal text-slate-400">({{ p.documentos.length }})</span>
            </p>
            @if (p.documentos.length > 0) {
              <ul class="space-y-2">
                @for (doc of p.documentos; track doc.id) {
                  <li class="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                    <div>
                      <p class="font-medium text-slate-800">{{ doc.nombre }}</p>
                      <p class="text-[10px] text-slate-400">Cargado el {{ doc.cargadoEn }}</p>
                    </div>
                    <span class="text-xs px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-medium">{{ doc.tipo }}</span>
                  </li>
                }
              </ul>
            } @else {
              <div class="rounded-lg bg-amber-50 border border-amber-100 p-3 text-xs text-amber-700">
                Sin documentos cargados aún.
              </div>
            }
          </div>

          <!-- Grupo familiar / Dependientes -->
          @if (p.condicionDeseada === 'familiar' || (p.dependientesPostulantes ?? []).length > 0) {
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <p class="text-sm font-semibold text-slate-700">
                  Grupo familiar
                  <span class="ml-1 text-xs font-normal text-slate-400">({{ (p.dependientesPostulantes ?? []).length }})</span>
                </p>
                @if (p.estado !== 'rechazado' && p.estado !== 'aprobado') {
                  <button type="button"
                    class="text-xs px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-semibold transition-colors"
                    (click)="mostrarFormDep.set(!mostrarFormDep())">
                    @if (mostrarFormDep()) { Cancelar } @else { + Agregar integrante }
                  </button>
                }
              </div>

              @if (mostrarFormDep()) {
                <div class="rounded-xl border-2 border-indigo-200 bg-indigo-50/40 p-4 space-y-3">
                  <p class="text-xs font-semibold text-indigo-700">Nuevo integrante del grupo familiar</p>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label for="dep-apellido" class="block text-xs font-medium text-slate-600 mb-1">Apellido *</label>
                      <input id="dep-apellido" type="text" class="input-modern !py-1.5 !text-sm"
                        [value]="nuevoDep().apellido ?? ''"
                        (input)="nuevoDep.update(d => ({...d, apellido: $any($event.target).value}))" />
                    </div>
                    <div>
                      <label for="dep-nombre" class="block text-xs font-medium text-slate-600 mb-1">Nombre *</label>
                      <input id="dep-nombre" type="text" class="input-modern !py-1.5 !text-sm"
                        [value]="nuevoDep().nombre ?? ''"
                        (input)="nuevoDep.update(d => ({...d, nombre: $any($event.target).value}))" />
                    </div>
                    <div>
                      <label for="dep-dni" class="block text-xs font-medium text-slate-600 mb-1">DNI *</label>
                      <input id="dep-dni" type="text" class="input-modern !py-1.5 !text-sm"
                        [value]="nuevoDep().dni ?? ''"
                        (input)="nuevoDep.update(d => ({...d, dni: $any($event.target).value}))" />
                    </div>
                    <div>
                      <label for="dep-relacion" class="block text-xs font-medium text-slate-600 mb-1">Relación *</label>
                      <select id="dep-relacion" class="input-modern !py-1.5 !text-sm"
                        [value]="nuevoDep().relacion ?? 'hijo'"
                        (change)="nuevoDep.update(d => ({...d, relacion: $any($event.target).value}))">
                        @for (opt of relacionOpts; track opt.value) {
                          <option [value]="opt.value">{{ opt.label }}</option>
                        }
                      </select>
                    </div>
                    <div>
                      <label for="dep-fnac" class="block text-xs font-medium text-slate-600 mb-1">Fecha de nacimiento</label>
                      <input id="dep-fnac" type="date" class="input-modern !py-1.5 !text-sm"
                        [value]="nuevoDep().fechaNacimiento ?? ''"
                        (input)="nuevoDep.update(d => ({...d, fechaNacimiento: $any($event.target).value || undefined}))" />
                    </div>
                    <div>
                      <label for="dep-sexo" class="block text-xs font-medium text-slate-600 mb-1">Sexo</label>
                      <select id="dep-sexo" class="input-modern !py-1.5 !text-sm"
                        [value]="nuevoDep().sexo ?? ''"
                        (change)="nuevoDep.update(d => ({...d, sexo: $any($event.target).value || undefined}))">
                        <option value="">— Sin especificar —</option>
                        <option value="masculino">Masculino</option>
                        <option value="femenino">Femenino</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button type="button"
                      class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors"
                      (click)="agregarDep(p.id)">
                      Agregar
                    </button>
                    <button type="button"
                      class="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors"
                      (click)="mostrarFormDep.set(false)">
                      Cancelar
                    </button>
                  </div>
                </div>
              }

              @if ((p.dependientesPostulantes ?? []).length === 0) {
                <div class="rounded-lg bg-amber-50 border border-amber-100 p-3 text-xs text-amber-700 text-center">
                  Sin integrantes registrados aún.
                  @if (p.condicionDeseada === 'familiar') {
                    &nbsp;Agregue los integrantes del grupo familiar.
                  }
                </div>
              }

              <ul class="space-y-2">
                @for (dep of p.dependientesPostulantes ?? []; track dep.id) {
                  <li class="rounded-xl border border-slate-100 bg-slate-50 overflow-hidden">
                    <div class="flex items-center justify-between gap-3 px-3 py-3">
                      <div class="min-w-0">
                        <p class="font-semibold text-slate-800 text-sm leading-tight">{{ dep.apellido }}, {{ dep.nombre }}</p>
                        <p class="text-xs text-slate-500">
                          {{ relacionLabels[dep.relacion] }} · DNI {{ dep.dni }}
                          @if (dep.fechaNacimiento) { · {{ dep.fechaNacimiento }} }
                        </p>
                      </div>
                      <div class="flex items-center gap-1.5 shrink-0">
                        <span class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          [class]="depEstadoClasses[dep.estado]">
                          {{ depEstadoLabels[dep.estado] }}
                        </span>
                        @if (dep.estado === 'pendiente' && p.estado !== 'rechazado' && p.estado !== 'aprobado') {
                          <button type="button"
                            class="text-[10px] px-2 py-0.5 rounded font-semibold bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                            (click)="aceptarDep(p.id, dep.id)">
                            Aceptar
                          </button>
                          <button type="button"
                            class="text-[10px] px-2 py-0.5 rounded font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                            (click)="iniciarRechazoDir(dep.id)">
                            Rechazar
                          </button>
                        }
                      </div>
                    </div>
                    @if (rechazandoDepId() === dep.id) {
                      <div class="border-t border-slate-200 bg-white px-3 py-3 space-y-2">
                        <label [for]="'motivo-dep-' + dep.id" class="block text-xs font-medium text-slate-600">
                          Motivo de rechazo <span class="text-red-500">*</span>
                        </label>
                        <textarea [id]="'motivo-dep-' + dep.id"
                          class="input-modern !text-sm !h-auto resize-none"
                          rows="2"
                          [value]="motivoRechazoDep()"
                          (input)="motivoRechazoDep.set($any($event.target).value)"
                          placeholder="Especifique el motivo..."></textarea>
                        <div class="flex gap-2">
                          <button type="button"
                            class="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors"
                            (click)="confirmarRechazoDep(p.id, dep.id)">
                            Confirmar rechazo
                          </button>
                          <button type="button"
                            class="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors"
                            (click)="rechazandoDepId.set(null)">
                            Cancelar
                          </button>
                        </div>
                      </div>
                    }
                    @if (dep.estado === 'rechazado' && dep.motivoRechazo) {
                      <div class="border-t border-red-100 bg-red-50 px-3 py-2">
                        <p class="text-xs text-red-700 italic">Motivo: {{ dep.motivoRechazo }}</p>
                      </div>
                    }
                  </li>
                }
              </ul>
            </div>
          }

          <!-- Historial del workflow -->
          <div>
            <p class="text-sm font-semibold text-slate-700 mb-3">Historial de acciones</p>
            <ol class="relative border-l border-slate-200 ml-3 space-y-4">
              @for (entry of p.historial; track entry.fecha + entry.estado) {
                <li class="ml-4">
                  <span class="absolute -left-1.5 mt-0.5 h-3 w-3 rounded-full border-2 border-white"
                    [class]="estadoClasses[entry.estado].split(' ')[0]"></span>
                  <p class="text-xs font-semibold text-slate-800">{{ estadoLabels[entry.estado] }}</p>
                  <p class="text-[10px] text-slate-400">{{ entry.operador }} · {{ entry.fecha }}</p>
                  @if (entry.observacion) {
                    <p class="text-xs text-slate-600 mt-0.5 italic">{{ entry.observacion }}</p>
                  }
                </li>
              }
            </ol>
          </div>

          @if (p.motivoRechazo) {
            <div class="rounded-lg bg-red-50 border border-red-100 p-4">
              <p class="text-xs font-semibold text-red-700 mb-1">Motivo de rechazo</p>
              <p class="text-sm text-red-800">{{ p.motivoRechazo }}</p>
            </div>
          }

          @if (p.socioConvertidoId) {
            <div class="rounded-lg bg-green-50 border border-green-200 p-4 flex items-center gap-3">
              <svg class="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
              <p class="text-sm text-green-800">Postulante convertido en socio. ID: <span class="font-mono font-bold">{{ p.socioConvertidoId }}</span></p>
            </div>
          }

          <!-- ===== PANEL DE ACCIONES DEL WORKFLOW ===== -->
          @if (p.estado !== 'rechazado' && p.estado !== 'aprobado') {
            <div class="rounded-xl border-2 border-indigo-100 bg-indigo-50/40 p-5 space-y-4">
              <p class="text-sm font-semibold text-indigo-800">
                Acción disponible: avanzar al siguiente paso
              </p>

              @switch (p.estado) {

                @case ('ingresado') {
                  <div class="space-y-3">
                    <div>
                      <label for="obs-doc-pend" class="block text-xs font-medium text-slate-600 mb-1">Observación (opcional)</label>
                      <textarea id="obs-doc-pend" [formControl]="obsControl" rows="2"
                        class="input-modern !text-sm !h-auto resize-none"
                        placeholder="Detalle los documentos requeridos..."></textarea>
                    </div>
                    <button type="button"
                      class="w-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
                      (click)="avanzar(p.id, 'documentacion_pendiente')">
                      Solicitar documentación →
                    </button>
                  </div>
                }

                @case ('documentacion_pendiente') {
                  <div class="space-y-3">
                    <div>
                      <label for="obs-doc-comp" class="block text-xs font-medium text-slate-600 mb-1">Observación (opcional)</label>
                      <textarea id="obs-doc-comp" [formControl]="obsControl" rows="2"
                        class="input-modern !text-sm !h-auto resize-none"
                        placeholder="Confirmación de documentos recibidos..."></textarea>
                    </div>
                    <button type="button"
                      class="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
                      (click)="avanzar(p.id, 'documentacion_completa')">
                      Confirmar documentación recibida →
                    </button>
                  </div>
                }

                @case ('documentacion_completa') {
                  <div class="space-y-3">
                    <div>
                      <label for="obs-eval" class="block text-xs font-medium text-slate-600 mb-1">Observación (opcional)</label>
                      <textarea id="obs-eval" [formControl]="obsControl" rows="2"
                        class="input-modern !text-sm !h-auto resize-none"
                        placeholder="Notas para la comisión evaluadora..."></textarea>
                    </div>
                    <button type="button"
                      class="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
                      (click)="avanzar(p.id, 'en_evaluacion')">
                      Elevar a comisión evaluadora →
                    </button>
                  </div>
                }

                @case ('en_evaluacion') {
                  <form [formGroup]="rechazarForm" class="space-y-3">
                    <!-- Aprobar -->
                    <div class="space-y-2">
                      <div>
                        <label for="obs-aprobacion" class="block text-xs font-medium text-slate-600 mb-1">Observación de aprobación</label>
                        <textarea id="obs-aprobacion" [formControl]="obsControl" rows="2"
                          class="input-modern !text-sm !h-auto resize-none"
                          placeholder="Notas de la comisión al aprobar..."></textarea>
                      </div>
                      <button type="button"
                        class="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
                        (click)="aprobar(p.id)">
                        Aprobar postulante ✓
                      </button>
                    </div>

                    <div class="relative flex items-center gap-2 my-2">
                      <div class="flex-1 border-t border-slate-200"></div>
                      <span class="text-xs text-slate-400 shrink-0">o</span>
                      <div class="flex-1 border-t border-slate-200"></div>
                    </div>

                    <!-- Rechazar -->
                    <div class="space-y-2">
                      <div>
                        <label for="motivo-rechazo" class="block text-xs font-medium text-slate-600 mb-1">
                          Motivo de rechazo <span class="text-red-500">*</span>
                        </label>
                        <textarea id="motivo-rechazo" formControlName="motivo" rows="2"
                          class="input-modern !text-sm !h-auto resize-none"
                          [class]="rechazarForm.get('motivo')!.invalid && rechazarForm.get('motivo')!.touched ? '!border-red-400' : ''"
                          placeholder="Especifique el motivo del rechazo..."></textarea>
                        @if (rechazarForm.get('motivo')!.invalid && rechazarForm.get('motivo')!.touched) {
                          <p class="text-xs text-red-500 mt-1">El motivo de rechazo es obligatorio.</p>
                        }
                      </div>
                      <button type="button"
                        class="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
                        (click)="rechazar(p.id)">
                        Rechazar postulante ✗
                      </button>
                    </div>
                  </form>
                }

              }
            </div>
          }

          <!-- Convertir a socio (solo estado aprobado y no convertido aún) -->
          @if (p.estado === 'aprobado' && !p.socioConvertidoId) {
            <div class="rounded-xl border-2 border-green-200 bg-green-50/60 p-5 space-y-3">
              <div>
                <p class="text-sm font-semibold text-green-800">Postulante aprobado</p>
                <p class="text-xs text-green-700 mt-1">Puede convertir este postulante en socio. Se creará un nuevo registro con los datos disponibles.</p>
              </div>

              @if ((p.dependientesPostulantes ?? []).length > 0) {
                @if (depAceptados(p).length > 0) {
                  <div class="rounded-lg bg-white border border-green-200 p-3">
                    <p class="text-xs font-semibold text-green-800 mb-2">Dependientes que se incluirán:</p>
                    <ul class="space-y-1">
                      @for (dep of depAceptados(p); track dep.id) {
                        <li class="text-xs text-green-700 flex items-center gap-1.5">
                          <svg class="w-3 h-3 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd"/></svg>
                          {{ dep.apellido }}, {{ dep.nombre }} ({{ relacionLabels[dep.relacion] }})
                        </li>
                      }
                    </ul>
                  </div>
                }
                @if (depRechazados(p).length > 0) {
                  <div class="rounded-lg bg-white border border-red-100 p-3">
                    <p class="text-xs font-semibold text-red-700 mb-1">No se incluirán (rechazados):</p>
                    <ul class="space-y-1">
                      @for (dep of depRechazados(p); track dep.id) {
                        <li class="text-xs text-red-600">{{ dep.apellido }}, {{ dep.nombre }}</li>
                      }
                    </ul>
                  </div>
                }
                @if (depPendientes(p).length > 0) {
                  <div class="rounded-lg bg-amber-50 border border-amber-100 p-3">
                    <p class="text-xs text-amber-700">
                      <strong>Atención:</strong> {{ depPendientes(p).length }} integrante(s) aún sin resolver quedarán excluidos.
                    </p>
                  </div>
                }
              }

              <button type="button"
                class="w-full bg-green-700 hover:bg-green-800 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
                (click)="convertirEnSocio(p)">
                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
                Convertir en socio
              </button>
            </div>
          }

        </div>
      </div>
    } @else {
      <div class="flex items-center justify-center h-full text-slate-400">
        Postulante no encontrado.
      </div>
    }
  `,
})
export class PostulanteDetalleComponent implements OnInit {
  private readonly postulanteService = inject(PostulanteService);
  private readonly socioService = inject(SocioService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  protected readonly postulante = signal<Postulante | undefined>(undefined);
  protected readonly datosPlegados = signal(true);

  protected readonly estadoLabels = ESTADO_POSTULANTE_LABELS;
  protected readonly estadoClasses = ESTADO_POSTULANTE_CLASSES;
  protected readonly tipoDocLabels = TIPO_DOCUMENTO_LABELS;
  protected readonly workflowSteps = WORKFLOW_STEPS;
  protected readonly depEstadoLabels = ESTADO_DEP_POSTULANTE_LABELS;
  protected readonly depEstadoClasses = ESTADO_DEP_POSTULANTE_CLASSES;
  protected readonly relacionLabels = RELACION_DEPENDIENTE_LABELS;
  protected readonly relacionOpts = Object.entries(RELACION_DEPENDIENTE_LABELS).map(
    ([value, label]) => ({ value: value as RelacionDependiente, label })
  );

  /** Control para observaciones de avance */
  protected readonly obsControl = this.fb.control('');
  /** Formulario de rechazo */
  protected readonly rechazarForm = this.fb.group({ motivo: ['', Validators.required] });

  /** Dependientes del grupo familiar */
  protected readonly mostrarFormDep = signal(false);
  protected readonly nuevoDep = signal<Partial<DependientePostulante>>({ relacion: 'hijo', tipoDocumento: 'dni' });
  protected readonly rechazandoDepId = signal<string | null>(null);
  protected readonly motivoRechazoDep = signal('');

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.postulante.set(this.postulanteService.getById(id));
        this.mostrarFormDep.set(false);
        this.rechazandoDepId.set(null);
      }
    });
  }

  protected isStepCompleted(estadoActual: EstadoPostulante, step: EstadoPostulante): boolean {
    if (estadoActual === 'rechazado') return false;
    const currentIdx = WORKFLOW_STEPS.indexOf(estadoActual);
    const stepIdx = WORKFLOW_STEPS.indexOf(step);
    return stepIdx <= currentIdx;
  }

  protected isStepCurrent(estadoActual: EstadoPostulante, step: EstadoPostulante): boolean {
    return estadoActual === step;
  }

  protected getStepBubble(estadoActual: EstadoPostulante, step: EstadoPostulante): string {
    if (estadoActual === 'rechazado') return 'bg-slate-200 text-slate-400';
    const currentIdx = WORKFLOW_STEPS.indexOf(estadoActual);
    const stepIdx = WORKFLOW_STEPS.indexOf(step);
    if (stepIdx < currentIdx) return 'bg-indigo-500 text-white';
    if (stepIdx === currentIdx) return 'bg-indigo-700 text-white ring-2 ring-indigo-300';
    return 'bg-slate-200 text-slate-400';
  }

  protected avanzar(id: string, nuevoEstado: EstadoPostulante): void {
    const obs = this.obsControl.value ?? '';
    const hoy = new Date().toISOString().split('T')[0];
    this.postulanteService.avanzarEstado(id, nuevoEstado, {
      fecha: hoy,
      operador: 'Admin',
      observacion: obs || undefined,
    });
    this.obsControl.reset();
    this.postulante.set(this.postulanteService.getById(id));
  }

  protected aprobar(id: string): void {
    const obs = this.obsControl.value ?? '';
    const hoy = new Date().toISOString().split('T')[0];
    this.postulanteService.avanzarEstado(id, 'aprobado', {
      fecha: hoy,
      operador: 'Admin',
      observacion: obs || 'Aprobado por comisión.',
    });
    this.obsControl.reset();
    this.postulante.set(this.postulanteService.getById(id));
  }

  protected rechazar(id: string): void {
    this.rechazarForm.markAllAsTouched();
    if (this.rechazarForm.invalid) return;
    const motivo = this.rechazarForm.getRawValue().motivo ?? '';
    const hoy = new Date().toISOString().split('T')[0];
    this.postulanteService.rechazar(id, motivo, 'Admin', hoy);
    this.rechazarForm.reset();
    this.postulante.set(this.postulanteService.getById(id));
  }

  protected depAceptados(p: Postulante): DependientePostulante[] {
    return (p.dependientesPostulantes ?? []).filter(d => d.estado === 'aceptado');
  }

  protected depRechazados(p: Postulante): DependientePostulante[] {
    return (p.dependientesPostulantes ?? []).filter(d => d.estado === 'rechazado');
  }

  protected depPendientes(p: Postulante): DependientePostulante[] {
    return (p.dependientesPostulantes ?? []).filter(d => d.estado === 'pendiente');
  }

  protected agregarDep(postulanteId: string): void {
    const dep = this.nuevoDep();
    if (!dep.nombre?.trim() || !dep.apellido?.trim() || !dep.dni?.trim()) return;
    this.postulanteService.agregarDependientePostulante(postulanteId, {
      nombre: dep.nombre.trim(),
      apellido: dep.apellido.trim(),
      tipoDocumento: dep.tipoDocumento ?? 'dni',
      dni: dep.dni.trim(),
      fechaNacimiento: dep.fechaNacimiento,
      relacion: dep.relacion ?? 'hijo',
      sexo: dep.sexo,
    });
    this.nuevoDep.set({ relacion: 'hijo', tipoDocumento: 'dni' });
    this.mostrarFormDep.set(false);
    this.postulante.set(this.postulanteService.getById(postulanteId));
  }

  protected aceptarDep(postulanteId: string, depId: string): void {
    this.postulanteService.cambiarEstadoDependiente(postulanteId, depId, 'aceptado');
    this.postulante.set(this.postulanteService.getById(postulanteId));
  }

  protected iniciarRechazoDir(depId: string): void {
    this.rechazandoDepId.set(depId);
    this.motivoRechazoDep.set('');
  }

  protected confirmarRechazoDep(postulanteId: string, depId: string): void {
    const motivo = this.motivoRechazoDep().trim();
    if (!motivo) return;
    this.postulanteService.cambiarEstadoDependiente(postulanteId, depId, 'rechazado', motivo);
    this.rechazandoDepId.set(null);
    this.motivoRechazoDep.set('');
    this.postulante.set(this.postulanteService.getById(postulanteId));
  }

  protected convertirEnSocio(p: Postulante): void {
    const hoy = new Date().toISOString().split('T')[0];
    this.socioService.create({
      nombre: p.nombre,
      apellido: p.apellido,
      tipoDocumento: p.tipoDocumento,
      dni: p.dni,
      email: p.email,
      telefono: p.telefono,
      fechaNacimiento: p.fechaNacimiento,
      sexo: p.sexo,
      nacionalidad: p.nacionalidad,
      direccion: p.direccion,
      condicionSocietaria: p.condicionDeseada,
      condicionInstitucional: 'socio',
      estado: 'activo',
      fechaAlta: hoy,
      observaciones: `Convertido desde postulante ${p.codigoPostulante ?? p.id}.`,
    });
    const socios = this.socioService.items();
    const nuevoSocio = socios[socios.length - 1];
    // Agregar dependientes aceptados al socio recién creado
    for (const dep of this.depAceptados(p)) {
      this.socioService.agregarDependiente(nuevoSocio.id, {
        nombre: dep.nombre,
        apellido: dep.apellido,
        dni: dep.dni,
        fechaNacimiento: dep.fechaNacimiento,
        relacion: dep.relacion,
        condicion: 'dependiente',
        marcaProteccionPermanencia: false,
        estado: 'activo',
        fechaAlta: hoy,
      });
    }
    this.postulanteService.marcarConvertido(p.id, nuevoSocio.id);
    this.postulante.set(this.postulanteService.getById(p.id));
  }
}
