import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EnrollmentService } from '../../services/enrollment.service';
import { EnrollmentStatus } from '../../enums/enrollment-status.enum';
import { EnrollmentStatusBadgeComponent } from '../../components/enrollment-status-badge/enrollment-status-badge';
import { EnrollmentListItem } from '../../models/enrollment.model';

@Component({
  selector: 'app-enrollment-payments-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EnrollmentStatusBadgeComponent],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-extrabold">Pagos / Pendientes</h1>
      <div class="section-card overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b bg-slate-50 text-left">
              <th class="py-2 px-4 text-xs font-semibold text-slate-500">Código</th>
              <th class="py-2 px-4 text-xs font-semibold text-slate-500">Estudiante</th>
              <th class="py-2 px-4 text-xs font-semibold text-slate-500">Curso</th>
              <th class="py-2 px-4 text-xs font-semibold text-slate-500 text-right">Deuda</th>
              <th class="py-2 px-4 text-xs font-semibold text-slate-500">Estado</th>
              <th class="py-2 px-4 text-xs font-semibold text-slate-500">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (m of pending(); track m.id) {
              <tr class="border-b hover:bg-slate-50">
                <td class="py-2 px-4 font-mono text-xs">{{ m.code }}</td>
                <td class="py-2 px-4">{{ m.studentName }}</td>
                <td class="py-2 px-4">{{ m.courseName }}</td>
                <td class="py-2 px-4 text-right font-bold text-amber-700">S/ {{ m.total.toFixed(2) }}</td>
                <td class="py-2 px-4"><app-enrollment-status-badge [status]="m.status" /></td>
                <td class="py-2 px-4">
                  <a [routerLink]="['/matricula', m.id]" class="text-brand font-semibold text-xs">Ver deuda</a>
                  <span class="mx-1">·</span>
                  <a routerLink="/matricula/nueva" class="text-brand font-semibold text-xs">Continuar pago</a>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="py-8 text-center text-slate-400">Sin pendientes de pago</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class EnrollmentPaymentsPageComponent implements OnInit {
  private readonly service = inject(EnrollmentService);
  protected readonly pending = signal<EnrollmentListItem[]>([]);

  ngOnInit(): void {
    this.service.getEnrollments({ status: EnrollmentStatus.PENDING_PAYMENT }).subscribe(list => this.pending.set(list));
  }
}
