import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MemberPaymentService } from '../../services/member-payment.service';
import { MemberPayment, MemberAccountStatement, MemberReceipt } from '../../models/member-portal.model';
import {
  MemberPaymentStatus,
  MEMBER_PAYMENT_STATUS_LABELS,
} from '../../enums/member-payment-status.enum';
import { MemberEmptyStateComponent } from '../../components/empty-state/member-empty-state';
import { MemberVisaCheckoutModalComponent } from '../../components/member-visa-checkout-modal/member-visa-checkout-modal';
import { MemberPaymentReceiptModalComponent } from '../../components/member-payment-receipt-modal/member-payment-receipt-modal';
import { MOCK_PARTICIPANTS } from '../../mocks/member-portal.mock';
import { MEMBER_PORTAL_ROUTE_PREFIX } from '../../member-portal.constants';

type FinanceSection = 'pending' | 'paid' | 'receipts';

@Component({
  selector: 'app-member-payments',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MemberEmptyStateComponent,
    MemberVisaCheckoutModalComponent,
    MemberPaymentReceiptModalComponent,
  ],
  template: `
    <div class="space-y-6">
      <header>
        <h1 class="mp-page-title">Estado de cuenta y pagos</h1>
        <p class="mp-page-subtitle">Resumen familiar, deudas pendientes, historial y comprobantes.</p>
      </header>

      @if (statementLoading()) {
        <div class="mp-card p-6 animate-pulse h-36"></div>
      } @else if (statement(); as s) {
        <section class="mp-card p-5 sm:p-6 space-y-4" aria-labelledby="resumen-cuenta">
          <h2 id="resumen-cuenta" class="text-sm font-bold uppercase tracking-wide text-slate-500">Resumen</h2>
          <div class="flex flex-wrap items-end justify-between gap-4">
            <div>
              @if (s.isUpToDate) {
                <p class="text-3xl font-extrabold text-emerald-700">Al día</p>
                <p class="text-sm text-slate-500 mt-1">No tienes deudas pendientes.</p>
              } @else {
                <p class="text-xs font-semibold uppercase text-slate-500">Total pendiente</p>
                <p class="text-3xl font-extrabold text-rose-700 mt-0.5">S/ {{ s.totalPending.toFixed(2) }}</p>
                @if (s.nextDueDate) {
                  <p class="text-sm text-amber-700 mt-1">Próximo vencimiento: {{ formatDate(s.nextDueDate) }}</p>
                }
              }
            </div>
            @if (s.lastPaymentDate) {
              <p class="text-xs text-slate-500">Último pago: {{ formatDate(s.lastPaymentDate) }}</p>
            }
          </div>

          @if (s.lines.length > 0) {
            <div class="border-t border-slate-100 pt-4 space-y-2">
              <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Por integrante</p>
              @for (line of s.lines; track line.participantPersonId) {
                <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span class="font-semibold text-slate-800">{{ line.participantName }}</span>
                  <span class="text-rose-700 font-bold">S/ {{ line.pendingAmount.toFixed(2) }}</span>
                </div>
              }
            </div>
          }
        </section>
      }

      <div class="flex flex-wrap gap-2" role="tablist" aria-label="Sección de finanzas">
        <button type="button" role="tab" class="mp-tab"
          [class.mp-tab-active]="section() === 'pending'"
          [attr.aria-selected]="section() === 'pending'"
          (click)="setSection('pending')">Pendientes</button>
        <button type="button" role="tab" class="mp-tab"
          [class.mp-tab-active]="section() === 'paid'"
          [attr.aria-selected]="section() === 'paid'"
          (click)="setSection('paid')">Historial</button>
        <button type="button" role="tab" class="mp-tab"
          [class.mp-tab-active]="section() === 'receipts'"
          [attr.aria-selected]="section() === 'receipts'"
          (click)="setSection('receipts')">Comprobantes</button>
      </div>

      @if (section() !== 'receipts') {
        <div class="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por integrante">
          <button type="button" role="tab" class="mp-btn-soft !text-xs !py-2"
            [class.!bg-amber-100]="participantFilter() === 'all'"
            (click)="setParticipantFilter('all')">Todos</button>
          @for (p of participants(); track p.personId) {
            <button type="button" role="tab" class="mp-btn-soft !text-xs !py-2"
              [class.!bg-amber-100]="participantFilter() === p.personId"
              (click)="setParticipantFilter(p.personId)">{{ p.firstName }}</button>
          }
        </div>
      }

      @if (section() === 'pending' && selectedIds().size > 0) {
        <div class="mp-card p-4 flex flex-wrap items-center justify-between gap-3 bg-amber-50/80 border-amber-200">
          <p class="text-sm font-semibold text-slate-800">
            {{ selectedIds().size }} seleccionado{{ selectedIds().size === 1 ? '' : 's' }} ·
            Total: S/ {{ selectedTotal().toFixed(2) }}
          </p>
          <button type="button" class="btn-primary !text-sm !py-2" (click)="openMultiCheckout()">
            Pagar seleccionados
          </button>
        </div>
      }

      @if (listLoading()) {
        <div class="space-y-3 animate-pulse">
          @for (i of [1, 2, 3]; track i) {
            <div class="h-24 bg-slate-200/80 rounded-2xl"></div>
          }
        </div>
      } @else if (section() === 'receipts') {
        @if (receipts().length === 0) {
          <app-member-empty-state
            title="Sin comprobantes"
            description="Los comprobantes aparecerán aquí después de realizar un pago."
            icon="🧾"
          />
        } @else {
          <div class="space-y-3">
            @for (r of receipts(); track r.id) {
              <article class="mp-card p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p class="font-mono text-sm font-bold text-brand">{{ r.number }}</p>
                  <h3 class="font-semibold text-slate-900 mt-1">{{ r.concept }}</h3>
                  <p class="text-sm text-slate-600 mt-0.5">{{ r.participantName }}</p>
                  <p class="text-xs text-slate-500 mt-2">{{ formatDate(r.date) }}</p>
                </div>
                <div class="text-right space-y-2">
                  <p class="text-xl font-extrabold text-slate-900">S/ {{ r.amount.toFixed(2) }}</p>
                  <button type="button" class="btn-secondary !text-xs !py-2" (click)="openReceiptByPaymentId(r.paymentId)">
                    Ver comprobante
                  </button>
                </div>
              </article>
            }
          </div>
        }
      } @else if (payments().length === 0) {
        <app-member-empty-state
          [title]="section() === 'pending' ? 'Sin pagos pendientes' : 'Sin pagos en el historial'"
          [description]="section() === 'pending' ? '¡Tu familia está al día!' : 'Aún no hay pagos registrados.'"
          icon="💳"
        />
      } @else {
        <div class="space-y-3">
          @for (p of payments(); track p.id) {
            <div class="mp-card p-5 flex flex-wrap items-end justify-between gap-4">
              @if (section() === 'pending') {
                <label class="flex items-start gap-3 flex-1 min-w-0 cursor-pointer">
                  <input type="checkbox" class="mt-1 rounded border-slate-300 text-brand focus:ring-brand"
                    [checked]="selectedIds().has(p.id)"
                    (change)="toggleSelect(p.id)"
                    [attr.aria-label]="'Seleccionar pago ' + p.code" />
                  <span class="flex-1 min-w-0">
                    <p class="font-mono text-xs text-slate-500">{{ p.code }}</p>
                    <h3 class="font-bold text-slate-900 mt-0.5">{{ p.concept }}</h3>
                    <p class="text-sm text-brand font-medium mt-0.5">{{ p.participantName }}</p>
                    @if (p.activityName) {
                      <p class="text-sm text-slate-600 mt-1">{{ p.activityName }} · {{ p.period }}</p>
                    }
                    <p class="text-lg font-extrabold text-slate-900 mt-3">S/ {{ p.amount.toFixed(2) }}</p>
                    @if (p.dueDate) {
                      <p class="text-xs text-amber-700 mt-1">Vence: {{ formatDate(p.dueDate) }}</p>
                    }
                    <span class="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mt-2" [class]="statusClass(p.status)">
                      {{ statusLabel(p.status) }}
                    </span>
                  </span>
                </label>
                <button type="button" class="btn-primary shrink-0 !py-2.5 !px-5" (click)="openCheckout([p])">Pagar</button>
              } @else {
                <a [routerLink]="[paymentsRoute, p.id]" class="flex-1 min-w-0 block -m-1 p-1 rounded-xl hover:bg-slate-50">
                  <p class="font-mono text-xs text-slate-500">{{ p.code }}</p>
                  <h3 class="font-bold text-slate-900 mt-0.5">{{ p.concept }}</h3>
                  <p class="text-sm text-brand font-medium mt-0.5">{{ p.participantName }}</p>
                  @if (p.activityName) {
                    <p class="text-sm text-slate-600 mt-1">{{ p.activityName }} · {{ p.period }}</p>
                  }
                  <p class="text-lg font-extrabold text-slate-900 mt-3">S/ {{ p.amount.toFixed(2) }}</p>
                  @if (p.paidAt) {
                    <p class="text-xs text-slate-500 mt-1">Pagado: {{ formatDate(p.paidAt) }}</p>
                  }
                  <span class="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mt-2" [class]="statusClass(p.status)">
                    {{ statusLabel(p.status) }}
                  </span>
                </a>
                <button type="button" class="btn-secondary shrink-0 !py-2.5 !px-5" (click)="openReceipt(p)">Comprobante</button>
              }
            </div>
          }
        </div>
      }

      <app-member-visa-checkout-modal
        [open]="checkoutOpen()"
        [payments]="checkoutPayments()"
        (close)="closeCheckout()"
        (paid)="onPaymentCompleted()" />

      <app-member-payment-receipt-modal
        [open]="receiptOpen()"
        [payment]="receiptPayment()"
        (close)="closeReceipt()" />
    </div>
  `,
})
export class MemberPaymentsPageComponent implements OnInit {
  private readonly paymentService = inject(MemberPaymentService);
  private readonly route = inject(ActivatedRoute);

  protected readonly statement = signal<MemberAccountStatement | null>(null);
  protected readonly statementLoading = signal(true);
  protected readonly payments = signal<MemberPayment[]>([]);
  protected readonly receipts = signal<MemberReceipt[]>([]);
  protected readonly listLoading = signal(true);
  protected readonly section = signal<FinanceSection>('pending');
  protected readonly participantFilter = signal<number | 'all'>('all');
  protected readonly selectedIds = signal<Set<number>>(new Set());
  protected readonly checkoutOpen = signal(false);
  protected readonly checkoutPayments = signal<MemberPayment[]>([]);
  protected readonly receiptOpen = signal(false);
  protected readonly receiptPayment = signal<MemberPayment | null>(null);

  protected readonly paymentsRoute = `${MEMBER_PORTAL_ROUTE_PREFIX}/pagos`;

  protected readonly participants = computed(() =>
    MOCK_PARTICIPANTS.map(p => ({
      personId: p.personId,
      firstName: p.fullName.split(' ')[0],
    })),
  );

  protected readonly selectedTotal = computed(() => {
    const ids = this.selectedIds();
    return this.payments().filter(p => ids.has(p.id)).reduce((s, p) => s + p.amount, 0);
  });

  ngOnInit(): void {
    const seccion = this.route.snapshot.queryParamMap.get('seccion');
    if (seccion === 'comprobantes' || seccion === 'receipts') {
      this.section.set('receipts');
    } else if (seccion === 'historial' || seccion === 'paid') {
      this.section.set('paid');
    }
    this.loadStatement();
    this.loadList();
  }

  protected setSection(value: FinanceSection): void {
    this.section.set(value);
    this.selectedIds.set(new Set());
    this.loadList();
  }

  protected setParticipantFilter(value: number | 'all'): void {
    this.participantFilter.set(value);
    this.selectedIds.set(new Set());
    if (this.section() !== 'receipts') this.loadList();
  }

  protected toggleSelect(id: number): void {
    this.selectedIds.update(set => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  protected openCheckout(payments: MemberPayment[]): void {
    this.checkoutPayments.set(payments);
    this.checkoutOpen.set(true);
  }

  protected openMultiCheckout(): void {
    const selected = this.payments().filter(p => this.selectedIds().has(p.id));
    if (selected.length > 0) this.openCheckout(selected);
  }

  protected closeCheckout(): void {
    this.checkoutOpen.set(false);
    this.checkoutPayments.set([]);
  }

  protected openReceipt(payment: MemberPayment): void {
    this.receiptPayment.set(payment);
    this.receiptOpen.set(true);
  }

  protected openReceiptByPaymentId(paymentId: number): void {
    this.paymentService.getPaymentDetail(paymentId).subscribe(p => {
      if (p) this.openReceipt(p);
    });
  }

  protected closeReceipt(): void {
    this.receiptOpen.set(false);
    this.receiptPayment.set(null);
  }

  protected onPaymentCompleted(): void {
    this.selectedIds.set(new Set());
    this.loadStatement();
    this.loadList();
    if (this.section() === 'pending') {
      this.section.set('receipts');
      this.loadList();
    }
  }

  protected statusLabel(status: MemberPaymentStatus): string {
    return MEMBER_PAYMENT_STATUS_LABELS[status];
  }

  protected statusClass(status: MemberPaymentStatus): string {
    switch (status) {
      case MemberPaymentStatus.PAID: return 'bg-emerald-100 text-emerald-800';
      case MemberPaymentStatus.PENDING: return 'bg-amber-100 text-amber-800';
      case MemberPaymentStatus.OVERDUE: return 'bg-rose-100 text-rose-800';
      default: return 'bg-slate-100 text-slate-600';
    }
  }

  protected formatDate(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  private loadStatement(): void {
    this.statementLoading.set(true);
    this.paymentService.getAccountStatement().subscribe({
      next: s => { this.statement.set(s); this.statementLoading.set(false); },
      error: () => this.statementLoading.set(false),
    });
  }

  private loadList(): void {
    this.listLoading.set(true);
    const filter = this.participantFilter();
    const sec = this.section();

    if (sec === 'receipts') {
      this.paymentService.getReceipts().subscribe({
        next: list => { this.receipts.set(list); this.listLoading.set(false); },
        error: () => this.listLoading.set(false),
      });
      return;
    }

    const request$ = sec === 'pending'
      ? this.paymentService.getPendingPayments(filter)
      : this.paymentService.getPaymentHistory({ participantPersonId: filter });

    request$.subscribe({
      next: list => { this.payments.set(list); this.listLoading.set(false); },
      error: () => this.listLoading.set(false),
    });
  }
}
