import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatriculaService } from '../../core/services/matricula.service';
import { SocioService } from '../../core/services/socio.service';
import { AcademiaService } from '../../core/services/academia.service';
import { Socio, ESTADO_SOCIO_LABELS } from '../../core/models/socio.model';
import {
  TipoMatricula,
  CanalMatricula,
  DescuentoAplicado,
  ValidacionMatriculaDetalle,
  TIPO_MATRICULA_LABELS,
  CANAL_MATRICULA_LABELS,
} from '../../core/models/matricula.model';

@Component({
  selector: 'app-matricula-module-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-900">Nueva Matrícula</h2>
        <p class="text-slate-500 mt-1">Complete los datos para registrar una matrícula</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="guardar()" class="space-y-6">
        <!-- Paso 1: Buscar / Seleccionar Socio -->
        <section class="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 class="text-lg font-semibold text-slate-800">1. Buscar Alumno</h3>

          @if (!socioSeleccionado()) {
            <!-- Buscador -->
            <div class="relative">
              <label for="buscarSocio" class="block text-sm font-medium text-slate-700 mb-1">
                Buscar por DNI, nombre o apellido
              </label>
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                  id="buscarSocio"
                  type="text"
                  autocomplete="off"
                  placeholder="Ej: 30123456 o García"
                  class="w-full rounded-lg border-slate-300 border pl-10 pr-3 py-2 focus:ring-2 focus:ring-brand-400 focus:border-brand-400"
                  [value]="busqueda()"
                  (input)="onBusquedaInput($event)"
                />
              </div>
              @if (busqueda().length > 0 && busqueda().length < 2) {
                <p class="text-xs text-slate-400 mt-1">Escriba al menos 2 caracteres para buscar</p>
              }
            </div>

            <!-- Resultados -->
            @if (busqueda().length >= 2) {
              <div class="border border-slate-200 rounded-lg overflow-hidden">
                <div class="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                  <span class="text-xs font-semibold text-slate-500 uppercase">
                    {{ resultadosBusqueda().length }} resultado{{ resultadosBusqueda().length !== 1 ? 's' : '' }}
                  </span>
                  @if (resultadosBusqueda().length > 5) {
                    <span class="text-xs text-slate-400">Mostrando primeros 5, refine su búsqueda</span>
                  }
                </div>
                <div class="max-h-60 overflow-y-auto divide-y divide-slate-100">
                  @for (s of resultadosBusqueda().slice(0, 5); track s.id) {
                    <button type="button"
                      class="w-full text-left px-4 py-3 hover:bg-brand-50 transition-colors flex items-center justify-between gap-3"
                      (click)="seleccionarSocio(s)">
                      <div class="min-w-0">
                        <p class="font-medium text-slate-800 truncate">{{ s.apellido }}, {{ s.nombre }}</p>
                        <p class="text-xs text-slate-500">DNI: {{ s.dni }}
                          @if (s.fechaNacimiento) { · <span class="font-semibold text-slate-700">{{ calcularEdad(s.fechaNacimiento) }} años</span> }
                          @if (s.email) { · {{ s.email }} }
                        </p>
                      </div>
                      <div class="shrink-0 flex items-center gap-2">
                        <span class="text-xs px-2 py-0.5 rounded font-medium"
                          [class]="s.estado === 'activo' ? 'bg-green-100 text-green-700' : s.estado === 'suspendido' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'">
                          {{ estadoSocioLabels[s.estado] }}
                        </span>
                        <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                      </div>
                    </button>
                  }
                  @empty {
                    <div class="px-4 py-6 text-center">
                      <p class="text-sm text-slate-500">No se encontraron socios con "{{ busqueda() }}"</p>
                      <button type="button" (click)="abrirRegistroRapido()"
                        class="mt-3 inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors text-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        Registrar nuevo socio
                      </button>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Formulario de registro rápido -->
            @if (mostrarRegistroRapido()) {
              <div class="border-2 border-brand-200 rounded-xl p-4 space-y-4 bg-brand-50/30">
                <div class="flex items-center justify-between">
                  <h4 class="font-semibold text-slate-800 text-sm">Registro rápido de socio</h4>
                  <button type="button" (click)="mostrarRegistroRapido.set(false)"
                    class="text-slate-400 hover:text-slate-600 transition-colors" aria-label="Cerrar registro rápido">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label for="regNombre" class="block text-xs font-medium text-slate-600 mb-1">Nombre *</label>
                    <input id="regNombre" type="text" [formControl]="regForm.controls.nombre"
                      class="w-full rounded-lg border-slate-300 border px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-400 focus:border-brand-400" />
                  </div>
                  <div>
                    <label for="regApellido" class="block text-xs font-medium text-slate-600 mb-1">Apellido *</label>
                    <input id="regApellido" type="text" [formControl]="regForm.controls.apellido"
                      class="w-full rounded-lg border-slate-300 border px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-400 focus:border-brand-400" />
                  </div>
                  <div>
                    <label for="regDni" class="block text-xs font-medium text-slate-600 mb-1">DNI *</label>
                    <input id="regDni" type="text" [formControl]="regForm.controls.dni"
                      class="w-full rounded-lg border-slate-300 border px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-400 focus:border-brand-400" />
                  </div>
                  <div>
                    <label for="regFechaNac" class="block text-xs font-medium text-slate-600 mb-1">Fecha nacimiento</label>
                    <input id="regFechaNac" type="date" [formControl]="regForm.controls.fechaNacimiento"
                      class="w-full rounded-lg border-slate-300 border px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-400 focus:border-brand-400" />
                  </div>
                  <div>
                    <label for="regEmail" class="block text-xs font-medium text-slate-600 mb-1">Email</label>
                    <input id="regEmail" type="email" [formControl]="regForm.controls.email"
                      class="w-full rounded-lg border-slate-300 border px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-400 focus:border-brand-400" />
                  </div>
                  <div>
                    <label for="regTelefono" class="block text-xs font-medium text-slate-600 mb-1">Teléfono</label>
                    <input id="regTelefono" type="text" [formControl]="regForm.controls.telefono"
                      class="w-full rounded-lg border-slate-300 border px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-400 focus:border-brand-400" />
                  </div>
                </div>
                @if (regDuplicado()) {
                  <p class="text-xs text-red-600 font-medium">Ya existe un socio con ese DNI.</p>
                }
                <div class="flex gap-2">
                  <button type="button" (click)="registrarSocioRapido()"
                    [disabled]="regForm.invalid"
                    class="bg-brand text-white px-4 py-1.5 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm">
                    Registrar y seleccionar
                  </button>
                  <button type="button" (click)="mostrarRegistroRapido.set(false)"
                    class="bg-slate-200 text-slate-700 px-4 py-1.5 rounded-lg hover:bg-slate-300 transition-colors text-sm">
                    Cancelar
                  </button>
                </div>
              </div>
            }
          } @else {
            <!-- Socio seleccionado -->
            <div class="rounded-lg border border-brand-200 bg-brand-50/30 p-4">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="font-semibold text-slate-800">{{ socioSeleccionado()!.apellido }}, {{ socioSeleccionado()!.nombre }}</p>
                  <p class="text-sm text-slate-600 mt-0.5">DNI: {{ socioSeleccionado()!.dni }}
                    @if (socioSeleccionado()!.email) { · {{ socioSeleccionado()!.email }} }
                    @if (socioSeleccionado()!.telefono) { · {{ socioSeleccionado()!.telefono }} }
                  </p>
                  <span class="inline-block mt-1 text-xs px-2 py-0.5 rounded font-medium"
                    [class]="socioSeleccionado()!.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">
                    {{ estadoSocioLabels[socioSeleccionado()!.estado] }}
                  </span>
                </div>
                <button type="button" (click)="deseleccionarSocio()"
                  class="shrink-0 text-sm text-brand hover:text-brand-700 font-medium transition-colors">
                  Cambiar
                </button>
              </div>
            </div>

            @if (fichaAlumno()) {
              <div class="rounded-lg bg-slate-50 p-4 text-sm space-y-1">
                <p class="font-medium text-slate-700">Ficha del alumno</p>
                <p class="text-slate-600">Certificado médico: {{ fichaAlumno()!.certificadoMedicoVigente ? 'Vigente' : 'No vigente' }}</p>
                <p class="text-slate-600">Declaración jurada: {{ fichaAlumno()!.declaracionJuradaFirmada ? 'Firmada' : 'Pendiente' }}</p>
                @if (fichaAlumno()!.personasRelacionadas.length > 0) {
                  <p class="text-slate-600">Apoderado: {{ fichaAlumno()!.personasRelacionadas[0].nombre }} {{ fichaAlumno()!.personasRelacionadas[0].apellido }}</p>
                }
              </div>
            }

            @if (historial().length > 0) {
              <div class="rounded-lg bg-blue-50 p-4 text-sm">
                <p class="font-medium text-blue-800">Historial académico ({{ historial().length }} registros)</p>
                <ul class="mt-1 space-y-0.5 text-blue-700">
                  @for (h of historial().slice(0, 3); track h.claseId) {
                    <li>{{ h.cursoNombre }} — {{ h.periodo }} ({{ h.estado }})</li>
                  }
                </ul>
              </div>
            }
          }
        </section>

        <!-- Paso 2: Selección de Clase -->
        <section class="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 class="text-lg font-semibold text-slate-800">2. Clase</h3>
          @if (clasePreseleccionada()) {
            <div class="rounded-lg border border-brand-200 bg-brand-50/30 p-4 flex items-center justify-between gap-3">
              <div>
                @if (claseInfoPreseleccionada(); as info) {
                  <p class="font-semibold text-slate-800">{{ info.cursoNombre }}</p>
                  <p class="text-sm text-slate-600 mt-0.5">{{ info.horarioTexto }}</p>
                }
                @if (vacanteInfo(); as vi) {
                  <p class="text-xs mt-1" [class]="vi.disponibles > 0 ? 'text-green-600' : 'text-red-600'">{{ vi.disponibles }} vacante(s) disponible(s)</p>
                }
              </div>
              <button type="button" (click)="limpiarClasePreseleccionada()"
                class="shrink-0 text-sm text-brand hover:text-brand-700 font-medium transition-colors">
                Cambiar
              </button>
            </div>
          } @else {
            <div>
              <label for="claseId" class="block text-sm font-medium text-slate-700 mb-1">Clase</label>
              <select id="claseId" formControlName="claseId"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-400 focus:border-brand-400"
                (change)="onClaseChange()">
                <option value="">— Seleccione una clase —</option>
                @for (c of clasesDisponibles(); track c.id) {
                  <option [value]="c.id">{{ c.cursoNombre }} — {{ c.horarioTexto }} ({{ c.vacantesDisp }} vacantes)</option>
                }
              </select>
            </div>

            @if (vacanteInfo()) {
              <div class="grid grid-cols-3 gap-4 text-center">
                <div class="rounded-lg bg-slate-50 p-3">
                  <p class="text-xs text-slate-500">Total</p>
                  <p class="text-lg font-bold text-slate-700">{{ vacanteInfo()!.totalVacantes }}</p>
                </div>
                <div class="rounded-lg bg-slate-50 p-3">
                  <p class="text-xs text-slate-500">Ocupadas</p>
                  <p class="text-lg font-bold text-slate-700">{{ vacanteInfo()!.ocupadas }}</p>
                </div>
                <div class="rounded-lg p-3" [class]="vacanteInfo()!.disponibles > 0 ? 'bg-green-50' : 'bg-red-50'">
                  <p class="text-xs" [class]="vacanteInfo()!.disponibles > 0 ? 'text-green-600' : 'text-red-600'">Disponibles</p>
                  <p class="text-lg font-bold" [class]="vacanteInfo()!.disponibles > 0 ? 'text-green-700' : 'text-red-700'">{{ vacanteInfo()!.disponibles }}</p>
                </div>
              </div>
            }
          }
        </section>

        <!-- Paso 3: Tipo y Canal -->
        <section class="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 class="text-lg font-semibold text-slate-800">3. Tipo y Canal</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="tipo" class="block text-sm font-medium text-slate-700 mb-1">Tipo de matrícula</label>
              <select id="tipo" formControlName="tipo"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-400 focus:border-brand-400">
                @for (t of tipoOptions; track t.value) {
                  <option [value]="t.value">{{ t.label }}</option>
                }
              </select>
            </div>
            <div>
              <label for="canal" class="block text-sm font-medium text-slate-700 mb-1">Canal</label>
              <select id="canal" formControlName="canal"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-400 focus:border-brand-400">
                @for (c of canalOptions; track c.value) {
                  <option [value]="c.value">{{ c.label }}</option>
                }
              </select>
            </div>
          </div>
        </section>

        <!-- Paso 4: Validación -->
        @if (validacion()) {
          <section class="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h3 class="text-lg font-semibold text-slate-800">4. Resultado de Validación</h3>
            <div class="rounded-lg p-4" [class]="validacion()!.permitido ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
              <ul class="space-y-1 text-sm" [class]="validacion()!.permitido ? 'text-green-700' : 'text-red-700'">
                @for (msg of validacion()!.mensajes; track msg) {
                  <li>{{ msg }}</li>
                }
              </ul>
            </div>

            @if (validacion()!.permitido) {
              <!-- Tarifa y Descuentos -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-600">Tarifa base</span>
                  <span class="font-mono font-medium text-slate-800">S/ {{ tarifaBase().toFixed(2) }}</span>
                </div>
                @if (descuentosAplicados().length > 0) {
                  @for (d of descuentosAplicados(); track d.tipo) {
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-green-600">{{ d.descripcion }}</span>
                      <span class="font-mono text-green-700">-{{ d.porcentaje }}%</span>
                    </div>
                  }
                }
                <div class="flex items-center justify-between border-t pt-3">
                  <span class="font-semibold text-slate-800">Monto final</span>
                  <span class="text-xl font-bold font-mono text-brand">S/ {{ montoFinal().toFixed(2) }}</span>
                </div>
              </div>
            }
          </section>
        }

        <!-- Observaciones -->
        <section class="bg-white rounded-xl shadow-sm p-6">
          <label for="observaciones" class="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
          <textarea id="observaciones" formControlName="observaciones" rows="3"
            class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-brand-400 focus:border-brand-400"></textarea>
        </section>

        <!-- Acciones -->
        <div class="flex gap-3">
          @if (!validacion()) {
            <button type="button" (click)="validar()"
              [disabled]="!form.value.socioId || !form.value.claseId"
              class="bg-brand text-white px-6 py-2 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Validar
            </button>
          } @else if (validacion()!.permitido) {
            <button type="submit"
              class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Registrar Matrícula
            </button>
            <button type="button" (click)="resetValidacion()"
              class="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 transition-colors">
              Modificar
            </button>
          } @else {
            <button type="button" (click)="resetValidacion()"
              class="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 transition-colors">
              Corregir datos
            </button>
          }
          <button type="button" (click)="cancelar()"
            class="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `,
})
export class MatriculaModuleFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly matriculaService = inject(MatriculaService);
  private readonly socioService = inject(SocioService);
  private readonly academiaService = inject(AcademiaService);

  protected readonly validacion = signal<ValidacionMatriculaDetalle | null>(null);
  protected readonly descuentosAplicados = signal<DescuentoAplicado[]>([]);
  protected readonly busqueda = signal('');
  protected readonly socioSeleccionado = signal<Socio | null>(null);
  protected readonly mostrarRegistroRapido = signal(false);
  protected readonly clasePreseleccionada = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    socioId: ['', Validators.required],
    claseId: ['', Validators.required],
    tipo: ['nueva' as TipoMatricula, Validators.required],
    canal: ['ventanilla' as CanalMatricula, Validators.required],
    observaciones: [''],
  });

  constructor() {
    const claseId = this.route.snapshot.queryParamMap.get('claseId');
    if (claseId) {
      this.clasePreseleccionada.set(claseId);
      this.form.controls.claseId.setValue(claseId);
    }
  }

  readonly regForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    dni: ['', Validators.required],
    fechaNacimiento: [''],
    email: [''],
    telefono: [''],
  });

  protected readonly estadoSocioLabels = ESTADO_SOCIO_LABELS;

  protected readonly resultadosBusqueda = computed(() => {
    const term = this.busqueda().trim().toLowerCase();
    if (term.length < 2) return [];
    return this.socioService.items().filter((s) => {
      const texto = `${s.apellido} ${s.nombre} ${s.dni} ${s.email ?? ''}`.toLowerCase();
      return texto.includes(term);
    });
  });

  protected readonly regDuplicado = computed(() => {
    const dni = this.regForm.controls.dni.value.trim();
    if (!dni) return false;
    return this.socioService.items().some((s) => s.dni === dni);
  });

  protected readonly fichaAlumno = computed(() => {
    const socio = this.socioSeleccionado();
    return socio ? this.matriculaService.getFichaAlumno(socio.id) : undefined;
  });

  protected readonly historial = computed(() => {
    const socio = this.socioSeleccionado();
    return socio ? this.matriculaService.getHistorialAcademico(socio.id) : [];
  });

  protected readonly clasesDisponibles = computed(() =>
    this.academiaService.clases()
      .filter((c) => c.estado === 'abierta')
      .map((c) => {
        const curso = this.academiaService.getCursoById(c.cursoId);
        const vi = this.matriculaService.getVacanteInfo(c.id);
        return {
          ...c,
          cursoNombre: curso?.nombre ?? '—',
          horarioTexto: c.horarios.map((h) => `${h.dia} ${h.horaInicio}-${h.horaFin}`).join(', '),
          vacantesDisp: vi?.disponibles ?? 0,
        };
      })
  );

  protected readonly claseInfoPreseleccionada = computed(() => {
    const claseId = this.clasePreseleccionada();
    if (!claseId) return null;
    const clase = this.academiaService.getClaseById(claseId);
    if (!clase) return null;
    const curso = this.academiaService.getCursoById(clase.cursoId);
    return {
      cursoNombre: curso?.nombre ?? '—',
      horarioTexto: clase.horarios.map((h) => `${h.dia} ${h.horaInicio}-${h.horaFin}`).join(', '),
    };
  });

  protected readonly vacanteInfo = computed(() => {
    const claseId = this.form.controls.claseId.value;
    return claseId ? this.matriculaService.getVacanteInfo(claseId) : undefined;
  });

  protected readonly tarifaBase = computed(() => {
    const v = this.validacion();
    return v?.tarifaSugerida ?? 0;
  });

  protected readonly montoFinal = computed(() =>
    this.matriculaService.calcularMontoFinal(this.tarifaBase(), this.descuentosAplicados())
  );

  protected readonly tipoOptions = Object.entries(TIPO_MATRICULA_LABELS).map(([value, label]) => ({ value, label }));
  protected readonly canalOptions = Object.entries(CANAL_MATRICULA_LABELS).map(([value, label]) => ({ value, label }));

  protected onBusquedaInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.busqueda.set(value);
    this.mostrarRegistroRapido.set(false);
  }

  protected seleccionarSocio(socio: Socio): void {
    this.socioSeleccionado.set(socio);
    this.form.controls.socioId.setValue(socio.id);
    this.busqueda.set('');
    this.mostrarRegistroRapido.set(false);
    this.validacion.set(null);
  }

  protected deseleccionarSocio(): void {
    this.socioSeleccionado.set(null);
    this.form.controls.socioId.setValue('');
    this.busqueda.set('');
    this.validacion.set(null);
  }

  protected abrirRegistroRapido(): void {
    this.mostrarRegistroRapido.set(true);
    const term = this.busqueda().trim();
    // Pre-fill dni if the search term looks numeric
    if (/^\d+$/.test(term)) {
      this.regForm.controls.dni.setValue(term);
    } else if (term) {
      this.regForm.controls.apellido.setValue(term);
    }
  }

  protected registrarSocioRapido(): void {
    if (this.regForm.invalid || this.regDuplicado()) return;
    const v = this.regForm.getRawValue();
    this.socioService.create({
      nombre: v.nombre,
      apellido: v.apellido,
      dni: v.dni,
      email: v.email || undefined,
      telefono: v.telefono || undefined,
      fechaNacimiento: v.fechaNacimiento || undefined,
      estado: 'activo',
      fechaAlta: new Date().toISOString().split('T')[0],
    });
    // Find the newly created socio by DNI
    const nuevo = this.socioService.items().find((s) => s.dni === v.dni);
    if (nuevo) {
      this.seleccionarSocio(nuevo);
    }
    this.regForm.reset();
    this.mostrarRegistroRapido.set(false);
  }

  protected onClaseChange(): void {
    this.validacion.set(null);
  }

  protected limpiarClasePreseleccionada(): void {
    this.clasePreseleccionada.set(null);
    this.form.controls.claseId.setValue('');
    this.validacion.set(null);
  }

  protected calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  }

  protected validar(): void {
    const { socioId, claseId } = this.form.getRawValue();
    if (!socioId || !claseId) return;
    const result = this.matriculaService.validarMatricula(socioId, claseId);
    this.validacion.set(result);
    this.descuentosAplicados.set(result.descuentosSugeridos ?? []);
  }

  protected resetValidacion(): void {
    this.validacion.set(null);
    this.descuentosAplicados.set([]);
  }

  protected guardar(): void {
    if (this.form.invalid || !this.validacion()?.permitido) return;
    const v = this.form.getRawValue();
    const result = this.matriculaService.registrar({
      socioId: v.socioId,
      claseId: v.claseId,
      tipo: v.tipo,
      canal: v.canal,
      descuentos: this.descuentosAplicados(),
      tarifaBase: this.tarifaBase(),
      observaciones: v.observaciones || undefined,
    });
    if (result) {
      this.cerrar();
    }
  }

  protected cancelar(): void {
    this.cerrar();
  }

  private cerrar(): void {
    if (this.route.outlet === 'panel') {
      const tree = this.router.parseUrl(this.router.url);
      delete tree.root.children['panel'];
      void this.router.navigateByUrl(tree);
    } else {
      this.router.navigate(['/matricula']);
    }
  }
}
