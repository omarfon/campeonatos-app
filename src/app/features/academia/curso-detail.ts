import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AcademiaService } from '../../core/services/academia.service';
import {
  Curso, CategoriaEdad, NivelHabilidad, Clase, Programa,
  TIPO_NOMENCLATURA_LABELS, ESTADO_CURSO_LABELS, ESTADO_CLASE_LABELS, DIA_SEMANA_LABELS,
  TIPO_HORARIO_CLASE_LABELS, TIPO_DURACION_CLASE_LABELS,
} from '../../core/models/academia.model';

@Component({
  selector: 'app-curso-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (curso(); as c) {
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <a routerLink="/academia/cursos" class="text-indigo-600 hover:text-indigo-800 text-sm">&larr; Volver al árbol</a>
            <div class="flex items-center gap-3 mt-1">
              <h2 class="text-2xl font-bold text-slate-900">{{ c.nombre }}</h2>
              <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                [class]="c.estado === 'activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'">
                {{ estadoCursoLabel(c.estado) }}
              </span>
            </div>
            <p class="text-slate-500 mt-1">{{ breadcrumb() }}</p>
          </div>
          <div class="flex gap-2">
            <a [routerLink]="['/', { outlets: { primary: ['academia', 'cursos', c.id], panel: ['academia', 'matriculas', 'nueva'] } }]" [queryParams]="{ cursoId: c.id }"
              class="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
              📝 Nueva Matrícula
            </a>
            <a [routerLink]="['/', { outlets: { primary: ['academia', 'cursos', c.id], panel: ['academia', 'clases', 'nueva'] } }]" [queryParams]="{ cursoId: c.id }"
              class="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
              + Nueva Clase Consolidada
            </a>
            <a [routerLink]="['editar']"
              class="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
              Editar Curso
            </a>
          </div>
        </div>

        <!-- Ficha del Curso -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Info principal -->
          <div class="lg:col-span-2 space-y-4">
            <div class="bg-white rounded-xl shadow-sm p-6">
              <div class="flex items-center gap-3 mb-4">
                <span class="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded">{{ c.codigo }}</span>
                @if (c.requiereCertificadoMedico) {
                  <span class="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">🏥 Certificado médico {{ c.edadCertificadoMedico ? '(+' + c.edadCertificadoMedico + ' años)' : '' }}</span>
                }
                @if (c.requiereDeclaracionJurada) {
                  <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">📝 Declaración jurada</span>
                }
              </div>

              <div class="space-y-4">
                <div>
                  <h4 class="text-sm font-semibold text-slate-500 uppercase tracking-wider">Descripción</h4>
                  <p class="text-slate-700 mt-1">{{ c.descripcion }}</p>
                </div>
                <div>
                  <h4 class="text-sm font-semibold text-slate-500 uppercase tracking-wider">Objetivos</h4>
                  <p class="text-slate-700 mt-1">{{ c.objetivos }}</p>
                </div>
                @if (c.publicoObjetivo) {
                  <div>
                    <h4 class="text-sm font-semibold text-slate-500 uppercase tracking-wider">Público Objetivo</h4>
                    <p class="text-slate-700 mt-1">{{ c.publicoObjetivo }}</p>
                  </div>
                }
              </div>
            </div>

            <!-- Categorías por Edad -->
            <div class="bg-white rounded-xl shadow-sm p-6">
              <h3 class="text-lg font-semibold text-slate-900 mb-4">RF-04 · Categorías por Edad</h3>
              @if (categoriasEdad().length > 0) {
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  @for (ce of categoriasEdad(); track ce.id) {
                    <div class="border border-slate-200 rounded-lg p-3">
                      <p class="font-medium text-slate-700">{{ ce.nombre }}</p>
                      <p class="text-sm text-slate-500">{{ ce.edadMinima }} - {{ ce.edadMaxima }} años</p>
                      @if (ce.esUnica) {
                        <span class="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full mt-1 inline-block">Categoría única</span>
                      }
                    </div>
                  }
                </div>
              } @else {
                <p class="text-slate-400 text-sm">No hay categorías de edad configuradas</p>
              }
            </div>

            <!-- Niveles de Habilidad -->
            @if (c.manejaLevels) {
              <div class="bg-white rounded-xl shadow-sm p-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-slate-900">RF-05 · Niveles de Habilidad</h3>
                  <span class="text-xs text-slate-400">{{ nomenclaturaLabel(c.tipoNomenclaturaNivel) }}</span>
                </div>
                @if (niveles().length > 0) {
                  <div class="space-y-2">
                    @for (nivel of niveles(); track nivel.id) {
                      <div class="flex items-center gap-3 border border-slate-200 rounded-lg p-3">
                        <span class="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold">{{ nivel.orden }}</span>
                        <div class="flex-1 min-w-0">
                          <p class="font-medium text-slate-700">{{ nivel.nombre }}</p>
                          @if (nivel.descripcion) {
                            <p class="text-sm text-slate-500">{{ nivel.descripcion }}</p>
                          }
                        </div>
                        @if (nivel.requiereCertificado) {
                          <span class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full shrink-0">Requiere certificación</span>
                        }
                      </div>
                    }
                  </div>
                } @else {
                  <p class="text-slate-400 text-sm">No hay niveles configurados</p>
                }
              </div>
            }

            <div class="bg-white rounded-xl shadow-sm p-6">
              <div class="flex items-center justify-between mb-4 gap-3">
                <div>
                  <h3 class="text-lg font-semibold text-slate-900">RF-08 / RF-09 · Programas Comerciales</h3>
                  <p class="text-sm text-slate-500 mt-1">Programas donde este curso participa como disciplina hija.</p>
                </div>
                <a [routerLink]="['/', { outlets: { primary: ['academia', 'cursos', c.id], panel: ['academia', 'programas', 'nuevo'] } }]" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">+ Nuevo programa</a>
              </div>

              @if (programas().length > 0) {
                <div class="space-y-3">
                  @for (programa of programas(); track programa.id) {
                    <a [routerLink]="['/academia/programas', programa.id]"
                      class="block rounded-lg border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all">
                      <p class="font-medium text-slate-800">{{ programa.nombre }}</p>
                      <p class="text-sm text-slate-500 mt-1">{{ programa.descripcion }}</p>
                    </a>
                  }
                </div>
              } @else {
                <p class="text-slate-400 text-sm">Este curso aún no forma parte de un programa comercial.</p>
              }
            </div>
          </div>

          <!-- Sidebar: resumen rápido -->
          <div class="space-y-4">
            <div class="bg-white rounded-xl shadow-sm p-5">
              <h4 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Resumen</h4>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm text-slate-500">Categorías de edad</span>
                  <span class="text-sm font-semibold">{{ categoriasEdad().length }}</span>
                </div>
                @if (c.manejaLevels) {
                  <div class="flex justify-between">
                    <span class="text-sm text-slate-500">Niveles</span>
                    <span class="text-sm font-semibold">{{ niveles().length }}</span>
                  </div>
                }
                <div class="flex justify-between">
                  <span class="text-sm text-slate-500">Clases activas</span>
                  <span class="text-sm font-semibold">{{ clases().length }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-slate-500">Programas asociados</span>
                  <span class="text-sm font-semibold">{{ programas().length }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-slate-500">Total matriculados</span>
                  <span class="text-sm font-semibold">{{ totalMatriculados() }}</span>
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-5 text-white">
              <p class="text-sm font-medium opacity-90">Nomenclatura de niveles</p>
              <p class="text-lg font-bold mt-1">{{ nomenclaturaLabel(c.tipoNomenclaturaNivel) }}</p>
            </div>
          </div>
        </div>

        <!-- Clases -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-900">Clases</h3>
            <a [routerLink]="['/', { outlets: { primary: ['academia', 'cursos', c.id], panel: ['academia', 'clases', 'nueva'] } }]" [queryParams]="{ cursoId: c.id }"
              class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">+ Nueva Clase Consolidada</a>
          </div>
          @if (clases().length > 0) {
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead>
                  <tr class="bg-slate-50 border-b">
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Categoría Edad</th>
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Nivel</th>
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Docente</th>
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Ambiente</th>
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Modalidad</th>
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Duración</th>
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Bloques</th>
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Vacantes</th>
                    <th class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (clase of clases(); track clase.id) {
                    <tr class="hover:bg-slate-50">
                      <td class="px-4 py-3 font-medium">{{ categoriaEdadNombre(clase.categoriaEdadId) }}</td>
                      <td class="px-4 py-3">{{ clase.nivelId ? nivelNombre(clase.nivelId) : '—' }}</td>
                      <td class="px-4 py-3">{{ docenteNombre(clase.docenteId) }}</td>
                      <td class="px-4 py-3">{{ ambienteNombre(clase.ambienteId) }}</td>
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
            <p class="text-slate-400 text-sm text-center py-6">No hay clases configuradas para este curso</p>
          }
        </div>
      </div>
    } @else {
      <div class="text-center py-12">
        <p class="text-slate-400 text-lg">Curso no encontrado</p>
        <a routerLink="/academia/cursos" class="text-indigo-600 hover:text-indigo-800 mt-2 inline-block">Volver al listado</a>
      </div>
    }
  `,
})
export class CursoDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly svc = inject(AcademiaService);

  protected readonly curso = signal<Curso | undefined>(undefined);

  protected readonly categoriasEdad = computed(() => {
    const c = this.curso();
    return c ? this.svc.getCategoriasEdadByCurso(c.id) : [];
  });

  protected readonly niveles = computed(() => {
    const c = this.curso();
    return c ? this.svc.getNivelesByCurso(c.id) : [];
  });

  protected readonly clases = computed(() => {
    const c = this.curso();
    return c ? this.svc.getClasesByCurso(c.id) : [];
  });

  protected readonly programas = computed<Programa[]>(() => {
    const c = this.curso();
    return c ? this.svc.getProgramasByCurso(c.id) : [];
  });

  protected readonly totalMatriculados = computed(() =>
    this.clases().reduce((sum, cl) => sum + cl.matriculados, 0)
  );

  protected readonly breadcrumb = computed(() => {
    const c = this.curso();
    if (!c) return '';
    const parts: string[] = [];
    const rubro = this.svc.getRubroById(c.rubroId);
    if (rubro) parts.push(rubro.nombre);
    const cat = this.svc.getCategoriaById(c.categoriaId);
    if (cat) parts.push(cat.nombre);
    if (c.subcategoriaId) {
      const sub = this.svc.getSubcategoriaById(c.subcategoriaId);
      if (sub) parts.push(sub.nombre);
    }
    return parts.join(' › ');
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.curso.set(this.svc.getCursoById(id));
    }
  }

  protected estadoCursoLabel(estado: string): string {
    return ESTADO_CURSO_LABELS[estado as keyof typeof ESTADO_CURSO_LABELS] ?? estado;
  }

  protected nomenclaturaLabel(tipo: string): string {
    return TIPO_NOMENCLATURA_LABELS[tipo as keyof typeof TIPO_NOMENCLATURA_LABELS] ?? tipo;
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

  protected ambienteNombre(id: string): string {
    return this.svc.getAmbienteById(id)?.nombre ?? id;
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
