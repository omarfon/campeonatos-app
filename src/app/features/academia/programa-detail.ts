import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AcademiaService } from '../../core/services/academia.service';
import {
  Programa,
  DIA_SEMANA_LABELS,
  ESTADO_PROGRAMA_LABELS,
  ESTADO_CLASE_LABELS,
  TIPO_HORARIO_CLASE_LABELS,
  TIPO_DURACION_CLASE_LABELS,
} from '../../core/models/academia.model';

@Component({
  selector: 'app-programa-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (programa(); as prog) {
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <a routerLink="/academia/programas" class="text-indigo-600 hover:text-indigo-800 text-sm">&larr; Volver a Programas</a>
            <div class="flex items-center gap-3 mt-1">
              <h2 class="text-2xl font-bold text-slate-900">{{ prog.nombre }}</h2>
              <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                [class]="estadoProgClass(prog.estado)">
                {{ estadoProgLabel(prog.estado) }}
              </span>
            </div>
            <p class="text-slate-500 mt-1">{{ prog.descripcion }}</p>
          </div>
        </div>

        <!-- Info cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl shadow-sm p-4">
            <p class="text-sm text-slate-500">Tipo</p>
            <p class="text-lg font-semibold capitalize">{{ prog.tipo }}</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-4">
            <p class="text-sm text-slate-500">Inicio</p>
            <p class="text-lg font-semibold">{{ prog.fechaInicio }}</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-4">
            <p class="text-sm text-slate-500">Fin</p>
            <p class="text-lg font-semibold">{{ prog.fechaFin }}</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-4">
            <p class="text-sm text-slate-500">Clases incluidas</p>
            <p class="text-lg font-semibold">{{ clasesDelPrograma().length }}</p>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between gap-3 mb-4">
            <h3 class="text-lg font-semibold text-slate-900">Cursos hijos del programa</h3>
            <span class="text-xs rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-700">{{ cursosDelPrograma().length }} curso(s)</span>
          </div>

          @if (cursosDelPrograma().length > 0) {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              @for (curso of cursosDelPrograma(); track curso.id) {
                <a [routerLink]="['/academia/cursos', curso.id]" class="rounded-lg border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all">
                  <p class="font-medium text-slate-800">{{ curso.nombre }}</p>
                  <p class="text-xs font-mono text-slate-400 mt-1">{{ curso.codigo }}</p>
                  <p class="text-sm text-slate-500 mt-2">{{ curso.descripcion }}</p>
                </a>
              }
            </div>
          } @else {
            <p class="text-slate-400 text-sm text-center py-6">No hay cursos asociados a este programa</p>
          }
        </div>

        <!-- Clases del programa -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Clases del Programa</h3>
          @if (clasesDelPrograma().length > 0) {
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead>
                  <tr class="bg-slate-50 border-b">
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Curso</th>
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Cat. Edad</th>
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Nivel</th>
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Docente</th>
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Modalidad</th>
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Duración</th>
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Horario</th>
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Vacantes</th>
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (clase of clasesDelPrograma(); track clase.id) {
                    <tr class="hover:bg-slate-50">
                      <td class="px-4 py-3">
                        <a [routerLink]="['/academia/cursos', clase.cursoId]" class="text-indigo-600 hover:text-indigo-800 font-medium">
                          {{ cursoNombre(clase.cursoId) }}
                        </a>
                      </td>
                      <td class="px-4 py-3">{{ categoriaEdadNombre(clase.categoriaEdadId) }}</td>
                      <td class="px-4 py-3">{{ clase.nivelId ? nivelNombre(clase.nivelId) : '—' }}</td>
                      <td class="px-4 py-3">{{ docenteNombre(clase.docenteId) }}</td>
                      <td class="px-4 py-3 text-xs text-slate-600">
                        <span>{{ tipoHorarioLabel(clase.tipoHorario) }}</span>
                        @if (clase.tipoHorario === 'abierto' && clase.frecuenciaSemanal) {
                          <span class="block text-slate-500">{{ clase.frecuenciaSemanal }} veces/semana</span>
                        }
                      </td>
                      <td class="px-4 py-3 text-xs text-slate-600">
                        <span>{{ tipoDuracionLabel(clase.tipoDuracion) }}</span>
                        @if (clase.tipoDuracion === 'finita' && clase.fechaInicio && clase.fechaFin) {
                          <span class="block text-slate-500">{{ clase.fechaInicio }} a {{ clase.fechaFin }}</span>
                        }
                      </td>
                      <td class="px-4 py-3">
                        @for (h of clase.horarios; track $index) {
                          <span class="block text-xs">{{ diaLabel(h.dia) }} {{ h.horaInicio }}-{{ h.horaFin }}</span>
                        }
                      </td>
                      <td class="px-4 py-3">
                        <span class="font-medium">{{ clase.matriculados }}/{{ clase.vacantes }}</span>
                      </td>
                      <td class="px-4 py-3">
                        <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                          [class]="estadoClaseClass(clase.estado)">
                          {{ estadoClaseLabel(clase.estado) }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <p class="text-slate-400 text-sm text-center py-6">No hay clases asociadas a este programa</p>
          }
        </div>
      </div>
    } @else {
      <div class="text-center py-12">
        <p class="text-slate-400 text-lg">Programa no encontrado</p>
        <a routerLink="/academia/programas" class="text-indigo-600 hover:text-indigo-800 mt-2 inline-block">Volver al listado</a>
      </div>
    }
  `,
})
export class ProgramaDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly svc = inject(AcademiaService);

  protected readonly programa = signal<Programa | undefined>(undefined);

  protected readonly clasesDelPrograma = computed(() => {
    const prog = this.programa();
    return prog ? this.svc.getClasesByPrograma(prog.id) : [];
  });

  protected readonly cursosDelPrograma = computed(() => {
    const prog = this.programa();
    return prog ? this.svc.getCursosByPrograma(prog.id) : [];
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.programa.set(this.svc.getProgramaById(id));
    }
  }

  protected estadoProgLabel(estado: string): string {
    return ESTADO_PROGRAMA_LABELS[estado as keyof typeof ESTADO_PROGRAMA_LABELS] ?? estado;
  }

  protected estadoProgClass(estado: string): string {
    const classes: Record<string, string> = {
      activo: 'bg-emerald-100 text-emerald-700',
      inactivo: 'bg-slate-100 text-slate-500',
      finalizado: 'bg-blue-100 text-blue-600',
    };
    return classes[estado] ?? 'bg-slate-100 text-slate-500';
  }

  protected cursoNombre(id: string): string {
    return this.svc.getCursoById(id)?.nombre ?? id;
  }

  protected categoriaEdadNombre(id: string): string {
    return this.svc.getCategoriaEdadById(id)?.nombre ?? id;
  }

  protected nivelNombre(id: string): string {
    return this.svc.getNivelById(id)?.nombre ?? id;
  }

  protected docenteNombre(id: string): string {
    const d = this.svc.getDocenteById(id);
    return d ? `${d.nombre} ${d.apellido}` : id;
  }

  protected diaLabel(dia: string): string {
    return DIA_SEMANA_LABELS[dia as keyof typeof DIA_SEMANA_LABELS] ?? dia;
  }

  protected estadoClaseLabel(estado: string): string {
    return ESTADO_CLASE_LABELS[estado as keyof typeof ESTADO_CLASE_LABELS] ?? estado;
  }

  protected estadoClaseClass(estado: string): string {
    const classes: Record<string, string> = {
      abierta: 'bg-emerald-100 text-emerald-700',
      cerrada: 'bg-slate-100 text-slate-500',
      llena: 'bg-amber-100 text-amber-700',
    };
    return classes[estado] ?? 'bg-slate-100 text-slate-500';
  }

  protected tipoHorarioLabel(tipo: keyof typeof TIPO_HORARIO_CLASE_LABELS): string {
    return TIPO_HORARIO_CLASE_LABELS[tipo] ?? tipo;
  }

  protected tipoDuracionLabel(tipo: keyof typeof TIPO_DURACION_CLASE_LABELS): string {
    return TIPO_DURACION_CLASE_LABELS[tipo] ?? tipo;
  }
}
