import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CompetenciaService } from '../../core/services/competencia.service';
import { DisciplinaService } from '../../core/services/disciplina.service';
import { EquipoService } from '../../core/services/equipo.service';
import { EncuentroService } from '../../core/services/encuentro.service';
import {
  Competencia, EstadoCompetencia,
  ESTADO_LABELS, TIPO_LABELS, MODALIDAD_LABELS, ESTRUCTURA_LABELS, DIAS_SEMANA_LABELS,
} from '../../core/models/competencia.model';
import { Encuentro, EstadoEncuentro, FechaCompetencia } from '../../core/models/encuentro.model';
import { Equipo } from '../../core/models/equipo.model';

@Component({
  selector: 'app-competencia-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (camp(); as c) {
      <div class="space-y-5">

        <!-- Hero Banner -->
        <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand via-brand-700 to-brand-900 p-5 text-white shadow-xl shadow-brand-200">
          <div class="absolute inset-0 opacity-10">
            <svg class="h-full w-full" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="detailGrid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" stroke-width="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#detailGrid)"/></svg>
          </div>
          <div class="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <a routerLink="/gestion/competencias"
                class="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors mb-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/></svg>
                Volver al listado
              </a>
              <h2 class="text-2xl font-extrabold tracking-tight">{{ c.nombre }}</h2>
              @if (c.descripcion) {
                <p class="text-white/70 mt-2 max-w-2xl text-base">{{ c.descripcion }}</p>
              }
              @if (c.observaciones) {
                <p class="text-white/50 mt-1 max-w-2xl text-sm italic">{{ c.observaciones }}</p>
              }
              <div class="flex flex-wrap items-center gap-2 mt-3">
                <span class="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold">
                  {{ tipoLabelsMap[c.tipo] }}
                </span>
                <span class="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold">
                  {{ modalidadLabelsMap[c.modalidad] }}
                </span>
                <span class="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold">
                  {{ estructuraLabelsMap[c.estructura] }}
                </span>
                <span class="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold">
                  {{ c.anio }}{{ c.periodo ? ' · ' + c.periodo : '' }}
                </span>
                @if (c.publicado) {
                  <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/30 backdrop-blur-sm px-3 py-1 text-xs font-semibold">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" aria-hidden="true"></span>
                    Publicado
                  </span>
                }
              </div>
            </div>
            <div class="flex flex-wrap gap-2 shrink-0">
              @if (c.estado === 'borrador') {
                <a [routerLink]="['editar']"
                  class="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/30 transition-all">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"/></svg>
                  Editar
                </a>
              }
              @if (!c.publicado && (c.estado === 'borrador' || c.estado === 'programado')) {
                <button (click)="publicar()"
                  class="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-400 transition-all">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6V7.5Z"/></svg>
                  Publicar
                </button>
              }
              @if (c.publicado && c.estado === 'borrador') {
                <button (click)="despublicar()"
                  class="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-600/30 hover:bg-amber-400 transition-all">
                  Despublicar
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Info Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div class="section-card p-3 group hover:shadow-lg hover:shadow-green-100 transition-all duration-300">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="w-7 h-7 rounded-lg bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center">
                <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z"/></svg>
              </span>
              <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Tipo</p>
            </div>
            <p class="text-sm font-bold text-slate-800">{{ tipoLabelsMap[c.tipo] }}</p>
          </div>
          <div class="section-card p-3 group hover:shadow-lg hover:shadow-green-100 transition-all duration-300">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z"/></svg>
              </span>
              <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Modalidad</p>
            </div>
            <p class="text-sm font-bold text-slate-800">{{ modalidadLabelsMap[c.modalidad] }}</p>
          </div>
          <div class="section-card p-3 group hover:shadow-lg hover:shadow-green-100 transition-all duration-300">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0 4.179 2.25-9.75 5.25-9.75-5.25 4.179-2.25"/></svg>
              </span>
              <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Estructura</p>
            </div>
            <p class="text-sm font-bold text-slate-800">{{ estructuraLabelsMap[c.estructura] }}</p>
          </div>
          <div class="section-card p-3 group hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.348 14.652a3.75 3.75 0 0 1 0-5.304m5.304 0a3.75 3.75 0 0 1 0 5.304m-7.425 2.121a6.75 6.75 0 0 1 0-9.546m9.546 0a6.75 6.75 0 0 1 0 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788M12 12h.008v.008H12V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/></svg>
              </span>
              <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Estado</p>
            </div>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
              [class]="estadoClasses[c.estado]">
              {{ estadoLabelsMap[c.estado] }}
            </span>
          </div>
          <div class="section-card p-3 group hover:shadow-lg hover:shadow-green-100 transition-all duration-300">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/></svg>
              </span>
              <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Vigencia</p>
            </div>
            <p class="text-sm font-bold text-slate-800">{{ c.fechaInicio }}</p>
            <p class="text-xs text-slate-400">hasta {{ c.fechaFin }}</p>
          </div>
          <div class="section-card p-3 group hover:shadow-lg hover:shadow-emerald-100 transition-all duration-300">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="w-7 h-7 rounded-lg flex items-center justify-center"
                [class]="c.publicado ? 'bg-gradient-to-br from-emerald-500 to-green-500' : 'bg-gradient-to-br from-slate-400 to-slate-500'">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
              </span>
              <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Publicación</p>
            </div>
            @if (c.publicado) {
              <p class="text-sm font-bold text-emerald-600">Publicado</p>
              @if (c.fechaPublicacion) {
                <p class="text-xs text-slate-400">{{ c.fechaPublicacion }}</p>
              }
            } @else if (c.publicacionAutomatica && c.fechaProgramadaPublicacion) {
              <p class="text-sm font-bold text-amber-600">Programado</p>
              <p class="text-xs text-slate-400">{{ c.fechaProgramadaPublicacion }}</p>
            } @else {
              <p class="text-sm text-slate-400 font-medium">No publicado</p>
            }
          </div>
        </div>

        <!-- Panel de Transiciones de Estado -->
        @if (transicionesDisponibles().length > 0) {
          <div class="section-card p-4 border-l-4 border-l-green-500">
            <div class="flex items-center gap-3 mb-3">
              <span class="w-8 h-8 rounded-xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-lg shadow-brand-200">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/></svg>
              </span>
              <div>
                <h3 class="text-base font-bold text-slate-800">Control de Estado</h3>
                <p class="text-sm text-slate-500">
                  Estado actual: <strong class="text-slate-700">{{ estadoLabelsMap[c.estado] }}</strong>
                </p>
              </div>
            </div>
            <div class="flex flex-wrap gap-3">
              @for (t of transicionesDisponibles(); track t) {
                <button (click)="transicionar(t)"
                  class="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border-2 hover:-translate-y-0.5 hover:shadow-md"
                  [class]="transicionBtnClass(t)">
                  {{ transicionLabelsMap[t] }}
                </button>
              }
            </div>
          </div>
        }

        <!-- Configuración de Fechas + Disciplinas (50/50) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <!-- Configuración de Fechas -->
          @if (c.fechaInicioInscripcion || c.fechaFinInscripcion || c.diasHabilesCompetencia.length > 0 || c.fechasBloqueadas.length > 0) {
            <div class="section-card p-4">
              <div class="flex items-center gap-3 mb-3">
                <span class="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-brand-200">
                  <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/></svg>
                </span>
                <h3 class="text-base font-bold text-slate-800">Configuración de Fechas</h3>
              </div>
              <div class="space-y-4">
                <!-- Inscripción -->
                @if (c.fechaInicioInscripcion || c.fechaFinInscripcion) {
                  <div>
                    <p class="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">Inscripción</p>
                    <div class="flex flex-col sm:flex-row gap-3 sm:gap-8">
                      @if (c.fechaInicioInscripcion) {
                        <div class="flex items-center gap-2">
                          <span class="w-2 h-2 rounded-full bg-green-400" aria-hidden="true"></span>
                          <span class="text-xs text-slate-400">Desde</span>
                          <span class="text-sm font-bold text-slate-700">{{ c.fechaInicioInscripcion }}</span>
                        </div>
                      }
                      @if (c.fechaFinInscripcion) {
                        <div class="flex items-center gap-2">
                          <span class="w-2 h-2 rounded-full bg-red-400" aria-hidden="true"></span>
                          <span class="text-xs text-slate-400">Hasta</span>
                          <span class="text-sm font-bold text-slate-700">{{ c.fechaFinInscripcion }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }
                <!-- Días Hábiles -->
                @if (c.diasHabilesCompetencia.length > 0) {
                  <div>
                    <p class="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">Días Hábiles</p>
                    <div class="flex flex-wrap gap-1.5">
                      @for (dia of c.diasHabilesCompetencia; track dia) {
                        <span class="inline-flex items-center bg-cyan-50 text-cyan-700 border border-cyan-200 px-3 py-1 rounded-lg text-xs font-semibold">
                          {{ diasSemanaLabelsMap[dia] }}
                        </span>
                      }
                    </div>
                  </div>
                }
                <!-- Fechas Bloqueadas -->
                @if (c.fechasBloqueadas.length > 0) {
                  <div>
                    <p class="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">Fechas Bloqueadas</p>
                    <div class="space-y-1.5">
                      @for (fb of c.fechasBloqueadas; track fb.id) {
                        <div class="flex items-center justify-between rounded-lg bg-red-50/60 px-3 py-2 hover:bg-red-50 transition-colors">
                          <div class="flex items-center gap-2">
                            <span class="font-semibold text-sm text-slate-800">{{ fb.motivo }}</span>
                            <span class="text-xs text-slate-400 capitalize">{{ fb.tipo }}</span>
                          </div>
                          <span class="text-xs font-semibold text-red-700 bg-white border border-red-200 px-2 py-0.5 rounded-md">{{ fb.fecha }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Disciplinas -->
          <div class="section-card p-4">
            <div class="flex items-center gap-3 mb-3">
              <span class="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 0 1-7.54 0"/></svg>
              </span>
              <h3 class="text-base font-bold text-slate-800">Disciplinas Asociadas</h3>
            </div>
            @if (c.disciplinaIds.length > 0) {
              <div class="flex flex-wrap gap-2">
                @for (dId of c.disciplinaIds; track dId) {
                  <span class="inline-flex items-center gap-1.5 bg-gradient-to-r from-green-50 to-green-50 text-green-700 border border-green-200/60 px-4 py-1.5 rounded-xl text-sm font-semibold">
                    <span class="w-2 h-2 rounded-full bg-green-400" aria-hidden="true"></span>
                    {{ getDisciplinaNombre(dId) }}
                  </span>
                }
              </div>
            } @else {
              <p class="text-slate-400 italic">Sin disciplinas asociadas</p>
            }
          </div>
        </div>

        <!-- Reglas y Parámetros -->
        <div class="section-card p-4">
          <div class="flex items-center gap-3 mb-3">
            <span class="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg shadow-slate-200">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/></svg>
            </span>
            <h3 class="text-base font-bold text-slate-800">Reglas y Parámetros</h3>
          </div>
          <div class="space-y-4">
            @if (c.reglasGenerales.length > 0) {
              <div>
                <p class="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">Reglas Generales</p>
                <div class="space-y-1.5">
                  @for (regla of c.reglasGenerales; track regla.id) {
                    <div class="flex items-center justify-between rounded-lg bg-slate-50/80 px-3 py-2 hover:bg-slate-100/80 transition-colors">
                      <div>
                        <span class="font-semibold text-sm text-slate-800">{{ regla.nombre }}</span>
                        @if (regla.descripcion) {
                          <span class="text-xs text-slate-400 ml-2">{{ regla.descripcion }}</span>
                        }
                      </div>
                      <span class="bg-white border border-slate-200 px-3 py-0.5 rounded-md text-sm font-mono font-bold text-slate-700">{{ regla.valor }}</span>
                    </div>
                  }
                </div>
              </div>
            }
            <div>
              <p class="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">Parámetros</p>
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div class="rounded-lg bg-slate-50/80 p-3">
                  <p class="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-0.5">Máx. Disc.</p>
                  <p class="text-sm font-bold text-slate-800">{{ c.parametros.maxDisciplinas }}</p>
                </div>
                <div class="rounded-lg bg-slate-50/80 p-3">
                  <p class="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-0.5">Duración</p>
                  <p class="text-sm font-bold text-slate-800">{{ c.parametros.duracionMaximaDias }}d</p>
                </div>
                <div class="rounded-lg bg-slate-50/80 p-3">
                  <p class="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-0.5">Invitados</p>
                  <p class="text-sm font-bold" [class]="c.parametros.permitirInvitados ? 'text-emerald-600' : 'text-slate-400'">{{ c.parametros.permitirInvitados ? 'Sí' : 'No' }}</p>
                </div>
                <div class="rounded-lg bg-slate-50/80 p-3">
                  <p class="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-0.5">Reapertura</p>
                  <p class="text-sm font-bold" [class]="c.parametros.permitirReapertura ? 'text-emerald-600' : 'text-slate-400'">{{ c.parametros.permitirReapertura ? 'Sí' : 'No' }}</p>
                </div>
                <div class="rounded-lg bg-slate-50/80 p-3">
                  <p class="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-0.5">Simultáneos</p>
                  <p class="text-sm font-bold" [class]="c.parametros.permitirSimultaneos ? 'text-emerald-600' : 'text-slate-400'">{{ c.parametros.permitirSimultaneos ? 'Sí' : 'No' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Equipos -->
        <div class="section-card p-4">
          <div class="flex items-center gap-3 mb-3">
            <span class="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-200">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"/></svg>
            </span>
            <h3 class="text-base font-bold text-slate-800">Equipos Participantes</h3>
          </div>
          @if (equiposCompetencia().length > 0) {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              @for (eq of equiposCompetencia(); track eq.id) {
                <button (click)="selectEquipo(eq.id)" class="group relative rounded-xl border border-slate-200/80 bg-white p-4 hover:border-green-200 hover:shadow-md hover:shadow-green-50 transition-all duration-300 text-left w-full cursor-pointer">
                  <div class="flex items-center gap-3">
                    <span class="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-100 flex items-center justify-center text-sm font-bold text-green-600 shrink-0">
                      {{ eq.nombre.charAt(0) }}
                    </span>
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-slate-800 group-hover:text-green-600 transition-colors truncate">{{ eq.nombre }}</p>
                      <p class="text-xs text-slate-400">{{ eq.participantes.length }} participantes</p>
                    </div>
                    <svg class="w-4 h-4 text-slate-300 group-hover:text-green-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg>
                  </div>
                </button>
              }
            </div>
          } @else {
            <div class="text-center py-8">
              <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <svg class="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"/></svg>
              </div>
              <p class="text-slate-400 italic">No hay equipos registrados aún</p>
              @if (puedeRegistrarEquipos()) {
                <button (click)="toggleRegistroEquipo()" class="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500 transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                  Registrar primer equipo
                </button>
              }
              @if (showRegistroEquipo()) {
                <form (ngSubmit)="registrarEquipo()" class="mt-6 max-w-sm mx-auto space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Nombre del equipo</label>
                    <input type="text" class="input-modern w-full" [value]="nuevoEquipoNombre()" (input)="nuevoEquipoNombre.set($any($event.target).value)" name="nombreEquipo" required maxlength="50" />
                  </div>
                  @if ((camp()?.disciplinaIds?.length ?? 0) > 1) {
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1">Disciplina</label>
                      <select class="input-modern w-full" [value]="selectedDisciplinaId()" (change)="selectedDisciplinaId.set($any($event.target).value)" name="disciplinaEquipo" required>
                        @for (dId of (camp()?.disciplinaIds ?? []); track dId) {
                          <option [value]="dId">{{ getDisciplinaNombre(dId) }}</option>
                        }
                      </select>
                    </div>
                  }
                  <div class="flex justify-end gap-2">
                    <button type="button" (click)="toggleRegistroEquipo()" class="btn-secondary">Cancelar</button>
                    <button type="submit" class="btn-primary">Registrar equipo</button>
                  </div>
                </form>
              }
            </div>
          }
        </div>

        <!-- Encuentros por Fecha -->
        <div class="section-card p-4">
          <div class="flex items-center gap-3 mb-3">
            <span class="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-brand-200">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"/></svg>
            </span>
            <h3 class="text-base font-bold text-slate-800">Encuentros</h3>
            @if (encuentrosCompetencia().length > 0) {
              <span class="ml-auto text-sm font-semibold text-slate-500">{{ encuentrosCompetencia().length }} encuentros</span>
            }
          </div>
          @if (fechasAgrupadas().length > 0) {
            <div class="space-y-4">
              @for (fecha of fechasAgrupadas(); track fecha.numero) {
                <div>
                  <div class="flex items-center gap-3 mb-3">
                    <span class="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-lg text-sm font-bold">
                      Fecha {{ fecha.numero }}
                    </span>
                    <span class="text-sm text-slate-500 font-medium">{{ fecha.fecha }}</span>
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                      [class]="fechaEstadoClass(fecha.estado)">
                      {{ fechaEstadoLabel(fecha.estado) }}
                    </span>
                  </div>
                  <div class="space-y-2">
                    @for (enc of fecha.encuentros; track enc.id) {
                      <div class="rounded-xl border border-slate-200/80 bg-white p-4 hover:border-green-200 hover:shadow-md hover:shadow-green-50 transition-all duration-200">
                        <div class="flex items-center gap-3">
                          <!-- Equipo Local -->
                          <button (click)="selectEquipo(enc.equipoLocalId)" class="flex items-center gap-2 hover:text-green-600 transition-colors text-left flex-1 min-w-0">
                            <span class="w-8 h-8 rounded-full bg-gradient-to-br from-green-100 to-green-100 flex items-center justify-center text-xs font-bold text-green-600 shrink-0">
                              {{ getEquipoNombre(enc.equipoLocalId).charAt(0) }}
                            </span>
                            <span class="font-semibold text-slate-800 truncate">{{ getEquipoNombre(enc.equipoLocalId) }}</span>
                          </button>
                          <!-- VS -->
                          <div class="flex flex-col items-center shrink-0 px-2">
                            <span class="text-xs font-bold text-slate-400 uppercase">VS</span>
                            <span class="text-[10px] text-slate-400 mt-0.5">{{ formatHora(enc.fechaHora) }}</span>
                          </div>
                          <!-- Equipo Visitante -->
                          <button (click)="selectEquipo(enc.equipoVisitanteId)" class="flex items-center gap-2 hover:text-green-600 transition-colors text-right flex-1 min-w-0 justify-end">
                            <span class="font-semibold text-slate-800 truncate">{{ getEquipoNombre(enc.equipoVisitanteId) }}</span>
                            <span class="w-8 h-8 rounded-full bg-gradient-to-br from-green-100 to-cyan-100 flex items-center justify-center text-xs font-bold text-green-600 shrink-0">
                              {{ getEquipoNombre(enc.equipoVisitanteId).charAt(0) }}
                            </span>
                          </button>
                        </div>
                        <div class="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <span class="inline-flex items-center px-2 py-0.5 rounded-full font-semibold"
                            [class]="encuentroEstadoClass(enc.estado)">
                            {{ encuentroEstadoLabel(enc.estado) }}
                          </span>
                          @if (enc.fase !== 'fase_grupos') {
                            <span class="capitalize">{{ formatFase(enc.fase) }}</span>
                          } @else if (enc.grupo) {
                            <span>Grupo {{ enc.grupo }}</span>
                          }
                          @if (getSedeNombre(enc.sedeId)) {
                            <span class="inline-flex items-center gap-1">
                              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
                              {{ getSedeNombre(enc.sedeId) }}
                            </span>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          } @else if (puedeGenerarFixture()) {
            <div class="text-center py-8 space-y-3">
              <div class="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto">
                <svg class="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"/></svg>
              </div>
              <p class="text-slate-700 font-semibold">{{ equiposCompetencia().length }} equipos registrados</p>
              <p class="text-slate-400 text-sm">Se generará un fixture todos contra todos (round-robin)</p>
              <button (click)="generarEncuentros()"
                class="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-200 hover:shadow-xl hover:shadow-brand-200 hover:-translate-y-0.5 transition-all">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"/></svg>
                Generar Fixture
              </button>
            </div>
          } @else {
            <div class="text-center py-8">
              <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <svg class="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"/></svg>
              </div>
              <p class="text-slate-400 italic">No hay encuentros programados aún</p>
            </div>
          }
        </div>

        <!-- Calendario -->
        <div class="section-card p-4">
          <div class="flex items-center gap-3 mb-3">
            <span class="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-green-600 flex items-center justify-center shadow-lg shadow-sky-200">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/></svg>
            </span>
            <h3 class="text-base font-bold text-slate-800">Calendario</h3>
          </div>
          @if (c.calendario.length > 0) {
            <div class="space-y-1.5">
              @for (evento of c.calendario; track evento.id) {
                <div class="flex items-center justify-between rounded-lg px-3 py-2 odd:bg-slate-50/80 hover:bg-green-50/50 transition-colors">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-green-400 shrink-0" aria-hidden="true"></span>
                    <div>
                      <p class="font-semibold text-sm text-slate-800">{{ evento.titulo }}</p>
                      <p class="text-xs text-slate-400 capitalize">{{ formatTipoEvento(evento.tipo) }}</p>
                    </div>
                  </div>
                  <span class="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">{{ evento.fecha }}</span>
                </div>
              }
            </div>
          } @else {
            <p class="text-slate-400 italic text-center py-6">No hay eventos en el calendario</p>
          }
        </div>

        <!-- Timeline de Historial de Estados -->
        @if (c.historialEstados.length > 0) {
          <div class="section-card p-4">
            <div class="flex items-center gap-3 mb-3">
              <span class="w-8 h-8 rounded-xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-lg shadow-brand-200">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
              </span>
              <h3 class="text-base font-bold text-slate-800">Historial de Estados</h3>
            </div>
            <ol class="relative border-l-2 border-green-100 ml-4 space-y-3">
              @for (h of c.historialEstados; track h.fecha; let last = $last) {
                <li class="ml-6">
                  <span class="absolute -left-2.5 w-5 h-5 rounded-full border-[3px] flex items-center justify-center"
                    [class]="last ? 'bg-green-600 border-green-100 shadow-lg shadow-brand-200' : 'bg-slate-300 border-white'"
                    aria-hidden="true">
                    @if (last) {
                      <span class="w-1.5 h-1.5 rounded-full bg-white" aria-hidden="true"></span>
                    }
                  </span>
                  <div class="rounded-lg bg-slate-50/80 px-3 py-2 hover:bg-white hover:shadow-sm transition-all">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold"
                        [class]="estadoClasses[h.estado]">
                        {{ estadoLabelsMap[h.estado] }}
                      </span>
                      <time class="text-xs text-slate-400 font-medium">{{ h.fecha }}</time>
                      @if (h.motivo) {
                        <span class="text-xs text-slate-500">· {{ h.motivo }}</span>
                      }
                    </div>
                  </div>
                </li>
              }
            </ol>
          </div>
        }

        <!-- Cierre / Anulación -->
        @if (c.fechaCierre || c.fechaAnulacion) {
          <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-4 text-white">
            <div class="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" aria-hidden="true"></div>
            <div class="relative">
              <div class="flex items-center gap-3 mb-3">
                <span class="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"/></svg>
                </span>
                <h3 class="text-base font-bold">Cierre y Anulación</h3>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                @if (c.fechaCierre) {
                  <div>
                    <p class="text-xs text-white/50 uppercase font-semibold tracking-wider">Fecha de cierre</p>
                    <p class="font-bold text-lg mt-1">{{ c.fechaCierre }}</p>
                    @if (c.motivoCierre) {
                      <p class="text-white/60 mt-1">{{ c.motivoCierre }}</p>
                    }
                  </div>
                }
                @if (c.fechaAnulacion) {
                  <div>
                    <p class="text-xs text-white/50 uppercase font-semibold tracking-wider">Fecha de anulación</p>
                    <p class="font-bold text-lg mt-1">{{ c.fechaAnulacion }}</p>
                    @if (c.motivoAnulacion) {
                      <p class="text-white/60 mt-1">{{ c.motivoAnulacion }}</p>
                    }
                  </div>
                }
              </div>
              @if (c.motivoSuspension) {
                <div class="mt-4 pt-4 border-t border-white/10">
                  <p class="text-xs text-white/50 uppercase font-semibold tracking-wider">Motivo de suspensión</p>
                  <p class="text-white/80 mt-1">{{ c.motivoSuspension }}</p>
                </div>
              }
            </div>
          </div>
        }

        <!-- Metadata -->
        <div class="flex items-center gap-6 text-xs text-slate-400 border-t border-slate-100 pt-4">
          <span class="inline-flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
            Creado: {{ c.creadoEn }}
          </span>
          <span class="inline-flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"/></svg>
            Actualizado: {{ c.actualizadoEn }}
          </span>
        </div>
      </div>
    } @else {
      <div class="text-center py-20">
        <div class="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
        </div>
        <p class="text-slate-400 text-lg font-medium">Competencia no encontrado</p>
        <a routerLink="/gestion/competencias" class="btn-primary mt-4 inline-flex">Volver al listado</a>
      </div>
    }

    <!-- Side Panel: Detalle de Equipo -->
    @if (selectedEquipo(); as eq) {
      <div class="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" [attr.aria-label]="'Detalle de ' + eq.nombre">
        <!-- Backdrop -->
        <button class="absolute inset-0 bg-black/30 backdrop-blur-sm" (click)="closeEquipoPanel()" aria-label="Cerrar panel"></button>
        <!-- Panel -->
        <div class="relative w-full max-w-md bg-white shadow-2xl overflow-y-auto animate-slide-in-right">
          <div class="sticky top-0 z-10 bg-gradient-to-br from-brand to-brand-900 p-6 text-white">
            <button (click)="closeEquipoPanel()" class="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" aria-label="Cerrar panel">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
            </button>
            <div class="flex items-center gap-4">
              <span class="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                {{ eq.nombre.charAt(0) }}
              </span>
              <div>
                <h3 class="text-xl font-bold">{{ eq.nombre }}</h3>
                <p class="text-white/70 text-sm">{{ eq.participantes.length }} participantes</p>
              </div>
            </div>
          </div>
          <div class="p-6 space-y-6">
            <!-- Info General -->
            <div class="grid grid-cols-2 gap-4">
              <div class="rounded-xl bg-slate-50 p-3">
                <p class="text-xs text-slate-400 uppercase font-semibold tracking-wider">Disciplina</p>
                <p class="text-sm font-bold text-slate-800 mt-1">{{ getDisciplinaNombre(eq.disciplinaId) }}</p>
              </div>
              @if (eq.delegadoId) {
                <div class="rounded-xl bg-slate-50 p-3">
                  <p class="text-xs text-slate-400 uppercase font-semibold tracking-wider">Delegado</p>
                  <p class="text-sm font-bold text-slate-800 mt-1">{{ getParticipanteNombre(eq.delegadoId, eq) }}</p>
                </div>
              }
            </div>

            <!-- Encuentros del equipo en este competencia -->
            @if (encuentrosEquipoSeleccionado().length > 0) {
              <div>
                <h4 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Encuentros</h4>
                <div class="space-y-2">
                  @for (enc of encuentrosEquipoSeleccionado(); track enc.id) {
                    <div class="rounded-lg border border-slate-200 p-3">
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-semibold text-slate-700">
                          {{ getEquipoNombre(enc.equipoLocalId) }} vs {{ getEquipoNombre(enc.equipoVisitanteId) }}
                        </span>
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          [class]="encuentroEstadoClass(enc.estado)">
                          {{ encuentroEstadoLabel(enc.estado) }}
                        </span>
                      </div>
                      <p class="text-xs text-slate-400 mt-1">Fecha {{ enc.numeroFecha }} · {{ formatHora(enc.fechaHora) }}</p>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Participantes -->
            <div>
              <h4 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Plantilla</h4>
              @if (eq.participantes.length > 0) {
                <div class="space-y-2">
                  @for (p of eq.participantes; track p.id) {
                    <div class="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50 transition-colors">
                      <span class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                        [class]="p.elegibilidad === 'elegible' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                        {{ p.numeroCamiseta ?? '?' }}
                      </span>
                      <div class="min-w-0 flex-1">
                        <p class="font-semibold text-slate-800 text-sm truncate">{{ p.nombre }} {{ p.apellido }}</p>
                        <div class="flex items-center gap-2 text-xs text-slate-400">
                          @if (p.posicion) {
                            <span>{{ p.posicion }}</span>
                          }
                          <span class="capitalize px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                            [class]="p.tipo === 'socio' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">
                            {{ p.tipo }}
                          </span>
                        </div>
                      </div>
                      @if (p.elegibilidad !== 'elegible') {
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 capitalize shrink-0">
                          {{ p.elegibilidad }}
                        </span>
                      }
                    </div>
                  }
                </div>
              } @else {
                <p class="text-slate-400 italic text-sm">Sin participantes registrados</p>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class CompetenciaDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly competenciaService = inject(CompetenciaService);
  private readonly disciplinaService = inject(DisciplinaService);
  private readonly equipoService = inject(EquipoService);
  private readonly encuentroService = inject(EncuentroService);

  protected readonly camp = signal<Competencia | undefined>(undefined);
  protected readonly selectedEquipo = signal<Equipo | undefined>(undefined);
  protected readonly showRegistroEquipo = signal(false);
  protected readonly nuevoEquipoNombre = signal('');
  protected readonly selectedDisciplinaId = signal('');

  protected readonly equiposCompetencia = computed(() => {
    const c = this.camp();
    if (!c) return [] as Equipo[];
    return this.equipoService.getEquiposByCompetencia(c.id);
  });

  protected readonly encuentrosCompetencia = computed(() => {
    const c = this.camp();
    if (!c) return [];
    return this.encuentroService.getByCompetencia(c.id);
  });

  protected readonly fechasAgrupadas = computed(() => {
    const c = this.camp();
    if (!c) return [];
    const fechas = this.encuentroService.getFechasByCompetencia(c.id);
    return fechas
      .map(f => ({
        ...f,
        encuentros: f.encuentroIds
          .map(eid => this.encuentroService.getById(eid))
          .filter((e): e is Encuentro => !!e),
      }))
      .sort((a, b) => a.numero - b.numero);
  });

  protected readonly encuentrosEquipoSeleccionado = computed(() => {
    const eq = this.selectedEquipo();
    const c = this.camp();
    if (!eq || !c) return [];
    return this.encuentroService.getByCompetencia(c.id).filter(
      e => e.equipoLocalId === eq.id || e.equipoVisitanteId === eq.id
    );
  });

  protected readonly transicionesDisponibles = computed(() => {
    const c = this.camp();
    if (!c) return [];
    return this.competenciaService.transicionesDisponibles(c.id);
  });

  protected readonly puedeRegistrarEquipos = computed(() => {
    const c = this.camp();
    if (!c) return false;
    return c.publicado && c.estado !== 'finalizado' && c.estado !== 'suspendido' && c.estado !== 'anulado';
  });

  protected readonly puedeGenerarFixture = computed(() => {
    const c = this.camp();
    if (!c) return false;
    return c.publicado
      && c.estado !== 'finalizado' && c.estado !== 'suspendido' && c.estado !== 'anulado'
      && this.equiposCompetencia().length >= 2
      && this.encuentrosCompetencia().length === 0;
  });

  protected readonly estadoClasses: Record<EstadoCompetencia, string> = {
    borrador: 'bg-slate-100 text-slate-700',
    programado: 'bg-green-100 text-green-800',
    en_ejecucion: 'bg-green-100 text-green-800',
    finalizado: 'bg-amber-100 text-amber-800',
    suspendido: 'bg-orange-100 text-orange-800',
    anulado: 'bg-red-100 text-red-800',
  };

  protected readonly estadoLabelsMap = ESTADO_LABELS;
  protected readonly tipoLabelsMap = TIPO_LABELS;
  protected readonly modalidadLabelsMap = MODALIDAD_LABELS;
  protected readonly estructuraLabelsMap = ESTRUCTURA_LABELS;
  protected readonly diasSemanaLabelsMap = DIAS_SEMANA_LABELS;

  protected readonly transicionLabelsMap: Record<EstadoCompetencia, string> = {
    borrador: 'Volver a borrador',
    programado: 'Programar',
    en_ejecucion: 'Iniciar competencia',
    finalizado: 'Finalizar',
    suspendido: 'Suspender',
    anulado: 'Anular',
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.camp.set(this.competenciaService.getById(id));
    }
  }

  protected getDisciplinaNombre(id: string): string {
    return this.disciplinaService.getById(id)?.nombre ?? id;
  }

  protected formatTipoEvento(tipo: string): string {
    return tipo.replace(/_/g, ' ');
  }

  protected transicionar(nuevoEstado: EstadoCompetencia): void {
    const c = this.camp();
    if (!c) return;
    const result = this.competenciaService.cambiarEstado(c.id, nuevoEstado);
    if (result !== true) {
      alert(result);
      return;
    }
    this.camp.set(this.competenciaService.getById(c.id));
  }

  protected publicar(): void {
    const c = this.camp();
    if (!c) return;
    this.competenciaService.publicar(c.id);
    this.camp.set(this.competenciaService.getById(c.id));
  }

  protected despublicar(): void {
    const c = this.camp();
    if (!c) return;
    this.competenciaService.despublicar(c.id);
    this.camp.set(this.competenciaService.getById(c.id));
  }

  // ──── Registro de Equipos ────

  protected toggleRegistroEquipo(): void {
    const show = !this.showRegistroEquipo();
    this.showRegistroEquipo.set(show);
    if (show) {
      const c = this.camp();
      if (c && c.disciplinaIds.length > 0) {
        this.selectedDisciplinaId.set(c.disciplinaIds[0]!);
      }
      this.nuevoEquipoNombre.set('');
    }
  }

  protected registrarEquipo(): void {
    const c = this.camp();
    const nombre = this.nuevoEquipoNombre().trim();
    if (!c || !nombre) return;

    const disciplinaId = c.disciplinaIds.length === 1
      ? c.disciplinaIds[0]!
      : this.selectedDisciplinaId();

    this.equipoService.createEquipo({
      nombre,
      competenciaId: c.id,
      disciplinaId,
    });

    this.nuevoEquipoNombre.set('');
    this.showRegistroEquipo.set(false);
  }

  // ──── Generación de Fixture ────

  protected generarEncuentros(): void {
    const c = this.camp();
    if (!c) return;

    const equipos = this.equiposCompetencia();
    if (equipos.length < 2) return;

    const disciplinaId = equipos[0]!.disciplinaId;
    const equipoIds = equipos.map(e => e.id);

    const result = this.encuentroService.generarFixture(
      c.id,
      disciplinaId,
      equipoIds,
      c.fechaInicio,
    );

    if (typeof result === 'string') {
      alert(result);
    }
  }

  protected transicionBtnClass(estado: EstadoCompetencia): string {
    const map: Record<EstadoCompetencia, string> = {
      borrador: 'border-slate-300 text-slate-700 hover:bg-slate-50',
      programado: 'border-green-300 text-green-700 hover:bg-green-50',
      en_ejecucion: 'border-green-300 text-green-700 hover:bg-green-50',
      finalizado: 'border-amber-300 text-amber-700 hover:bg-amber-50',
      suspendido: 'border-orange-300 text-orange-700 hover:bg-orange-50',
      anulado: 'border-red-300 text-red-700 hover:bg-red-50',
    };
    return map[estado];
  }

  // ──── Encuentros helpers ────

  protected getEquipoNombre(id: string): string {
    return this.equipoService.getEquipoById(id)?.nombre ?? id;
  }

  protected formatHora(fechaHora: string): string {
    const d = new Date(fechaHora);
    return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  }

  protected formatFase(fase: string): string {
    return fase.replace(/_/g, ' ');
  }

  protected getSedeNombre(sedeId?: string): string {
    if (!sedeId) return '';
    return this.encuentroService.getSedeById(sedeId)?.nombre ?? '';
  }

  protected encuentroEstadoClass(estado: EstadoEncuentro): string {
    const map: Record<EstadoEncuentro, string> = {
      borrador: 'bg-slate-100 text-slate-600',
      programado: 'bg-green-100 text-green-700',
      en_curso: 'bg-green-100 text-green-700',
      finalizado: 'bg-amber-100 text-amber-700',
      suspendido: 'bg-orange-100 text-orange-700',
      reprogramado: 'bg-cyan-100 text-cyan-700',
      walkover: 'bg-red-100 text-red-700',
      cancelado: 'bg-red-100 text-red-700',
    };
    return map[estado];
  }

  protected encuentroEstadoLabel(estado: EstadoEncuentro): string {
    const map: Record<EstadoEncuentro, string> = {
      borrador: 'Borrador',
      programado: 'Programado',
      en_curso: 'En curso',
      finalizado: 'Finalizado',
      suspendido: 'Suspendido',
      reprogramado: 'Reprogramado',
      walkover: 'Walkover',
      cancelado: 'Cancelado',
    };
    return map[estado];
  }

  protected fechaEstadoClass(estado: FechaCompetencia['estado']): string {
    const map: Record<FechaCompetencia['estado'], string> = {
      pendiente: 'bg-green-100 text-green-700',
      en_curso: 'bg-green-100 text-green-700',
      completada: 'bg-slate-100 text-slate-600',
    };
    return map[estado];
  }

  protected fechaEstadoLabel(estado: FechaCompetencia['estado']): string {
    const map: Record<FechaCompetencia['estado'], string> = {
      pendiente: 'Pendiente',
      en_curso: 'En curso',
      completada: 'Completada',
    };
    return map[estado];
  }

  // ──── Side Panel ────

  protected selectEquipo(equipoId: string): void {
    const eq = this.equipoService.getEquipoById(equipoId);
    this.selectedEquipo.set(eq);
  }

  protected closeEquipoPanel(): void {
    this.selectedEquipo.set(undefined);
  }

  protected getParticipanteNombre(id: string, equipo: Equipo): string {
    const p = equipo.participantes.find(par => par.id === id);
    return p ? `${p.nombre} ${p.apellido}` : id;
  }
}
