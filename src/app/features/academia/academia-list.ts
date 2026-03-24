import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AcademiaService } from '../../core/services/academia.service';
import { TIPO_RUBRO_LABELS, ESTADO_CURSO_LABELS } from '../../core/models/academia.model';

@Component({
  selector: 'app-academia-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Estructura Académica</h2>
          <p class="text-slate-500 mt-1">Árbol de clasificación de cursos y disciplinas</p>
        </div>
        <div class="flex gap-2">
          <a routerLink="/academia/estructura" class="inline-flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
            🗂️ Estructura
          </a>
          <a routerLink="/academia/ambientes" class="inline-flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
            🏟️ Ambientes
          </a>
          <a routerLink="/academia/calendario" class="inline-flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
            📅 Calendario
          </a>
          <a [routerLink]="['/', { outlets: { primary: ['academia', 'cursos'], panel: ['academia', 'matriculas', 'nueva'] } }]" class="inline-flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
            📝 Matrículas
          </a>
          <a routerLink="/academia/programas" class="inline-flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
            📦 Programas
          </a>
          <a [routerLink]="['/', { outlets: { primary: ['academia', 'cursos'], panel: ['academia', 'cursos', 'nuevo'] } }]" class="inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium">
            <span aria-hidden="true">+</span> Nuevo Curso
          </a>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="bg-white rounded-xl shadow-sm p-4 text-center">
          <p class="text-2xl font-bold text-green-600">{{ rubros().length }}</p>
          <p class="text-xs text-slate-500 mt-1">Rubros</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 text-center">
          <p class="text-2xl font-bold text-green-600">{{ categorias().length }}</p>
          <p class="text-xs text-slate-500 mt-1">Categorías</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 text-center">
          <p class="text-2xl font-bold text-green-600">{{ cursos().length }}</p>
          <p class="text-xs text-slate-500 mt-1">Cursos</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 text-center">
          <p class="text-2xl font-bold text-green-600">{{ clases().length }}</p>
          <p class="text-xs text-slate-500 mt-1">Clases activas</p>
        </div>
      </div>

      <!-- Tree View -->
      @for (rubro of arbol(); track rubro.id) {
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <!-- Rubro Header -->
          <button
            type="button"
            class="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors text-left"
            [attr.aria-expanded]="isRubroOpen(rubro.id)"
            (click)="toggleRubro(rubro.id)"
          >
            <div class="flex items-center gap-3">
              <span class="flex items-center justify-center w-10 h-10 rounded-lg text-lg"
                [class]="rubroIconClass(rubro.tipo)">
                {{ rubroIcon(rubro.tipo) }}
              </span>
              <div>
                <h3 class="text-lg font-semibold text-slate-900">{{ rubro.nombre }}</h3>
                @if (rubro.descripcion) {
                  <p class="text-sm text-slate-500">{{ rubro.descripcion }}</p>
                }
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                {{ contarCursosRubro(rubro) }} curso(s)
              </span>
              <svg class="w-5 h-5 text-slate-400 transition-transform duration-200" [class.rotate-180]="isRubroOpen(rubro.id)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </button>

          @if (isRubroOpen(rubro.id)) {
            <div class="border-t border-slate-100 px-6 py-4 space-y-4">
              @for (cat of rubro.categorias; track cat.id) {
                <div class="border border-slate-200 rounded-lg overflow-hidden">
                  <!-- Categoría Header -->
                  <button
                    type="button"
                    class="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                    [attr.aria-expanded]="isCatOpen(cat.id)"
                    (click)="toggleCat(cat.id)"
                  >
                    <span class="font-medium text-slate-700">{{ cat.nombre }}</span>
                    <div class="flex items-center gap-2">
                      @if (cat.subcategorias.length > 0) {
                        <span class="text-xs text-slate-400">{{ cat.subcategorias.length }} subcategoría(s)</span>
                      }
                      <svg class="w-4 h-4 text-slate-400 transition-transform duration-200" [class.rotate-180]="isCatOpen(cat.id)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>
                  </button>

                  @if (isCatOpen(cat.id)) {
                    <div class="p-4 space-y-4">
                      <!-- Subcategorías -->
                      @for (sub of cat.subcategorias; track sub.id) {
                        <div>
                          <h5 class="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-2">
                            <span class="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                            {{ sub.nombre }}
                          </h5>
                          @if (sub.cursos.length > 0) {
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-4">
                              @for (curso of sub.cursos; track curso.id) {
                                <a [routerLink]="['/academia/cursos', curso.id]"
                                  class="block bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-green-300 transition-all group">
                                  <div class="flex items-start justify-between">
                                    <div class="min-w-0">
                                      <p class="font-semibold text-green-600 group-hover:text-green-800 truncate">{{ curso.nombre }}</p>
                                      <p class="text-xs text-slate-400 font-mono">{{ curso.codigo }}</p>
                                    </div>
                                    <span class="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
                                      [class]="curso.estado === 'activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'">
                                      {{ estadoLabel(curso.estado) }}
                                    </span>
                                  </div>
                                  <p class="text-sm text-slate-500 mt-2 line-clamp-2">{{ curso.descripcion }}</p>
                                  <div class="flex items-center gap-3 mt-3 text-xs text-slate-400">
                                    @if (curso.requiereCertificadoMedico) {
                                      <span class="flex items-center gap-1">🏥 Cert. médico</span>
                                    }
                                    @if (curso.manejaLevels) {
                                      <span class="flex items-center gap-1">📊 Con niveles</span>
                                    }
                                  </div>
                                </a>
                              }
                            </div>
                          } @else {
                            <p class="text-sm text-slate-400 ml-4">Sin cursos en esta subcategoría</p>
                          }
                        </div>
                      }

                      <!-- Cursos directos (sin subcategoría) -->
                      @if (cat.cursosDirectos.length > 0) {
                        @if (cat.subcategorias.length > 0) {
                          <div class="border-t border-slate-100 pt-3">
                            <h5 class="text-sm font-semibold text-slate-500 mb-2">Otros cursos</h5>
                          </div>
                        }
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          @for (curso of cat.cursosDirectos; track curso.id) {
                            <a [routerLink]="['/academia/cursos', curso.id]"
                              class="block bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-green-300 transition-all group">
                              <div class="flex items-start justify-between">
                                <div class="min-w-0">
                                  <p class="font-semibold text-green-600 group-hover:text-green-800 truncate">{{ curso.nombre }}</p>
                                  <p class="text-xs text-slate-400 font-mono">{{ curso.codigo }}</p>
                                </div>
                                <span class="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
                                  [class]="curso.estado === 'activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'">
                                  {{ estadoLabel(curso.estado) }}
                                </span>
                              </div>
                              <p class="text-sm text-slate-500 mt-2 line-clamp-2">{{ curso.descripcion }}</p>
                              <div class="flex items-center gap-3 mt-3 text-xs text-slate-400">
                                @if (curso.requiereCertificadoMedico) {
                                  <span class="flex items-center gap-1">🏥 Cert. médico</span>
                                }
                                @if (curso.manejaLevels) {
                                  <span class="flex items-center gap-1">📊 Con niveles</span>
                                }
                              </div>
                            </a>
                          }
                        </div>
                      }

                      @if (cat.subcategorias.length === 0 && cat.cursosDirectos.length === 0) {
                        <p class="text-sm text-slate-400 text-center py-4">Sin cursos en esta categoría</p>
                      }
                    </div>
                  }
                </div>
              }

              @if (rubro.categorias.length === 0) {
                <p class="text-sm text-slate-400 text-center py-4">Sin categorías en este rubro</p>
              }
            </div>
          }
        </div>
      }

      @if (arbol().length === 0) {
        <div class="text-center py-12 text-slate-400">No hay rubros configurados</div>
      }
    </div>
  `,
})
export class AcademiaListComponent {
  private readonly academiaService = inject(AcademiaService);

  protected readonly arbol = this.academiaService.arbolAcademico;
  protected readonly rubros = this.academiaService.rubros;
  protected readonly categorias = this.academiaService.categorias;
  protected readonly cursos = this.academiaService.cursos;
  protected readonly clases = this.academiaService.clases;

  private readonly openRubros = signal(new Set<string>(['rub-dep']));
  private readonly openCats = signal(new Set<string>());

  protected isRubroOpen(id: string): boolean {
    return this.openRubros().has(id);
  }

  protected isCatOpen(id: string): boolean {
    return this.openCats().has(id);
  }

  protected toggleRubro(id: string): void {
    this.openRubros.update(s => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  protected toggleCat(id: string): void {
    this.openCats.update(s => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  protected readonly estadoLabels = ESTADO_CURSO_LABELS;

  protected estadoLabel(estado: string): string {
    return this.estadoLabels[estado as keyof typeof ESTADO_CURSO_LABELS] ?? estado;
  }

  protected rubroIcon(tipo: string): string {
    const icons: Record<string, string> = { deportivo: '🏅', musica: '🎵', cultural: '🎭', tecnologia: '💻' };
    return icons[tipo] ?? '📁';
  }

  protected rubroIconClass(tipo: string): string {
    const classes: Record<string, string> = {
      deportivo: 'bg-green-100 text-green-600',
      musica: 'bg-purple-100 text-purple-600',
      cultural: 'bg-amber-100 text-amber-600',
      tecnologia: 'bg-emerald-100 text-emerald-600',
    };
    return classes[tipo] ?? 'bg-slate-100 text-slate-600';
  }

  protected contarCursosRubro(rubro: ReturnType<AcademiaService['arbolAcademico']>[number]): number {
    let count = 0;
    for (const cat of rubro.categorias) {
      count += cat.cursosDirectos.length;
      for (const sub of cat.subcategorias) {
        count += sub.cursos.length;
      }
    }
    return count;
  }
}
