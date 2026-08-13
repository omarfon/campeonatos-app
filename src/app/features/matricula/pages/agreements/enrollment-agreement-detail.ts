import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EnrollmentAgreementService } from '../../services/enrollment-agreement.service';
import { EnrollmentCourseService } from '../../services/enrollment-course.service';
import {
  EnrollmentAgreement,
  EnrollmentCourse,
  AGREEMENT_STATUS_LABELS,
} from '../../models/enrollment.model';

@Component({
  selector: 'app-enrollment-agreement-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (agreement(); as a) {
      <div class="space-y-6">
        <nav class="text-sm text-slate-500" aria-label="Miga de pan">
          <a routerLink="/matricula/convenios" class="hover:text-brand">Convenios</a>
          <span class="mx-2" aria-hidden="true">/</span>
          <span class="font-medium text-slate-800">{{ a.name }}</span>
        </nav>

        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-sm text-slate-500">{{ a.company }}</p>
            <h1 class="text-2xl font-extrabold text-slate-900">{{ a.name }}</h1>
            <div class="flex flex-wrap items-center gap-2 mt-2">
              <span class="text-xs font-semibold px-2.5 py-1 rounded-full" [class]="statusClass(a.status)">
                {{ statusLabel(a.status) }}
              </span>
              <span class="text-xs text-slate-500">{{ a.validFrom }} — {{ a.validTo }}</span>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <a routerLink="/matricula/convenios" class="btn-ghost !text-sm">Volver al listado</a>
            <a [routerLink]="['/', { outlets: { primary: ['matricula', 'convenios', a.id], panel: ['matricula', 'convenios', a.id, 'editar'] } }]"
              class="btn-primary !text-sm">Editar</a>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div class="section-card p-4 space-y-3">
            <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-500">Información general</h2>
            <dl class="space-y-2 text-sm">
              <div><dt class="text-slate-500">Descripción</dt><dd class="font-medium mt-0.5">{{ a.description }}</dd></div>
              <div><dt class="text-slate-500">Condiciones</dt><dd class="font-medium mt-0.5">{{ a.conditions }}</dd></div>
              <div class="flex justify-between gap-4">
                <dt class="text-slate-500">Empresa</dt>
                <dd class="font-medium">{{ a.company }}</dd>
              </div>
            </dl>
          </div>

          <div class="section-card p-4 space-y-3">
            <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-500">Beneficio y cobertura</h2>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between gap-4">
                <dt class="text-slate-500">Beneficio</dt>
                <dd class="font-semibold text-brand">{{ a.benefitSummary }}</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-slate-500">Cobertura</dt>
                <dd class="font-medium">{{ a.coveragePercentage }}%</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-slate-500">Vigencia</dt>
                <dd>{{ a.validFrom }} — {{ a.validTo }}</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-slate-500">Estado</dt>
                <dd>{{ statusLabel(a.status) }}</dd>
              </div>
            </dl>
          </div>

          <div class="section-card p-4 space-y-3">
            <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-500">Modalidades permitidas</h2>
            <ul class="space-y-1 text-sm">
              @for (m of a.allowedModalities; track m) {
                <li class="flex items-center gap-2">
                  <span class="text-brand" aria-hidden="true">•</span>{{ m }}
                </li>
              } @empty {
                <li class="text-slate-400">Sin modalidades configuradas</li>
              }
            </ul>
          </div>

          <div class="section-card p-4 space-y-3">
            <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-500">Sedes permitidas</h2>
            <ul class="space-y-1 text-sm">
              @for (c of a.allowedCampuses; track c) {
                <li class="flex items-center gap-2">
                  <span class="text-brand" aria-hidden="true">•</span>{{ c }}
                </li>
              } @empty {
                <li class="text-slate-400">Sin sedes configuradas</li>
              }
            </ul>
          </div>

          <div class="section-card p-4 lg:col-span-2 space-y-3">
            <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Cursos aplicables ({{ courseNames().length }})
            </h2>
            @if (courseNames().length > 0) {
              <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                @for (name of courseNames(); track name) {
                  <li class="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                    <span class="text-brand" aria-hidden="true">•</span>{{ name }}
                  </li>
                }
              </ul>
            } @else {
              <p class="text-sm text-slate-400">Sin cursos configurados</p>
            }
          </div>
        </div>

        <a routerLink="/matricula/reglas" class="inline-block text-sm font-semibold text-brand hover:underline">
          Ver reglas de matrícula →
        </a>
      </div>
    } @else {
      <div class="space-y-4 py-12 text-center">
        <p class="text-slate-400">Convenio no encontrado</p>
        <a routerLink="/matricula/convenios" class="btn-ghost !text-sm inline-block">Volver al listado</a>
      </div>
    }
  `,
})
export class EnrollmentAgreementDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly agreementService = inject(EnrollmentAgreementService);
  private readonly courseService = inject(EnrollmentCourseService);

  protected readonly agreement = signal<EnrollmentAgreement | undefined>(undefined);
  protected readonly courses = signal<EnrollmentCourse[]>([]);

  protected readonly courseNames = computed(() => {
    const a = this.agreement();
    if (!a) return [];
    return a.allowedCourseIds
      .map(id => this.courses().find(c => c.id === id)?.name)
      .filter((n): n is string => !!n);
  });

  ngOnInit(): void {
    this.courseService.getCourses().subscribe(list => this.courses.set(list));
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.agreementService.getById(id).subscribe(a => this.agreement.set(a));
  }

  protected statusLabel(s: EnrollmentAgreement['status']): string {
    return AGREEMENT_STATUS_LABELS[s];
  }

  protected statusClass(s: EnrollmentAgreement['status']): string {
    return s === 'active'
      ? 'bg-green-100 text-green-800'
      : s === 'expired'
        ? 'bg-slate-100 text-slate-600'
        : 'bg-amber-100 text-amber-800';
  }
}
