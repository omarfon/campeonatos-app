import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { CompetenciaService } from '../../core/services/competencia.service';
import { DisciplinaService } from '../../core/services/disciplina.service';
import {
  TipoCompetencia, ModalidadCompetencia, EstructuraCompetencia, Competencia, ReglaGeneral,
  PARAMETROS_DEFAULT, DIAS_SEMANA_LABELS, TipoFechaBloqueada,
} from '../../core/models/competencia.model';

@Component({
  selector: 'app-competencia-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <a routerLink="/gestion/competencias"
          class="inline-flex items-center gap-1.5 text-slate-400 hover:text-green-600 text-sm font-medium transition-colors mb-3">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/></svg>
          Volver al listado
        </a>
        <h2 class="text-3xl font-extrabold text-slate-800 tracking-tight">{{ isEdit() ? 'Editar' : 'Nuevo' }} Competencia</h2>
        <p class="text-slate-400 mt-1">Complete los pasos para configurar el competencia</p>
      </div>

      <!-- Modern Stepper -->
      <nav class="mb-8" aria-label="Progreso del formulario">
        <div class="section-card p-4">
          <ol class="flex items-center w-full">
            @for (step of steps; track step.index; let i = $index) {
              <li class="flex items-center" [class]="i < steps.length - 1 ? 'flex-1' : ''">
                <button type="button" (click)="goToStep(step.index)"
                  class="flex items-center gap-2.5 group"
                  [attr.aria-current]="paso() === step.index ? 'step' : null">
                  <span class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 shrink-0"
                    [class]="paso() === step.index
                      ? 'bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg shadow-brand-200 scale-110'
                      : paso() > step.index
                        ? 'bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-200'
                        : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'">
                    @if (paso() > step.index) {
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
                    } @else {
                      {{ step.index }}
                    }
                  </span>
                  <span class="hidden sm:block text-sm font-semibold transition-colors"
                    [class]="paso() === step.index ? 'text-green-600' : paso() > step.index ? 'text-emerald-600' : 'text-slate-400'">
                    {{ step.label }}
                  </span>
                </button>
                @if (i < steps.length - 1) {
                  <div class="flex-1 mx-3 h-0.5 rounded-full transition-colors duration-300"
                    [class]="paso() > step.index ? 'bg-gradient-to-r from-emerald-400 to-emerald-300' : 'bg-slate-200'"
                    aria-hidden="true"></div>
                }
              </li>
            }
          </ol>
        </div>
      </nav>

      <form [formGroup]="form" (ngSubmit)="guardar()" class="section-card p-8 space-y-6">

        <!-- PASO 1: Info General + Clasificación -->
        @if (paso() === 1) {
          <div class="flex items-center gap-3 mb-6">
            <span class="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-lg shadow-brand-200">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"/></svg>
            </span>
            <div>
              <h3 class="text-lg font-bold text-slate-800">Registro y Clasificación</h3>
              <p class="text-sm text-slate-400">Datos básicos, tipo, modalidad y estructura</p>
            </div>
          </div>

          <div>
            <label for="nombre" class="block text-sm font-semibold text-slate-700 mb-1.5">Nombre del competencia</label>
            <input id="nombre" formControlName="nombre" type="text" class="input-modern" placeholder="Ej: Copa Primavera 2025" />
            @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
              <p class="mt-1.5 text-sm text-red-500 font-medium">El nombre es requerido</p>
            }
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="anio" class="block text-sm font-semibold text-slate-700 mb-1.5">Año</label>
              <input id="anio" formControlName="anio" type="number" class="input-modern" min="2020" max="2099" />
            </div>
            <div>
              <label for="periodo" class="block text-sm font-semibold text-slate-700 mb-1.5">Período <span class="text-slate-400 font-normal">(opcional)</span></label>
              <input id="periodo" formControlName="periodo" type="text" class="input-modern" placeholder="Ej: 1er semestre, Verano" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label for="tipo" class="block text-sm font-semibold text-slate-700 mb-1.5">Tipo de participación</label>
              <select id="tipo" formControlName="tipo" class="input-modern">
                <option value="interno">Interno</option>
                <option value="abierto">Abierto</option>
              </select>
            </div>
            <div>
              <label for="modalidad" class="block text-sm font-semibold text-slate-700 mb-1.5">Modalidad</label>
              <select id="modalidad" formControlName="modalidad" class="input-modern">
                <option value="interno_cerrado">Interno cerrado</option>
                <option value="interno_invitados">Interno con invitados</option>
                <option value="abierto">Abierto</option>
              </select>
            </div>
            <div>
              <label for="estructura" class="block text-sm font-semibold text-slate-700 mb-1.5">Estructura</label>
              <select id="estructura" formControlName="estructura" class="input-modern">
                <option value="unico">Torneo único</option>
                <option value="apertura_clausura">Apertura / Clausura</option>
                <option value="fases_especiales">Fases especiales</option>
              </select>
            </div>
          </div>

          <div>
            <label for="descripcion" class="block text-sm font-semibold text-slate-700 mb-1.5">Descripción</label>
            <textarea id="descripcion" formControlName="descripcion" rows="2" class="input-modern" placeholder="Descripción opcional..."></textarea>
          </div>

          <div>
            <label for="observaciones" class="block text-sm font-semibold text-slate-700 mb-1.5">Observaciones</label>
            <textarea id="observaciones" formControlName="observaciones" rows="2" class="input-modern" placeholder="Observaciones internas..."></textarea>
          </div>
        }

        <!-- PASO 2: Disciplinas -->
        @if (paso() === 2) {
          <div class="flex items-center gap-3 mb-6">
            <span class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 0 1-7.54 0"/></svg>
            </span>
            <div>
              <h3 class="text-lg font-bold text-slate-800">Asociar Disciplinas Deportivas</h3>
              <p class="text-sm text-slate-400">Seleccione las disciplinas que participarán (máx. {{ form.get('maxDisciplinas')?.value }})</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            @for (disc of disciplinas(); track disc.id) {
              <label
                class="relative flex items-start gap-3 rounded-xl p-4 cursor-pointer transition-all duration-200 border-2"
                [class]="selectedDisciplinas().has(disc.id)
                  ? 'border-green-500 bg-green-50/50 shadow-md shadow-green-100'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'">
                <input type="checkbox"
                  [checked]="selectedDisciplinas().has(disc.id)"
                  (change)="toggleDisciplina(disc.id)"
                  class="mt-0.5 rounded-md text-green-600 focus:ring-green-500 focus:ring-offset-0" />
                <div>
                  <span class="font-semibold text-slate-800">{{ disc.nombre }}</span>
                  @if (disc.descripcion) {
                    <p class="text-sm text-slate-500 mt-0.5">{{ disc.descripcion }}</p>
                  }
                  <p class="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"/></svg>
                    {{ disc.minJugadoresPorEquipo }}–{{ disc.maxJugadoresPorEquipo }} jugadores · {{ disc.tipoPlanilla }}
                  </p>
                </div>
                @if (selectedDisciplinas().has(disc.id)) {
                  <span class="absolute top-3 right-3 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
                  </span>
                }
              </label>
            }
          </div>

          @if (selectedDisciplinas().size === 0) {
            <div class="flex items-center gap-2 mt-3 text-sm text-amber-600 bg-amber-50 rounded-xl px-4 py-3">
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/></svg>
              Seleccione al menos una disciplina. Sin disciplinas no se podrá iniciar el competencia.
            </div>
          }
        }

        <!-- PASO 3: Reglas Generales -->
        @if (paso() === 3) {
          <div class="flex items-center gap-3 mb-6">
            <span class="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg shadow-slate-200">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/></svg>
            </span>
            <div>
              <h3 class="text-lg font-bold text-slate-800">Configuración de Reglas</h3>
              <p class="text-sm text-slate-400">Las reglas generales prevalecen sobre las reglas por disciplina</p>
            </div>
          </div>

          <div formArrayName="reglasGenerales" class="space-y-4">
            @for (regla of reglasArray.controls; track regla; let i = $index) {
              <div [formGroupName]="i" class="relative rounded-xl bg-slate-50/80 border border-slate-200/80 p-5 space-y-3 hover:border-slate-300 transition-colors">
                <div class="flex items-center justify-between">
                  <span class="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
                    <span class="w-6 h-6 rounded-lg bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-xs text-white font-bold">{{ i + 1 }}</span>
                    Regla {{ i + 1 }}
                  </span>
                  <button type="button" (click)="removeRegla(i)"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:text-white hover:bg-red-500 transition-all"
                    aria-label="Eliminar regla">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
                  </button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label [for]="'regla-nombre-' + i" class="block text-xs font-semibold text-slate-600 mb-1">Nombre</label>
                    <input [id]="'regla-nombre-' + i" formControlName="nombre" type="text" class="input-modern" placeholder="Ej: Tiempo por set" />
                  </div>
                  <div>
                    <label [for]="'regla-valor-' + i" class="block text-xs font-semibold text-slate-600 mb-1">Valor</label>
                    <input [id]="'regla-valor-' + i" formControlName="valor" type="text" class="input-modern" placeholder="Ej: 25 minutos" />
                  </div>
                </div>
                <div>
                  <label [for]="'regla-desc-' + i" class="block text-xs font-semibold text-slate-600 mb-1">Descripción</label>
                  <input [id]="'regla-desc-' + i" formControlName="descripcion" type="text" class="input-modern" placeholder="Descripción opcional..." />
                </div>
              </div>
            }
          </div>

          <button type="button" (click)="addRegla()"
            class="mt-2 inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-800 font-semibold px-4 py-2.5 rounded-xl hover:bg-green-50 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
            Agregar regla
          </button>
        }

        <!-- PASO 4: Calendario y Fechas -->
        @if (paso() === 4) {
          <div class="flex items-center gap-3 mb-6">
            <span class="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-green-600 flex items-center justify-center shadow-lg shadow-sky-200">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/></svg>
            </span>
            <div>
              <h3 class="text-lg font-bold text-slate-800">Configuración de Calendario</h3>
              <p class="text-sm text-slate-400">Fechas, días hábiles y bloqueos</p>
            </div>
          </div>

          <fieldset class="space-y-4 rounded-xl bg-green-50/50 border border-green-100 p-5">
            <legend class="text-sm font-bold text-green-700 px-2">Período de inscripción</legend>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="fechaInicioInscripcion" class="block text-sm font-semibold text-slate-700 mb-1.5">Inicio inscripción</label>
                <input id="fechaInicioInscripcion" formControlName="fechaInicioInscripcion" type="date" class="input-modern" />
              </div>
              <div>
                <label for="fechaFinInscripcion" class="block text-sm font-semibold text-slate-700 mb-1.5">Fin inscripción</label>
                <input id="fechaFinInscripcion" formControlName="fechaFinInscripcion" type="date" class="input-modern" />
              </div>
            </div>
          </fieldset>

          <fieldset class="space-y-4 rounded-xl bg-green-50/50 border border-green-100 p-5">
            <legend class="text-sm font-bold text-green-700 px-2">Vigencia del competencia</legend>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="fechaInicio" class="block text-sm font-semibold text-slate-700 mb-1.5">Fecha inicio</label>
                <input id="fechaInicio" formControlName="fechaInicio" type="date" class="input-modern" />
                @if (form.get('fechaInicio')?.invalid && form.get('fechaInicio')?.touched) {
                  <p class="mt-1.5 text-sm text-red-500 font-medium">Fecha inicio requerida</p>
                }
              </div>
              <div>
                <label for="fechaFin" class="block text-sm font-semibold text-slate-700 mb-1.5">Fecha fin</label>
                <input id="fechaFin" formControlName="fechaFin" type="date" class="input-modern" />
                @if (form.get('fechaFin')?.invalid && form.get('fechaFin')?.touched) {
                  <p class="mt-1.5 text-sm text-red-500 font-medium">Fecha fin requerida</p>
                }
              </div>
            </div>
          </fieldset>

          <!-- Días hábiles -->
          <fieldset class="space-y-3 rounded-xl bg-emerald-50/50 border border-emerald-100 p-5">
            <legend class="text-sm font-bold text-emerald-700 px-2">Días hábiles de competencia</legend>
            <div class="flex flex-wrap gap-2">
              @for (dia of diasSemana; track dia.value) {
                <label class="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 cursor-pointer transition-all border-2"
                  [class]="selectedDias().has(dia.value)
                    ? 'border-emerald-500 bg-emerald-100 text-emerald-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'">
                  <input type="checkbox"
                    [checked]="selectedDias().has(dia.value)"
                    (change)="toggleDia(dia.value)"
                    class="rounded-md text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0" />
                  <span class="text-sm font-semibold">{{ dia.label }}</span>
                </label>
              }
            </div>
          </fieldset>

          <!-- Fechas bloqueadas -->
          <fieldset class="space-y-3 rounded-xl bg-red-50/50 border border-red-100 p-5">
            <legend class="text-sm font-bold text-red-700 px-2">Fechas bloqueadas</legend>
            @for (fb of fechasBloqueadas(); track fb.id) {
              <div class="flex items-center gap-3 rounded-lg bg-white border border-red-200 p-3">
                <span class="text-sm font-mono font-semibold text-slate-700">{{ fb.fecha }}</span>
                <span class="text-sm text-slate-500 flex-1">{{ fb.motivo }}</span>
                <span class="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-lg capitalize">{{ fb.tipo }}</span>
                <button type="button" (click)="removeFechaBloqueada(fb.id)"
                  class="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:text-white hover:bg-red-500 transition-all"
                  aria-label="Eliminar fecha bloqueada">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
                </button>
              </div>
            }
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label for="fb-fecha" class="block text-xs font-semibold text-slate-600 mb-1">Fecha</label>
                <input id="fb-fecha" type="date" class="input-modern" #fbFecha />
              </div>
              <div>
                <label for="fb-motivo" class="block text-xs font-semibold text-slate-600 mb-1">Motivo</label>
                <input id="fb-motivo" type="text" class="input-modern" placeholder="Motivo..." #fbMotivo />
              </div>
              <div>
                <label for="fb-tipo" class="block text-xs font-semibold text-slate-600 mb-1">Tipo</label>
                <select id="fb-tipo" class="input-modern" #fbTipo>
                  <option value="evento">Evento</option>
                  <option value="elecciones">Elecciones</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div class="flex items-end">
                <button type="button"
                  (click)="addFechaBloqueada(fbFecha.value, fbMotivo.value, fbTipo.value); fbFecha.value=''; fbMotivo.value=''"
                  class="btn-ghost !text-xs !px-3 !py-2 !text-red-600 hover:!bg-red-50 w-full justify-center">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                  Bloquear
                </button>
              </div>
            </div>
          </fieldset>
        }

        <!-- PASO 5: Parámetros -->
        @if (paso() === 5) {
          <div class="flex items-center gap-3 mb-6">
            <span class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-200">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
            </span>
            <div>
              <h3 class="text-lg font-bold text-slate-800">Parámetros del Competencia</h3>
              <p class="text-sm text-slate-400">Configuración de límites y permisos</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label for="maxDisciplinas" class="block text-sm font-semibold text-slate-700 mb-1.5">Máx. disciplinas</label>
              <input id="maxDisciplinas" formControlName="maxDisciplinas" type="number" class="input-modern" min="1" max="50" />
              <p class="text-xs text-slate-400 mt-1">Cantidad máxima de disciplinas permitidas</p>
            </div>
            <div>
              <label for="duracionMaximaDias" class="block text-sm font-semibold text-slate-700 mb-1.5">Duración máxima (días)</label>
              <input id="duracionMaximaDias" formControlName="duracionMaximaDias" type="number" class="input-modern" min="1" />
              <p class="text-xs text-slate-400 mt-1">Máximo de días de duración del competencia</p>
            </div>
          </div>

          <div class="space-y-4 mt-4">
            <label class="flex items-center gap-3 cursor-pointer group rounded-xl border-2 border-slate-200 p-4 hover:border-teal-300 transition-colors">
              <input type="checkbox" formControlName="permitirInvitados"
                class="w-5 h-5 rounded-md text-teal-600 focus:ring-teal-500 focus:ring-offset-0" />
              <div>
                <span class="text-sm font-semibold text-slate-700 group-hover:text-teal-700 transition-colors">Permitir invitados</span>
                <p class="text-xs text-slate-400">Permite la participación de equipos externos al club</p>
              </div>
            </label>

            <label class="flex items-center gap-3 cursor-pointer group rounded-xl border-2 border-slate-200 p-4 hover:border-teal-300 transition-colors">
              <input type="checkbox" formControlName="permitirReapertura"
                class="w-5 h-5 rounded-md text-teal-600 focus:ring-teal-500 focus:ring-offset-0" />
              <div>
                <span class="text-sm font-semibold text-slate-700 group-hover:text-teal-700 transition-colors">Permitir reapertura</span>
                <p class="text-xs text-slate-400">Permite reabrir el competencia una vez suspendido</p>
              </div>
            </label>

            <label class="flex items-center gap-3 cursor-pointer group rounded-xl border-2 border-slate-200 p-4 hover:border-teal-300 transition-colors">
              <input type="checkbox" formControlName="permitirSimultaneos"
                class="w-5 h-5 rounded-md text-teal-600 focus:ring-teal-500 focus:ring-offset-0" />
              <div>
                <span class="text-sm font-semibold text-slate-700 group-hover:text-teal-700 transition-colors">Permitir simultáneos</span>
                <p class="text-xs text-slate-400">Permite que haya otros competencias activos en las mismas fechas</p>
              </div>
            </label>
          </div>
        }

        <!-- PASO 6: Publicación -->
        @if (paso() === 6) {
          <div class="flex items-center gap-3 mb-6">
            <span class="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-lg shadow-brand-200">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6V7.5Z"/></svg>
            </span>
            <div>
              <h3 class="text-lg font-bold text-slate-800">Publicación</h3>
              <p class="text-sm text-slate-400">Configure opciones de publicación del competencia</p>
            </div>
          </div>

          <fieldset class="space-y-4 rounded-xl bg-green-50/50 border border-green-100 p-5">
            <legend class="text-sm font-bold text-green-700 px-2">Opciones de publicación</legend>

            <label class="inline-flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" formControlName="publicacionAutomatica"
                class="w-5 h-5 rounded-md text-green-600 focus:ring-green-500 focus:ring-offset-0" />
              <span class="text-sm text-slate-700 font-medium group-hover:text-green-600 transition-colors">Publicación automática programada</span>
            </label>

            @if (form.get('publicacionAutomatica')?.value) {
              <div>
                <label for="fechaProgramadaPublicacion" class="block text-sm font-semibold text-slate-700 mb-1.5">
                  Fecha programada de publicación
                </label>
                <input id="fechaProgramadaPublicacion" formControlName="fechaProgramadaPublicacion" type="date" class="input-modern" />
              </div>
            }
          </fieldset>

          <!-- Resumen -->
          <div class="rounded-xl bg-slate-50 border border-slate-200 p-5 mt-4">
            <h4 class="text-sm font-bold text-slate-700 mb-3">Resumen del competencia</h4>
            <dl class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <dt class="text-slate-400">Nombre</dt>
              <dd class="text-slate-800 font-medium">{{ form.get('nombre')?.value }}</dd>
              <dt class="text-slate-400">Año</dt>
              <dd class="text-slate-800 font-medium">{{ form.get('anio')?.value }}</dd>
              <dt class="text-slate-400">Disciplinas</dt>
              <dd class="text-slate-800 font-medium">{{ selectedDisciplinas().size }} seleccionadas</dd>
              <dt class="text-slate-400">Reglas</dt>
              <dd class="text-slate-800 font-medium">{{ reglasArray.length }}</dd>
              <dt class="text-slate-400">Vigencia</dt>
              <dd class="text-slate-800 font-medium">{{ form.get('fechaInicio')?.value }} — {{ form.get('fechaFin')?.value }}</dd>
              <dt class="text-slate-400">Días hábiles</dt>
              <dd class="text-slate-800 font-medium">{{ diasHabilesResumen() }}</dd>
              <dt class="text-slate-400">Fechas bloqueadas</dt>
              <dd class="text-slate-800 font-medium">{{ fechasBloqueadas().length }}</dd>
            </dl>
          </div>
        }

        <!-- Navegación del Wizard -->
        <div class="flex justify-between items-center pt-6 border-t border-slate-100">
          <button type="button" (click)="anterior()"
            [class]="paso() === 1 ? 'invisible' : ''"
            class="btn-ghost inline-flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/></svg>
            Anterior
          </button>

          <div class="flex gap-3">
            <button type="button" (click)="cancelar()"
              class="btn-ghost text-slate-400 hover:text-red-500">
              Cancelar
            </button>

            @if (paso() < totalPasos) {
              <button type="button" (click)="siguiente()" [disabled]="!pasoValido()"
                class="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
                Siguiente
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
              </button>
            } @else {
              <button type="submit" [disabled]="!formularioValido()"
                class="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
                {{ isEdit() ? 'Actualizar' : 'Crear Competencia' }}
              </button>
            }
          </div>
        </div>
      </form>
    </div>
  `,
})
export class CompetenciaFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly competenciaService = inject(CompetenciaService);
  private readonly disciplinaService = inject(DisciplinaService);

  protected readonly isEdit = signal(false);
  protected readonly paso = signal(1);
  protected readonly totalPasos = 6;
  protected readonly disciplinas = this.disciplinaService.items;
  protected readonly selectedDisciplinas = signal(new Set<string>());
  protected readonly selectedDias = signal(new Set<number>([1, 2, 3, 4, 5, 6])); // Lun-Sáb por defecto
  protected readonly fechasBloqueadas = signal<Array<{ id: string; fecha: string; motivo: string; tipo: TipoFechaBloqueada }>>([]);

  private editId = '';

  protected readonly steps = [
    { index: 1, label: 'Registro' },
    { index: 2, label: 'Disciplinas' },
    { index: 3, label: 'Reglas' },
    { index: 4, label: 'Calendario' },
    { index: 5, label: 'Parámetros' },
    { index: 6, label: 'Publicación' },
  ];

  protected readonly diasSemana = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Lun' },
    { value: 2, label: 'Mar' },
    { value: 3, label: 'Mié' },
    { value: 4, label: 'Jue' },
    { value: 5, label: 'Vie' },
    { value: 6, label: 'Sáb' },
  ];

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    anio: [new Date().getFullYear(), Validators.required],
    periodo: [''],
    tipo: ['interno' as TipoCompetencia],
    modalidad: ['interno_cerrado' as ModalidadCompetencia],
    estructura: ['unico' as EstructuraCompetencia],
    descripcion: [''],
    observaciones: [''],
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required],
    fechaInicioInscripcion: [''],
    fechaFinInscripcion: [''],
    publicacionAutomatica: [false],
    fechaProgramadaPublicacion: [''],
    // Parámetros
    maxDisciplinas: [PARAMETROS_DEFAULT.maxDisciplinas],
    permitirInvitados: [PARAMETROS_DEFAULT.permitirInvitados],
    permitirReapertura: [PARAMETROS_DEFAULT.permitirReapertura],
    duracionMaximaDias: [PARAMETROS_DEFAULT.duracionMaximaDias],
    permitirSimultaneos: [PARAMETROS_DEFAULT.permitirSimultaneos],
    reglasGenerales: this.fb.array<ReturnType<typeof this.crearReglaGroup>>([]),
  });

  get reglasArray(): FormArray {
    return this.form.controls.reglasGenerales;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const camp = this.competenciaService.getById(id);
      if (camp) {
        this.isEdit.set(true);
        this.editId = id;
        this.form.patchValue({
          nombre: camp.nombre,
          anio: camp.anio,
          periodo: camp.periodo ?? '',
          tipo: camp.tipo,
          modalidad: camp.modalidad,
          estructura: camp.estructura,
          descripcion: camp.descripcion ?? '',
          observaciones: camp.observaciones ?? '',
          fechaInicio: camp.fechaInicio,
          fechaFin: camp.fechaFin,
          fechaInicioInscripcion: camp.fechaInicioInscripcion ?? '',
          fechaFinInscripcion: camp.fechaFinInscripcion ?? '',
          publicacionAutomatica: camp.publicacionAutomatica,
          fechaProgramadaPublicacion: camp.fechaProgramadaPublicacion ?? '',
          maxDisciplinas: camp.parametros.maxDisciplinas,
          permitirInvitados: camp.parametros.permitirInvitados,
          permitirReapertura: camp.parametros.permitirReapertura,
          duracionMaximaDias: camp.parametros.duracionMaximaDias,
          permitirSimultaneos: camp.parametros.permitirSimultaneos,
        });
        this.selectedDisciplinas.set(new Set(camp.disciplinaIds));
        this.selectedDias.set(new Set(camp.diasHabilesCompetencia));
        this.fechasBloqueadas.set([...camp.fechasBloqueadas]);
        camp.reglasGenerales.forEach((r) => this.addRegla(r));
      }
    }
  }

  protected crearReglaGroup(regla?: ReglaGeneral) {
    return this.fb.nonNullable.group({
      nombre: [regla?.nombre ?? '', Validators.required],
      descripcion: [regla?.descripcion ?? ''],
      valor: [regla?.valor ?? '', Validators.required],
    });
  }

  protected addRegla(regla?: ReglaGeneral): void {
    this.reglasArray.push(this.crearReglaGroup(regla));
  }

  protected removeRegla(index: number): void {
    this.reglasArray.removeAt(index);
  }

  protected toggleDisciplina(id: string): void {
    this.selectedDisciplinas.update((set) => {
      const newSet = new Set(set);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }

  protected toggleDia(dia: number): void {
    this.selectedDias.update((set) => {
      const newSet = new Set(set);
      if (newSet.has(dia)) newSet.delete(dia);
      else newSet.add(dia);
      return newSet;
    });
  }

  protected addFechaBloqueada(fecha: string, motivo: string, tipo: string): void {
    if (!fecha || !motivo) return;
    this.fechasBloqueadas.update((arr) => [
      ...arr,
      { id: crypto.randomUUID(), fecha, motivo, tipo: tipo as TipoFechaBloqueada },
    ]);
  }

  protected removeFechaBloqueada(id: string): void {
    this.fechasBloqueadas.update((arr) => arr.filter((f) => f.id !== id));
  }

  protected diasHabilesResumen(): string {
    const labels = DIAS_SEMANA_LABELS;
    return Array.from(this.selectedDias()).sort().map((d) => labels[d]).join(', ') || 'Ninguno';
  }

  protected pasoValido(): boolean {
    switch (this.paso()) {
      case 1:
        return this.form.controls.nombre.valid && this.form.controls.anio.valid;
      case 2:
        return this.selectedDisciplinas().size > 0;
      case 3:
        return this.reglasArray.valid;
      case 4:
        return this.form.controls.fechaInicio.valid && this.form.controls.fechaFin.valid;
      default:
        return true;
    }
  }

  protected formularioValido(): boolean {
    return (
      this.form.controls.nombre.valid &&
      this.form.controls.anio.valid &&
      this.form.controls.fechaInicio.valid &&
      this.form.controls.fechaFin.valid &&
      this.selectedDisciplinas().size > 0
    );
  }

  protected goToStep(step: number): void {
    if (step < this.paso() || this.pasoValido()) {
      this.paso.set(step);
    }
  }

  protected siguiente(): void {
    if (this.pasoValido() && this.paso() < this.totalPasos) {
      this.paso.update((p) => p + 1);
    }
  }

  protected anterior(): void {
    if (this.paso() > 1) {
      this.paso.update((p) => p - 1);
    }
  }

  protected guardar(): void {
    if (!this.formularioValido()) return;
    const value = this.form.getRawValue();
    const reglas: ReglaGeneral[] = value.reglasGenerales.map((r) => ({
      id: crypto.randomUUID(),
      nombre: r.nombre,
      descripcion: r.descripcion,
      valor: r.valor,
    }));

    const data = {
      nombre: value.nombre,
      anio: value.anio,
      periodo: value.periodo || undefined,
      tipo: value.tipo,
      modalidad: value.modalidad,
      estructura: value.estructura,
      descripcion: value.descripcion,
      observaciones: value.observaciones || undefined,
      disciplinaIds: Array.from(this.selectedDisciplinas()),
      reglasGenerales: reglas,
      fechaInicio: value.fechaInicio,
      fechaFin: value.fechaFin,
      fechaInicioInscripcion: value.fechaInicioInscripcion || undefined,
      fechaFinInscripcion: value.fechaFinInscripcion || undefined,
      diasHabilesCompetencia: Array.from(this.selectedDias()),
      fechasBloqueadas: this.fechasBloqueadas(),
      publicacionAutomatica: value.publicacionAutomatica,
      fechaProgramadaPublicacion: value.fechaProgramadaPublicacion || undefined,
      parametros: {
        maxDisciplinas: value.maxDisciplinas,
        permitirInvitados: value.permitirInvitados,
        permitirReapertura: value.permitirReapertura,
        duracionMaximaDias: value.duracionMaximaDias,
        permitirSimultaneos: value.permitirSimultaneos,
      },
      calendario: [] as Competencia['calendario'],
    };

    if (this.isEdit()) {
      this.competenciaService.update(this.editId, data);
    } else {
      this.competenciaService.create(data);
    }
    this.router.navigate(['/gestion/competencias']);
  }

  protected cancelar(): void {
    this.router.navigate(['/gestion/competencias']);
  }
}
