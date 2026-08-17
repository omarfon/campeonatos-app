import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EnrollmentStudentService } from '../../services/enrollment-student.service';
import { EnrollmentAgreementService } from '../../services/enrollment-agreement.service';
import { EnrollmentStudent, STUDENT_TYPE_LABELS, EnrollmentAgreement } from '../../models/enrollment.model';

@Component({
  selector: 'app-enrollment-student-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (student(); as s) {
      <div class="space-y-6">
        <nav class="text-sm text-slate-500">
          <a routerLink="/matricula/estudiantes" class="hover:text-brand">Estudiantes</a>
          <span class="mx-2">/</span>
          <span class="font-medium text-slate-800">{{ s.firstName }} {{ s.lastName }}</span>
        </nav>

        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="font-mono text-sm text-slate-500">{{ s.code }}</p>
            <h1 class="text-2xl font-extrabold">{{ s.firstName }} {{ s.lastName }}</h1>
            <p class="text-sm text-slate-500 mt-1">{{ typeLabel(s) }} · {{ statusLabel(s.status) }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <a [routerLink]="['/', { outlets: { primary: ['matricula', 'estudiantes', s.id], panel: ['matricula', 'estudiantes', s.id, 'editar'] } }]"
              class="btn-ghost !text-sm">Editar</a>
            <a [routerLink]="['/matricula/nueva']" [queryParams]="{ estudiante: s.id }" class="btn-primary !text-sm">Matricular</a>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div class="section-card p-4 space-y-3">
            <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-500">Identificación</h2>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between gap-4"><dt class="text-slate-500">Documento</dt><dd class="font-medium">{{ s.documentType }} {{ s.documentNumber }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-slate-500">Fecha nacimiento</dt><dd>{{ s.birthDate }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-slate-500">Edad</dt><dd>{{ s.age }} años</dd></div>
              @if (s.gender) {
                <div class="flex justify-between gap-4"><dt class="text-slate-500">Género</dt><dd>{{ genderLabel(s.gender) }}</dd></div>
              }
              <div class="flex justify-between gap-4"><dt class="text-slate-500">Condición</dt><dd>{{ s.condition }}</dd></div>
            </dl>
          </div>

          <div class="section-card p-4 space-y-3">
            <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-500">Contacto</h2>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between gap-4"><dt class="text-slate-500">Correo</dt><dd>{{ s.email }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-slate-500">Teléfono</dt><dd>{{ s.phone }}</dd></div>
              <div><dt class="text-slate-500">Dirección</dt><dd class="font-medium mt-0.5">{{ s.address }}</dd></div>
              @if (s.district) {
                <div class="flex justify-between gap-4"><dt class="text-slate-500">Distrito</dt><dd>{{ s.district }}</dd></div>
              }
            </dl>
          </div>

          @if (s.emergencyContactName || s.emergencyContactPhone) {
            <div class="section-card p-4 space-y-3">
              <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-500">Emergencia</h2>
              <dl class="space-y-2 text-sm">
                @if (s.emergencyContactName) {
                  <div class="flex justify-between gap-4"><dt class="text-slate-500">Contacto</dt><dd>{{ s.emergencyContactName }}</dd></div>
                }
                @if (s.emergencyContactPhone) {
                  <div class="flex justify-between gap-4"><dt class="text-slate-500">Teléfono</dt><dd>{{ s.emergencyContactPhone }}</dd></div>
                }
              </dl>
            </div>
          }

          @if (s.isRegularStudent && s.lastCourseName) {
            <div class="section-card p-4 space-y-3">
              <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-500">Historial reciente</h2>
              <dl class="space-y-2 text-sm">
                <div class="flex justify-between gap-4"><dt class="text-slate-500">Último curso</dt><dd>{{ s.lastCourseName }}</dd></div>
                @if (s.lastClassSchedule) {
                  <div class="flex justify-between gap-4"><dt class="text-slate-500">Horario</dt><dd>{{ s.lastClassSchedule }}</dd></div>
                }
                @if (s.lastEnrollmentDate) {
                  <div class="flex justify-between gap-4"><dt class="text-slate-500">Última matrícula</dt><dd>{{ s.lastEnrollmentDate }}</dd></div>
                }
              </dl>
            </div>
          }

          <div class="section-card p-4 space-y-3">
            <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-500">Convenios</h2>
            @if (agreements().length > 0) {
              <ul class="space-y-2 text-sm">
                @for (a of agreements(); track a.id) {
                  <li class="rounded-lg bg-violet-50 border border-violet-200 px-3 py-2">
                    <p class="font-semibold text-violet-900">{{ a.name }}</p>
                    <p class="text-violet-800">{{ a.benefitSummary }} · {{ a.company }}</p>
                  </li>
                }
              </ul>
            } @else {
              <p class="text-sm text-slate-500">Sin convenios registrados.</p>
            }
          </div>

          @if (s.notes) {
            <div class="section-card p-4 lg:col-span-2">
              <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Observaciones</h2>
              <p class="text-sm text-slate-700">{{ s.notes }}</p>
            </div>
          }
        </div>
      </div>
    } @else {
      <p class="text-slate-400 py-12 text-center">Estudiante no encontrado</p>
    }
  `,
})
export class EnrollmentStudentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(EnrollmentStudentService);
  private readonly agreementService = inject(EnrollmentAgreementService);

  protected readonly student = signal<EnrollmentStudent | undefined>(undefined);
  protected readonly agreements = signal<EnrollmentAgreement[]>([]);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.service.getById(id).subscribe(s => {
      this.student.set(s);
      if (s) {
        this.agreementService.getAvailableAgreements(s.id).subscribe(list => this.agreements.set(list));
      }
    });
  }

  protected typeLabel(s: EnrollmentStudent): string {
    return s.isRegularStudent ? STUDENT_TYPE_LABELS.REGULAR : STUDENT_TYPE_LABELS.NEW;
  }

  protected statusLabel(status: EnrollmentStudent['status']): string {
    const labels: Record<EnrollmentStudent['status'], string> = {
      active: 'Activo', inactive: 'Inactivo', blocked: 'Bloqueado',
    };
    return labels[status];
  }

  protected genderLabel(g: NonNullable<EnrollmentStudent['gender']>): string {
    return g === 'M' ? 'Masculino' : g === 'F' ? 'Femenino' : 'Otro';
  }
}
