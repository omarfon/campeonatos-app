import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { EventStatusBadgeComponent } from '../../components/event-status-badge/event-status-badge';
import { EVENT_CATEGORY_LABELS, EventCategory } from '../../enums/event-category.enum';

type CalendarView = 'month' | 'week' | 'day';

interface CalendarDay {
  date: string;
  day: number;
  currentMonth: boolean;
  isToday: boolean;
  events: Event[];
  moreCount: number;
}

const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(d: Date): Date {
  const day = (d.getDay() + 6) % 7;
  return addDays(d, -day);
}

function eventOccursOnDate(evt: Event, dateStr: string): boolean {
  return dateStr >= evt.startDate && dateStr <= evt.endDate;
}

function eventOverlapsPeriod(evt: Event, periodStart: string, periodEnd: string): boolean {
  return evt.startDate <= periodEnd && evt.endDate >= periodStart;
}

@Component({
  selector: 'app-events-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EventStatusBadgeComponent],
  template: `
    <div class="space-y-6">
      <nav class="text-sm text-slate-500" aria-label="Breadcrumb">
        <a routerLink="/eventos/listado" class="hover:text-brand">Eventos</a>
        <span class="mx-2">/</span>
        <span class="text-slate-800 font-medium">Calendario</span>
      </nav>

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">Calendario de Eventos</h1>
          <p class="text-sm text-slate-500 mt-0.5">
            @if (hasActiveFilters()) {
              {{ allEvents().length }} de {{ totalEvents() }} eventos
            } @else {
              {{ allEvents().length }} eventos en total
            }
          </p>
        </div>
        <div class="flex gap-2" role="tablist" aria-label="Vista del calendario">
          @for (v of views; track v) {
            <button type="button" role="tab" [attr.aria-selected]="view() === v"
              class="px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
              [class]="view() === v ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'"
              (click)="view.set(v)">
              {{ v === 'month' ? 'Mes' : v === 'week' ? 'Semana' : 'Día' }}
            </button>
          }
        </div>
      </div>

      <div class="section-card p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label for="search-cal" class="block text-xs font-semibold text-slate-500 mb-1">Buscar evento</label>
            <input id="search-cal" type="search" class="input-modern !py-1.5 !text-sm" placeholder="Nombre o código..."
              [value]="search()" (input)="search.set($any($event.target).value)" />
          </div>
          <div>
            <label for="filtro-fecha-cal" class="block text-xs font-semibold text-slate-500 mb-1">Buscar por fecha</label>
            <input id="filtro-fecha-cal" type="date" class="input-modern !py-1.5 !text-sm"
              [value]="filtroFecha()" (change)="onFechaFilterChange($any($event.target).value)" />
          </div>
          <div>
            <label for="filtro-categoria-cal" class="block text-xs font-semibold text-slate-500 mb-1">Categoría</label>
            <select id="filtro-categoria-cal" class="input-modern !py-1.5 !text-sm"
              [value]="filtroCategoria()" (change)="filtroCategoria.set($any($event.target).value)">
              <option value="">Todas las categorías</option>
              @for (c of categories; track c) {
                <option [value]="c">{{ categoryLabels[c] }}</option>
              }
            </select>
          </div>
          <div class="flex items-end">
            @if (hasActiveFilters()) {
              <button type="button" class="btn-ghost !text-sm w-full sm:w-auto" (click)="clearFilters()">
                Limpiar filtros
              </button>
            }
          </div>
        </div>
      </div>

      <div class="section-card p-4 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <button type="button" class="btn-ghost !px-2 !py-1" (click)="shiftPeriod(-1)" aria-label="Periodo anterior">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <h2 class="text-lg font-bold text-slate-800 min-w-[12rem] text-center">{{ periodLabel() }}</h2>
            <button type="button" class="btn-ghost !px-2 !py-1" (click)="shiftPeriod(1)" aria-label="Periodo siguiente">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
          <button type="button" class="btn-ghost !text-sm" (click)="goToday()">Hoy</button>
        </div>

        @if (view() === 'day') {
          <div class="border border-slate-200 rounded-xl p-4 min-h-[12rem]">
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">{{ periodLabel() }}</p>
            @if (periodEvents().length > 0) {
              <div class="space-y-2">
                @for (evt of periodEvents(); track evt.id) {
                  <button type="button"
                    class="w-full text-left flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                    (click)="selected.set(evt)">
                    <span class="text-sm font-mono text-slate-500 shrink-0">{{ evt.startTime }}</span>
                    <span class="font-semibold text-brand truncate flex-1">{{ evt.name }}</span>
                    <app-event-status-badge [status]="evt.status" />
                  </button>
                }
              </div>
            } @else {
              <p class="text-sm text-slate-500">
                @if (hasActiveFilters()) {
                  No hay eventos que coincidan con los filtros en este día.
                } @else {
                  No hay eventos en este día.
                }
              </p>
            }
          </div>
        } @else {
          <div class="grid grid-cols-7 gap-1 mb-2">
            @for (d of weekDays; track d) {
              <div class="text-center text-xs font-semibold text-slate-500 py-1">{{ d }}</div>
            }
          </div>
          <div class="grid grid-cols-7 gap-1">
            @for (day of calendarDays(); track day.date) {
              <div class="min-h-[88px] border rounded-lg p-1 transition-colors"
                [class.border-brand/30]="day.isToday"
                [class.bg-brand/5]="day.isToday"
                [class.border-slate-100]="!day.isToday"
                [class.bg-slate-50]="!day.currentMonth && view() === 'month'">
                <p class="text-xs font-semibold mb-1"
                  [class.text-brand]="day.isToday"
                  [class.text-slate-500]="!day.isToday"
                  [class.text-slate-400]="!day.currentMonth && view() === 'month' && !day.isToday">
                  {{ day.day }}
                </p>
                @for (evt of day.events; track evt.id) {
                  <button type="button"
                    class="w-full text-left text-[10px] px-1 py-0.5 rounded bg-brand/10 text-brand truncate mb-0.5 hover:bg-brand/20"
                    [title]="evt.name + ' · ' + evt.startTime"
                    (click)="selected.set(evt)">
                    {{ evt.startTime }} {{ evt.name }}
                  </button>
                }
                @if (day.moreCount > 0) {
                  <p class="text-[10px] text-slate-400 px-1">+{{ day.moreCount }} más</p>
                }
              </div>
            }
          </div>
        }

        <p class="text-xs text-slate-500">
          {{ periodEvents().length }} evento{{ periodEvents().length === 1 ? '' : 's' }} en este periodo
        </p>
      </div>

      <div class="section-card overflow-hidden">
        <div class="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-500">
            @if (hasActiveFilters()) {
              Eventos filtrados
            } @else {
              Todos los eventos
            }
          </h2>
          @if (filtroFecha()) {
            <span class="text-xs text-slate-500">Fecha: {{ filtroFecha() }}</span>
          }
        </div>
        @if (allEventsSorted().length > 0) {
          <div class="divide-y divide-slate-100">
            @for (evt of allEventsSorted(); track evt.id) {
              <button type="button"
                class="w-full text-left grid grid-cols-1 sm:grid-cols-[minmax(0,6rem)_minmax(0,1fr)_minmax(0,8rem)_auto] gap-2 px-4 py-3 hover:bg-slate-50 items-center text-sm"
                (click)="goToEventDate(evt); selected.set(evt)">
                <span class="font-mono text-xs text-slate-500">{{ evt.startDate }}</span>
                <span class="font-semibold text-slate-800 truncate">{{ evt.name }}</span>
                <span class="text-slate-600 truncate">{{ categoryLabels[evt.category] }}</span>
                <app-event-status-badge [status]="evt.status" />
              </button>
            }
          </div>
        } @else {
          <p class="px-4 py-6 text-sm text-slate-500">
            @if (hasActiveFilters()) {
              No hay eventos que coincidan con los filtros aplicados.
            } @else {
              No hay eventos registrados.
            }
          </p>
        }
      </div>

      @if (selected(); as evt) {
        <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
          role="dialog" aria-modal="true" aria-labelledby="event-dialog-title"
          (click)="selected.set(null)" (keydown.escape)="selected.set(null)">
          <div class="section-card p-6 w-full max-w-md space-y-3" (click)="$event.stopPropagation()">
            <h2 id="event-dialog-title" class="text-lg font-bold">{{ evt.name }}</h2>
            <app-event-status-badge [status]="evt.status" />
            <p class="text-sm text-slate-600">
              {{ evt.startDate }}@if (evt.endDate !== evt.startDate) { — {{ evt.endDate }} }
              · {{ evt.startTime }} - {{ evt.endTime }}
            </p>
            <p class="text-sm">{{ evt.environments[0]?.environmentName ?? evt.venueName }}</p>
            <p class="text-sm">Aforo: {{ evt.capacity.confirmedCapacity }}/{{ evt.capacity.totalCapacity }}</p>
            <div class="flex gap-2">
              <a [routerLink]="['/eventos', evt.id]" class="btn-primary !text-sm flex-1 text-center">Ver detalle</a>
              <button type="button" class="btn-ghost" (click)="selected.set(null)">Cerrar</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class EventsCalendarComponent {
  private readonly eventService = inject(EventService);

  protected readonly selected = signal<Event | null>(null);
  protected readonly view = signal<CalendarView>('month');
  protected readonly displayDate = signal(new Date());
  protected readonly search = signal('');
  protected readonly filtroFecha = signal('');
  protected readonly filtroCategoria = signal('');
  protected readonly views: CalendarView[] = ['month', 'week', 'day'];
  protected readonly weekDays = WEEK_DAYS;
  protected readonly categories = Object.values(EventCategory);
  protected readonly categoryLabels = EVENT_CATEGORY_LABELS;

  protected readonly totalEvents = computed(() => this.eventService.events().length);

  protected readonly allEvents = computed(() => {
    let list = [...this.eventService.events()];
    const q = this.search().trim().toLowerCase();
    if (q) {
      list = list.filter(e =>
        e.name.toLowerCase().includes(q) || e.code.toLowerCase().includes(q),
      );
    }
    const fecha = this.filtroFecha();
    if (fecha) list = list.filter(e => eventOccursOnDate(e, fecha));
    const cat = this.filtroCategoria();
    if (cat) list = list.filter(e => e.category === cat as EventCategory);
    return list;
  });

  protected readonly hasActiveFilters = computed(() =>
    !!this.search().trim() || !!this.filtroFecha() || !!this.filtroCategoria(),
  );

  protected readonly allEventsSorted = computed(() =>
    [...this.allEvents()].sort((a, b) =>
      a.startDate === b.startDate ? a.startTime.localeCompare(b.startTime) : a.startDate.localeCompare(b.startDate),
    ),
  );

  protected readonly periodBounds = computed(() => {
    const d = this.displayDate();
    const view = this.view();

    if (view === 'day') {
      const dateStr = formatLocalDate(d);
      return { start: dateStr, end: dateStr };
    }

    if (view === 'week') {
      const start = startOfWeek(d);
      const end = addDays(start, 6);
      return { start: formatLocalDate(start), end: formatLocalDate(end) };
    }

    const year = d.getFullYear();
    const month = d.getMonth();
    const start = formatLocalDate(new Date(year, month, 1));
    const end = formatLocalDate(new Date(year, month + 1, 0));
    return { start, end };
  });

  protected readonly periodLabel = computed(() => {
    const d = this.displayDate();
    const view = this.view();
    const { start, end } = this.periodBounds();

    if (view === 'day') {
      const parsed = parseLocalDate(start);
      return `${parsed.getDate()} ${MONTH_NAMES[parsed.getMonth()]} ${parsed.getFullYear()}`;
    }

    if (view === 'week') {
      const s = parseLocalDate(start);
      const e = parseLocalDate(end);
      if (s.getMonth() === e.getMonth()) {
        return `${s.getDate()} – ${e.getDate()} ${MONTH_NAMES[s.getMonth()]} ${s.getFullYear()}`;
      }
      return `${s.getDate()} ${MONTH_NAMES[s.getMonth()].slice(0, 3)} – ${e.getDate()} ${MONTH_NAMES[e.getMonth()].slice(0, 3)} ${e.getFullYear()}`;
    }

    return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  });

  protected readonly periodEvents = computed(() => {
    const { start, end } = this.periodBounds();
    return this.allEventsSorted().filter(e => eventOverlapsPeriod(e, start, end));
  });

  protected readonly calendarDays = computed((): CalendarDay[] => {
    const events = this.allEvents();
    const view = this.view();
    const d = this.displayDate();
    const today = formatLocalDate(new Date());

    if (view === 'day') {
      const dateStr = formatLocalDate(d);
      return [{
        date: dateStr,
        day: d.getDate(),
        currentMonth: true,
        isToday: dateStr === today,
        events: events.filter(e => eventOccursOnDate(e, dateStr)),
        moreCount: 0,
      }];
    }

    let gridStart: Date;
    let gridEnd: Date;
    let referenceMonth: number;

    if (view === 'week') {
      gridStart = startOfWeek(d);
      gridEnd = addDays(gridStart, 6);
      referenceMonth = d.getMonth();
    } else {
      const year = d.getFullYear();
      const month = d.getMonth();
      referenceMonth = month;
      const firstDay = new Date(year, month, 1);
      const startOffset = (firstDay.getDay() + 6) % 7;
      gridStart = addDays(firstDay, -startOffset);
      const lastDay = new Date(year, month + 1, 0);
      const endOffset = (7 - ((lastDay.getDay() + 6) % 7 + 1)) % 7;
      gridEnd = addDays(lastDay, endOffset);
    }

    const days: CalendarDay[] = [];
    for (let cursor = new Date(gridStart); cursor <= gridEnd; cursor = addDays(cursor, 1)) {
      const dateStr = formatLocalDate(cursor);
      const matching = events
        .filter(e => eventOccursOnDate(e, dateStr))
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
      days.push({
        date: dateStr,
        day: cursor.getDate(),
        currentMonth: cursor.getMonth() === referenceMonth,
        isToday: dateStr === today,
        events: matching.slice(0, 3),
        moreCount: Math.max(0, matching.length - 3),
      });
    }
    return days;
  });

  protected shiftPeriod(direction: -1 | 1): void {
    this.displayDate.update(d => {
      const next = new Date(d);
      if (this.view() === 'day') {
        next.setDate(next.getDate() + direction);
      } else if (this.view() === 'week') {
        next.setDate(next.getDate() + direction * 7);
      } else {
        next.setMonth(next.getMonth() + direction);
      }
      return next;
    });
  }

  protected goToday(): void {
    this.displayDate.set(new Date());
  }

  protected goToEventDate(evt: Event): void {
    this.displayDate.set(parseLocalDate(evt.startDate));
    this.view.set('day');
  }

  protected onFechaFilterChange(value: string): void {
    this.filtroFecha.set(value);
    if (value) {
      this.displayDate.set(parseLocalDate(value));
      this.view.set('day');
    }
  }

  protected clearFilters(): void {
    this.search.set('');
    this.filtroFecha.set('');
    this.filtroCategoria.set('');
  }
}
