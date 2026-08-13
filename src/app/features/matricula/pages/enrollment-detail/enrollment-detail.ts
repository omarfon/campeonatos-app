import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EnrollmentService } from '../../services/enrollment.service';
import { EnrollmentHistoryService } from '../../services/enrollment-history.service';
import { EnrollmentPaymentService } from '../../services/enrollment-payment.service';
import { EnrollmentStatusBadgeComponent } from '../../components/enrollment-status-badge/enrollment-status-badge';
import { EnrollmentHistoryTimelineComponent } from '../../components/history-timeline/enrollment-history-timeline';
import { EnrollmentListItem, STUDENT_TYPE_LABELS } from '../../models/enrollment.model';
import { EnrollmentHistoryEntry } from '../../models/enrollment.model';
import { EnrollmentPayment } from '../../models/enrollment.model';

type DetailTab = 'resumen' | 'estudiante' | 'curso' | 'convenio' | 'conceptos' | 'pago' | 'validaciones' | 'historial';

@Component({
  selector: 'app-enrollment-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EnrollmentStatusBadgeComponent, EnrollmentHistoryTimelineComponent],
  template: `
    @if (item(); as m) {
      <div class="space-y-6">
        <nav class="text-sm text-slate-500">
          <a routerLink="/matricula" class="hover:text-brand">Matrículas</a>
          <span class="mx-2">/</span>
          <span class="font-medium text-slate-800">{{ m.code }}</span>
        </nav>

        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="font-mono text-sm text-slate-500">{{ m.code }}</p>
            <h1 class="text-2xl font-extrabold">{{ m.studentName }}</h1>
          </div>
          <app-enrollment-status-badge [status]="m.status" />
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="section-card p-4"><p class="text-xs text-slate-500 uppercase">Estudiante</p><p class="font-bold">{{ typeLabel(m.studentType) }}</p></div>
          <div class="section-card p-4"><p class="text-xs text-slate-500 uppercase">Curso</p><p class="font-bold">{{ m.courseName }}</p></div>
          <div class="section-card p-4"><p class="text-xs text-slate-500 uppercase">Horario</p><p class="font-bold text-sm">{{ m.schedule }}</p></div>
          <div class="section-card p-4"><p class="text-xs text-slate-500 uppercase">Total</p><p class="font-bold text-brand">S/ {{ m.total.toFixed(2) }}</p></div>
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
            <div class="section-card p-4 text-sm space-y-2">
              <p><span class="text-slate-500">Documento:</span> {{ m.studentDocument }}</p>
              <p><span class="text-slate-500">Sede:</span> {{ m.campus }}</p>
              <p><span class="text-slate-500">Fecha:</span> {{ m.createdAt }}</p>
              @if (m.confirmedAt) { <p><span class="text-slate-500">Confirmada:</span> {{ m.confirmedAt }}</p> }
            </div>
          }
          @case ('historial') {
            <div class="section-card p-4">
              <app-enrollment-history-timeline [entries]="history()" />
            </div>
          }
          @case ('pago') {
            <div class="section-card p-4">
              @for (p of payments(); track p.id) {
                <p class="text-sm">{{ p.method }} · S/ {{ p.amount.toFixed(2) }} · {{ p.paidAt.slice(0, 10) }}</p>
              } @empty {
                <p class="text-slate-400">Sin pagos registrados</p>
              }
            </div>
          }
          @default {
            <div class="section-card p-4 text-sm text-slate-600">Información de {{ tab() }} (mock consulta).</div>
          }
        }

        <div class="flex gap-2">
          @if (m.status === 'PENDING_PAYMENT') {
            <a routerLink="/matricula/nueva" class="btn-primary">Continuar pago</a>
          }
          <button type="button" class="btn-ghost text-red-600" (click)="cancel()">Cancelar matrícula</button>
        </div>
      </div>
    } @else {
      <p class="text-slate-400 py-12 text-center">Matrícula no encontrada</p>
    }
  `,
})
export class EnrollmentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(EnrollmentService);
  private readonly historyService = inject(EnrollmentHistoryService);
  private readonly paymentService = inject(EnrollmentPaymentService);

  protected readonly item = signal<EnrollmentListItem | undefined>(undefined);
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
        this.historyService.getByEnrollment(m.id).subscribe(h => this.history.set(h));
        this.paymentService.getByEnrollment(m.id).subscribe(p => this.payments.set(p));
      }
    });
  }

  protected typeLabel(t: EnrollmentListItem['studentType']): string {
    return STUDENT_TYPE_LABELS[t];
  }

  protected cancel(): void {
    const m = this.item();
    if (m && confirm('¿Cancelar esta matrícula?')) {
      this.service.cancelEnrollment(m.id).subscribe(() => this.service.getEnrollment(m.id).subscribe(i => this.item.set(i)));
    }
  }
}
