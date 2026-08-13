import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventRegistrationService, RegistrationFilters } from '../../services/event-registration.service';
import { EventService } from '../../services/event.service';
import { EventOfferingService } from '../../services/event-offering.service';
import { ParticipantType, PARTICIPANT_TYPE_LABELS } from '../../enums/participant-type.enum';
import { RegistrationStatus, REGISTRATION_STATUS_LABELS } from '../../enums/registration-status.enum';
import { Event, EventRegistration } from '../../models/event.model';
import { EventOfferingSelection } from '../../models/event-offering.model';
import { EmptyStateComponent } from '../../components/empty-state/empty-state';
import { EventOfferingSelectorComponent } from '../../components/offering-selector/event-offering-selector';

const PAYMENT_STATUS_LABELS: Record<EventRegistration['paymentStatus'], string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  partial: 'Pago parcial',
  exempt: 'Exento',
};

const LIST_GRID_COLS = 'grid-cols-1 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,0.85fr)_minmax(0,0.5fr)_minmax(0,0.45fr)_minmax(0,0.55fr)_minmax(0,0.55fr)]';

@Component({
  selector: 'app-event-registrations',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, EmptyStateComponent, EventOfferingSelectorComponent],
  template: `
    <div class="space-y-6">
      <nav class="text-sm text-slate-500" aria-label="Breadcrumb">
        <a routerLink="/eventos/listado" class="hover:text-brand">Eventos</a>
        <span class="mx-2">/</span>
        <span class="text-slate-800 font-medium">Inscripciones</span>
      </nav>

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">Inscripciones</h1>
          <p class="text-sm text-slate-500 mt-0.5">Gestión global de inscripciones a eventos</p>
        </div>
        <button type="button" class="btn-primary shrink-0" (click)="openModal()">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
          </svg>
          Nueva inscripción
        </button>
      </div>

      <div class="section-card p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          <div>
            <label for="filter-search" class="block text-xs font-semibold text-slate-500 mb-1">Buscar</label>
            <input id="filter-search" class="input-modern !py-1.5 !text-sm w-full"
              placeholder="Nombre, DNI, código…"
              [ngModel]="search()" (ngModelChange)="onSearchChange($event)" />
          </div>
          <div>
            <label for="filter-event" class="block text-xs font-semibold text-slate-500 mb-1">Evento</label>
            <select id="filter-event" class="input-modern !py-1.5 !text-sm w-full"
              [ngModel]="filterEventId()" (ngModelChange)="setFilterEvent($event)">
              <option value="">Todos</option>
              @for (e of events(); track e.id) {
                <option [value]="e.id">{{ e.name }}</option>
              }
            </select>
          </div>
          <div>
            <label for="filter-payment" class="block text-xs font-semibold text-slate-500 mb-1">Estado de pago</label>
            <select id="filter-payment" class="input-modern !py-1.5 !text-sm w-full"
              [ngModel]="filterPayment()" (ngModelChange)="setFilterPayment($event)">
              <option value="all">Todos</option>
              <option value="paid">Pagado</option>
              <option value="pending">Pendiente</option>
              <option value="partial">Pago parcial</option>
              <option value="exempt">Exento</option>
            </select>
          </div>
          <div>
            <label for="filter-participant" class="block text-xs font-semibold text-slate-500 mb-1">Tipo participante</label>
            <select id="filter-participant" class="input-modern !py-1.5 !text-sm w-full"
              [ngModel]="filterParticipant()" (ngModelChange)="setFilterParticipant($event)">
              <option value="">Todos</option>
              @for (pt of participantTypes; track pt) {
                <option [value]="pt">{{ participantLabels[pt] }}</option>
              }
            </select>
          </div>
          <div>
            <label for="filter-status" class="block text-xs font-semibold text-slate-500 mb-1">Estado inscripción</label>
            <select id="filter-status" class="input-modern !py-1.5 !text-sm w-full"
              [ngModel]="filterStatus()" (ngModelChange)="setFilterStatus($event)">
              <option value="">Todos</option>
              @for (st of registrationStatuses; track st) {
                <option [value]="st">{{ statusLabels[st] }}</option>
              }
            </select>
          </div>
        </div>
        @if (hasActiveFilters()) {
          <div class="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            @for (chip of activeFilterChips(); track chip) {
              <span class="text-xs px-2.5 py-1 rounded-full bg-brand/10 text-brand font-medium">{{ chip }}</span>
            }
            <button type="button" class="btn-ghost !text-xs !py-1 ml-auto" (click)="clearFilters()">Limpiar filtros</button>
          </div>
        }
      </div>

      <div class="section-card overflow-hidden">
        @if (filteredList().length > 0) {
          <div class="hidden lg:grid gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500"
            [class]="listGridCols">
            <span>Código</span>
            <span>Evento</span>
            <span>Participante</span>
            <span>Tipo</span>
            <span>Tarifa</span>
            <span>Extras</span>
            <span>Pago</span>
            <span>Estado</span>
          </div>
          <div class="divide-y divide-slate-100">
            @for (reg of paginated(); track reg.id) {
              <div class="grid gap-2 px-4 py-3 hover:bg-slate-50 items-center text-sm" [class]="listGridCols">
                <span class="font-mono text-xs text-slate-500">{{ reg.code }}</span>
                <span class="font-semibold text-brand truncate" [title]="reg.eventName">{{ reg.eventName }}</span>
                <div class="min-w-0">
                  <p class="font-medium text-slate-800 truncate">{{ reg.personName }}</p>
                  <p class="text-xs text-slate-400">{{ reg.documentNumber }}</p>
                </div>
                <span class="text-slate-600 text-xs">{{ participantLabels[reg.participantType] }}</span>
                <span class="font-semibold text-slate-800">S/ {{ reg.rateAmount.toFixed(2) }}</span>
                <span class="text-xs text-slate-500">
                  @if (reg.consumptions?.length) {
                    {{ reg.consumptions!.length }} opc.
                  } @else { — }
                </span>
                <span class="text-xs px-2 py-0.5 rounded-full font-medium w-fit" [class]="paymentBadgeClass(reg.paymentStatus)">
                  {{ paymentLabels[reg.paymentStatus] }}
                </span>
                <span class="text-xs px-2 py-0.5 rounded-full font-medium w-fit" [class]="statusBadgeClass(reg.status)">
                  {{ statusLabels[reg.status] }}
                </span>
              </div>
            }
          </div>
          <div class="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-slate-100 text-sm text-slate-500">
            <span>{{ filteredList().length }} inscripción(es){{ hasActiveFilters() ? ' filtradas' : '' }}</span>
            @if (totalPages() > 1) {
              <div class="flex items-center gap-2">
                <button type="button" class="btn-ghost !text-xs" [disabled]="page() <= 1" (click)="page.set(page() - 1)">Anterior</button>
                <span>Página {{ page() }} de {{ totalPages() }}</span>
                <button type="button" class="btn-ghost !text-xs" [disabled]="page() >= totalPages()" (click)="page.set(page() + 1)">Siguiente</button>
              </div>
            }
          </div>
        } @else {
          <app-empty-state
            [title]="hasActiveFilters() ? 'No se encontraron inscripciones' : 'Sin inscripciones'"
            [description]="hasActiveFilters() ? 'Ajusta los filtros para ver más resultados' : 'Registra la primera inscripción a un evento'">
            @if (!hasActiveFilters()) {
              <button type="button" class="btn-primary mt-4" (click)="openModal()">Nueva inscripción</button>
            }
          </app-empty-state>
        }
      </div>

      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="reg-modal-title">
          <div class="section-card p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 id="reg-modal-title" class="text-lg font-bold">Nueva inscripción</h2>
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1" for="reg-event">Evento</label>
                <select id="reg-event" class="input-modern !py-1.5 !text-sm w-full" [ngModel]="selectedEventId()" (ngModelChange)="onEventChange($event)">
                  @for (e of events(); track e.id) {
                    <option [value]="e.id">{{ e.name }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1" for="reg-name">Participante</label>
                <input id="reg-name" class="input-modern !py-1.5 !text-sm w-full" placeholder="Nombre completo"
                  [ngModel]="personName()" (ngModelChange)="personName.set($event)" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-1" for="reg-doc">Documento</label>
                <input id="reg-doc" class="input-modern !py-1.5 !text-sm w-full" placeholder="DNI"
                  [ngModel]="documentNumber()" (ngModelChange)="documentNumber.set($event)" />
              </div>
            </div>

            @if (selectedEventCatalog()) {
              <app-event-offering-selector
                [catalog]="selectedEventCatalog()!"
                [selections]="offeringSelections()"
                (selectionsChange)="offeringSelections.set($event)" />
            }

            <div class="rounded-lg bg-slate-50 p-3 text-sm space-y-1">
              <p><strong>Participante:</strong> {{ personName() || '—' }}</p>
              <p><strong>Tarifa base:</strong> S/ {{ rateAmount().toFixed(2) }}</p>
              <p><strong>Adicionales:</strong> S/ {{ extrasTotal().toFixed(2) }}</p>
              <p class="font-bold text-brand"><strong>Total:</strong> S/ {{ grandTotal().toFixed(2) }}</p>
            </div>

            @if (selectionErrors().length) {
              <ul class="text-xs text-red-600">
                @for (e of selectionErrors(); track e) { <li>{{ e }}</li> }
              </ul>
            }

            <div class="flex gap-2 justify-end">
              <button type="button" class="btn-ghost" (click)="showModal.set(false)">Cancelar</button>
              <button type="button" class="btn-primary" [disabled]="!canConfirm()" (click)="confirmRegistration()">Confirmar inscripción</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class EventRegistrationsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly registrationService = inject(EventRegistrationService);
  private readonly eventService = inject(EventService);
  private readonly offeringService = inject(EventOfferingService);

  protected readonly participantTypes = Object.values(ParticipantType);
  protected readonly registrationStatuses = Object.values(RegistrationStatus);
  protected readonly statusLabels = REGISTRATION_STATUS_LABELS;
  protected readonly participantLabels = PARTICIPANT_TYPE_LABELS;
  protected readonly paymentLabels = PAYMENT_STATUS_LABELS;
  protected readonly listGridCols = LIST_GRID_COLS;

  protected readonly filteredList = signal<EventRegistration[]>([]);
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly events = signal<Event[]>([]);
  protected readonly search = signal('');
  protected readonly filterEventId = signal('');
  protected readonly filterPayment = signal<string>('all');
  protected readonly filterParticipant = signal('');
  protected readonly filterStatus = signal('');
  protected readonly showModal = signal(false);
  protected readonly selectedEventId = signal('evt-1');
  protected readonly personName = signal('');
  protected readonly documentNumber = signal('');
  protected readonly offeringSelections = signal<EventOfferingSelection[]>([]);

  private searchDebounce?: ReturnType<typeof setTimeout>;

  protected readonly selectedEvent = computed(() =>
    this.events().find(e => e.id === this.selectedEventId()),
  );

  protected readonly selectedEventCatalog = computed(() =>
    this.selectedEvent()?.categoryConfig.offeringCatalog ?? null,
  );

  protected readonly rateAmount = computed(() => {
    const evt = this.selectedEvent();
    return evt?.rates[0]?.price ?? 50;
  });

  protected readonly extrasTotal = computed(() =>
    this.offeringService.calculateSelectionsTotal(this.offeringSelections()),
  );

  protected readonly grandTotal = computed(() =>
    this.rateAmount() + this.extrasTotal(),
  );

  protected readonly selectionErrors = computed(() => {
    const cat = this.selectedEventCatalog();
    if (!cat) return [];
    return this.offeringService.validateSelections(cat, this.offeringSelections()).errors;
  });

  protected readonly hasActiveFilters = computed(() =>
    !!this.filterEventId() || this.filterPayment() !== 'all' ||
    !!this.filterParticipant() || !!this.filterStatus() || !!this.search(),
  );

  protected readonly activeFilterChips = computed(() => {
    const chips: string[] = [];
    const evt = this.events().find(e => e.id === this.filterEventId());
    if (evt) chips.push(evt.name);
    if (this.filterPayment() !== 'all') {
      chips.push(PAYMENT_STATUS_LABELS[this.filterPayment() as EventRegistration['paymentStatus']] ?? this.filterPayment());
    }
    if (this.filterParticipant()) {
      chips.push(this.participantLabels[this.filterParticipant() as ParticipantType]);
    }
    if (this.filterStatus()) {
      chips.push(this.statusLabels[this.filterStatus() as RegistrationStatus]);
    }
    if (this.search()) chips.push(`"${this.search()}"`);
    return chips;
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredList().length / this.pageSize)),
  );

  protected readonly paginated = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredList().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    const qEvent = this.route.snapshot.queryParamMap.get('evento');
    if (qEvent) this.filterEventId.set(qEvent);

    this.eventService.getEvents().subscribe(list => {
      this.events.set(list);
      if (list.length) this.selectedEventId.set(list[0].id);
    });
    this.load();
  }

  protected setFilterEvent(value: string): void {
    this.filterEventId.set(value);
    this.page.set(1);
    this.load();
  }

  protected setFilterPayment(value: string): void {
    this.filterPayment.set(value);
    this.page.set(1);
    this.load();
  }

  protected setFilterParticipant(value: string): void {
    this.filterParticipant.set(value);
    this.page.set(1);
    this.load();
  }

  protected setFilterStatus(value: string): void {
    this.filterStatus.set(value);
    this.page.set(1);
    this.load();
  }

  protected buildFilters(): RegistrationFilters {
    return {
      eventId: this.filterEventId() || undefined,
      paymentStatus: (this.filterPayment() === 'all' ? undefined : this.filterPayment()) as RegistrationFilters['paymentStatus'],
      participantType: (this.filterParticipant() || undefined) as ParticipantType | undefined,
      status: (this.filterStatus() || undefined) as RegistrationStatus | undefined,
      search: this.search() || undefined,
    };
  }

  protected applyFilters(): void {
    this.page.set(1);
    this.load();
  }

  protected onSearchChange(value: string): void {
    this.search.set(value);
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.page.set(1);
      this.load();
    }, 300);
  }

  protected clearFilters(): void {
    this.filterEventId.set('');
    this.filterPayment.set('all');
    this.filterParticipant.set('');
    this.filterStatus.set('');
    this.search.set('');
    this.page.set(1);
    this.load();
  }

  protected paymentBadgeClass(status: EventRegistration['paymentStatus']): string {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'partial': return 'bg-amber-100 text-amber-700';
      case 'exempt': return 'bg-slate-100 text-slate-600';
      default: return 'bg-red-50 text-red-600';
    }
  }

  protected statusBadgeClass(status: RegistrationStatus): string {
    switch (status) {
      case RegistrationStatus.CONFIRMED: return 'bg-green-100 text-green-700';
      case RegistrationStatus.RESERVED: return 'bg-blue-100 text-blue-700';
      case RegistrationStatus.CANCELLED: return 'bg-red-100 text-red-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  }

  protected openModal(): void {
    this.personName.set('');
    this.documentNumber.set('');
    this.offeringSelections.set([]);
    this.showModal.set(true);
  }

  protected onEventChange(eventId: string): void {
    this.selectedEventId.set(eventId);
    this.offeringSelections.set([]);
  }

  protected canConfirm(): boolean {
    return !!this.personName().trim() && !!this.documentNumber().trim() && this.selectionErrors().length === 0;
  }

  protected load(): void {
    const filters = this.buildFilters();
    this.registrationService.getRegistrations(filters).subscribe(list => {
      this.filteredList.set(list);
      if (this.page() > Math.max(1, Math.ceil(list.length / this.pageSize))) {
        this.page.set(1);
      }
    });
  }

  protected confirmRegistration(): void {
    const consumptions = this.offeringSelections().map(s => ({
      optionId: s.optionId,
      optionName: s.optionName,
      quantity: s.quantity,
      unitPrice: s.unitPrice,
    }));

    this.registrationService.createRegistration({
      eventId: this.selectedEventId(),
      personId: crypto.randomUUID(),
      personName: this.personName(),
      documentNumber: this.documentNumber(),
      participantType: ParticipantType.MEMBER_HOLDER,
      rateName: 'Tarifa estándar',
      rateAmount: this.grandTotal(),
      consumptions,
    }).subscribe(() => {
      this.showModal.set(false);
      this.load();
    });
  }
}
