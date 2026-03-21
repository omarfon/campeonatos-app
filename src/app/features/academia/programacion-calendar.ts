import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AcademiaService } from '../../core/services/academia.service';
import { DiaSemana } from '../../core/models/academia.model';

interface EventoCalendario {
  id: string;
  fecha: string;
  tipo: 'clase' | 'bloqueo';
  titulo: string;
  detalle: string;
  categoriaColorKey: string;
  categoriaLabel: string;
  horaInicio?: string;
  horaFin?: string;
}

interface DiaCalendario {
  fecha: string;
  numero: number;
  perteneceMes: boolean;
  eventos: EventoCalendario[];
}

@Component({
  selector: 'app-programacion-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Calendario de Programación</h2>
          <p class="mt-1 text-slate-500">Visualiza sesiones de clases y bloqueos institucionales por mes</p>
        </div>
        <a
          routerLink="/academia/cursos"
          class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          Volver a cursos
        </a>
      </div>

      <div class="grid grid-cols-1 gap-3 rounded-xl bg-white p-4 shadow-sm md:grid-cols-3">
        <label class="text-sm font-medium text-slate-700" for="mes">Mes
          <input
            id="mes"
            type="month"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
            [value]="mesSeleccionado()"
            (change)="onMesChange($event)"
          />
        </label>

        <label class="text-sm font-medium text-slate-700" for="zona">Zona
          <select
            id="zona"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
            [value]="zonaSeleccionada()"
            (change)="onZonaChange($event)"
          >
            <option value="">Todas las zonas</option>
            @for (zona of zonas(); track zona) {
              <option [value]="zona">{{ zona }}</option>
            }
          </select>
        </label>

        <label class="text-sm font-medium text-slate-700" for="ambiente">Ambiente
          <select
            id="ambiente"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
            [value]="ambienteSeleccionadoId()"
            (change)="onAmbienteChange($event)"
          >
            <option value="">Todos los ambientes</option>
            @for (ambiente of ambientesFiltrados(); track ambiente.id) {
              <option [value]="ambiente.id">{{ ambiente.nombre }} ({{ ambiente.zona }})</option>
            }
          </select>
        </label>
      </div>

      <div class="rounded-xl bg-white p-4 shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-900">{{ tituloMes() }}</h3>
          <p class="text-sm text-slate-500">{{ resumenMes() }}</p>
        </div>

        <div class="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
          <span class="text-slate-500">Leyenda:</span>
          @for (categoria of leyendaCategorias(); track categoria.key) {
            <span class="inline-flex items-center gap-2 rounded-full px-2.5 py-1 ring-1" [class]="legendClass(categoria.className)">
              <span class="h-2 w-2 rounded-full" [class]="dotClass(categoria.className)"></span>
              {{ categoria.label }}
            </span>
          }
          <span class="inline-flex items-center gap-2 rounded-full bg-amber-100 px-2.5 py-1 text-amber-800 ring-1 ring-amber-200">
            <span class="h-2 w-2 rounded-full bg-amber-500"></span>
            Bloqueo institucional
          </span>
        </div>

        <div class="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
          @for (dia of diasCabecera; track dia) {
            <div class="rounded-md bg-slate-100 py-2">{{ dia }}</div>
          }
        </div>

        <div class="mt-2 grid grid-cols-7 gap-2" role="grid" aria-label="Calendario mensual de programación">
          @for (dia of diasCalendario(); track dia.fecha) {
            <article
              role="gridcell"
              class="min-h-28 rounded-lg border border-slate-200 p-2"
              [class.bg-slate-50]="!dia.perteneceMes"
              [class.opacity-60]="!dia.perteneceMes"
              [attr.aria-label]="ariaLabelDia(dia)"
            >
              <p class="text-xs font-semibold text-slate-600">{{ dia.numero }}</p>

              <div class="mt-1 space-y-1">
                @for (evento of eventosVisibles(dia); track evento.id) {
                  <p
                    class="truncate rounded-md border-l-4 px-2 py-1 text-[11px] font-semibold shadow-sm"
                    [class]="eventoClass(evento)"
                    [attr.title]="tooltipEvento(evento)"
                  >
                    @if (evento.horaInicio && evento.horaFin) {
                      {{ evento.horaInicio }}-{{ evento.horaFin }} ·
                    }
                    {{ evento.titulo }}
                  </p>
                }

                @if (dia.eventos.length > maxEventosVisibles) {
                  <p class="text-[11px] font-medium text-slate-500">+{{ dia.eventos.length - maxEventosVisibles }} más</p>
                }
              </div>
            </article>
          }
        </div>
      </div>
    </div>
  `,
})
export class ProgramacionCalendarComponent {
  private readonly academiaService = inject(AcademiaService);
  private readonly categoriaPalette = [
    'border-cyan-500 bg-cyan-50 text-cyan-900',
    'border-violet-500 bg-violet-50 text-violet-900',
    'border-emerald-500 bg-emerald-50 text-emerald-900',
    'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-900',
    'border-orange-500 bg-orange-50 text-orange-900',
    'border-sky-500 bg-sky-50 text-sky-900',
    'border-lime-500 bg-lime-50 text-lime-900',
    'border-pink-500 bg-pink-50 text-pink-900',
  ] as const;

  protected readonly diasCabecera = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  protected readonly maxEventosVisibles = 3;

  protected readonly cursos = this.academiaService.cursos;
  protected readonly ambientes = this.academiaService.ambientes;
  protected readonly clases = this.academiaService.clases;
  protected readonly bloqueos = this.academiaService.bloqueosInstitucionales;

  protected readonly mesSeleccionado = signal(this.mesActual());
  protected readonly zonaSeleccionada = signal('');
  protected readonly ambienteSeleccionadoId = signal('');

  protected readonly zonas = computed(() => {
    const lista = this.ambientes().map(item => item.zona);
    return Array.from(new Set(lista)).sort((a, b) => a.localeCompare(b, 'es'));
  });

  protected readonly ambientesFiltrados = computed(() => {
    const zona = this.zonaSeleccionada();
    const lista = this.ambientes();
    if (!zona) return lista;
    return lista.filter(item => item.zona === zona);
  });

  protected readonly tituloMes = computed(() => {
    const [yearText, monthText] = this.mesSeleccionado().split('-');
    const year = Number(yearText);
    const month = Number(monthText);
    if (!Number.isInteger(year) || !Number.isInteger(month)) return '';
    return new Date(year, month - 1, 1).toLocaleDateString('es-PE', {
      month: 'long',
      year: 'numeric',
    });
  });

  private readonly eventosPorFecha = computed(() => {
    const mapa = new Map<string, EventoCalendario[]>();
    const rango = this.rangoMes();
    const ambienteId = this.ambienteSeleccionadoId();
    const zona = this.zonaSeleccionada();

    const ambienteSeleccionado = ambienteId ? this.ambientes().find(item => item.id === ambienteId) : undefined;

    for (const clase of this.clases()) {
      const ambiente = this.ambientes().find(item => item.id === clase.ambienteId);
      if (!ambiente) continue;
      if (ambienteId && ambiente.id !== ambienteId) continue;
      if (!ambienteId && zona && ambiente.zona !== zona) continue;

      const sesiones = this.sesionesClaseEnMes(clase, rango.inicio, rango.fin);
      const curso = this.cursos().find(item => item.id === clase.cursoId);

      for (const sesion of sesiones) {
        const evento: EventoCalendario = {
          id: `clase-${clase.id}-${sesion.fecha}-${sesion.horaInicio}`,
          fecha: sesion.fecha,
          tipo: 'clase',
          titulo: curso?.nombre ?? 'Clase',
          detalle: `${ambiente.nombre} · ${ambiente.zona}`,
          categoriaColorKey: clase.categoriaEdadId,
          categoriaLabel: this.academiaService.getCategoriaEdadById(clase.categoriaEdadId)?.nombre ?? 'Categoría',
          horaInicio: sesion.horaInicio,
          horaFin: sesion.horaFin,
        };
        this.agregarEvento(mapa, evento);
      }
    }

    for (const bloqueo of this.bloqueos()) {
      if (bloqueo.fecha < rango.inicio || bloqueo.fecha > rango.fin) continue;
      if (!this.bloqueoAplicaABusqueda(bloqueo.zona, zona, ambienteSeleccionado?.zona)) continue;

      const evento: EventoCalendario = {
        id: `bloqueo-${bloqueo.id}`,
        fecha: bloqueo.fecha,
        tipo: 'bloqueo',
        titulo: 'Bloqueo institucional',
        detalle: bloqueo.motivo,
        categoriaColorKey: 'bloqueo',
        categoriaLabel: 'Bloqueo institucional',
      };
      this.agregarEvento(mapa, evento);
    }

    for (const [fecha, eventos] of mapa) {
      eventos.sort((a, b) => (a.horaInicio ?? '99:99').localeCompare(b.horaInicio ?? '99:99'));
      mapa.set(fecha, eventos);
    }

    return mapa;
  });

  protected readonly diasCalendario = computed(() => {
    const { inicioGrilla, finGrilla, inicio, fin } = this.rangoMes();
    const dias: DiaCalendario[] = [];
    const cursor = new Date(inicioGrilla);

    while (cursor <= finGrilla) {
      const fecha = this.formatearFecha(cursor);
      dias.push({
        fecha,
        numero: cursor.getDate(),
        perteneceMes: fecha >= inicio && fecha <= fin,
        eventos: this.eventosPorFecha().get(fecha) ?? [],
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    return dias;
  });

  protected readonly resumenMes = computed(() => {
    const dias = this.diasCalendario();
    const totalClases = dias.reduce((acc, dia) => acc + dia.eventos.filter(e => e.tipo === 'clase').length, 0);
    const totalBloqueos = dias.reduce((acc, dia) => acc + dia.eventos.filter(e => e.tipo === 'bloqueo').length, 0);
    return `${totalClases} sesión(es) · ${totalBloqueos} bloqueo(s)`;
  });

  protected readonly leyendaCategorias = computed(() => {
    const categorias = new Map<string, string>();
    for (const dia of this.diasCalendario()) {
      for (const evento of dia.eventos) {
        if (evento.tipo === 'clase') {
          categorias.set(evento.categoriaColorKey, evento.categoriaLabel);
        }
      }
    }

    return Array.from(categorias.entries()).map(([key, label]) => ({
      key,
      label,
      className: this.colorClassByKey(key),
    }));
  });

  constructor() {
    effect(() => {
      const ambientes = this.ambientesFiltrados();
      const ambienteId = this.ambienteSeleccionadoId();
      if (ambienteId && !ambientes.some(item => item.id === ambienteId)) {
        this.ambienteSeleccionadoId.set('');
      }
    });
  }

  protected onMesChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (value) {
      this.mesSeleccionado.set(value);
    }
  }

  protected onZonaChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.zonaSeleccionada.set(value);
    this.ambienteSeleccionadoId.set('');
  }

  protected onAmbienteChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.ambienteSeleccionadoId.set(value);
  }

  protected eventosVisibles(dia: DiaCalendario): EventoCalendario[] {
    return dia.eventos.slice(0, this.maxEventosVisibles);
  }

  protected tooltipEvento(evento: EventoCalendario): string {
    const horario = evento.horaInicio && evento.horaFin ? `${evento.horaInicio} - ${evento.horaFin} · ` : '';
    return `${horario}${evento.titulo}. ${evento.categoriaLabel}. ${evento.detalle}`;
  }

  protected eventoClass(evento: EventoCalendario): string {
    return evento.tipo === 'clase'
      ? this.colorClassByKey(evento.categoriaColorKey)
      : 'border-amber-500 bg-amber-50 text-amber-900';
  }

  protected legendClass(className: string): string {
    return `${className} ring-inset`;
  }

  protected dotClass(className: string): string {
    if (className.includes('cyan')) return 'bg-cyan-500';
    if (className.includes('violet')) return 'bg-violet-500';
    if (className.includes('emerald')) return 'bg-emerald-500';
    if (className.includes('fuchsia')) return 'bg-fuchsia-500';
    if (className.includes('orange')) return 'bg-orange-500';
    if (className.includes('sky')) return 'bg-sky-500';
    if (className.includes('lime')) return 'bg-lime-500';
    return 'bg-pink-500';
  }

  protected ariaLabelDia(dia: DiaCalendario): string {
    const fecha = new Date(`${dia.fecha}T00:00:00`).toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return `${fecha}. ${dia.eventos.length} evento(s).`;
  }

  private sesionesClaseEnMes(
    clase: ReturnType<AcademiaService['clases']>[number],
    inicioMes: string,
    finMes: string
  ): Array<{ fecha: string; horaInicio: string; horaFin: string }> {
    const sesiones: Array<{ fecha: string; horaInicio: string; horaFin: string }> = [];

    let cursor = new Date(`${inicioMes}T00:00:00`);
    const fin = new Date(`${finMes}T00:00:00`);

    while (cursor <= fin) {
      const fecha = this.formatearFecha(cursor);
      if (clase.tipoDuracion === 'finita') {
        if (!clase.fechaInicio || !clase.fechaFin) {
          cursor.setDate(cursor.getDate() + 1);
          continue;
        }
        if (fecha < clase.fechaInicio || fecha > clase.fechaFin) {
          cursor.setDate(cursor.getDate() + 1);
          continue;
        }
      }

      const diaActual = this.dateToDiaSemana(cursor);
      for (const horario of clase.horarios) {
        if (horario.dia === diaActual) {
          sesiones.push({
            fecha,
            horaInicio: horario.horaInicio,
            horaFin: horario.horaFin,
          });
        }
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    return sesiones;
  }

  private bloqueoAplicaABusqueda(bloqueoZona: string | undefined, zonaFiltro: string, zonaAmbienteSeleccionado: string | undefined): boolean {
    if (zonaAmbienteSeleccionado) {
      return !bloqueoZona || bloqueoZona === zonaAmbienteSeleccionado;
    }
    if (zonaFiltro) {
      return !bloqueoZona || bloqueoZona === zonaFiltro;
    }
    return true;
  }

  private agregarEvento(mapa: Map<string, EventoCalendario[]>, evento: EventoCalendario): void {
    const lista = mapa.get(evento.fecha) ?? [];
    lista.push(evento);
    mapa.set(evento.fecha, lista);
  }

  private colorClassByKey(key: string): string {
    let hash = 0;
    for (let index = 0; index < key.length; index += 1) {
      hash = (hash << 5) - hash + key.charCodeAt(index);
      hash |= 0;
    }

    return this.categoriaPalette[Math.abs(hash) % this.categoriaPalette.length] ?? this.categoriaPalette[0];
  }

  private rangoMes(): { inicio: string; fin: string; inicioGrilla: Date; finGrilla: Date } {
    const [yearText, monthText] = this.mesSeleccionado().split('-');
    const year = Number(yearText);
    const month = Number(monthText);

    const inicio = new Date(year, month - 1, 1);
    const fin = new Date(year, month, 0);

    const offset = (inicio.getDay() + 6) % 7;
    const inicioGrilla = new Date(inicio);
    inicioGrilla.setDate(inicio.getDate() - offset);

    const finGrilla = new Date(inicioGrilla);
    finGrilla.setDate(inicioGrilla.getDate() + 41);

    return {
      inicio: this.formatearFecha(inicio),
      fin: this.formatearFecha(fin),
      inicioGrilla,
      finGrilla,
    };
  }

  private dateToDiaSemana(date: Date): DiaSemana {
    const day = date.getDay();
    if (day === 1) return 'lunes';
    if (day === 2) return 'martes';
    if (day === 3) return 'miercoles';
    if (day === 4) return 'jueves';
    if (day === 5) return 'viernes';
    if (day === 6) return 'sabado';
    return 'domingo';
  }

  private formatearFecha(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private mesActual(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${now.getFullYear()}-${month}`;
  }
}
