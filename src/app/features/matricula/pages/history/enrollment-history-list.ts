import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EnrollmentHistoryService } from '../../services/enrollment-history.service';
import { EnrollmentHistoryEntry } from '../../models/enrollment.model';

@Component({
  selector: 'app-enrollment-history-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-extrabold">Historial de matrículas</h1>
      <div class="section-card overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b bg-slate-50 text-left">
              <th class="py-2 px-4 text-xs font-semibold text-slate-500">Fecha / Hora</th>
              <th class="py-2 px-4 text-xs font-semibold text-slate-500">Usuario</th>
              <th class="py-2 px-4 text-xs font-semibold text-slate-500">Acción</th>
              <th class="py-2 px-4 text-xs font-semibold text-slate-500">Detalle</th>
              <th class="py-2 px-4 text-xs font-semibold text-slate-500">Matrícula</th>
            </tr>
          </thead>
          <tbody>
            @for (h of entries(); track h.id) {
              <tr class="border-b hover:bg-slate-50">
                <td class="py-2 px-4 text-xs">{{ formatTs(h.timestamp) }}</td>
                <td class="py-2 px-4">{{ h.user }}</td>
                <td class="py-2 px-4 font-medium">{{ h.action }}</td>
                <td class="py-2 px-4 text-slate-600">{{ h.detail }}</td>
                <td class="py-2 px-4">
                  <a [routerLink]="['/matricula', h.enrollmentId]" class="text-brand text-xs font-semibold">#{{ h.enrollmentId }}</a>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class EnrollmentHistoryListComponent implements OnInit {
  private readonly service = inject(EnrollmentHistoryService);
  protected readonly entries = signal<EnrollmentHistoryEntry[]>([]);

  ngOnInit(): void {
    this.service.getAll().subscribe(list => this.entries.set(list));
  }

  protected formatTs(ts: string): string {
    const d = new Date(ts);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
}
