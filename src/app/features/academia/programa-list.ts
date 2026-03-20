import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AcademiaService } from '../../core/services/academia.service';
import { ESTADO_PROGRAMA_LABELS } from '../../core/models/academia.model';

@Component({
  selector: 'app-programa-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <a routerLink="/academia/cursos" class="text-indigo-600 hover:text-indigo-800 text-sm">&larr; Volver al árbol</a>
          <h2 class="text-2xl font-bold text-slate-900 mt-1">Programas</h2>
          <p class="text-slate-500 mt-1">Paquetes comerciales que agrupan cursos y clases</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (prog of programas(); track prog.id) {
          <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between">
              <div class="min-w-0">
                <a [routerLink]="[prog.id]" class="text-lg font-semibold text-indigo-600 hover:text-indigo-800">
                  {{ prog.nombre }}
                </a>
                <p class="text-sm text-slate-500 mt-1">{{ prog.descripcion }}</p>
              </div>
              <span class="shrink-0 ml-3 text-xs px-2 py-0.5 rounded-full font-medium"
                [class]="estadoClass(prog.estado)">
                {{ estadoLabel(prog.estado) }}
              </span>
            </div>

            <div class="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div>
                <p class="text-slate-400">Tipo</p>
                <p class="font-medium capitalize">{{ prog.tipo }}</p>
              </div>
              <div>
                <p class="text-slate-400">Fechas</p>
                <p class="font-medium">{{ prog.fechaInicio }} — {{ prog.fechaFin }}</p>
              </div>
              <div>
                <p class="text-slate-400">Clases</p>
                <p class="font-medium">{{ prog.claseIds.length }}</p>
              </div>
            </div>

            <div class="mt-4 pt-4 border-t flex items-center justify-end">
              <a [routerLink]="[prog.id]" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                Ver detalle →
              </a>
            </div>
          </div>
        } @empty {
          <div class="col-span-full text-center py-12 text-slate-400">
            No hay programas configurados
          </div>
        }
      </div>
    </div>
  `,
})
export class ProgramaListComponent {
  private readonly svc = inject(AcademiaService);
  protected readonly programas = this.svc.programas;

  protected estadoLabel(estado: string): string {
    return ESTADO_PROGRAMA_LABELS[estado as keyof typeof ESTADO_PROGRAMA_LABELS] ?? estado;
  }

  protected estadoClass(estado: string): string {
    const classes: Record<string, string> = {
      activo: 'bg-emerald-100 text-emerald-700',
      inactivo: 'bg-slate-100 text-slate-500',
      finalizado: 'bg-blue-100 text-blue-600',
    };
    return classes[estado] ?? 'bg-slate-100 text-slate-500';
  }
}
