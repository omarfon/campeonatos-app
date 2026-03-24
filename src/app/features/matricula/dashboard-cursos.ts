import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AcademiaService } from '../../core/services/academia.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-cursos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-slate-900 mb-4">Control de Cursos y Matrículas</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        @for (curso of cursos(); track curso.id) {
          <div class="bg-white rounded-xl shadow-sm p-6 cursor-pointer border hover:border-green-400 transition"
            (click)="seleccionarCurso(curso.id)">
            <h3 class="text-lg font-semibold text-slate-900">{{ curso.nombre }}</h3>
            <p class="text-slate-500 mt-1">Clases: {{ clasesPorCurso(curso.id).length }}</p>
          </div>
        }
      </div>
    </div>
  `
})
export class DashboardCursosComponent {
  private readonly academiaService = inject(AcademiaService);
  private readonly router = inject(Router);

  cursos = computed(() => this.academiaService.cursos().filter(c => c.estado === 'activo'));

  clasesPorCurso = (cursoId: string) => {
    return this.academiaService.clases().filter(clase => clase.cursoId === cursoId);
  };

  seleccionarCurso(id: string) {
    this.router.navigate(
      ['/', { outlets: { primary: ['matricula', 'dashboard'], panel: ['matricula', 'dashboard', id] } }]
    );
  }

  private getMesActual(): string {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  }
}
