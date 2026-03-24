import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AcademiaService } from '../../core/services/academia.service';
import { AcademiaMatriculaService } from '../../core/services/academia-matricula.service';

@Component({
  selector: 'app-dashboard-curso-detalle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 w-[420px] max-w-full">
      <h3 class="text-xl font-bold text-slate-900 mb-2">Clases de {{ curso()?.nombre }}</h3>
      <div class="mb-4 flex gap-3 items-center">
        <label for="mes" class="text-sm font-medium text-slate-700">Mes:</label>
        <input id="mes" type="month" [value]="mesSeleccionado()" (change)="onMesChange($event)"
          class="rounded-lg border border-slate-300 px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-500" />
      </div>
      <div class="space-y-3">
        @for (clase of clases(); track clase.id) {
          <div class="border rounded-lg p-4 bg-slate-50 cursor-pointer hover:border-green-400"
            (click)="seleccionarClase(clase.id)">
            <div class="font-semibold text-slate-800">{{ etiquetaClase(clase.id) }}</div>
            <div class="text-xs text-slate-500">Vacantes: {{ clase.vacantes - clase.matriculados }} / {{ clase.vacantes }}</div>
          </div>
        }
      </div>
      @if (claseSeleccionada(); as claseId) {
        <div class="mt-4 border-t pt-4">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-lg font-bold text-slate-900">Alumnos matriculados</h4>
            <button
              class="rounded-lg bg-green-600 text-white px-4 py-1.5 text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              (click)="abrirMatricula(claseId)"
            >+ Matricular</button>
          </div>
          <ul class="divide-y divide-slate-200 text-sm">
            @for (alumno of alumnosMatriculadosClase(claseId); track alumno.id) {
              <li class="py-1 flex justify-between items-center">
                <span>{{ alumno.socioNombre }}</span>
                <span class="text-xs text-slate-500">{{ alumno.fechaRegistro }}</span>
              </li>
            } @empty {
              <li class="py-2 text-slate-500">No hay alumnos matriculados este mes.</li>
            }
          </ul>
          <div class="mt-2 text-xs text-slate-600">Espacios disponibles: <span class="font-bold">{{ vacantesDisponibles() }}</span></div>
        </div>
      }
    </div>
  `
})
export class DashboardCursoDetalleComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly academiaService = inject(AcademiaService);
  private readonly matriculaService = inject(AcademiaMatriculaService);

  protected readonly cursoId = this.route.snapshot.params['id'];
  protected readonly mesSeleccionado = signal(this.getMesActual());
  protected readonly claseSeleccionada = signal<string | null>(null);

  curso = computed(() => this.academiaService.getCursoById(this.cursoId));
  clases = computed(() => this.academiaService.clases().filter(c => c.cursoId === this.cursoId));

  etiquetaClase = (claseId: string) => {
    const clase = this.academiaService.getClaseById(claseId);
    return clase ? `${clase.periodo}` : claseId;
  };

  alumnosMatriculadosClase = (claseId: string) => {
    return this.matriculaService.matriculasDetalladas().filter(m =>
      m.claseId === claseId && m.fechaRegistro.startsWith(this.mesSeleccionado())
    );
  };

  vacantesDisponibles = () => {
    const claseId = this.claseSeleccionada();
    if (!claseId) return '';
    const clase = this.academiaService.getClaseById(claseId);
    if (!clase) return '';
    return clase.vacantes - clase.matriculados;
  };

  onMesChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.mesSeleccionado.set(value);
    this.claseSeleccionada.set(null);
  }

  seleccionarClase(id: string) {
    this.claseSeleccionada.set(id);
  }

  abrirMatricula(claseId: string) {
    this.router.navigate(
      ['/', { outlets: { primary: ['matricula', 'dashboard'], panel: ['matricula', 'nueva'] } }],
      { queryParams: { cursoId: this.cursoId, claseId } }
    );
  }

  private getMesActual(): string {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  }
}
