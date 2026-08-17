import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EnrollmentService } from '../../services/enrollment.service';
import { EnrollmentStatus } from '../../enums/enrollment-status.enum';
import { EnrollmentStatusBadgeComponent } from '../../components/enrollment-status-badge/enrollment-status-badge';
import { EnrollmentListItem } from '../../models/enrollment.model';

@Component({
  selector: 'app-enrollment-payments-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, EnrollmentStatusBadgeComponent],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Pagos / Pendientes</h1>
        <p class="text-sm text-slate-500 mt-0.5">{{ pending().length }} pendiente(s) de pago</p>
      </div>

      <div class="section-card p-4 space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div class="lg:col-span-2">
            <label for="pay-search" class="block text-xs font-semibold text-slate-500 mb-1">Buscar</label>
            <input id="pay-search" type="search" class="input-modern !py-1.5 !text-sm w-full"
              placeholder="Código, estudiante, documento o curso..."
              [(ngModel)]="filterSearch" (ngModelChange)="applyFilters()" />
          </div>
          <div>
            <label for="pay-code" class="block text-xs font-semibold text-slate-500 mb-1">Código matrícula</label>
            <input id="pay-code" type="search" class="input-modern !py-1.5 !text-sm w-full"
              placeholder="MAT-2026-..."
              [(ngModel)]="filterCode" (ngModelChange)="applyFilters()" />
          </div>
        </div>
        @if (hasFilters()) {
          <div class="flex justify-end">
            <button type="button" class="btn-ghost !text-sm" (click)="clearFilters()">Limpiar filtros</button>
          </div>
        }
      </div>

      <div class="section-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b bg-slate-50 text-left">
                <th class="py-2 px-4 text-xs font-semibold text-slate-500">Código</th>
                <th class="py-2 px-4 text-xs font-semibold text-slate-500">Estudiante</th>
                <th class="py-2 px-4 text-xs font-semibold text-slate-500">Documento</th>
                <th class="py-2 px-4 text-xs font-semibold text-slate-500">Curso</th>
                <th class="py-2 px-4 text-xs font-semibold text-slate-500 text-right">Deuda</th>
                <th class="py-2 px-4 text-xs font-semibold text-slate-500">Estado</th>
                <th class="py-2 px-4 text-xs font-semibold text-slate-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (m of pending(); track m.id) {
                <tr class="border-b hover:bg-slate-50 cursor-pointer transition-colors"
                  tabindex="0"
                  role="link"
                  [attr.aria-label]="'Ver matrícula ' + m.code"
                  (click)="openDetail(m.id)"
                  (keydown.enter)="openDetail(m.id)"
                  (keydown.space)="openDetail(m.id); $event.preventDefault()">
                  <td class="py-2 px-4 font-mono text-xs text-brand font-semibold">{{ m.code }}</td>
                  <td class="py-2 px-4 font-medium">{{ m.studentName }}</td>
                  <td class="py-2 px-4 text-slate-600">{{ m.studentDocument }}</td>
                  <td class="py-2 px-4">{{ m.courseName }}</td>
                  <td class="py-2 px-4 text-right font-bold text-amber-700">S/ {{ m.total.toFixed(2) }}</td>
                  <td class="py-2 px-4"><app-enrollment-status-badge [status]="m.status" /></td>
                  <td class="py-2 px-4 whitespace-nowrap" (click)="$event.stopPropagation()">
                    <a routerLink="/matricula/nueva" class="text-brand font-semibold text-xs">Continuar pago</a>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="py-8 text-center text-slate-400">
                    @if (hasFilters()) {
                      No hay pendientes que coincidan con la búsqueda.
                    } @else {
                      Sin pendientes de pago.
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class EnrollmentPaymentsPageComponent implements OnInit {
  private readonly service = inject(EnrollmentService);
  private readonly router = inject(Router);

  protected readonly pending = signal<EnrollmentListItem[]>([]);
  private allPending: EnrollmentListItem[] = [];

  protected filterSearch = '';
  protected filterCode = '';

  ngOnInit(): void {
    this.load();
  }

  protected applyFilters(): void {
    let list = [...this.allPending];
    const search = this.filterSearch.trim().toLowerCase();
    if (search) {
      list = list.filter(m =>
        m.code.toLowerCase().includes(search) ||
        m.studentName.toLowerCase().includes(search) ||
        m.studentDocument.includes(search) ||
        m.courseName.toLowerCase().includes(search),
      );
    }
    const code = this.filterCode.trim().toLowerCase();
    if (code) {
      list = list.filter(m => m.code.toLowerCase().includes(code));
    }
    this.pending.set(list);
  }

  protected clearFilters(): void {
    this.filterSearch = '';
    this.filterCode = '';
    this.applyFilters();
  }

  protected hasFilters(): boolean {
    return !!(this.filterSearch.trim() || this.filterCode.trim());
  }

  protected openDetail(id: number): void {
    this.router.navigate(['/matricula', id]);
  }

  private load(): void {
    this.service.getEnrollments({ status: EnrollmentStatus.PENDING_PAYMENT }).subscribe(list => {
      this.allPending = list;
      this.applyFilters();
    });
  }
}
