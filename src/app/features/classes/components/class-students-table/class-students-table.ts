import { Component, ChangeDetectionStrategy, input, signal, computed } from '@angular/core';
import { ClassEnrollmentStudent } from '../../models/class.model';

@Component({
  selector: 'app-class-students-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (students().length === 0) {
      <p class="text-slate-600">Esta clase todavía no tiene alumnos matriculados.</p>
    } @else {
      <div class="mb-4">
        <label for="student-filter" class="sr-only">Buscar alumno</label>
        <input
          id="student-filter"
          type="search"
          class="input-modern !text-sm max-w-xs"
          placeholder="Buscar alumno..."
          [value]="filterText()"
          (input)="filterText.set(($any($event.target)).value)"
        />
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50 text-left">
              <th class="py-2 px-4 text-xs font-semibold text-slate-500">Alumno</th>
              <th class="py-2 px-4 text-xs font-semibold text-slate-500">Tipo</th>
              <th class="py-2 px-4 text-xs font-semibold text-slate-500">Matrícula</th>
              <th class="py-2 px-4 text-xs font-semibold text-slate-500">Estado</th>
            </tr>
          </thead>
          <tbody>
            @for (s of filteredStudents(); track s.id) {
              <tr class="border-b border-slate-50 hover:bg-slate-50">
                <td class="py-2 px-4 font-medium">{{ s.name }}</td>
                <td class="py-2 px-4">{{ s.type }}</td>
                <td class="py-2 px-4">{{ s.enrollmentDate }}</td>
                <td class="py-2 px-4">
                  <span
                    class="text-xs font-semibold px-2 py-0.5 rounded-full"
                    [class.bg-green-100]="s.status === 'Activo'"
                    [class.text-green-800]="s.status === 'Activo'"
                    [class.bg-amber-100]="s.status === 'Lista de espera'"
                    [class.text-amber-800]="s.status === 'Lista de espera'"
                    [class.bg-slate-100]="s.status === 'Retirado'"
                    [class.text-slate-700]="s.status === 'Retirado'"
                  >
                    {{ s.status }}
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class ClassStudentsTableComponent {
  readonly students = input.required<ClassEnrollmentStudent[]>();
  protected readonly filterText = signal('');

  protected readonly filteredStudents = computed(() => {
    const q = this.filterText().trim().toLowerCase();
    if (!q) return this.students();
    return this.students().filter(s => s.name.toLowerCase().includes(q));
  });
}
