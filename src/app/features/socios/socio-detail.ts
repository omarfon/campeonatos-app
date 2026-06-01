import { Component, inject, signal, computed, OnInit, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SocioService } from '../../core/services/socio.service';
import { TramiteSocietarioService } from '../../core/services/tramite-societario.service';
import { CuotaSocietariaService } from '../../core/services/cuota-societaria.service';
import { CuotaSocietaria, ESTADO_CUOTA_LABELS, ESTADO_CUOTA_CLASSES } from '../../core/models/cuota-societaria.model';
import {
  Socio,
  Dependiente,
  DocumentoSocio,
  TipoDocumentoSocio,
  ESTADO_SOCIO_LABELS,
  EstadoSocio,
  CONDICION_SOCIETARIA_LABELS,
  CondicionSocietaria,
  RELACION_DEPENDIENTE_LABELS,
  SEXO_LABELS,
  CONDICION_INSTITUCIONAL_LABELS,
  TIPO_DOCUMENTO_LABELS,
  TIPO_DOCUMENTO_SOCIO_LABELS,
} from '../../core/models/socio.model';
import {
  TIPO_TRAMITE_LABELS,
  ESTADO_SOLICITUD_LABELS,
  ESTADO_SOLICITUD_CLASSES,
  EstadoSolicitud,
} from '../../core/models/tramite-societario.model';

type Tab = 'ficha' | 'dependientes' | 'tramites' | 'cuenta' | 'documentos';

@Component({
  selector: 'app-socio-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    @if (socio(); as s) {
      <div class="space-y-5">

        <!-- Cabecera panel -->
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-xl font-bold text-slate-900">{{ s.apellido }}, {{ s.nombre }}</h2>
            <p class="text-sm text-slate-500">DNI: {{ s.dni }}
              @if (s.codigoSocio) { &nbsp;·&nbsp; <span class="font-mono">{{ s.codigoSocio }}</span> }
            </p>
          </div>
          <div class="flex gap-2 shrink-0">
            <a [routerLink]="['/', { outlets: { primary: ['maestros', 'socios'], panel: ['maestros', 'socios', s.id, 'editar'] } }]"
               class="btn-secondary !text-xs !px-3 !py-1.5">Editar</a>
          </div>
        </div>

        <!-- Badge estado + condición -->
        <div class="flex flex-wrap gap-2">
          <span class="text-xs px-2.5 py-1 rounded-full font-semibold"
            [class]="estadoClasses[s.estado]">
            {{ estadoLabels[s.estado] }}
          </span>
          @if (s.condicionSocietaria) {
            <span class="text-xs px-2.5 py-1 rounded-full font-semibold"
              [class]="condicionClasses[s.condicionSocietaria]">
              {{ condicionLabels[s.condicionSocietaria] }}
            </span>
          }
          @if (s.discapacidad?.tieneDiscapacidad) {
            <span class="text-xs px-2.5 py-1 rounded-full font-semibold bg-purple-100 text-purple-700">
              Habilidad diferente
            </span>
          }
        </div>

        <!-- Tabs -->
        <div class="flex gap-1 bg-slate-100 rounded-xl p-1" role="tablist">
          @for (tab of tabs; track tab.id) {
            <button type="button" role="tab"
              [attr.aria-selected]="activeTab() === tab.id"
              [class]="activeTab() === tab.id
                ? 'flex-1 py-2 px-2 rounded-lg bg-white text-brand font-semibold text-xs shadow-sm'
                : 'flex-1 py-2 px-2 rounded-lg text-slate-500 hover:text-slate-800 font-medium text-xs'"
              (click)="activeTab.set(tab.id)">
              {{ tab.label }}
              @if (tab.id === 'dependientes' && ((s.dependientes ?? []).length + dependientesSocios().length) > 0) {
                <span class="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-brand-100 text-brand text-[9px] font-bold">{{ (s.dependientes ?? []).length + dependientesSocios().length }}</span>
              }
              @if (tab.id === 'tramites' && tramitesPendientes().length > 0) {
                <span class="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-[9px] font-bold">{{ tramitesPendientes().length }}</span>
              }
              @if (tab.id === 'cuenta' && cuotasPorCobrar().length > 0) {
                <span class="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-100 text-red-700 text-[9px] font-bold">{{ cuotasPorCobrar().length }}</span>
              }
            </button>
          }
        </div>

        <!-- TAB: Ficha -->
        @if (activeTab() === 'ficha') {
          <div class="section-card space-y-4">
            <h3 class="text-sm font-semibold text-slate-700 border-b pb-2">Datos personales</h3>
            <div class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <p class="text-xs text-slate-400">Fecha de nacimiento</p>
                <p class="font-medium">{{ s.fechaNacimiento ?? '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400">Sexo</p>
                <p class="font-medium">{{ s.sexo ?? '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400">Nacionalidad</p>
                <p class="font-medium">{{ s.nacionalidad ?? '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400">Fecha de alta</p>
                <p class="font-medium">{{ s.fechaAlta }}</p>
              </div>
              <div class="col-span-2">
                <p class="text-xs text-slate-400">Dirección</p>
                <p class="font-medium">{{ s.direccion ?? '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400">Email</p>
                <p class="font-medium">{{ s.email ?? '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400">Teléfono</p>
                <p class="font-medium">{{ s.telefono ?? '—' }}</p>
              </div>
            </div>

            @if (s.observaciones) {
              <div class="rounded-lg bg-amber-50 border border-amber-100 p-3">
                <p class="text-xs font-semibold text-amber-700 mb-0.5">Observaciones</p>
                <p class="text-sm text-amber-800">{{ s.observaciones }}</p>
              </div>
            }

            @if (s.discapacidad?.tieneDiscapacidad) {
              <div class="rounded-lg bg-purple-50 border border-purple-100 p-3 space-y-1">
                <p class="text-xs font-semibold text-purple-700">Situación de salud / habilidad diferente</p>
                <p class="text-sm text-purple-800">Tipo: {{ s.discapacidad?.tipo ?? '—' }}</p>
                @if (s.discapacidad?.numeroConadis) {
                  <p class="text-xs text-purple-600">N° CONADIS: {{ s.discapacidad?.numeroConadis }}</p>
                }
              </div>
            }

            @if ((s.personasRelacionadas ?? []).length > 0) {
              <div>
                <p class="text-xs font-semibold text-slate-600 mb-2">Personas relacionadas / apoderados</p>
                <ul class="space-y-2">
                  @for (p of s.personasRelacionadas; track p.id) {
                    <li class="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                      <span class="font-medium">{{ p.apellido }}, {{ p.nombre }}</span>
                      <span class="text-slate-400 text-xs ml-1">({{ p.relacion }})</span>
                      @if (p.telefono) { <span class="text-xs text-slate-500 ml-2">{{ p.telefono }}</span> }
                    </li>
                  }
                </ul>
              </div>
            }
          </div>
        }

        <!-- TAB: Dependientes -->
        @if (activeTab() === 'dependientes') {
          <div class="space-y-4">

            <!-- Socios vinculados como dependientes (tabla socios) -->
            @if (dependientesSocios().length > 0) {
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-semibold text-slate-700">Socios vinculados como dependientes</p>
                  <span class="text-[10px] px-1.5 py-0.5 rounded bg-brand-100 text-brand font-medium">{{ dependientesSocios().length }}</span>
                </div>
                @for (dep of dependientesSocios(); track dep.id) {
                  <div class="section-card overflow-hidden !p-0">

                    <!-- Cabecera — siempre visible -->
                    <button type="button"
                      class="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
                      [attr.aria-expanded]="expandedDepSocioIds().has(dep.id)"
                      (click)="toggleDepSocio(dep.id)">
                      <div class="flex items-center gap-3 min-w-0">
                        @if (dep.fotografiaUrl) {
                          <img [src]="dep.fotografiaUrl" [alt]="dep.nombre + ' ' + dep.apellido"
                               class="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-brand-100" />
                        } @else {
                          <div class="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center shrink-0 text-brand font-bold text-sm" aria-hidden="true">
                            {{ dep.nombre[0] }}{{ dep.apellido[0] }}
                          </div>
                        }
                        <div class="min-w-0">
                          <p class="font-semibold text-slate-800 text-sm leading-tight">{{ dep.apellido }}, {{ dep.nombre }}</p>
                          <p class="text-xs text-slate-500 font-mono">DNI {{ dep.dni }}
                            @if (dep.codigoSocio) { &nbsp;·&nbsp; {{ dep.codigoSocio }} }
                          </p>
                        </div>
                      </div>
                      <div class="flex items-center gap-1.5 shrink-0">
                        <span class="text-[10px] px-1.5 py-0.5 rounded font-medium"
                          [class]="dep.estado === 'activo' ? 'bg-green-100 text-green-700' : dep.estado === 'suspendido' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'">
                          {{ estadoLabels[dep.estado] }}
                        </span>
                        <a [routerLink]="['/', { outlets: { primary: ['maestros', 'socios'], panel: ['maestros', 'socios', dep.id, 'detalle'] } }]"
                           class="p-1.5 rounded text-slate-400 hover:text-brand hover:bg-brand-50 transition-colors"
                           title="Ver ficha"
                           [attr.aria-label]="'Ver ficha de ' + dep.apellido + ', ' + dep.nombre"
                           (click)="$event.stopPropagation()">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                          </svg>
                        </a>
                        <a [routerLink]="['/', { outlets: { primary: ['maestros', 'socios'], panel: ['maestros', 'socios', dep.id, 'editar'] } }]"
                           class="p-1.5 rounded text-slate-400 hover:text-brand hover:bg-brand-50 transition-colors"
                           title="Editar"
                           [attr.aria-label]="'Editar ' + dep.apellido + ', ' + dep.nombre"
                           (click)="$event.stopPropagation()">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.862 4.487 18.55 2.8a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"/>
                          </svg>
                        </a>
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-400 transition-transform duration-200 ml-0.5"
                          [class]="expandedDepSocioIds().has(dep.id) ? 'rotate-180' : ''"
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </div>
                    </button>

                    <!-- Detalle expandible -->
                    @if (expandedDepSocioIds().has(dep.id)) {
                      <div class="border-t border-slate-100 bg-slate-50/50 px-4 py-4 space-y-4">

                        <!-- Fotografía -->
                        <div class="flex flex-col items-center gap-2">
                          @if (dep.fotografiaUrl) {
                            <img [src]="dep.fotografiaUrl" [alt]="dep.nombre + ' ' + dep.apellido"
                                 class="w-28 h-28 rounded-2xl object-cover shadow-md ring-4 ring-white border border-slate-200" />
                          } @else {
                            <div class="w-28 h-28 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 flex flex-col items-center justify-center shadow-md ring-4 ring-white border border-slate-200 gap-1">
                              <span class="text-3xl font-bold text-brand leading-none">{{ dep.nombre[0] }}{{ dep.apellido[0] }}</span>
                              <span class="text-[9px] text-brand-400 font-medium uppercase tracking-wide">Sin foto</span>
                            </div>
                          }
                          <p class="text-xs text-slate-500 italic">Fotografía de identificación</p>
                        </div>

                        <!-- Datos personales -->
                        <div class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                          <div>
                            <p class="text-xs text-slate-400">Tipo de doc.</p>
                            <p class="font-medium text-slate-700">
                              {{ dep.tipoDocumento ? tipoDocumentoLabels[dep.tipoDocumento] : 'DNI' }}
                            </p>
                          </div>
                          <div>
                            <p class="text-xs text-slate-400">Número de documento</p>
                            <p class="font-medium text-slate-700 font-mono">{{ dep.dni }}</p>
                          </div>
                          <div>
                            <p class="text-xs text-slate-400">Fecha de nacimiento</p>
                            <p class="font-medium text-slate-700">{{ dep.fechaNacimiento ?? '—' }}</p>
                          </div>
                          <div>
                            <p class="text-xs text-slate-400">Sexo</p>
                            <p class="font-medium text-slate-700">
                              {{ dep.sexo ? sexoLabels[dep.sexo] : '—' }}
                            </p>
                          </div>
                          <div>
                            <p class="text-xs text-slate-400">Nacionalidad</p>
                            <p class="font-medium text-slate-700">{{ dep.nacionalidad ?? '—' }}</p>
                          </div>
                          <div>
                            <p class="text-xs text-slate-400">Condición institucional</p>
                            <p class="font-medium text-slate-700">
                              {{ dep.condicionInstitucional ? condicionInstitucionalLabels[dep.condicionInstitucional] : '—' }}
                            </p>
                          </div>
                          <div class="col-span-2">
                            <p class="text-xs text-slate-400">Dirección</p>
                            <p class="font-medium text-slate-700">{{ dep.direccion ?? '—' }}</p>
                          </div>
                          <div>
                            <p class="text-xs text-slate-400">Email</p>
                            <p class="font-medium text-slate-700 break-all">{{ dep.email ?? '—' }}</p>
                          </div>
                          <div>
                            <p class="text-xs text-slate-400">Teléfono</p>
                            <p class="font-medium text-slate-700">{{ dep.telefono ?? '—' }}</p>
                          </div>
                          <div>
                            <p class="text-xs text-slate-400">Fecha de alta</p>
                            <p class="font-medium text-slate-700">{{ dep.fechaAlta }}</p>
                          </div>
                          @if (dep.fechaBaja) {
                            <div>
                              <p class="text-xs text-slate-400">Fecha de baja</p>
                              <p class="font-medium text-red-600">{{ dep.fechaBaja }}</p>
                            </div>
                          }
                        </div>

                        @if (dep.observaciones) {
                          <div class="rounded-lg bg-amber-50 border border-amber-100 p-3">
                            <p class="text-xs font-semibold text-amber-700 mb-0.5">Observaciones</p>
                            <p class="text-sm text-amber-800">{{ dep.observaciones }}</p>
                          </div>
                        }

                        @if (dep.discapacidad?.tieneDiscapacidad) {
                          <div class="rounded-lg bg-purple-50 border border-purple-100 p-3 space-y-1">
                            <p class="text-xs font-semibold text-purple-700">Situación de salud / habilidad diferente</p>
                            <p class="text-sm text-purple-800">Tipo: {{ dep.discapacidad?.tipo ?? '—' }}</p>
                            @if (dep.discapacidad?.grado) {
                              <p class="text-xs text-purple-600">Grado: {{ dep.discapacidad?.grado }}</p>
                            }
                            @if (dep.discapacidad?.numeroConadis) {
                              <p class="text-xs text-purple-600">N° CONADIS: {{ dep.discapacidad?.numeroConadis }}</p>
                            }
                          </div>
                        }

                      </div>
                    }

                  </div>
                }
              </div>
              <hr class="border-slate-100">
            }

            <!-- Dependientes registrados (ficha simplificada) -->
            <div class="flex items-center justify-between">
              <p class="text-sm font-semibold text-slate-700">Dependientes registrados</p>
              <button type="button"
                class="btn-primary !text-xs !px-3 !py-1.5"
                (click)="abrirFormDependiente()">
                + Agregar
              </button>
            </div>

            @if (mostrarFormDep()) {
              <form class="section-card space-y-3 border-2 border-brand-200" (submit)="guardarDependiente($event)">
                <p class="text-sm font-semibold text-brand">Nuevo dependiente</p>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label for="depNombre" class="block text-xs font-medium text-slate-600 mb-1">Nombre *</label>
                    <input id="depNombre" type="text" class="input-modern !py-1.5 !text-sm" [value]="nuevoDep().nombre" (input)="nuevoDep.update(d => ({...d, nombre: $any($event.target).value}))" />
                  </div>
                  <div>
                    <label for="depApellido" class="block text-xs font-medium text-slate-600 mb-1">Apellido *</label>
                    <input id="depApellido" type="text" class="input-modern !py-1.5 !text-sm" [value]="nuevoDep().apellido" (input)="nuevoDep.update(d => ({...d, apellido: $any($event.target).value}))" />
                  </div>
                  <div>
                    <label for="depDni" class="block text-xs font-medium text-slate-600 mb-1">DNI *</label>
                    <input id="depDni" type="text" class="input-modern !py-1.5 !text-sm" [value]="nuevoDep().dni" (input)="nuevoDep.update(d => ({...d, dni: $any($event.target).value}))" />
                  </div>
                  <div>
                    <label for="depRelacion" class="block text-xs font-medium text-slate-600 mb-1">Relación *</label>
                    <select id="depRelacion" class="input-modern !py-1.5 !text-sm" [value]="nuevoDep().relacion" (change)="nuevoDep.update(d => ({...d, relacion: $any($event.target).value}))">
                      @for (opt of relacionDepOpts; track opt.value) {
                        <option [value]="opt.value">{{ opt.label }}</option>
                      }
                    </select>
                  </div>
                  <div>
                    <label for="depFechaNac" class="block text-xs font-medium text-slate-600 mb-1">Fecha nacimiento</label>
                    <input id="depFechaNac" type="date" class="input-modern !py-1.5 !text-sm" [value]="nuevoDep().fechaNacimiento ?? ''" (input)="nuevoDep.update(d => ({...d, fechaNacimiento: $any($event.target).value || undefined}))" />
                  </div>
                  <div class="flex items-end">
                    <label class="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input type="checkbox" class="rounded border-slate-300 text-brand" [checked]="nuevoDep().marcaProteccionPermanencia"
                        (change)="nuevoDep.update(d => ({...d, marcaProteccionPermanencia: $any($event.target).checked}))" />
                      Protección permanencia
                    </label>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button type="submit" class="btn-primary !text-xs !px-3 !py-1.5">Guardar</button>
                  <button type="button" class="btn-secondary !text-xs !px-3 !py-1.5" (click)="mostrarFormDep.set(false)">Cancelar</button>
                </div>
              </form>
            }

            @if ((s.dependientes ?? []).length === 0 && !mostrarFormDep()) {
              <div class="section-card text-center py-8">
                <p class="text-slate-400 text-sm">No hay dependientes registrados.</p>
              </div>
            }

            @for (dep of s.dependientes ?? []; track dep.id) {
              <div class="section-card overflow-hidden">
                <!-- Cabecera — siempre visible -->
                <button type="button"
                  class="w-full flex items-center justify-between gap-3 text-left"
                  [attr.aria-expanded]="expandedDepIds().has(dep.id)"
                  (click)="toggleDep(dep.id)">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center shrink-0 text-brand font-bold text-sm" aria-hidden="true">
                      {{ dep.nombre[0] }}
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-slate-800 text-sm">{{ dep.apellido }}, {{ dep.nombre }}</p>
                      <p class="text-xs text-slate-500">{{ relacionDepLabels[dep.relacion] }} · DNI {{ dep.dni }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5 shrink-0">
                    <span class="text-[10px] px-1.5 py-0.5 rounded font-medium"
                      [class]="dep.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'">
                      {{ dep.estado === 'activo' ? 'Activo' : 'Inactivo' }}
                    </span>
                    @if (dep.marcaProteccionPermanencia) {
                      <span class="text-[10px] px-1.5 py-0.5 rounded font-medium bg-purple-100 text-purple-700">PP</span>
                    }
                    @if (dep.discapacidad?.tieneDiscapacidad) {
                      <span class="text-[10px] px-1.5 py-0.5 rounded font-medium bg-amber-100 text-amber-700">HD</span>
                    }
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-400 transition-transform duration-200"
                      [class]="expandedDepIds().has(dep.id) ? 'rotate-180' : ''"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                </button>

                <!-- Detalle expandible -->
                @if (expandedDepIds().has(dep.id)) {
                  <div class="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div>
                      <p class="text-xs text-slate-400">Fecha de nacimiento</p>
                      <p class="font-medium text-slate-700">{{ dep.fechaNacimiento ?? '—' }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-slate-400">Parentesco</p>
                      <p class="font-medium text-slate-700">{{ relacionDepLabels[dep.relacion] }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-slate-400">Condición institucional</p>
                      <p class="font-medium text-slate-700">{{ dep.condicion ?? '—' }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-slate-400">Fecha de alta</p>
                      <p class="font-medium text-slate-700">{{ dep.fechaAlta }}</p>
                    </div>
                    @if (dep.fechaBaja) {
                      <div>
                        <p class="text-xs text-slate-400">Fecha de baja</p>
                        <p class="font-medium text-red-600">{{ dep.fechaBaja }}</p>
                      </div>
                    }
                    <div class="col-span-2">
                      <p class="text-xs text-slate-400 mb-1.5">Indicadores</p>
                      <div class="flex flex-wrap gap-1.5">
                        @if (dep.marcaProteccionPermanencia) {
                          <span class="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700">Protección permanencia</span>
                        }
                        @if (dep.discapacidad?.tieneDiscapacidad) {
                          <span class="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">Habilidad diferente</span>
                        }
                        @if (!dep.marcaProteccionPermanencia && !dep.discapacidad?.tieneDiscapacidad) {
                          <span class="text-xs text-slate-400 italic">Sin indicadores especiales</span>
                        }
                      </div>
                    </div>
                    @if (dep.discapacidad?.tieneDiscapacidad) {
                      <div class="col-span-2 rounded-lg bg-amber-50 border border-amber-100 p-3 space-y-1">
                        <p class="text-xs font-semibold text-amber-700">Situación de salud / habilidad diferente</p>
                        @if (dep.discapacidad?.tipo) { <p class="text-sm text-amber-800">Tipo: {{ dep.discapacidad?.tipo }}</p> }
                        @if (dep.discapacidad?.grado) { <p class="text-xs text-amber-600">Grado: {{ dep.discapacidad?.grado }}</p> }
                        @if (dep.discapacidad?.numeroConadis) { <p class="text-xs text-amber-600">N° CONADIS: {{ dep.discapacidad?.numeroConadis }}</p> }
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- TAB: Cuenta Corriente -->
        @if (activeTab() === 'cuenta') {
          <div class="space-y-3">
            <!-- Resumen financiero -->
            <div class="grid grid-cols-3 gap-3">
              <div class="section-card text-center">
                <p class="text-xl font-bold text-green-600">{{ cantCuotasPagadas() }}</p>
                <p class="text-[10px] text-slate-500 mt-0.5">Pagadas</p>
              </div>
              <div class="section-card text-center">
                <p class="text-xl font-bold text-amber-600">{{ cantCuotasPendientes() }}</p>
                <p class="text-[10px] text-slate-500 mt-0.5">Pendientes</p>
              </div>
              <div class="section-card text-center">
                <p class="text-xl font-bold text-red-600">{{ cantCuotasVencidas() }}</p>
                <p class="text-[10px] text-slate-500 mt-0.5">Vencidas</p>
              </div>
            </div>

            @if (totalAdeudado() > 0) {
              <div class="rounded-lg bg-red-50 border border-red-200 px-4 py-2 flex items-center justify-between">
                <p class="text-sm text-red-700 font-medium">Total adeudado</p>
                <p class="font-bold text-red-800">S/ {{ totalAdeudado() }}</p>
              </div>
            }

            @if (cuotasPorPersona().length === 0) {
              <div class="section-card text-center py-8">
                <p class="text-slate-400 text-sm">Sin cuotas registradas.</p>
              </div>
            }

            @for (grupo of cuotasPorPersona(); track grupo.id) {
              @if (cuotasPorPersona().length > 1) {
                <div class="flex items-center gap-2 pt-1 pb-0.5">
                  <div class="w-6 h-6 rounded-full bg-brand-100 text-brand text-[10px] font-bold flex items-center justify-center shrink-0">
                    {{ grupo.label[0] }}
                  </div>
                  <p class="text-xs font-semibold text-slate-700 flex-1 truncate">{{ grupo.label }}</p>
                  @if (grupo.esTitular) {
                    <span class="text-[10px] px-1.5 py-0.5 rounded bg-brand-100 text-brand font-medium shrink-0">Titular</span>
                  } @else {
                    <span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 font-medium shrink-0">Dependiente</span>
                  }
                </div>
              }
              @for (c of grupo.cuotas; track c.id) {
                <div class="section-card">
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <p class="text-sm font-semibold text-slate-800">Período {{ c.periodo }}</p>
                      <p class="text-xs text-slate-500">Vence: {{ c.fechaVencimiento }}</p>
                      @if (c.fechaPago) {
                        <p class="text-xs text-slate-400 mt-0.5">Pagado: {{ c.fechaPago }} · {{ c.metodoPago }}</p>
                      }
                      @if (c.motivoExoneracion) {
                        <p class="text-xs text-purple-600 italic mt-0.5">{{ c.motivoExoneracion }}</p>
                      }
                    </div>
                    <div class="flex flex-col items-end gap-1.5 shrink-0">
                      <span class="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        [class]="estadoCuotaClasses[c.estado]">
                        {{ estadoCuotaLabels[c.estado] }}
                      </span>
                      <p class="text-sm font-bold text-slate-800">S/ {{ c.monto }}</p>
                      @if (c.estado === 'pendiente' || c.estado === 'vencida') {
                        <a [routerLink]="['/', { outlets: { primary: ['maestros', 'socios', 'cuotas'], panel: ['maestros', 'socios', 'cuota', c.id, 'pagar'] } }]"
                          class="text-[10px] text-green-700 hover:text-green-900 font-semibold">
                          Registrar pago
                        </a>
                      }
                    </div>
                  </div>
                </div>
              }
            }
          </div>
        }

        <!-- TAB: Trámites societarios -->
        @if (activeTab() === 'tramites') {
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <p class="text-sm font-semibold text-slate-700">Historial de trámites</p>
              <a [routerLink]="['/', { outlets: { primary: ['maestros', 'socios', 'solicitudes'], panel: ['maestros', 'socios', 'solicitud', 'nueva'] } }]"
                 [queryParams]="{ socioId: s.id }"
                 class="btn-primary !text-xs !px-3 !py-1.5">+ Nuevo trámite</a>
            </div>

            @if (tramitesSocio().length === 0) {
              <div class="section-card text-center py-8">
                <p class="text-slate-400 text-sm">Sin trámites registrados para este socio.</p>
              </div>
            }

            @for (t of tramitesSocio(); track t.id) {
              <div class="section-card">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-slate-800">{{ tipoTramiteLabels[t.tipo] }}</p>
                    <p class="text-xs text-slate-500 mt-0.5">{{ t.descripcion }}</p>
                    <p class="text-xs text-slate-400 mt-1">Creado: {{ t.fechaCreacion }} · Última acción: {{ t.fechaUltimaAccion }}</p>
                  </div>
                  <div class="flex flex-col items-end gap-1 shrink-0">
                    <span class="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      [class]="estadoSolicitudClasses[t.estado]">
                      {{ estadoSolicitudLabels[t.estado] }}
                    </span>
                    <a [routerLink]="['/', { outlets: { primary: ['maestros', 'socios', 'solicitudes'], panel: ['maestros', 'socios', 'solicitud', t.id, 'evaluar'] } }]"
                       class="text-[10px] text-brand hover:text-brand-700 font-medium">Ver detalle</a>
                  </div>
                </div>
                @if (t.motivoRechazo) {
                  <div class="mt-2 rounded bg-red-50 border border-red-100 px-2 py-1.5">
                    <p class="text-xs text-red-700"><span class="font-semibold">Motivo rechazo:</span> {{ t.motivoRechazo }}</p>
                  </div>
                }
              </div>
            } @empty {
            }
          </div>
        }

        <!-- TAB: Documentos -->
        @if (activeTab() === 'documentos') {
          <div class="space-y-4">

            <!-- Encabezado + botón agregar -->
            <div class="flex items-center justify-between">
              <p class="text-sm font-semibold text-slate-700">
                Documentos adjuntos
                <span class="ml-1.5 text-xs font-normal text-slate-400">({{ (s.documentos ?? []).length }})</span>
              </p>
              <button type="button" class="btn-primary !text-xs !px-3 !py-1.5"
                (click)="mostrarFormDoc.set(!mostrarFormDoc())">
                @if (mostrarFormDoc()) { Cancelar } @else { + Agregar documento }
              </button>
            </div>

            <!-- Formulario de carga -->
            @if (mostrarFormDoc()) {
              <form [formGroup]="docForm" class="section-card border-2 border-brand-200 space-y-3"
                (ngSubmit)="guardarDocumento(s.id)">
                <p class="text-sm font-semibold text-brand">Registrar nuevo documento</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label for="doc-nombre" class="block text-xs font-medium text-slate-600 mb-1">
                      Nombre del archivo <span class="text-red-500">*</span>
                    </label>
                    <input id="doc-nombre" type="text" formControlName="nombre" class="input-modern !py-1.5 !text-sm"
                      placeholder="Ej: DNI_Garcia_2024.pdf"
                      [class]="docForm.get('nombre')!.invalid && docForm.get('nombre')!.touched ? '!border-red-400' : ''" />
                    @if (docForm.get('nombre')!.invalid && docForm.get('nombre')!.touched) {
                      <p class="text-xs text-red-500 mt-1">El nombre es obligatorio.</p>
                    }
                  </div>
                  <div>
                    <label for="doc-tipo" class="block text-xs font-medium text-slate-600 mb-1">
                      Tipo de documento <span class="text-red-500">*</span>
                    </label>
                    <select id="doc-tipo" formControlName="tipo" class="input-modern !py-1.5 !text-sm">
                      @for (opt of tipoDocSocioOpts; track opt.value) {
                        <option [value]="opt.value">{{ opt.label }}</option>
                      }
                    </select>
                  </div>
                  <div class="sm:col-span-2">
                    <label for="doc-desc" class="block text-xs font-medium text-slate-600 mb-1">Descripción (opcional)</label>
                    <input id="doc-desc" type="text" formControlName="descripcion" class="input-modern !py-1.5 !text-sm"
                      placeholder="Notas adicionales sobre el documento..." />
                  </div>
                  <div class="sm:col-span-2">
                    <label for="doc-archivo" class="block text-xs font-medium text-slate-600 mb-1">Archivo</label>
                    <div class="flex items-center justify-center w-full">
                      <label for="doc-archivo"
                        class="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div class="flex flex-col items-center justify-center py-3">
                          <svg class="w-7 h-7 mb-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/>
                          </svg>
                          <p class="text-xs text-slate-500">Seleccionar archivo <span class="text-brand font-medium">(PDF, JPG, PNG)</span></p>
                          <p class="text-[10px] text-slate-400 mt-0.5">Solo registro simulado — sin almacenamiento real</p>
                        </div>
                        <input id="doc-archivo" type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                      </label>
                    </div>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button type="submit" class="btn-primary !text-xs !px-3 !py-1.5">Guardar registro</button>
                  <button type="button" class="btn-secondary !text-xs !px-3 !py-1.5"
                    (click)="mostrarFormDoc.set(false)">Cancelar</button>
                </div>
              </form>
            }

            <!-- Lista de documentos -->
            @if ((s.documentos ?? []).length === 0 && !mostrarFormDoc()) {
              <div class="section-card text-center py-10">
                <svg class="w-10 h-10 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/>
                </svg>
                <p class="text-slate-400 text-sm">Sin documentos registrados.</p>
                <p class="text-xs text-slate-300 mt-1">Use el botón "Agregar documento" para registrar uno.</p>
              </div>
            }

            @for (doc of s.documentos ?? []; track doc.id) {
              <div class="section-card flex items-start justify-between gap-3">
                <div class="flex items-start gap-3 min-w-0">
                  <!-- Icono según tipo -->
                  <div class="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                    [class]="docIconBg(doc.tipo)">
                    <svg class="w-5 h-5" [class]="docIconColor(doc.tipo)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/>
                    </svg>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-slate-800 truncate">{{ doc.nombre }}</p>
                    <p class="text-xs text-slate-500 mt-0.5">
                      <span class="font-medium text-slate-600">{{ tipoDocSocioLabels[doc.tipo] }}</span>
                      &nbsp;·&nbsp; Cargado el {{ doc.fechaCarga }}
                    </p>
                    @if (doc.descripcion) {
                      <p class="text-xs text-slate-400 italic mt-0.5">{{ doc.descripcion }}</p>
                    }
                  </div>
                </div>
                <button type="button"
                  class="shrink-0 p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  [attr.aria-label]="'Eliminar ' + doc.nombre"
                  (click)="eliminarDocumento(s.id, doc.id)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                  </svg>
                </button>
              </div>
            }

          </div>
        }

      </div>
    } @else {
      <div class="text-center py-12">
        <p class="text-slate-400 text-lg">Socio no encontrado</p>
        <a routerLink="/maestros/socios" class="text-brand hover:text-brand-700 mt-2 inline-block text-sm">Volver al listado</a>
      </div>
    }
  `,
})
export class SocioDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly socioService = inject(SocioService);
  private readonly tramiteService = inject(TramiteSocietarioService);
  private readonly cuotaService = inject(CuotaSocietariaService);
  private readonly fb = inject(FormBuilder);

  protected readonly socio = signal<Socio | undefined>(undefined);
  protected readonly activeTab = signal<Tab>('ficha');
  protected readonly mostrarFormDep = signal(false);
  protected readonly nuevoDep = signal<Partial<Dependiente>>({ relacion: 'hijo', marcaProteccionPermanencia: false, estado: 'activo' });
  protected readonly expandedDepIds = signal<Set<string>>(new Set<string>());
  protected readonly expandedDepSocioIds = signal<Set<string>>(new Set<string>());

  /** Documentos */
  protected readonly mostrarFormDoc = signal(false);
  protected readonly docForm = this.fb.group({
    nombre: ['', Validators.required],
    tipo: ['dni_frente' as TipoDocumentoSocio, Validators.required],
    descripcion: [''],
  });
  protected readonly tipoDocSocioLabels = TIPO_DOCUMENTO_SOCIO_LABELS;
  protected readonly tipoDocSocioOpts = Object.entries(TIPO_DOCUMENTO_SOCIO_LABELS).map(
    ([value, label]) => ({ value: value as TipoDocumentoSocio, label })
  );

  protected readonly tabs: { id: Tab; label: string }[] = [
    { id: 'ficha', label: 'Ficha' },
    { id: 'dependientes', label: 'Dependientes' },
    { id: 'tramites', label: 'Trámites' },
    { id: 'cuenta', label: 'Cuenta Corriente' },
    { id: 'documentos', label: 'Documentos' },
  ];

  protected readonly tramitesSocio = computed(() => {
    const s = this.socio();
    return s ? this.tramiteService.getBySocioId(s.id) : [];
  });

  protected readonly dependientesSocios = computed(() => {
    const s = this.socio();
    return s ? this.socioService.getDependientesSocios(s.id) : [];
  });

  protected readonly tramitesPendientes = computed(() =>
    this.tramitesSocio().filter((t) => t.estado === 'enviada' || t.estado === 'en_evaluacion')
  );

  protected readonly cuotasPorPersona = computed(() => {
    const s = this.socio();
    if (!s) return [];
    const grupos: { id: string; label: string; esTitular: boolean; cuotas: CuotaSocietaria[] }[] = [];
    const cts = this.cuotaService.getBySocioId(s.id).slice().reverse();
    if (cts.length > 0) {
      grupos.push({ id: s.id, label: `${s.nombre} ${s.apellido}`, esTitular: true, cuotas: cts });
    }
    for (const dep of s.dependientes ?? []) {
      const cd = this.cuotaService.getBySocioId(dep.id).slice().reverse();
      if (cd.length > 0) {
        grupos.push({
          id: dep.id,
          label: `${dep.nombre} ${dep.apellido} (${this.relacionDepLabels[dep.relacion]})`,
          esTitular: false,
          cuotas: cd,
        });
      }
    }
    return grupos;
  });

  protected readonly cuotasSocio = computed(() =>
    this.cuotasPorPersona().flatMap((g) => g.cuotas)
  );

  protected readonly cuotasPorCobrar = computed(() =>
    this.cuotasSocio().filter((c) => c.estado === 'pendiente' || c.estado === 'vencida')
  );

  protected readonly cantCuotasPagadas = computed(() => this.cuotasSocio().filter((c) => c.estado === 'pagada').length);
  protected readonly cantCuotasPendientes = computed(() => this.cuotasSocio().filter((c) => c.estado === 'pendiente').length);
  protected readonly cantCuotasVencidas = computed(() => this.cuotasSocio().filter((c) => c.estado === 'vencida').length);

  protected readonly totalAdeudado = computed(() =>
    this.cuotasPorCobrar().reduce((sum, c) => sum + c.monto, 0)
  );

  protected readonly estadoCuotaLabels = ESTADO_CUOTA_LABELS;
  protected readonly estadoCuotaClasses = ESTADO_CUOTA_CLASSES;

  protected readonly estadoLabels = ESTADO_SOCIO_LABELS;
  protected readonly condicionLabels = CONDICION_SOCIETARIA_LABELS;
  protected readonly sexoLabels = SEXO_LABELS;
  protected readonly condicionInstitucionalLabels = CONDICION_INSTITUCIONAL_LABELS;
  protected readonly tipoDocumentoLabels = TIPO_DOCUMENTO_LABELS;
  protected readonly tipoTramiteLabels = TIPO_TRAMITE_LABELS;
  protected readonly estadoSolicitudLabels = ESTADO_SOLICITUD_LABELS;
  protected readonly estadoSolicitudClasses = ESTADO_SOLICITUD_CLASSES;
  protected readonly relacionDepLabels = RELACION_DEPENDIENTE_LABELS;
  protected readonly relacionDepOpts = Object.entries(RELACION_DEPENDIENTE_LABELS).map(([value, label]) => ({ value, label }));

  protected readonly estadoClasses: Record<EstadoSocio, string> = {
    activo: 'bg-green-100 text-green-700',
    inactivo: 'bg-slate-100 text-slate-600',
    suspendido: 'bg-amber-100 text-amber-700',
  };

  protected readonly condicionClasses: Record<CondicionSocietaria, string> = {
    individual: 'bg-blue-100 text-blue-700',
    familiar: 'bg-purple-100 text-purple-700',
    transitorio_menor: 'bg-teal-100 text-teal-700',
    transitorio_mayor: 'bg-indigo-100 text-indigo-700',
  };

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.socio.set(this.socioService.getById(id));
        this.activeTab.set('ficha');
        this.expandedDepIds.set(new Set());
        this.expandedDepSocioIds.set(new Set());
      }
    });
  }

  protected toggleDep(id: string): void {
    this.expandedDepIds.update((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  protected toggleDepSocio(id: string): void {
    this.expandedDepSocioIds.update((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  protected abrirFormDependiente(): void {
    this.nuevoDep.set({ relacion: 'hijo', marcaProteccionPermanencia: false, estado: 'activo' });
    this.mostrarFormDep.set(true);
  }

  protected guardarDependiente(event: Event): void {
    event.preventDefault();
    const s = this.socio();
    const dep = this.nuevoDep();
    if (!s || !dep.nombre || !dep.apellido || !dep.dni) return;
    this.socioService.agregarDependiente(s.id, {
      nombre: dep.nombre,
      apellido: dep.apellido,
      dni: dep.dni,
      relacion: dep.relacion ?? 'hijo',
      fechaNacimiento: dep.fechaNacimiento,
      condicion: 'dependiente',
      marcaProteccionPermanencia: dep.marcaProteccionPermanencia ?? false,
      estado: 'activo',
      fechaAlta: new Date().toISOString().split('T')[0],
    });
    this.socio.set(this.socioService.getById(s.id));
    this.mostrarFormDep.set(false);
  }

  protected guardarDocumento(socioId: string): void {
    this.docForm.markAllAsTouched();
    if (this.docForm.invalid) return;
    const v = this.docForm.getRawValue();
    const hoy = new Date().toISOString().split('T')[0];
    this.socioService.agregarDocumento(socioId, {
      nombre: v.nombre!,
      tipo: v.tipo as TipoDocumentoSocio,
      descripcion: v.descripcion || undefined,
      fechaCarga: hoy,
    });
    this.docForm.reset({ nombre: '', tipo: 'dni_frente', descripcion: '' });
    this.mostrarFormDoc.set(false);
    this.socio.set(this.socioService.getById(socioId));
  }

  protected eliminarDocumento(socioId: string, docId: string): void {
    this.socioService.eliminarDocumento(socioId, docId);
    this.socio.set(this.socioService.getById(socioId));
  }

  protected docIconBg(tipo: TipoDocumentoSocio): string {
    const map: Record<TipoDocumentoSocio, string> = {
      dni_frente: 'bg-blue-100',
      dni_dorso: 'bg-blue-100',
      fotografia: 'bg-purple-100',
      certificado_medico: 'bg-green-100',
      constancia_domicilio: 'bg-amber-100',
      formulario_alta: 'bg-brand-100',
      otro: 'bg-slate-100',
    };
    return map[tipo] ?? 'bg-slate-100';
  }

  protected docIconColor(tipo: TipoDocumentoSocio): string {
    const map: Record<TipoDocumentoSocio, string> = {
      dni_frente: 'text-blue-500',
      dni_dorso: 'text-blue-500',
      fotografia: 'text-purple-500',
      certificado_medico: 'text-green-600',
      constancia_domicilio: 'text-amber-600',
      formulario_alta: 'text-brand',
      otro: 'text-slate-500',
    };
    return map[tipo] ?? 'text-slate-500';
  }
}
