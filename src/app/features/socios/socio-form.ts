import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SocioService } from '../../core/services/socio.service';
import {
  EstadoSocio,
  TipoDocumento,
  Sexo,
  CondicionInstitucional,
  CondicionSocietaria,
  RelacionApoderado,
  PersonaRelacionadaSocio,
  NivelAcademicoAlumno,
  TIPO_DOCUMENTO_LABELS,
  SEXO_LABELS,
  CONDICION_INSTITUCIONAL_LABELS,
  CONDICION_SOCIETARIA_LABELS,
  RELACION_APODERADO_LABELS,
} from '../../core/models/socio.model';

type Tab = 'general' | 'apoderado' | 'salud' | 'niveles';

@Component({
  selector: 'app-socio-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="mb-2">
        <h2 class="text-2xl font-bold text-slate-900">{{ isEdit() ? 'Editar' : 'Nueva' }} Ficha de Socio</h2>
        <p class="text-slate-500 mt-1 text-sm">Perfil del socio con datos personales, apoderados, salud e historial de niveles.</p>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 bg-slate-100 rounded-xl p-1" role="tablist">
        @for (tab of tabs; track tab.id) {
          <button type="button" role="tab"
            [attr.aria-selected]="activeTab() === tab.id"
            [class]="activeTab() === tab.id
              ? 'flex-1 py-2 px-3 rounded-lg bg-white text-brand font-semibold text-sm shadow-sm'
              : 'flex-1 py-2 px-3 rounded-lg text-slate-600 hover:text-slate-800 font-medium text-sm'"
            (click)="activeTab.set(tab.id)">
            {{ tab.label }}
          </button>
        }
      </div>

      <form [formGroup]="form" (ngSubmit)="guardar()">

        <!-- TAB: Datos Generales -->
        @if (activeTab() === 'general') {
          <div class="bg-white rounded-xl shadow-sm p-6 space-y-5">
            <h3 class="text-base font-semibold text-slate-800 border-b pb-2">Datos Personales</h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="nombre" class="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                <input id="nombre" formControlName="nombre" type="text"
                  class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-400 focus:border-brand-400" />
              </div>
              <div>
                <label for="apellido" class="block text-sm font-medium text-slate-700 mb-1">Apellido *</label>
                <input id="apellido" formControlName="apellido" type="text"
                  class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-400 focus:border-brand-400" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label for="tipoDocumento" class="block text-sm font-medium text-slate-700 mb-1">Tipo de documento</label>
                <select id="tipoDocumento" formControlName="tipoDocumento"
                  class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-400 focus:border-brand-400">
                  @for (opt of tipoDocumentoOpts; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </div>
              <div class="sm:col-span-2">
                <label for="dni" class="block text-sm font-medium text-slate-700 mb-1">Número de documento *</label>
                <input id="dni" formControlName="dni" type="text"
                  class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-400 focus:border-brand-400" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label for="fechaNacimiento" class="block text-sm font-medium text-slate-700 mb-1">Fecha de nacimiento</label>
                <input id="fechaNacimiento" formControlName="fechaNacimiento" type="date"
                  class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-400 focus:border-brand-400" />
                @if (edadCalculada() !== null) {
                  <p class="text-xs text-slate-500 mt-1">{{ edadCalculada() }} años</p>
                }
              </div>
              <div>
                <label for="sexo" class="block text-sm font-medium text-slate-700 mb-1">Sexo</label>
                <select id="sexo" formControlName="sexo"
                  class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-400 focus:border-brand-400">
                  <option value="">— Seleccione —</option>
                  @for (opt of sexoOpts; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </div>
              <div>
                <label for="nacionalidad" class="block text-sm font-medium text-slate-700 mb-1">Nacionalidad</label>
                <input id="nacionalidad" formControlName="nacionalidad" type="text"
                  class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-400 focus:border-brand-400" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Correo electrónico</label>
                <input id="email" formControlName="email" type="email"
                  class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-400 focus:border-brand-400" />
              </div>
              <div>
                <label for="telefono" class="block text-sm font-medium text-slate-700 mb-1">Teléfono celular</label>
                <input id="telefono" formControlName="telefono" type="text"
                  class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-400 focus:border-brand-400" />
              </div>
            </div>

            <div>
              <label for="direccion" class="block text-sm font-medium text-slate-700 mb-1">Dirección de residencia</label>
              <input id="direccion" formControlName="direccion" type="text"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-400 focus:border-brand-400" />
            </div>

            <h3 class="text-base font-semibold text-slate-800 border-b pb-2 pt-2">Condición Institucional</h3>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label for="condicionInstitucional" class="block text-sm font-medium text-slate-700 mb-1">Condición</label>
                <select id="condicionInstitucional" formControlName="condicionInstitucional"
                  class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-400 focus:border-brand-400">
                  <option value="">— Seleccione —</option>
                  @for (opt of condicionOpts; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </div>
              <div>
                <label for="estado" class="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                <select id="estado" formControlName="estado"
                  class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-400 focus:border-brand-400">
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="suspendido">Suspendido</option>
                </select>
              </div>
              <div>
                <label for="condicionSocietaria" class="block text-sm font-medium text-slate-700 mb-1">Condición Societaria</label>
                <select id="condicionSocietaria" formControlName="condicionSocietaria"
                  class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-400 focus:border-brand-400">
                  <option value="">— Seleccione —</option>
                  @for (opt of condicionSocietariaOpts; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </div>
              <div>
                <label for="fechaAlta" class="block text-sm font-medium text-slate-700 mb-1">Fecha de alta</label>
                <input id="fechaAlta" formControlName="fechaAlta" type="date"
                  class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-400 focus:border-brand-400" />
              </div>
            </div>

            <div>
              <label for="observaciones" class="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
              <textarea id="observaciones" formControlName="observaciones" rows="3"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-400 focus:border-brand-400"></textarea>
            </div>
          </div>
        }

        <!-- TAB: Apoderado / Personas Relacionadas -->
        @if (activeTab() === 'apoderado') {
          <div class="bg-white rounded-xl shadow-sm p-6 space-y-5">
            <div class="flex items-center justify-between border-b pb-2">
              <h3 class="text-base font-semibold text-slate-800">Apoderado / Personas Relacionadas</h3>
              @if (esMenorDeEdad()) {
                <span class="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded">Menor de edad — apoderado requerido</span>
              }
            </div>

            @if (!esMenorDeEdad() && !form.value.fechaNacimiento) {
              <p class="text-sm text-slate-500 italic">Complete la fecha de nacimiento en "Datos Generales" para determinar si aplica apoderado.</p>
            }

            <!-- Lista de personas relacionadas -->
            @if (personasRelacionadas().length > 0) {
              <ul class="space-y-3">
                @for (p of personasRelacionadas(); track p.id) {
                  <li class="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 gap-3">
                    <div class="min-w-0">
                      <p class="font-medium text-slate-800">{{ p.apellido }}, {{ p.nombre }}</p>
                      <p class="text-xs text-slate-500">{{ relacionLabels[p.relacion] }}
                        @if (p.dni) { · DNI: {{ p.dni }} }
                        @if (p.telefono) { · {{ p.telefono }} }
                      </p>
                    </div>
                    <button type="button" (click)="eliminarPersona(p.id)"
                      class="shrink-0 text-red-500 hover:text-red-700 transition-colors text-xs font-medium"
                      aria-label="Eliminar persona relacionada">Eliminar</button>
                  </li>
                }
              </ul>
            } @else {
              <p class="text-sm text-slate-400 italic text-center py-4">No se han registrado personas relacionadas.</p>
            }

            <!-- Formulario para agregar persona -->
            @if (mostrarFormPersona()) {
              <div class="border-2 border-brand-200 rounded-xl p-4 space-y-3 bg-brand-50/20">
                <p class="text-sm font-semibold text-slate-700">Nueva persona relacionada</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label for="pNombre" class="block text-xs font-medium text-slate-600 mb-1">Nombre *</label>
                    <input id="pNombre" type="text" [value]="nuevaPersona().nombre"
                      (input)="actualizarNuevaPersona('nombre', $event)"
                      class="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-400" />
                  </div>
                  <div>
                    <label for="pApellido" class="block text-xs font-medium text-slate-600 mb-1">Apellido *</label>
                    <input id="pApellido" type="text" [value]="nuevaPersona().apellido"
                      (input)="actualizarNuevaPersona('apellido', $event)"
                      class="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-400" />
                  </div>
                  <div>
                    <label for="pRelacion" class="block text-xs font-medium text-slate-600 mb-1">Relación *</label>
                    <select id="pRelacion" [value]="nuevaPersona().relacion"
                      (change)="actualizarNuevaPersona('relacion', $event)"
                      class="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-400">
                      @for (opt of relacionOpts; track opt.value) {
                        <option [value]="opt.value">{{ opt.label }}</option>
                      }
                    </select>
                  </div>
                  <div>
                    <label for="pDni" class="block text-xs font-medium text-slate-600 mb-1">DNI</label>
                    <input id="pDni" type="text" [value]="nuevaPersona().dni"
                      (input)="actualizarNuevaPersona('dni', $event)"
                      class="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-400" />
                  </div>
                  <div>
                    <label for="pTelefono" class="block text-xs font-medium text-slate-600 mb-1">Teléfono</label>
                    <input id="pTelefono" type="text" [value]="nuevaPersona().telefono"
                      (input)="actualizarNuevaPersona('telefono', $event)"
                      class="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-400" />
                  </div>
                  <div>
                    <label for="pEmail" class="block text-xs font-medium text-slate-600 mb-1">Email</label>
                    <input id="pEmail" type="email" [value]="nuevaPersona().email"
                      (input)="actualizarNuevaPersona('email', $event)"
                      class="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-400" />
                  </div>
                </div>
                <div class="flex gap-2 pt-1">
                  <button type="button" (click)="agregarPersona()"
                    [disabled]="!nuevaPersona().nombre || !nuevaPersona().apellido"
                    class="bg-brand text-white px-4 py-1.5 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                    Agregar
                  </button>
                  <button type="button" (click)="mostrarFormPersona.set(false)"
                    class="bg-slate-200 text-slate-700 px-4 py-1.5 rounded-lg hover:bg-slate-300 text-sm">
                    Cancelar
                  </button>
                </div>
              </div>
            } @else {
              <button type="button" (click)="abrirFormPersona()"
                class="inline-flex items-center gap-2 border border-dashed border-brand-400 text-brand px-4 py-2 rounded-lg hover:bg-brand-50 text-sm font-medium transition-colors">
                <span aria-hidden="true">+</span> Agregar persona relacionada
              </button>
            }
          </div>
        }

        <!-- TAB: Salud y Discapacidad -->
        @if (activeTab() === 'salud') {
          <div class="bg-white rounded-xl shadow-sm p-6 space-y-5">
            <h3 class="text-base font-semibold text-slate-800 border-b pb-2">Situación de Salud y Discapacidad</h3>
            <p class="text-xs text-slate-500">Esta información es de carácter informativo para el docente. No restringe la matrícula.</p>

            <div class="flex items-center gap-3">
              <input id="tieneDiscapacidad" type="checkbox" formControlName="tieneDiscapacidad"
                class="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand-400" />
              <label for="tieneDiscapacidad" class="text-sm font-medium text-slate-700">El socio presenta alguna habilidad diferente o discapacidad</label>
            </div>

            @if (form.value.tieneDiscapacidad) {
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pl-7">
                <div>
                  <label for="discapacidadTipo" class="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                  <input id="discapacidadTipo" formControlName="discapacidadTipo" type="text"
                    placeholder="Ej: motora, visual, auditiva..."
                    class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-400 focus:border-brand-400" />
                </div>
                <div>
                  <label for="discapacidadGrado" class="block text-sm font-medium text-slate-700 mb-1">Grado</label>
                  <select id="discapacidadGrado" formControlName="discapacidadGrado"
                    class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-400 focus:border-brand-400">
                    <option value="">— Seleccione —</option>
                    <option value="leve">Leve</option>
                    <option value="moderado">Moderado</option>
                    <option value="severo">Severo</option>
                  </select>
                </div>
                <div>
                  <label for="discapacidadConadis" class="block text-sm font-medium text-slate-700 mb-1">N° Carnet CONADIS</label>
                  <input id="discapacidadConadis" formControlName="discapacidadNumeroConadis" type="text"
                    class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-400 focus:border-brand-400" />
                </div>
              </div>
            }
          </div>
        }

        <!-- TAB: Historial de Niveles -->
        @if (activeTab() === 'niveles') {
          <div class="bg-white rounded-xl shadow-sm p-6 space-y-5">
            <h3 class="text-base font-semibold text-slate-800 border-b pb-2">Historial de Niveles / Grados</h3>
            <p class="text-xs text-slate-500">Registra los niveles académicos o deportivos alcanzados (ej. cinturón, nivel certificado).</p>

            @if (historialNiveles().length > 0) {
              <ul class="space-y-3">
                @for (n of historialNiveles(); track n.id) {
                  <li class="flex items-start justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 gap-3">
                    <div class="min-w-0">
                      <p class="font-medium text-slate-800">{{ n.nivel }}
                        <span class="text-xs font-normal text-slate-500 ml-1">— {{ n.disciplina }}</span>
                      </p>
                      <p class="text-xs text-slate-500">Otorgado: {{ n.fechaOtorgado }}
                        @if (n.certificadoPor) { · Por: {{ n.certificadoPor }} }
                      </p>
                      @if (n.observaciones) {
                        <p class="text-xs text-slate-400 mt-0.5">{{ n.observaciones }}</p>
                      }
                    </div>
                    <button type="button" (click)="eliminarNivel(n.id)"
                      class="shrink-0 text-red-500 hover:text-red-700 transition-colors text-xs font-medium"
                      aria-label="Eliminar nivel">Eliminar</button>
                  </li>
                }
              </ul>
            } @else {
              <p class="text-sm text-slate-400 italic text-center py-4">Sin niveles registrados.</p>
            }

            @if (mostrarFormNivel()) {
              <div class="border-2 border-brand-200 rounded-xl p-4 space-y-3 bg-brand-50/20">
                <p class="text-sm font-semibold text-slate-700">Nuevo nivel</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label for="nDisciplina" class="block text-xs font-medium text-slate-600 mb-1">Disciplina *</label>
                    <input id="nDisciplina" type="text" [value]="nuevoNivel().disciplina"
                      (input)="actualizarNuevoNivel('disciplina', $event)"
                      placeholder="Ej: Judo, Natación..."
                      class="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-400" />
                  </div>
                  <div>
                    <label for="nNivel" class="block text-xs font-medium text-slate-600 mb-1">Nivel / Grado *</label>
                    <input id="nNivel" type="text" [value]="nuevoNivel().nivel"
                      (input)="actualizarNuevoNivel('nivel', $event)"
                      placeholder="Ej: Cinturón verde, Nivel 2..."
                      class="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-400" />
                  </div>
                  <div>
                    <label for="nFecha" class="block text-xs font-medium text-slate-600 mb-1">Fecha otorgado *</label>
                    <input id="nFecha" type="date" [value]="nuevoNivel().fechaOtorgado"
                      (input)="actualizarNuevoNivel('fechaOtorgado', $event)"
                      class="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-400" />
                  </div>
                  <div>
                    <label for="nCertificadoPor" class="block text-xs font-medium text-slate-600 mb-1">Certificado por</label>
                    <input id="nCertificadoPor" type="text" [value]="nuevoNivel().certificadoPor"
                      (input)="actualizarNuevoNivel('certificadoPor', $event)"
                      placeholder="Ej: AELU, institución externa..."
                      class="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-400" />
                  </div>
                  <div class="sm:col-span-2">
                    <label for="nObs" class="block text-xs font-medium text-slate-600 mb-1">Observaciones</label>
                    <input id="nObs" type="text" [value]="nuevoNivel().observaciones"
                      (input)="actualizarNuevoNivel('observaciones', $event)"
                      class="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-400" />
                  </div>
                </div>
                <div class="flex gap-2 pt-1">
                  <button type="button" (click)="agregarNivel()"
                    [disabled]="!nuevoNivel().disciplina || !nuevoNivel().nivel || !nuevoNivel().fechaOtorgado"
                    class="bg-brand text-white px-4 py-1.5 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                    Agregar
                  </button>
                  <button type="button" (click)="mostrarFormNivel.set(false)"
                    class="bg-slate-200 text-slate-700 px-4 py-1.5 rounded-lg hover:bg-slate-300 text-sm">
                    Cancelar
                  </button>
                </div>
              </div>
            } @else {
              <button type="button" (click)="abrirFormNivel()"
                class="inline-flex items-center gap-2 border border-dashed border-brand-400 text-brand px-4 py-2 rounded-lg hover:bg-brand-50 text-sm font-medium transition-colors">
                <span aria-hidden="true">+</span> Agregar nivel
              </button>
            }
          </div>
        }

        <!-- Acciones -->
        <div class="flex gap-3 pt-2">
          <button type="submit" [disabled]="form.invalid"
            class="bg-brand text-white px-6 py-2 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {{ isEdit() ? 'Actualizar' : 'Crear' }}
          </button>
          <button type="button" (click)="cancelar()"
            class="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 transition-colors">
            Cancelar
          </button>
        </div>

      </form>
    </div>
  `,
})
export class SocioFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly socioService = inject(SocioService);

  protected readonly isEdit = signal(false);
  private editId = '';

  protected readonly activeTab = signal<Tab>('general');
  protected readonly mostrarFormPersona = signal(false);
  protected readonly mostrarFormNivel = signal(false);
  protected readonly personasRelacionadas = signal<PersonaRelacionadaSocio[]>([]);
  protected readonly historialNiveles = signal<NivelAcademicoAlumno[]>([]);

  protected readonly nuevaPersona = signal<Partial<PersonaRelacionadaSocio>>({ relacion: 'padre' });
  protected readonly nuevoNivel = signal<Partial<NivelAcademicoAlumno>>({});

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    tipoDocumento: ['dni' as TipoDocumento],
    dni: ['', Validators.required],
    sexo: ['' as Sexo | ''],
    nacionalidad: [''],
    fechaNacimiento: [''],
    email: [''],
    telefono: [''],
    direccion: [''],
    condicionInstitucional: ['' as CondicionInstitucional | ''],
    condicionSocietaria: ['' as CondicionSocietaria | ''],
    estado: ['activo' as EstadoSocio],
    fechaAlta: [new Date().toISOString().split('T')[0], Validators.required],
    observaciones: [''],
    tieneDiscapacidad: [false],
    discapacidadTipo: [''],
    discapacidadGrado: [''],
    discapacidadNumeroConadis: [''],
  });

  protected readonly edadCalculada = computed(() => {
    const fecha = this.form.value.fechaNacimiento;
    if (!fecha) return null;
    const hoy = new Date();
    const nac = new Date(fecha);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  });

  protected readonly esMenorDeEdad = computed(() => {
    const edad = this.edadCalculada();
    return edad !== null && edad < 18;
  });

  protected readonly tabs: { id: Tab; label: string }[] = [
    { id: 'general', label: 'Datos Generales' },
    { id: 'apoderado', label: 'Apoderado' },
    { id: 'salud', label: 'Salud' },
    { id: 'niveles', label: 'Niveles' },
  ];

  protected readonly tipoDocumentoOpts = Object.entries(TIPO_DOCUMENTO_LABELS).map(([value, label]) => ({ value: value as TipoDocumento, label }));
  protected readonly sexoOpts = Object.entries(SEXO_LABELS).map(([value, label]) => ({ value: value as Sexo, label }));
  protected readonly condicionOpts = Object.entries(CONDICION_INSTITUCIONAL_LABELS).map(([value, label]) => ({ value: value as CondicionInstitucional, label }));
  protected readonly condicionSocietariaOpts = Object.entries(CONDICION_SOCIETARIA_LABELS).map(([value, label]) => ({ value: value as CondicionSocietaria, label }));
  protected readonly relacionOpts = Object.entries(RELACION_APODERADO_LABELS).map(([value, label]) => ({ value: value as RelacionApoderado, label }));
  protected readonly relacionLabels = RELACION_APODERADO_LABELS;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const socio = this.socioService.getById(id);
      if (socio) {
        this.isEdit.set(true);
        this.editId = id;
        this.form.patchValue({
          nombre: socio.nombre,
          apellido: socio.apellido,
          tipoDocumento: socio.tipoDocumento ?? 'dni',
          dni: socio.dni,
          sexo: socio.sexo ?? '',
          nacionalidad: socio.nacionalidad ?? '',
          fechaNacimiento: socio.fechaNacimiento ?? '',
          email: socio.email ?? '',
          telefono: socio.telefono ?? '',
          direccion: socio.direccion ?? '',
          condicionInstitucional: socio.condicionInstitucional ?? '',
          condicionSocietaria: socio.condicionSocietaria ?? '',
          estado: socio.estado,
          fechaAlta: socio.fechaAlta,
          observaciones: socio.observaciones ?? '',
          tieneDiscapacidad: socio.discapacidad?.tieneDiscapacidad ?? false,
          discapacidadTipo: socio.discapacidad?.tipo ?? '',
          discapacidadGrado: socio.discapacidad?.grado ?? '',
          discapacidadNumeroConadis: socio.discapacidad?.numeroConadis ?? '',
        });
        if (socio.personasRelacionadas) this.personasRelacionadas.set(socio.personasRelacionadas);
        if (socio.historialNiveles) this.historialNiveles.set(socio.historialNiveles);
      }
    }
  }

  protected abrirFormPersona(): void {
    this.nuevaPersona.set({ relacion: 'padre' });
    this.mostrarFormPersona.set(true);
  }

  protected actualizarNuevaPersona(campo: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.nuevaPersona.update(p => ({ ...p, [campo]: value }));
  }

  protected agregarPersona(): void {
    const p = this.nuevaPersona();
    if (!p.nombre || !p.apellido) return;
    this.personasRelacionadas.update(list => [...list, {
      id: crypto.randomUUID(),
      nombre: p.nombre!,
      apellido: p.apellido!,
      relacion: p.relacion ?? 'padre',
      dni: p.dni || undefined,
      telefono: p.telefono || undefined,
      email: p.email || undefined,
    }]);
    this.mostrarFormPersona.set(false);
  }

  protected eliminarPersona(id: string): void {
    this.personasRelacionadas.update(list => list.filter(p => p.id !== id));
  }

  protected abrirFormNivel(): void {
    this.nuevoNivel.set({});
    this.mostrarFormNivel.set(true);
  }

  protected actualizarNuevoNivel(campo: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.nuevoNivel.update(n => ({ ...n, [campo]: value }));
  }

  protected agregarNivel(): void {
    const n = this.nuevoNivel();
    if (!n.disciplina || !n.nivel || !n.fechaOtorgado) return;
    this.historialNiveles.update(list => [...list, {
      id: crypto.randomUUID(),
      disciplina: n.disciplina!,
      nivel: n.nivel!,
      fechaOtorgado: n.fechaOtorgado!,
      certificadoPor: n.certificadoPor || undefined,
      observaciones: n.observaciones || undefined,
    }]);
    this.mostrarFormNivel.set(false);
  }

  protected eliminarNivel(id: string): void {
    this.historialNiveles.update(list => list.filter(n => n.id !== id));
  }

  protected guardar(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const data = {
      nombre: v.nombre,
      apellido: v.apellido,
      tipoDocumento: v.tipoDocumento || undefined,
      dni: v.dni,
      sexo: (v.sexo as Sexo) || undefined,
      nacionalidad: v.nacionalidad || undefined,
      email: v.email || undefined,
      telefono: v.telefono || undefined,
      fechaNacimiento: v.fechaNacimiento || undefined,
      direccion: v.direccion || undefined,
      condicionInstitucional: (v.condicionInstitucional as CondicionInstitucional) || undefined,
      condicionSocietaria: (v.condicionSocietaria as CondicionSocietaria) || undefined,
      estado: v.estado,
      fechaAlta: v.fechaAlta,
      observaciones: v.observaciones || undefined,
      personasRelacionadas: this.personasRelacionadas().length > 0 ? this.personasRelacionadas() : undefined,
      discapacidad: v.tieneDiscapacidad ? {
        tieneDiscapacidad: true,
        tipo: v.discapacidadTipo || undefined,
        grado: v.discapacidadGrado || undefined,
        numeroConadis: v.discapacidadNumeroConadis || undefined,
      } : { tieneDiscapacidad: false },
      historialNiveles: this.historialNiveles().length > 0 ? this.historialNiveles() : undefined,
    };

    if (this.isEdit()) {
      this.socioService.update(this.editId, data);
    } else {
      this.socioService.create(data);
    }
    this.router.navigate(['/maestros/socios']);
  }

  protected cancelar(): void {
    this.router.navigate(['/maestros/socios']);
  }
}
