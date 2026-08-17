import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StudentEnrollmentService } from '../../services/student-enrollment.service';
import { StudentEnrollment } from '../../models/student-portal.model';
import { EnrollmentStatus, ENROLLMENT_STATUS_LABELS } from '../../../matricula/enums/enrollment-status.enum';

@Component({
  selector: 'app-student-enrollment-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-6">
      <nav class="text-sm text-slate-500">
        <a routerLink="/portal-alumno/matriculas" class="hover:text-brand">Mis matrículas</a>
        <span class="mx-2">/</span>
        <span class="text-slate-800 font-medium">Detalle</span>
      </nav>

      @if (loading()) {
        <div class="sp-card p-8 animate-pulse">
          <div class="h-6 bg-slate-200 rounded w-48 mb-4"></div>
          <div class="h-4 bg-slate-200 rounded w-full"></div>
        </div>
      } @else if (enrollment(); as e) {
        <div class="space-y-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="font-mono text-xs text-slate-500">{{ e.code }}</p>
              <h1 class="text-2xl font-extrabold text-slate-900 mt-1">{{ e.courseName }}</h1>
              <p class="text-sm text-slate-600 mt-1">{{ e.period }}</p>
            </div>
            <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand/10 text-brand">
              {{ statusLabel(e.status) }}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="sp-card p-5 space-y-3">
              <h2 class="text-sm font-bold uppercase tracking-wider text-slate-500">Clase</h2>
              <p class="font-semibold text-slate-900">{{ e.className }}</p>
              <p class="text-sm text-slate-600">{{ e.schedule }}</p>
              <p class="text-sm text-slate-500">{{ e.campus }} · {{ e.environment }}</p>
              <p class="text-sm text-slate-500">Profesor: {{ e.teacher }}</p>
              @if (e.startDate) {
                <p class="text-sm text-slate-500">Inicio: {{ e.startDate }}</p>
              }
            </div>
            <div class="sp-card p-5 space-y-3">
              <h2 class="text-sm font-bold uppercase tracking-wider text-slate-500">Pago</h2>
              @if (e.agreementName) {
                <p class="text-sm text-violet-700 font-semibold">Convenio: {{ e.agreementName }}</p>
              }
              <div class="space-y-1 text-sm">
                @for (line of e.lines; track line.conceptCode) {
                  <div class="flex justify-between gap-2"
                    [class.text-green-700]="line.isDiscount">
                    <span>{{ line.conceptName }}</span>
                    <span class="font-semibold shrink-0">
                      {{ line.isDiscount ? '-' : '' }}S/ {{ Math.abs(line.amount).toFixed(2) }}
                    </span>
                  </div>
                }
              </div>
              <div class="border-t border-slate-100 pt-2 flex justify-between font-bold text-slate-900">
                <span>Total</span>
                <span>S/ {{ e.total.toFixed(2) }}</span>
              </div>
              @if (e.paymentId) {
                <a [routerLink]="['/portal-alumno/pagos', e.paymentId]" class="text-sm font-semibold text-brand hover:underline">
                  Ver comprobante de pago →
                </a>
              }
            </div>
          </div>

          <div class="sp-card p-5 text-sm text-slate-500">
            <p>Creada: {{ e.createdAt }}</p>
            @if (e.confirmedAt) {
              <p>Confirmada: {{ e.confirmedAt }}</p>
            }
          </div>
        </div>
      } @else {
        <div class="sp-card p-8 text-center space-y-3">
          <p class="text-slate-600">Matrícula no encontrada.</p>
          <a routerLink="/portal-alumno/matriculas" class="btn-primary inline-block">Volver al listado</a>
        </div>
      }
    </div>
  `,
})
export class StudentEnrollmentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly enrollmentService = inject(StudentEnrollmentService);

  protected readonly Math = Math;
  protected readonly enrollment = signal<StudentEnrollment | null>(null);
  protected readonly loading = signal(true);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.enrollmentService.getEnrollment(id).subscribe({
      next: e => {
        this.enrollment.set(e ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected statusLabel(status: EnrollmentStatus): string {
    return ENROLLMENT_STATUS_LABELS[status];
  }
}
