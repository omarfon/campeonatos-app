import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event, getAvailableCapacity } from '../../models/event.model';
import { EventStatus, EVENT_STATUS_LABELS } from '../../enums/event-status.enum';
import { EventCategory, EVENT_CATEGORY_LABELS } from '../../enums/event-category.enum';
import { EventStatusBadgeComponent } from '../../components/event-status-badge/event-status-badge';
import { EmptyStateComponent } from '../../components/empty-state/empty-state';
import { confirmDialog } from '../../../../shared/confirm-dialog';

interface EventMenuAction {
  id: string;
  label: string;
  type: 'link' | 'button';
  route?: (string | number)[];
  danger?: boolean;
  success?: boolean;
  action?: () => void;
}

const LIST_GRID_COLS = 'grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_minmax(0,0.8fr)_minmax(0,0.6fr)_minmax(0,0.5fr)_minmax(0,0.5fr)_minmax(0,0.5fr)_minmax(0,2.5rem)]';

@Component({
  selector: 'app-event-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EventStatusBadgeComponent, EmptyStateComponent],
  template: `
    <div class="space-y-6">
      <nav class="text-sm text-slate-500" aria-label="Breadcrumb">
        <a routerLink="/eventos/listado" class="hover:text-brand">Eventos</a>
        <span class="mx-2">/</span>
        <span class="text-slate-800 font-medium">Listado</span>
      </nav>

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">Eventos</h1>
          <p class="text-sm text-slate-500 mt-0.5">Administra el ciclo de vida de los eventos</p>
        </div>
        <a routerLink="/eventos/nuevo" class="btn-primary shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
          Nuevo evento
        </a>
      </div>

      <div class="section-card p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label for="search" class="block text-xs font-semibold text-slate-500 mb-1">Buscar</label>
            <input id="search" class="input-modern !py-1.5 !text-sm" placeholder="Nombre o código..."
              [value]="search()" (input)="search.set($any($event.target).value)" />
          </div>
          <div>
            <label for="filtro-estado" class="block text-xs font-semibold text-slate-500 mb-1">Estado</label>
            <select id="filtro-estado" class="input-modern !py-1.5 !text-sm"
              [value]="filtroEstado()" (change)="filtroEstado.set($any($event.target).value)">
              <option value="">Todos</option>
              @for (s of statusOptions; track s) {
                <option [value]="s">{{ statusLabels[s] }}</option>
              }
            </select>
          </div>
          <div>
            <label for="filtro-categoria" class="block text-xs font-semibold text-slate-500 mb-1">Categoría</label>
            <select id="filtro-categoria" class="input-modern !py-1.5 !text-sm"
              [value]="filtroCategoria()" (change)="filtroCategoria.set($any($event.target).value)">
              <option value="">Todas</option>
              @for (c of categoryOptions; track c) {
                <option [value]="c">{{ categoryLabels[c] }}</option>
              }
            </select>
          </div>
          <div>
            <label for="filtro-tipo" class="block text-xs font-semibold text-slate-500 mb-1">Tipo</label>
            <select id="filtro-tipo" class="input-modern !py-1.5 !text-sm"
              [value]="filtroTipo()" (change)="filtroTipo.set($any($event.target).value)">
              <option value="">Todos</option>
              @for (t of eventService.eventTypes; track t.id) {
                <option [value]="t.id">{{ t.name }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <div class="section-card">
        @if (filtered().length > 0) {
          <div class="hidden lg:grid gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500"
            [class]="listGridCols">
            <span>Código</span><span>Evento</span><span>Tipo</span><span>Categoría</span><span>Fecha</span><span>Aforo</span><span>Cupos</span><span>Estado</span><span class="sr-only">Acciones</span>
          </div>
          <div class="divide-y divide-slate-100">
            @for (evt of paginated(); track evt.id) {
              <div class="grid gap-2 px-4 py-3 hover:bg-slate-50 items-center text-sm relative" [class]="listGridCols">
                <span class="font-mono text-xs text-slate-500">{{ evt.code }}</span>
                <a [routerLink]="['/eventos', evt.id]" class="font-semibold text-brand hover:underline truncate">{{ evt.name }}</a>
                <span class="text-slate-600">{{ evt.typeName }}</span>
                <span class="text-slate-600">{{ categoryLabels[evt.category] }}</span>
                <span class="text-slate-600">{{ evt.startDate }} {{ evt.startTime }}</span>
                <span>{{ evt.capacity.totalCapacity }}</span>
                <span>{{ available(evt) }}</span>
                <app-event-status-badge [status]="evt.status" />
                <div class="relative flex justify-end lg:justify-center">
                  <button type="button"
                    class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/80 hover:text-slate-800 transition-colors"
                    [attr.aria-expanded]="openMenuId() === evt.id"
                    aria-haspopup="menu"
                    [attr.aria-label]="'Acciones para ' + evt.name"
                    (click)="toggleMenu(evt.id, $event)">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <circle cx="12" cy="5" r="1.75"/><circle cx="12" cy="12" r="1.75"/><circle cx="12" cy="19" r="1.75"/>
                    </svg>
                  </button>
                  @if (openMenuId() === evt.id) {
                    <div class="absolute right-0 top-full mt-1 z-30 min-w-[11rem] py-1 bg-white border border-slate-200 rounded-xl shadow-lg"
                      role="menu" (click)="$event.stopPropagation()">
                      @for (item of menuActions(evt); track item.id) {
                        @if (item.type === 'link') {
                          <a [routerLink]="item.route!"
                            class="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors"
                            [class]="item.danger ? 'text-red-600' : item.success ? 'text-green-700' : 'text-slate-700'"
                            role="menuitem"
                            (click)="closeMenu()">
                            {{ item.label }}
                          </a>
                        } @else {
                          <button type="button"
                            class="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors"
                            [class]="item.danger ? 'text-red-600' : item.success ? 'text-green-700' : 'text-slate-700'"
                            role="menuitem"
                            (click)="runMenuAction(item)">
                            {{ item.label }}
                          </button>
                        }
                      }
                    </div>
                  }
                </div>
              </div>
            }
          </div>
          @if (totalPages() > 1) {
            <div class="flex items-center justify-center gap-2 py-4 border-t border-slate-100">
              <button type="button" class="btn-ghost !text-xs" [disabled]="page() <= 1" (click)="page.set(page() - 1)">Anterior</button>
              <span class="text-sm text-slate-500">Página {{ page() }} de {{ totalPages() }}</span>
              <button type="button" class="btn-ghost !text-xs" [disabled]="page() >= totalPages()" (click)="page.set(page() + 1)">Siguiente</button>
            </div>
          }
        } @else {
          <app-empty-state title="No se encontraron eventos" description="Ajusta los filtros o crea un nuevo evento">
            <a routerLink="/eventos/nuevo" class="btn-primary mt-4">Nuevo evento</a>
          </app-empty-state>
        }
      </div>
    </div>
  `,
})
export class EventListComponent implements OnInit {
  protected readonly eventService = inject(EventService);
  protected readonly listGridCols = LIST_GRID_COLS;

  protected readonly events = signal<Event[]>([]);
  protected readonly search = signal('');
  protected readonly filtroEstado = signal('');
  protected readonly filtroCategoria = signal('');
  protected readonly filtroTipo = signal('');
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly openMenuId = signal<string | null>(null);
  protected readonly statusOptions = Object.values(EventStatus);
  protected readonly statusLabels = EVENT_STATUS_LABELS;
  protected readonly categoryOptions = Object.values(EventCategory);
  protected readonly categoryLabels = EVENT_CATEGORY_LABELS;

  protected readonly filtered = computed(() => {
    let list = this.events();
    const q = this.search().toLowerCase();
    if (q) list = list.filter(e => e.name.toLowerCase().includes(q) || e.code.toLowerCase().includes(q));
    if (this.filtroEstado()) list = list.filter(e => e.status === this.filtroEstado());
    if (this.filtroCategoria()) list = list.filter(e => e.category === this.filtroCategoria());
    if (this.filtroTipo()) list = list.filter(e => e.typeId === this.filtroTipo());
    return list;
  });

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));
  protected readonly paginated = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.loadEvents();
  }

  @HostListener('document:click')
  protected closeMenuOnOutsideClick(): void {
    this.openMenuId.set(null);
  }

  @HostListener('document:keydown.escape')
  protected closeMenuOnEscape(): void {
    this.openMenuId.set(null);
  }

  protected toggleMenu(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.openMenuId.update(cur => cur === id ? null : id);
  }

  protected closeMenu(): void {
    this.openMenuId.set(null);
  }

  protected runMenuAction(item: EventMenuAction): void {
    this.closeMenu();
    item.action?.();
  }

  protected menuActions(evt: Event): EventMenuAction[] {
    const items: EventMenuAction[] = [
      { id: 'view', label: 'Ver detalle', type: 'link', route: ['/eventos', evt.id] },
    ];
    if (this.canEdit(evt)) {
      items.push({ id: 'edit', label: 'Editar', type: 'link', route: ['/eventos', evt.id, 'editar'] });
    }
    items.push({ id: 'dup', label: 'Duplicar', type: 'button', action: () => this.duplicar(evt.id) });
    items.push({ id: 'rec', label: 'Ver recaudación', type: 'link', route: ['/eventos/recaudaciones', evt.id] });
    if (this.canPublish(evt)) {
      items.push({ id: 'pub', label: 'Publicar', type: 'button', success: true, action: () => void this.publicar(evt.id) });
    }
    if (this.canFinish(evt)) {
      items.push({ id: 'fin', label: 'Finalizar', type: 'button', action: () => void this.finalizar(evt.id) });
    }
    if (this.canSettle(evt)) {
      items.push({ id: 'liq', label: 'Liquidar', type: 'link', route: ['/eventos', evt.id, 'liquidacion'] });
    }
    if (this.canCancel(evt)) {
      items.push({ id: 'can', label: 'Cancelar evento', type: 'button', danger: true, action: () => void this.cancelar(evt.id) });
    }
    return items;
  }

  private loadEvents(): void {    this.eventService.getEvents().subscribe(list => this.events.set(list));
  }

  protected available(evt: Event): number {
    return getAvailableCapacity(evt.capacity);
  }

  protected canEdit(evt: Event): boolean {
    return ![EventStatus.SETTLED, EventStatus.CANCELLED].includes(evt.status);
  }

  protected canPublish(evt: Event): boolean {
    return [EventStatus.DRAFT, EventStatus.CONFIGURED].includes(evt.status);
  }

  protected canFinish(evt: Event): boolean {
    return [EventStatus.IN_PROGRESS, EventStatus.REGISTRATION_OPEN, EventStatus.PUBLISHED].includes(evt.status);
  }

  protected canSettle(evt: Event): boolean {
    return evt.status === EventStatus.FINISHED;
  }

  protected canCancel(evt: Event): boolean {
    return ![EventStatus.SETTLED, EventStatus.CANCELLED, EventStatus.FINISHED].includes(evt.status);
  }

  protected async publicar(id: string): Promise<void> {
    const ok = await confirmDialog({ title: 'Publicar evento', text: '¿Confirma la publicación del evento?', confirmText: 'Publicar' });
    if (ok) this.eventService.publishEvent(id).subscribe({ next: () => this.loadEvents(), error: (e) => alert(e.message) });
  }

  protected async cancelar(id: string): Promise<void> {
    const ok = await confirmDialog({ title: 'Cancelar evento', text: 'Esta acción cancelará el evento.', confirmText: 'Cancelar evento' });
    if (ok) this.eventService.cancelEvent(id).subscribe(() => this.loadEvents());
  }

  protected async finalizar(id: string): Promise<void> {
    const ok = await confirmDialog({ title: 'Finalizar evento', text: 'El evento pasará a estado Finalizado.', confirmText: 'Finalizar' });
    if (ok) this.eventService.finishEvent(id).subscribe(() => this.loadEvents());
  }

  protected duplicar(id: string): void {
    this.eventService.duplicateEvent(id).subscribe(() => this.loadEvents());
  }
}
