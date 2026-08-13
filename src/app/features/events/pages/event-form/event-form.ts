import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { EventEnvironmentService } from '../../services/event-environment.service';
import { EventRateService } from '../../services/event-rate.service';
import { EventCategory, EVENT_CATEGORY_LABELS } from '../../enums/event-category.enum';
import { EventStatus } from '../../enums/event-status.enum';
import { ParticipantType } from '../../enums/participant-type.enum';
import {
  EventEnvironment, EventRate, EventValidationResult, EventEnvironmentBooking,
  EventCategoryConfig, ContestCategory, BingoSerie, WorkshopConfig,
} from '../../models/event.model';
import {
  GENERAL_WIZARD_STEPS, CATEGORY_WIZARD_STEP, FINAL_WIZARD_STEPS, MOCK_AUTH_CONTEXT,
} from '../../models/event-general-config.model';
import { EventRateMatrixComponent } from '../../components/rate-matrix/event-rate-matrix';
import { EventCapacityBarComponent } from '../../components/event-capacity-bar/event-capacity-bar';
import { GeneralEventConfigComponent } from '../../category-config/general/general-event-config';
import { MassiveEventConfigComponent } from '../../category-config/massive/massive-event-config';
import { EventOfferingCatalog, EventTicketPool } from '../../models/event-offering.model';
import { EventOfferingService, syncTicketPoolsFromCatalog } from '../../services/event-offering.service';
import { getOfferingTemplateForCategory } from '../../mocks/event-offering.templates';
import { EventOfferingCatalogComponent } from '../../components/offering-catalog/event-offering-catalog';
import { EventTicketGenerationConfigComponent } from '../../components/ticket-generation/event-ticket-generation-config';
import { FundraisingEventConfigComponent } from '../../category-config/fundraising/fundraising-event-config';
import { ContestEventConfigComponent } from '../../category-config/contest/contest-event-config';
import { TripEventConfigComponent } from '../../category-config/trip/trip-event-config';
import { WorkshopEventConfigComponent } from '../../category-config/workshop/workshop-event-config';
import { confirmDialog } from '../../../../shared/confirm-dialog';

const ALL_STEPS = [...GENERAL_WIZARD_STEPS, CATEGORY_WIZARD_STEP, ...FINAL_WIZARD_STEPS];

function dateRangeValidator(group: AbstractControl): ValidationErrors | null {
  const start = group.get('startDate')?.value;
  const end = group.get('endDate')?.value;
  if (start && end && end < start) return { dateRange: true };
  const regStart = group.get('registrationStartDate')?.value;
  const regEnd = group.get('registrationEndDate')?.value;
  if (regStart && regEnd && regEnd < regStart) return { regDateRange: true };
  const sDate = group.get('startDate')?.value;
  const sTime = group.get('startTime')?.value;
  const eTime = group.get('endTime')?.value;
  if (sDate && start === end && sTime && eTime && eTime <= sTime) return { timeRange: true };
  return null;
}

const DEFAULT_WORKSHOP: WorkshopConfig = {
  name: '', responsible: '', instructor: '', environmentId: '',
  date: '', startTime: '09:00', endTime: '12:00', quota: 20, price: 0,
};

@Component({
  selector: 'app-event-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block -mx-4 -mt-4 -mb-4 lg:-mx-8 lg:-mt-8 lg:-mb-8',
  },
  imports: [
    ReactiveFormsModule, RouterLink, EventRateMatrixComponent, EventCapacityBarComponent,
    GeneralEventConfigComponent, MassiveEventConfigComponent,
    FundraisingEventConfigComponent, ContestEventConfigComponent, TripEventConfigComponent,
    WorkshopEventConfigComponent, EventOfferingCatalogComponent,
    EventTicketGenerationConfigComponent,
  ],
  template: `
    <div class="flex flex-col h-[calc(100vh-3rem)] w-full px-4 lg:px-8 py-4 max-w-6xl mx-auto">
      <!-- Header -->
      <div class="shrink-0 flex flex-wrap items-center justify-between gap-3 mb-3">
        <div class="flex items-center gap-3 min-w-0">
          <nav class="text-sm text-slate-500 shrink-0">
            <a routerLink="/eventos/listado" class="hover:text-brand">Eventos</a>
            <span class="mx-1.5">/</span>
          </nav>
          <h1 class="text-xl font-bold text-slate-900 truncate">Creación de evento</h1>
          @if (currentStep() <= 5) {
            <span class="hidden sm:inline text-xs font-semibold uppercase tracking-wide text-brand bg-brand/10 px-2.5 py-1 rounded-md">General</span>
          } @else if (currentStep() === 6) {
            <span class="hidden sm:inline text-xs font-semibold uppercase tracking-wide text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">{{ categoryLabels[form.value.category!] }}</span>
          }
        </div>
        <p class="text-sm text-slate-400">Paso {{ currentStep() }} de 8</p>
      </div>

      <!-- Stepper -->
      <div class="shrink-0 flex gap-1 overflow-x-auto pb-3 mb-3">
        @for (step of allSteps; track step.id) {
          <button type="button"
            class="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
            [class]="stepClass(step.id)"
            [title]="step.label"
            (click)="goToStep(step.id)">
            <span class="opacity-60">{{ step.id }}.</span> {{ stepShortLabels[step.id] }}
          </button>
        }
      </div>

      <!-- Formulario ocupa el resto del viewport -->
      <form [formGroup]="form" class="section-card flex flex-col flex-1 min-h-0 overflow-hidden">
        <div class="flex-1 min-h-0 overflow-y-auto p-5 lg:p-6 space-y-4">
        @switch (currentStep()) {
          @case (1) {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1" for="code">Código</label>
                <input id="code" formControlName="code" class="input-modern !py-2 !text-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Compañía</label>
                <input class="input-modern !py-2 !text-sm bg-slate-50" [value]="auth.companyName" readonly aria-readonly="true" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1">Unidad de negocio</label>
                <input class="input-modern !py-2 !text-sm bg-slate-50" [value]="auth.businessUnitName" readonly aria-readonly="true" />
              </div>
              <div class="sm:col-span-2 lg:col-span-3">
                <label class="block text-xs font-semibold text-slate-500 mb-1" for="name">Nombre del evento *</label>
                <input id="name" formControlName="name" class="input-modern !py-2 !text-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1" for="typeId">Tipo de evento</label>
                <select id="typeId" formControlName="typeId" class="input-modern !py-2 !text-sm">
                  @for (t of eventService.eventTypes; track t.id) {
                    <option [value]="t.id">{{ t.name }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1" for="category">Categoría</label>
                <select id="category" formControlName="category" class="input-modern !py-2 !text-sm">
                  @for (c of categories; track c) {
                    <option [value]="c">{{ categoryLabels[c] }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1" for="imageUrl">Imagen / banner (URL)</label>
                <input id="imageUrl" formControlName="imageUrl" class="input-modern !py-2 !text-sm" placeholder="https://..." />
              </div>
              <div class="sm:col-span-2 lg:col-span-3">
                <label class="block text-xs font-semibold text-slate-500 mb-1" for="description">Descripción</label>
                <textarea id="description" formControlName="description" rows="3" class="input-modern !py-2 !text-sm"></textarea>
              </div>
              <div class="sm:col-span-2 lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <label class="flex items-center gap-2 text-sm p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" formControlName="isPublic" /> Público
                </label>
                <label class="flex items-center gap-2 text-sm p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" formControlName="membersOnly" /> Exclusivo socios
                </label>
                <label class="flex items-center gap-2 text-sm p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" formControlName="allowGuests" /> Invitados
                </label>
                <label class="flex items-center gap-2 text-sm p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" formControlName="requiresRegistration" /> Requiere inscripción
                </label>
                <label class="flex items-center gap-2 text-sm p-2.5 rounded-lg border border-amber-200 bg-amber-50/50 cursor-pointer">
                  <input type="checkbox" formControlName="isFree" /> Gratuito
                </label>
              </div>
            </div>
          }
          @case (2) {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><label class="block text-xs font-semibold text-slate-500 mb-1">Fecha inicio *</label><input type="date" formControlName="startDate" class="input-modern !py-2 !text-sm" /></div>
              <div><label class="block text-xs font-semibold text-slate-500 mb-1">Fecha fin *</label><input type="date" formControlName="endDate" class="input-modern !py-2 !text-sm" /></div>
              <div class="hidden lg:block"></div>
              <div><label class="block text-xs font-semibold text-slate-500 mb-1">Hora inicio</label><input type="time" formControlName="startTime" class="input-modern !py-2 !text-sm" /></div>
              <div><label class="block text-xs font-semibold text-slate-500 mb-1">Hora fin</label><input type="time" formControlName="endTime" class="input-modern !py-2 !text-sm" /></div>
              <div class="hidden lg:block"></div>
              <div><label class="block text-xs font-semibold text-slate-500 mb-1">Inicio inscripciones</label><input type="date" formControlName="registrationStartDate" class="input-modern !py-2 !text-sm" /></div>
              <div><label class="block text-xs font-semibold text-slate-500 mb-1">Cierre inscripciones</label><input type="date" formControlName="registrationEndDate" class="input-modern !py-2 !text-sm" /></div>
            </div>
            @if (form.errors?.['dateRange']) { <p class="text-sm text-red-600">Fecha final debe ser ≥ fecha inicial</p> }
            @if (form.errors?.['regDateRange']) { <p class="text-sm text-red-600">Cierre inscripción debe ser ≥ inicio</p> }
            @if (form.errors?.['timeRange']) { <p class="text-sm text-red-600">Hora fin debe ser posterior a hora inicio (mismo día)</p> }
            <div class="p-4 bg-slate-50 rounded-lg text-sm space-y-1">
              <p><strong>Fecha:</strong> {{ formatDateSummary() }}</p>
              <p><strong>Horario:</strong> {{ form.value.startTime }} – {{ form.value.endTime }}</p>
              <p><strong>Inscripciones:</strong> {{ form.value.registrationStartDate || '—' }} – {{ form.value.registrationEndDate || '—' }}</p>
            </div>
          }
          @case (3) {
            <p class="text-sm text-slate-600">Seleccione uno o varios ambientes. Se validará disponibilidad al avanzar.</p>
            <div class="space-y-2">
              @for (env of environments(); track env.id) {
                <label class="flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer"
                  [class]="selectedEnvs().includes(env.id) ? 'border-brand bg-brand/5' : 'border-slate-200 hover:bg-slate-50'">
                  <input type="checkbox" [checked]="selectedEnvs().includes(env.id)" (change)="toggleEnv(env)" />
                  <div class="flex-1 min-w-0 text-sm">
                    <p class="font-semibold text-slate-800">{{ env.name }}</p>
                    <p class="text-slate-500 text-xs">{{ env.venueName }} · {{ env.type }} · Cap. {{ env.capacity }}</p>
                  </div>
                  <span class="shrink-0 text-xs px-2 py-0.5 rounded-full"
                    [class]="env.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                    {{ env.status === 'available' ? 'Disponible' : env.status }}
                  </span>
                </label>
              }
            </div>
            @if (envConflict()) {
              <p class="text-sm font-semibold text-red-600">El ambiente ya se encuentra reservado para este horario.</p>
            }
          }
          @case (4) {
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
              <div><label class="block text-xs font-semibold text-slate-500 mb-1">Aforo total *</label><input type="number" formControlName="totalCapacity" class="input-modern !py-2 !text-sm" min="1" /></div>
              <div><label class="block text-xs font-semibold text-slate-500 mb-1">Cupos reservados</label><input type="number" formControlName="reservedCapacity" class="input-modern !py-2 !text-sm" min="0" /></div>
            </div>
            <div class="max-w-lg pt-2"><app-event-capacity-bar [capacity]="capacityPreview()" /></div>
          }
          @case (5) {
            @if (form.value.isFree) {
              <p class="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                Evento gratuito: la inscripción sigue siendo obligatoria para controlar el aforo.
              </p>
            } @else {
              <app-event-rate-matrix [rates]="rates()" (ratesChange)="rates.set($event)" />
            }
            <div class="p-4 border border-slate-200 rounded-xl space-y-3">
              <h4 class="text-sm font-bold text-slate-700">Reglas de tarifa</h4>
              <label class="flex items-center gap-2 text-sm">
                <input type="checkbox" formControlName="applyDebtPenalty" />
                Aplicar tarifa de No Socio cuando el socio tenga deuda
              </label>
              <div class="max-w-xs">
                <label class="block text-xs font-semibold text-slate-500 mb-1">Máx. invitados por socio</label>
                <input type="number" formControlName="maxGuestsPerMember" class="input-modern !py-2 !text-sm" min="0" />
              </div>
            </div>
            @if (!form.value.isFree) {
              <div class="p-4 bg-slate-50 rounded-lg space-y-3">
                <h4 class="text-sm font-bold text-slate-700">Simular tarifa</h4>
                <div class="flex flex-wrap items-end gap-3">
                  <select class="input-modern !py-2 !text-sm w-44" [value]="simType()" (change)="onSimTypeChange($event)">
                    <option [value]="ParticipantType.MEMBER_HOLDER">Socio titular</option>
                    <option [value]="ParticipantType.MEMBER_GUEST">Invitado</option>
                    <option [value]="ParticipantType.PUBLIC">Público</option>
                  </select>
                  <label class="flex items-center gap-2 text-sm pb-2"><input type="checkbox" [checked]="simDebt()" (change)="simDebt.set($any($event.target).checked)" /> Tiene deuda</label>
                  <button type="button" class="btn-ghost !text-sm" (click)="simulateRate()">Calcular</button>
                  @if (simResult()) {
                    <span class="text-sm font-bold text-brand pb-2">S/ {{ simResult()!.appliedRate.toFixed(2) }}</span>
                  }
                </div>
              </div>
            }
          }
          @case (6) {
            <div class="space-y-6">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <p class="text-sm text-slate-600">
                  Tickets y consumos modulares — movilidad, comidas (1–3), juegos inflables, cartillas bingo, etc.
                </p>
                <button type="button" class="btn-ghost !text-xs" (click)="loadOfferingTemplate()">
                  Cargar plantilla {{ categoryLabels[form.value.category!] }}
                </button>
              </div>
              <app-event-offering-catalog
                [catalog]="offeringCatalog()"
                (catalogChange)="onCatalogChange($event)" />

              <div class="border-t border-slate-200 pt-4">
                <app-event-ticket-generation-config
                  [catalog]="offeringCatalog()"
                  [category]="form.value.category!"
                  [pools]="ticketPools()"
                  [totalCapacity]="form.value.totalCapacity ?? 0"
                  (poolsChange)="ticketPools.set($event)" />
              </div>

              @if (!form.value.isFree) {
                <div class="border-t border-slate-200 pt-4">
                  <h4 class="text-sm font-bold text-slate-700 mb-3">Tarifas del evento</h4>
                  <p class="text-xs text-slate-500 mb-3">Agregue o modifique tarifas por categoría de socio, condición y tipo de participante.</p>
                  <app-event-rate-matrix [rates]="rates()" (ratesChange)="rates.set($event)" />
                </div>
              }

              <div class="border-t border-slate-200 pt-4">
                <h4 class="text-sm font-bold text-slate-700 mb-3">Configuración específica</h4>
                @switch (form.value.category) {
                  @case (EventCategory.GENERAL) { <app-general-event-config /> }
                  @case (EventCategory.MASSIVE) { <app-massive-event-config [environments]="envBookingsPreview()" /> }
                  @case (EventCategory.FUNDRAISING) {
                    <app-fundraising-event-config [series]="bingoSeries()" (seriesChange)="bingoSeries.set($event)" />
                  }
                  @case (EventCategory.CONTEST) {
                    <app-contest-event-config [categories]="contestCategories()" (categoriesChange)="contestCategories.set($event)" />
                  }
                  @case (EventCategory.TRIP) { <app-trip-event-config /> }
                  @case (EventCategory.WORKSHOP) {
                    <app-workshop-event-config [config]="workshopConfig()" (configChange)="workshopConfig.set($event)" />
                  }
                  @case (EventCategory.FOOD) {
                    <p class="text-xs text-slate-500">Los menús y movilidad se configuran en el catálogo superior.</p>
                  }
                }
              </div>
            </div>
          }
          @case (7) {
            <dl class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div><dt class="text-slate-500 text-xs">Nombre</dt><dd class="font-semibold mt-0.5">{{ form.value.name }}</dd></div>
              <div><dt class="text-slate-500 text-xs">Categoría</dt><dd class="font-semibold mt-0.5">{{ categoryLabels[form.value.category!] }}</dd></div>
              <div><dt class="text-slate-500 text-xs">Compañía / UN</dt><dd class="font-semibold mt-0.5">{{ auth.companyName }} · {{ auth.businessUnitName }}</dd></div>
              <div><dt class="text-slate-500 text-xs">Fecha y horario</dt><dd class="font-semibold mt-0.5">{{ form.value.startDate }} {{ form.value.startTime }}–{{ form.value.endTime }}</dd></div>
              <div><dt class="text-slate-500 text-xs">Aforo</dt><dd class="font-semibold mt-0.5">{{ form.value.totalCapacity }} ({{ form.value.reservedCapacity }} reservados)</dd></div>
              <div><dt class="text-slate-500 text-xs">Ambientes</dt><dd class="font-semibold mt-0.5">{{ selectedEnvs().length }} seleccionado(s)</dd></div>
              <div><dt class="text-slate-500 text-xs">Tarifas</dt><dd class="font-semibold mt-0.5">{{ form.value.isFree ? 'Gratuito' : rates().length + ' tarifa(s)' }}</dd></div>
              <div><dt class="text-slate-500 text-xs">Tickets a generar</dt><dd class="font-semibold mt-0.5">{{ totalTicketsToGenerate() }}</dd></div>
              <div class="sm:col-span-2"><dt class="text-slate-500 text-xs">Config. categoría</dt><dd class="font-semibold mt-0.5">{{ categoryConfigSummary() }}</dd></div>
            </dl>
          }
          @case (8) {
            <h3 class="text-base font-bold text-slate-800 mb-3">Validación para publicación</h3>
            <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              @for (item of validationChecks(); track item.label) {
                <li class="flex items-center gap-2 text-sm">
                  <span [class]="item.ok ? 'text-green-600' : 'text-red-600'">{{ item.ok ? '✓' : '✗' }}</span>
                  {{ item.label }}
                </li>
              }
            </ul>
            @for (w of validation()?.warnings ?? []; track w.field) {
              <p class="text-sm text-amber-600 mt-2">⚠ {{ w.message }}</p>
            }
          }
        }
        </div>

        <div class="shrink-0 flex flex-wrap items-center gap-3 px-5 lg:px-6 py-4 border-t border-slate-200 bg-slate-50/80">
          @if (currentStep() > 1) { <button type="button" class="btn-ghost !text-sm" (click)="prev()">Anterior</button> }
          <button type="button" class="btn-ghost !text-sm" (click)="saveDraft()">Guardar borrador</button>
          <a routerLink="/eventos/listado" class="btn-ghost !text-sm">Cancelar</a>
          <div class="flex-1"></div>
          @if (currentStep() < 8) {
            <button type="button" class="btn-primary !text-sm" (click)="next()">Siguiente</button>
          } @else {
            <button type="button" class="btn-primary !text-sm" [disabled]="!validation()?.valid" (click)="publish()">Publicar evento</button>
          }
        </div>
      </form>
    </div>
  `,
})
export class EventFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly eventService = inject(EventService);
  private readonly envService = inject(EventEnvironmentService);
  private readonly rateService = inject(EventRateService);
  private readonly offeringService = inject(EventOfferingService);

  protected readonly EventCategory = EventCategory;
  protected readonly ParticipantType = ParticipantType;
  protected readonly auth = MOCK_AUTH_CONTEXT;
  protected readonly allSteps = ALL_STEPS;
  protected readonly stepShortLabels: Record<number, string> = {
    1: 'Info', 2: 'Fechas', 3: 'Ambientes', 4: 'Aforo', 5: 'Tarifas',
    6: 'Categoría', 7: 'Revisión', 8: 'Publicar',
  };
  protected readonly currentStep = signal(1);
  protected readonly categories = Object.values(EventCategory);
  protected readonly categoryLabels = EVENT_CATEGORY_LABELS;
  protected readonly environments = signal<EventEnvironment[]>([]);
  protected readonly selectedEnvs = signal<string[]>([]);
  protected readonly envConflict = signal(false);
  protected readonly rates = signal<EventRate[]>([]);
  protected readonly validation = signal<EventValidationResult | null>(null);
  protected readonly simType = signal<ParticipantType>(ParticipantType.MEMBER_HOLDER);
  protected readonly simDebt = signal(false);
  protected readonly simResult = signal<{ appliedRate: number; explanation: string } | null>(null);

  protected readonly offeringCatalog = signal<EventOfferingCatalog>(getOfferingTemplateForCategory(EventCategory.GENERAL));
  protected readonly ticketPools = signal<EventTicketPool[]>([]);

  protected readonly contestCategories = signal<ContestCategory[]>([]);
  protected readonly bingoSeries = signal<BingoSerie[]>([]);
  protected readonly workshopConfig = signal<WorkshopConfig>({ ...DEFAULT_WORKSHOP });

  protected readonly form = this.fb.group({
    code: ['EVT-' + Date.now().toString().slice(-6)],
    name: ['', Validators.required],
    description: [''],
    typeId: ['et-1'],
    category: [EventCategory.GENERAL],
    imageUrl: [''],
    isPublic: [true],
    membersOnly: [false],
    allowGuests: [true],
    requiresRegistration: [true],
    isFree: [false],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    startTime: ['18:00'],
    endTime: ['22:00'],
    registrationStartDate: [''],
    registrationEndDate: [''],
    totalCapacity: [100, [Validators.required, Validators.min(1)]],
    reservedCapacity: [0],
    applyDebtPenalty: [true],
    maxGuestsPerMember: [3],
  }, { validators: dateRangeValidator });

  protected readonly capacityPreview = computed(() => ({
    totalCapacity: this.form.value.totalCapacity ?? 0,
    reservedCapacity: this.form.value.reservedCapacity ?? 0,
    confirmedCapacity: 0,
  }));

  protected readonly validationChecks = computed(() => [
    { label: 'Información general completa', ok: !!this.form.value.name },
    { label: 'Fecha y horario configurados', ok: !!this.form.value.startDate && !!this.form.value.endDate && !this.form.errors?.['dateRange'] && !this.form.errors?.['timeRange'] },
    { label: 'Ambiente disponible', ok: this.selectedEnvs().length > 0 && !this.envConflict() },
    { label: 'Aforo configurado', ok: (this.form.value.totalCapacity ?? 0) > 0 },
    { label: 'Tarifas configuradas', ok: !!this.form.value.isFree || this.rates().length > 0 },
    { label: 'Tickets a generar definidos', ok: !this.hasTicketOptions() || this.totalTicketsToGenerate() > 0 },
  ]);

  protected readonly hasTicketOptions = computed(() =>
    this.offeringCatalog().options.some(o => o.generatesTicket && o.status === 'active'),
  );

  protected readonly totalTicketsToGenerate = computed(() =>
    this.ticketPools().filter(p => p.enabled).reduce((n, p) => n + p.quantityToGenerate, 0),
  );

  constructor() {
    this.envService.getEnvironments().subscribe(envs => this.environments.set(envs));
    this.initDefaultRates();
    this.syncTicketPools();
  }

  protected loadOfferingTemplate(): void {
    const cat = this.form.value.category as EventCategory;
    this.offeringService.getTemplate(cat).subscribe(t => {
      this.offeringCatalog.set(t);
      this.syncTicketPools();
    });
  }

  protected onCatalogChange(catalog: EventOfferingCatalog): void {
    this.offeringCatalog.set(catalog);
    this.syncTicketPools();
  }

  protected syncTicketPools(): void {
    this.ticketPools.set(syncTicketPoolsFromCatalog(
      this.offeringCatalog(),
      this.ticketPools(),
      this.form.value.category as EventCategory,
      this.form.value.totalCapacity ?? 0,
    ));
  }

  protected onEnterCategoryStep(): void {
    if (this.offeringCatalog().options.length === 0) {
      this.loadOfferingTemplate();
    } else if (this.ticketPools().length === 0) {
      this.syncTicketPools();
    }
  }

  protected stepClass(stepId: number): string {
    const cur = this.currentStep();
    if (cur === stepId) return 'bg-brand text-white';
    if (cur > stepId) return 'bg-green-100 text-green-700';
    return 'bg-slate-100 text-slate-500';
  }

  protected formatDateSummary(): string {
    const s = this.form.value.startDate;
    const e = this.form.value.endDate;
    if (!s) return '—';
    if (s === e) return this.formatDate(s);
    return `${this.formatDate(s)} - ${this.formatDate(e!)}`;
  }

  private formatDate(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  protected envBookingsPreview(): EventEnvironmentBooking[] {
    return this.buildEnvBookings();
  }

  protected categoryConfigSummary(): string {
    const cat = this.form.value.category;
    const catalog = this.offeringCatalog();
    const tickets = this.totalTicketsToGenerate();
    const base = `${catalog.groups.length} grupo(s), ${catalog.options.length} opción(es), ${tickets} ticket(s) a generar`;
    switch (cat) {
      case EventCategory.CONTEST: return `${base} · ${this.contestCategories().length} categoría(s) concurso`;
      case EventCategory.FUNDRAISING: return `${base} · ${this.bingoSeries().length} serie(s) bingo`;
      case EventCategory.WORKSHOP: return `${base} · ${this.workshopConfig().name || 'Taller'}`;
      case EventCategory.MASSIVE: return `${base} · ${this.selectedEnvs().length} ambiente(s)`;
      case EventCategory.TRIP: return `${base} · entradas personales`;
      default: return base;
    }
  }

  protected onSimTypeChange(ev: globalThis.Event): void {
    this.simType.set((ev.target as HTMLSelectElement).value as ParticipantType);
  }

  private initDefaultRates(): void {
    this.rates.set([
      { id: crypto.randomUUID(), memberCategory: 'Socio', condition: 'Habilitado', participantType: ParticipantType.MEMBER_HOLDER, price: 50, currency: 'PEN', validFrom: '2026-01-01', validTo: '2026-12-31', status: 'active' },
      { id: crypto.randomUUID(), memberCategory: 'Socio', condition: 'Habilitado', participantType: ParticipantType.MEMBER_GUEST, price: 70, currency: 'PEN', validFrom: '2026-01-01', validTo: '2026-12-31', status: 'active' },
      { id: crypto.randomUUID(), memberCategory: 'No socio', condition: 'General', participantType: ParticipantType.PUBLIC, price: 100, currency: 'PEN', validFrom: '2026-01-01', validTo: '2026-12-31', status: 'active' },
    ]);
  }

  protected goToStep(step: number): void {
    if (step <= this.currentStep()) {
      this.currentStep.set(step);
      if (step === 6) this.onEnterCategoryStep();
    }
  }

  protected prev(): void { this.currentStep.update(s => Math.max(1, s - 1)); }

  protected async next(): Promise<void> {
    if (!this.validateCurrentStep()) return;
    if (this.currentStep() === 3) {
      await this.checkEnvAvailability();
      if (this.envConflict()) return;
    }
    if (this.currentStep() === 7) this.runValidation();
    this.currentStep.update(s => {
      const next = Math.min(8, s + 1);
      if (next === 6) this.onEnterCategoryStep();
      return next;
    });
    if (this.currentStep() === 8) this.runValidation();
  }

  private validateCurrentStep(): boolean {
    const step = this.currentStep();
    if (step === 1 && this.form.get('name')?.invalid) {
      this.form.get('name')?.markAsTouched();
      return false;
    }
    if (step === 2 && (this.form.get('startDate')?.invalid || this.form.get('endDate')?.invalid || this.form.errors)) {
      return false;
    }
    if (step === 3 && this.selectedEnvs().length === 0) return false;
    if (step === 4 && (this.form.value.totalCapacity ?? 0) <= 0) return false;
    if (step === 5 && !this.form.value.isFree && this.rates().length === 0) return false;
    return true;
  }

  protected toggleEnv(env: EventEnvironment): void {
    if (env.status !== 'available') return;
    this.selectedEnvs.update(list =>
      list.includes(env.id) ? list.filter(id => id !== env.id) : [...list, env.id]
    );
  }

  private async checkEnvAvailability(): Promise<void> {
    const v = this.form.value;
    let conflict = false;
    for (const envId of this.selectedEnvs()) {
      const available = await new Promise<boolean>(resolve => {
        this.envService.checkAvailability(envId, v.startDate!, v.startTime!, v.endDate!, v.endTime!)
          .subscribe(ok => resolve(ok));
      });
      if (!available) conflict = true;
    }
    this.envConflict.set(conflict);
  }

  protected simulateRate(): void {
    this.rateService.calculateRate('temp', 'person-1', this.simType(), this.simDebt()).subscribe(r => {
      this.simResult.set({ appliedRate: r.appliedRate, explanation: r.explanation });
    });
  }

  private runValidation(): void {
    const checks = this.validationChecks();
    this.validation.set({
      valid: checks.every(c => c.ok),
      errors: checks.filter(c => !c.ok).map(c => ({ field: c.label, message: c.label, severity: 'error' as const })),
      warnings: !this.form.value.imageUrl ? [{ field: 'imageUrl', message: 'No se configuró imagen del evento', severity: 'warning' as const }] : [],
    });
  }

  protected saveDraft(): void { this.createEvent(EventStatus.DRAFT); }

  protected async publish(): Promise<void> {
    const ok = await confirmDialog({ title: 'Publicar evento', text: '¿Confirma la publicación?', confirmText: 'Publicar' });
    if (ok) this.createEvent(EventStatus.PUBLISHED);
  }

  private buildEnvBookings(): EventEnvironmentBooking[] {
    const v = this.form.value;
    return this.selectedEnvs().map(id => {
      const env = this.environments().find(e => e.id === id)!;
      return {
        environmentId: id, environmentName: env.name, venueName: env.venueName,
        startDate: v.startDate!, startTime: v.startTime!, endDate: v.endDate!, endTime: v.endTime!,
        capacity: env.capacity,
      };
    });
  }

  private buildCategoryConfig(): EventCategoryConfig {
    const cat = this.form.value.category as EventCategory;
    const base: EventCategoryConfig = {
      offeringCatalog: this.offeringCatalog(),
      ticketGeneration: { pools: this.ticketPools() },
    };
    switch (cat) {
      case EventCategory.CONTEST: return { ...base, contestCategories: this.contestCategories() };
      case EventCategory.FUNDRAISING: return { ...base, bingoSeries: this.bingoSeries() };
      case EventCategory.WORKSHOP: return { ...base, workshop: this.workshopConfig() };
      case EventCategory.MASSIVE: return { ...base, massiveEnvironments: this.buildEnvBookings() };
      default: return base;
    }
  }

  private createEvent(status: EventStatus): void {
    const v = this.form.getRawValue();
    const type = this.eventService.eventTypes.find(t => t.id === v.typeId);
    const envBookings = this.buildEnvBookings();

    this.eventService.createEvent({
      code: v.code!, name: v.name!, description: v.description ?? '',
      companyId: this.auth.companyId, companyName: this.auth.companyName,
      businessUnitId: this.auth.businessUnitId, businessUnitName: this.auth.businessUnitName,
      typeId: v.typeId!, typeName: type?.name ?? '', category: v.category as EventCategory,
      imageUrl: v.imageUrl || undefined,
      isPublic: v.isPublic ?? false, membersOnly: v.membersOnly ?? false, allowGuests: v.allowGuests ?? false,
      requiresRegistration: v.requiresRegistration ?? true, isFree: v.isFree ?? false, status,
      startDate: v.startDate!, endDate: v.endDate!, startTime: v.startTime!, endTime: v.endTime!,
      registrationStartDate: v.registrationStartDate ?? '', registrationEndDate: v.registrationEndDate ?? '',
      venueName: envBookings[0]?.environmentName ?? '', environments: envBookings,
      capacity: { totalCapacity: v.totalCapacity!, reservedCapacity: v.reservedCapacity ?? 0, confirmedCapacity: 0 },
      rates: v.isFree ? [] : this.rates(),
      rateRules: {
        applyDebtPenalty: v.applyDebtPenalty ?? true,
        allowGuests: v.allowGuests ?? false,
        maxGuestsPerMember: v.maxGuestsPerMember ?? 0,
      },
      categoryConfig: this.buildCategoryConfig(),
      personalTicketRequired: v.category === EventCategory.TRIP,
    }).subscribe(evt => this.router.navigate(['/eventos', evt.id]));
  }
}
