import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EnrollmentService } from '../../services/enrollment.service';
import { EnrollmentStatusBadgeComponent } from '../../components/enrollment-status-badge/enrollment-status-badge';
import { EnrollmentListItem } from '../../models/enrollment.model';
import { STUDENT_TYPE_LABELS } from '../../models/enrollment.model';

@Component({
  selector: 'app-enrollment-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EnrollmentStatusBadgeComponent],
  template: `
    <div class="space-y-6">
      <nav class="text-sm text-slate-500" aria-label="Breadcrumb">
        <span class="text-slate-800 font-medium">Matrícula</span>
        <span class="mx-2">/</span>
        <span>Dashboard</span>
      </nav>

      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand via-brand-700 to-brand-900 p-6 text-white shadow-xl">
        <h1 class="text-2xl font-extrabold">Dashboard de Matrícula</h1>
        <p class="text-green-200 text-sm mt-1">Indicadores operativos del proceso de matrícula</p>
        <div class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          @for (stat of kpiStats(); track stat.label) {
            <div class="rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 text-center">
              <p class="text-2xl font-bold">{{ stat.value }}</p>
              <p class="text-xs text-green-200 mt-0.5">{{ stat.label }}</p>
            </div>
          }
        </div>
      </div>

      @if (alerts().length) {
        <section class="section-card p-4">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">Alertas</h2>
          <div class="space-y-2">
            @for (a of alerts(); track a.id) {
              <div class="flex items-center justify-between gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p class="text-sm text-amber-900">{{ a.message }}</p>
                @if (a.actionRoute) {
                  <a [routerLink]="a.actionRoute" class="text-sm font-semibold text-brand shrink-0">{{ a.actionLabel }}</a>
                }
              </div>
            }
          </div>
        </section>
      }

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section class="section-card p-4">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Distribución por curso</h2>
          @for (d of byCourse(); track d.label) {
            <div class="mb-2">
              <div class="flex justify-between text-sm mb-1">
                <span class="truncate">{{ d.label }}</span>
                <span class="font-semibold">{{ d.value }}</span>
              </div>
              <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-brand rounded-full" [style.width.%]="barWidth(d.value, maxCourse())"></div>
              </div>
            </div>
          }
        </section>
        <section class="section-card p-4">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Por tipo de estudiante</h2>
          @for (d of byType(); track d.label) {
            <div class="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
              <span class="text-sm">{{ d.label }}</span>
              <span class="font-bold text-brand">{{ d.value }}</span>
            </div>
          }
        </section>
      </div>

      <section class="section-card overflow-hidden">
        <div class="px-4 py-3 border-b border-slate-200 flex justify-between items-center">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-500">Matrículas recientes</h2>
          <a routerLink="/matricula" class="text-sm text-brand font-semibold hover:underline">Ver todas</a>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 text-left">
                <th class="py-2 px-4 text-xs font-semibold text-slate-500">Código</th>
                <th class="py-2 px-4 text-xs font-semibold text-slate-500">Estudiante</th>
                <th class="py-2 px-4 text-xs font-semibold text-slate-500">Curso</th>
                <th class="py-2 px-4 text-xs font-semibold text-slate-500">Clase</th>
                <th class="py-2 px-4 text-xs font-semibold text-slate-500">Tipo</th>
                <th class="py-2 px-4 text-xs font-semibold text-slate-500">Estado</th>
              </tr>
            </thead>
            <tbody>
              @for (m of recent(); track m.id) {
                <tr class="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                  tabindex="0"
                  role="link"
                  [attr.aria-label]="'Ver matrícula ' + m.code"
                  (click)="openDetail(m.id)"
                  (keydown.enter)="openDetail(m.id)"
                  (keydown.space)="openDetail(m.id); $event.preventDefault()">
                  <td class="py-2 px-4 font-mono text-xs text-brand font-semibold">{{ m.code }}</td>
                  <td class="py-2 px-4">{{ m.studentName }}</td>
                  <td class="py-2 px-4">{{ m.courseName }}</td>
                  <td class="py-2 px-4">{{ m.className }}</td>
                  <td class="py-2 px-4">{{ typeLabel(m.studentType) }}</td>
                  <td class="py-2 px-4"><app-enrollment-status-badge [status]="m.status" /></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <div class="flex gap-3">
        <a routerLink="/matricula/nueva" class="btn-primary">Nueva matrícula</a>
        <a routerLink="/matricula/dashboard-visual" class="btn-ghost">Dashboard visual (cursos)</a>
      </div>
    </div>
  `,
})
export class EnrollmentDashboardComponent implements OnInit {
  private readonly service = inject(EnrollmentService);
  private readonly router = inject(Router);

  protected readonly recent = signal<EnrollmentListItem[]>([]);
  protected readonly alerts = signal(this.service.getAlerts());
  protected readonly byCourse = signal(this.service.getDistributionByCourse());
  protected readonly byType = signal(this.service.getDistributionByType());

  protected kpiStats = () => {
    const s = this.service.dashboardStats();
    return [
      { label: 'Matrículas del día', value: s.todayCount },
      { label: 'Matrículas del mes', value: s.monthCount },
      { label: 'Estudiantes nuevos', value: s.newStudents },
      { label: 'Estudiantes regulares', value: s.regularStudents },
      { label: 'Pendientes de pago', value: s.pendingPayment },
      { label: 'Confirmadas', value: s.confirmed },
      { label: 'Con convenio', value: s.withAgreement },
      { label: 'Anuladas', value: s.cancelled },
    ];
  };

  ngOnInit(): void {
    this.service.getRecent(8).subscribe(list => this.recent.set(list));
  }

  protected maxCourse(): number {
    return Math.max(...this.byCourse().map(d => d.value), 1);
  }

  protected barWidth(value: number, max: number): number {
    return (value / max) * 100;
  }

  protected typeLabel(t: EnrollmentListItem['studentType']): string {
    return STUDENT_TYPE_LABELS[t];
  }

  protected openDetail(id: number): void {
    this.router.navigate(['/matricula', id]);
  }
}
