import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EnrollmentClassService } from '../../services/enrollment-class.service';
import { EnrollmentCourseService } from '../../services/enrollment-course.service';
import { EnrollmentClass, AVAILABILITY_LABELS, getAvailabilityLabel } from '../../models/enrollment.model';

@Component({
  selector: 'app-available-classes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-extrabold">Clases disponibles</h1>
      <p class="text-sm text-slate-500">Oferta apta para matrícula (solo clases aprobadas)</p>

      <div class="section-card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select class="input-modern !text-sm" [(ngModel)]="filterCourseId" (ngModelChange)="load()">
          <option [ngValue]="0">Todos los cursos</option>
          @for (c of courses(); track c.id) {
            <option [ngValue]="c.id">{{ c.name }}</option>
          }
        </select>
        <select class="input-modern !text-sm" [(ngModel)]="filterCampus" (ngModelChange)="load()">
          <option value="">Todas las sedes</option>
          @for (s of campuses; track s) { <option [value]="s">{{ s }}</option> }
        </select>
        <select class="input-modern !text-sm" [(ngModel)]="filterModality" (ngModelChange)="load()">
          <option value="">Todas las modalidades</option>
          <option value="Presencial">Presencial</option>
          <option value="Virtual">Virtual</option>
        </select>
      </div>

      <div class="section-card overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b bg-slate-50 text-left">
              <th class="py-2 px-4 text-xs font-semibold text-slate-500">Curso</th>
              <th class="py-2 px-4 text-xs font-semibold text-slate-500">Clase</th>
              <th class="py-2 px-4 text-xs font-semibold text-slate-500">Sede</th>
              <th class="py-2 px-4 text-xs font-semibold text-slate-500">Horario</th>
              <th class="py-2 px-4 text-xs font-semibold text-slate-500 text-right">Capacidad</th>
              <th class="py-2 px-4 text-xs font-semibold text-slate-500 text-right">Matriculados</th>
              <th class="py-2 px-4 text-xs font-semibold text-slate-500 text-right">Disponibles</th>
              <th class="py-2 px-4 text-xs font-semibold text-slate-500">Estado</th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track row.cls.id) {
              <tr class="border-b border-slate-50 hover:bg-slate-50">
                <td class="py-2 px-4">{{ row.courseName }}</td>
                <td class="py-2 px-4 font-medium">{{ row.cls.name }}</td>
                <td class="py-2 px-4">{{ row.cls.campus }}</td>
                <td class="py-2 px-4 text-xs">{{ row.cls.schedule }}</td>
                <td class="py-2 px-4 text-right">{{ row.cls.capacity }}</td>
                <td class="py-2 px-4 text-right">{{ row.cls.enrolled }}</td>
                <td class="py-2 px-4 text-right font-semibold">{{ row.cls.available }}</td>
                <td class="py-2 px-4">
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                    {{ availLabel(row.cls) }}
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class AvailableClassesComponent implements OnInit {
  private readonly classService = inject(EnrollmentClassService);
  private readonly courseService = inject(EnrollmentCourseService);

  protected readonly rows = signal<{ cls: EnrollmentClass; courseName: string }[]>([]);
  protected readonly courses = signal<{ id: number; name: string }[]>([]);
  protected filterCourseId = 0;
  protected filterCampus = '';
  protected filterModality = '';
  protected readonly campuses = ['AELU Principal', 'AELU Sede Norte', 'AELU Virtual'];

  ngOnInit(): void {
    this.courseService.getCourses().subscribe(list =>
      this.courses.set(list.map(c => ({ id: c.id, name: c.name }))),
    );
    this.load();
  }

  protected load(): void {
    this.classService.getAllApproved({
      courseId: this.filterCourseId || undefined,
      campus: this.filterCampus || undefined,
      modality: this.filterModality || undefined,
    }).subscribe(classes => {
      this.courseService.getCourses().subscribe(courses => {
        this.rows.set(classes.map(cls => ({
          cls,
          courseName: courses.find(c => c.id === cls.courseId)?.name ?? '—',
        })));
      });
    });
  }

  protected availLabel(c: EnrollmentClass): string {
    return AVAILABILITY_LABELS[getAvailabilityLabel(c.available, c.capacity)];
  }
}
