import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EnrollmentService } from '../../services/enrollment.service';
import { EnrollmentHistoryService } from '../../services/enrollment-history.service';
import { EnrollmentPaymentService } from '../../services/enrollment-payment.service';
import { EnrollmentStudentService } from '../../services/enrollment-student.service';
import { EnrollmentStatusBadgeComponent } from '../../components/enrollment-status-badge/enrollment-status-badge';
import { EnrollmentHistoryTimelineComponent } from '../../components/history-timeline/enrollment-history-timeline';
import {
  EnrollmentListItem,
  EnrollmentStudent,
  STUDENT_TYPE_LABELS,
  EnrollmentHistoryEntry,
  EnrollmentPayment,
} from '../../models/enrollment.model';
import { ENROLLMENT_STATUS_LABELS } from '../../enums/enrollment-status.enum';

type DetailTab = 'resumen' | 'estudiante' | 'curso' | 'convenio' | 'conceptos' | 'pago' | 'validaciones' | 'historial';

@Component({
  selector: 'app-enrollment-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EnrollmentStatusBadgeComponent, EnrollmentHistoryTimelineComponent],
  template: `
    @if (item(); as m) {
      <div class="space-y-6">
        <nav class="text-sm text-slate-500" aria-label="Miga de pan">
          <a routerLink="/matricula" class="hover:text-brand">Matrículas</a>
          <span class="mx-2">/</span>
          <span class="font-medium text-slate-800">{{ m.code }}</span>
        </nav>

        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="font-mono text-sm text-slate-500">{{ m.code }}</p>
            <h1 class="text-2xl font-extrabold text-slate-900">{{ m.studentName }}</h1>
            <p class="text-sm text-slate-500 mt-1">{{ m.courseName }} · {{ m.className }}</p>
          </div>
          <app-enrollment-status-badge [status]="m.status" />
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="section-card p-4">
            <p class="text-xs text-slate-500 uppercase">Estudiante</p>
            <p class="font-bold">{{ typeLabel(m.studentType) }}</p>
          </div>
          <div class="section-card p-4">
            <p class="text-xs text-slate-500 uppercase">Curso</p>
            <p class="font-bold">{{ m.courseName }}</p>
          </div>
          <div class="section-card p-4">
            <p class="text-xs text-slate-500 uppercase">Horario</p>
            <p class="font-bold text-sm">{{ m.schedule }}</p>
          </div>
          <div class="section-card p-4">
            <p class="text-xs text-slate-500 uppercase">Total</p>
            <p class="font-bold text-brand">S/ {{ m.total.toFixed(2) }}</p>
          </div>
        </div>

        <div role="tablist" class="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          @for (t of tabs; track t.id) {
            <button type="button" role="tab" [attr.aria-selected]="tab() === t.id"
              class="px-3 py-1.5 rounded-lg text-sm font-semibold"
              [class]="tab() === t.id ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-100'"
              (click)="tab.set(t.id)">{{ t.label }}</button>
          }
        </div>

        @switch (tab()) {
          @case ('resumen') {
            <div class="section-card p-4">
              <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div><dt class="text-slate-500">Estudiante</dt><dd class="font-medium">{{ m.studentName }}</dd></div>
                <div><dt class="text-slate-500">Documento</dt><dd class="font-medium">{{ m.studentDocument }}</dd></div>
                <div><dt class="text-slate-500">Tipo</dt><dd>{{ typeLabel(m.studentType) }}</dd></div>
                <div><dt class="text-slate-500">Estado</dt><dd>{{ statusLabel(m.status) }}</dd></div>
                <div><dt class="text-slate-500">Curso</dt><dd>{{ m.courseName }}</dd></div>
                <div><dt class="text-slate-500">Clase</dt><dd>{{ m.className }}</dd></div>
                <div><dt class="text-slate-500">Horario</dt><dd>{{ m.schedule }}</dd></div>
                <div><dt class="text-slate-500">Sede</dt><dd>{{ m.campus }}</dd></div>
                <div><dt class="text-slate-500">Convenio</dt><dd>{{ m.agreementName ?? 'Sin convenio' }}</dd></div>
                <div><dt class="text-slate-500">Fecha registro</dt><dd>{{ m.createdAt }}</dd></div>
                @if (m.confirmedAt) {
                  <div><dt class="text-slate-500">Fecha confirmación</dt><dd>{{ m.confirmedAt }}</dd></div>
                }
                @if (m.cancelledAt) {
                  <div><dt class="text-slate-500">Fecha anulación</dt><dd>{{ m.cancelledAt }}</dd></div>
                }
              </dl>
            </div>
          }
          @case ('estudiante') {
            <div class="section-card p-4 space-y-4">
              @if (student(); as s) {
                <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div><dt class="text-slate-500">Código</dt><dd class="font-mono">{{ s.code }}</dd></div>
                  <div><dt class="text-slate-500">Nombre</dt><dd class="font-medium">{{ s.firstName }} {{ s.lastName }}</dd></div>
                  <div><dt class="text-slate-500">Documento</dt><dd>{{ s.documentType }} {{ s.documentNumber }}</dd></div>
                  <div><dt class="text-slate-500">Correo</dt><dd>{{ s.email }}</dd></div>
                  <div><dt class="text-slate-500">Teléfono</dt><dd>{{ s.phone }}</dd></div>
                  <div><dt class="text-slate-500">Tipo</dt><dd>{{ typeLabel(m.studentType) }}</dd></div>
                  <div><dt class="text-slate-500">Condición</dt><dd>{{ s.condition }}</dd></div>
                  <div><dt class="text-slate-500">Distrito</dt><dd>{{ s.district ?? '—' }}</dd></div>
                </dl>
                <a [routerLink]="['/matricula', 'estudiantes', s.id]" class="inline-block text-sm font-semibold text-brand hover:underline">
                  Ver ficha del estudiante →
                </a>
              } @else {
                <p class="text-sm text-slate-600">{{ m.studentName }} · {{ m.studentDocument }}</p>
              }
            </div>
          }
          @case ('curso') {
            <div class="section-card p-4">
              <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div><dt class="text-slate-500">Curso</dt><dd class="font-medium">{{ m.courseName }}</dd></div>
                <div><dt class="text-slate-500">Clase</dt><dd class="font-medium">{{ m.className }}</dd></div>
                <div><dt class="text-slate-500">Horario</dt><dd>{{ m.schedule }}</dd></div>
                <div><dt class="text-slate-500">Sede</dt><dd>{{ m.campus }}</dd></div>
              </dl>
            </div>
          }
          @case ('convenio') {
            <div class="section-card p-4 text-sm">
              @if (m.agreementName) {
                <p class="font-semibold text-slate-900">{{ m.agreementName }}</p>
                <p class="text-slate-600 mt-1">Convenio aplicado a esta matrícula.</p>
              } @else {
                <p class="text-slate-600">Esta matrícula no tiene convenio asociado.</p>
              }
            </div>
          }
          @case ('conceptos') {
            <div class="section-card overflow-hidden">
              <table class="w-full text-sm">
                <tbody>
                  <tr class="border-b border-slate-100">
                    <td class="py-3 px-4 text-slate-600">Subtotal</td>
                    <td class="py-3 px-4 text-right font-medium">S/ {{ m.subtotal.toFixed(2) }}</td>
                  </tr>
                  <tr class="border-b border-slate-100">
                    <td class="py-3 px-4 text-slate-600">Descuento</td>
                    <td class="py-3 px-4 text-right font-medium text-green-700">- S/ {{ m.discount.toFixed(2) }}</td>
                  </tr>
                  <tr class="bg-slate-50">
                    <td class="py-3 px-4 font-semibold">Total a pagar</td>
                    <td class="py-3 px-4 text-right font-bold text-brand">S/ {{ m.total.toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          }
          @case ('pago') {
            <div class="section-card p-4 space-y-3">
              @for (p of payments(); track p.id) {
                <div class="flex flex-wrap justify-between gap-2 text-sm border-b border-slate-100 pb-2 last:border-0">
                  <span class="font-medium capitalize">{{ paymentMethodLabel(p.method) }}</span>
                  <span>S/ {{ p.amount.toFixed(2) }}</span>
                  <span class="text-slate-500">{{ p.paidAt.slice(0, 10) }}</span>
                  <span class="text-xs" [class]="p.confirmed ? 'text-green-700' : 'text-amber-700'">
                    {{ p.confirmed ? 'Confirmado' : 'Pendiente' }}
                  </span>
                </div>
              } @empty {
                <p class="text-slate-400">Sin pagos registrados</p>
              }
            </div>
          }
          @case ('validaciones') {
            <div class="section-card p-4 space-y-2 text-sm">
              <p class="flex items-center gap-2">
                <span class="text-green-600 font-bold">✓</span> Estudiante identificado
              </p>
              <p class="flex items-center gap-2">
                <span class="font-bold" [class]="m.status !== 'CANCELLED' ? 'text-green-600' : 'text-red-600'">
                  {{ m.status !== 'CANCELLED' ? '✓' : '✗' }}
                </span>
                Matrícula {{ m.status === 'CANCELLED' ? 'anulada' : 'vigente' }}
              </p>
              <p class="flex items-center gap-2">
                <span class="font-bold" [class]="m.status === 'CONFIRMED' ? 'text-green-600' : 'text-amber-600'">
                  {{ m.status === 'CONFIRMED' ? '✓' : '○' }}
                </span>
                {{ m.status === 'CONFIRMED' ? 'Matrícula confirmada' : m.status === 'PENDING_PAYMENT' ? 'Pendiente de pago' : 'Estado: ' + statusLabel(m.status) }}
              </p>
            </div>
          }
          @case ('historial') {
            <div class="section-card p-4">
              <app-enrollment-history-timeline [entries]="history()" />
            </div>
          }
        }

        <div class="flex flex-wrap gap-2">
          @if (m.status === 'PENDING_PAYMENT') {
            <a routerLink="/matricula/nueva" class="btn-primary">Continuar pago</a>
          }
          @if (m.status !== 'CANCELLED') {
            <button type="button" class="btn-ghost text-red-600" (click)="cancel()">Cancelar matrícula</button>
          }
          <a routerLink="/matricula" class="btn-ghost">Volver al listado</a>
        </div>
      </div>
    } @else {
      <div class="space-y-4 py-12 text-center">
        <p class="text-slate-400">Matrícula no encontrada</p>
        <a routerLink="/matricula" class="btn-ghost inline-block">Volver al listado</a>
      </div>
    }
  `,
})
export class EnrollmentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(EnrollmentService);
  private readonly historyService = inject(EnrollmentHistoryService);
  private readonly paymentService = inject(EnrollmentPaymentService);
  private readonly studentService = inject(EnrollmentStudentService);

  protected readonly item = signal<EnrollmentListItem | undefined>(undefined);
  protected readonly student = signal<EnrollmentStudent | undefined>(undefined);
  protected readonly history = signal<EnrollmentHistoryEntry[]>([]);
  protected readonly payments = signal<EnrollmentPayment[]>([]);
  protected readonly tab = signal<DetailTab>('resumen');

  protected readonly tabs: { id: DetailTab; label: string }[] = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'estudiante', label: 'Estudiante' },
    { id: 'curso', label: 'Curso / Clase' },
    { id: 'convenio', label: 'Convenio' },
    { id: 'conceptos', label: 'Conceptos' },
    { id: 'pago', label: 'Pago' },
    { id: 'validaciones', label: 'Validaciones' },
    { id: 'historial', label: 'Historial' },
  ];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.service.getEnrollment(id).subscribe(m => {
      this.item.set(m);
      if (m) {
        this.studentService.getById(m.studentId).subscribe(s => this.student.set(s));
        this.historyService.getByEnrollment(m.id).subscribe(h => this.history.set(h));
        this.paymentService.getByEnrollment(m.id).subscribe(p => this.payments.set(p));
      }
    });
  }

  protected typeLabel(t: EnrollmentListItem['studentType']): string {
    return STUDENT_TYPE_LABELS[t];
  }

  protected statusLabel(status: EnrollmentListItem['status']): string {
    return ENROLLMENT_STATUS_LABELS[status];
  }

  protected paymentMethodLabel(method: EnrollmentPayment['method']): string {
    const labels: Record<EnrollmentPayment['method'], string> = {
      cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia', other: 'Otro',
    };
    return labels[method];
  }

  protected cancel(): void {
    const m = this.item();
    if (m && confirm('¿Cancelar esta matrícula?')) {
      this.service.cancelEnrollment(m.id).subscribe(() => {
        this.service.getEnrollment(m.id).subscribe(i => this.item.set(i));
      });
    }
  }
}
