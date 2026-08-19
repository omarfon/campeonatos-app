import { Component, ChangeDetectionStrategy, inject, input, output, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClassesFacade } from '../../facades/classes.facade';
import { ClassService } from '../../services/class.service';
import { AcademicPeriod } from '../../models/class.model';

@Component({
  selector: 'app-class-duplicate-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" role="dialog" aria-modal="true" aria-labelledby="dup-title">
      <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
        <h2 id="dup-title" class="text-lg font-bold text-slate-900">Duplicar clase</h2>

        <div class="rounded-xl bg-slate-50 p-4 text-sm">
          <p class="text-slate-500">Origen</p>
          <p class="font-semibold">{{ className() }}</p>
          <p class="text-slate-600">{{ periodName() }}</p>
        </div>

        <div>
          <label for="dup-period" class="block text-sm font-medium text-slate-700 mb-1">Nuevo periodo *</label>
          <select id="dup-period" class="input-modern w-full" [(ngModel)]="periodId" (ngModelChange)="onPeriodChange($event)">
            @for (p of periods(); track p.id) {
              <option [ngValue]="p.id">{{ p.name }}</option>
            }
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="dup-start" class="block text-sm font-medium mb-1">Fecha inicio</label>
            <input id="dup-start" type="date" class="input-modern w-full" [(ngModel)]="startDate" />
          </div>
          <div>
            <label for="dup-end" class="block text-sm font-medium mb-1">Fecha fin</label>
            <input id="dup-end" type="date" class="input-modern w-full" [(ngModel)]="endDate" />
          </div>
        </div>

        <p class="text-xs text-slate-500">
          Se copiarán actividad, curso, profesor, modalidad, sede, ambiente, programación y capacidad.
          No se copian matrículas, sesiones ejecutadas ni historial.
        </p>

        <div class="flex gap-2 justify-end pt-2">
          <button type="button" class="btn-secondary" (click)="cancel.emit()">Cancelar</button>
          <button type="button" class="btn-primary" [disabled]="!periodId || !startDate || !endDate" (click)="confirm()">
            Duplicar clase
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ClassDuplicateModalComponent implements OnInit {
  readonly classId = input.required<number>();
  readonly className = input.required<string>();
  readonly sourcePeriodId = input.required<number>();
  readonly sourcePeriodName = input.required<string>();

  readonly cancel = output<void>();
  readonly duplicated = output<number>();

  private readonly facade = inject(ClassesFacade);
  private readonly classService = inject(ClassService);

  protected readonly periods = signal<AcademicPeriod[]>([]);
  protected periodId = 0;
  protected startDate = '';
  protected endDate = '';

  ngOnInit(): void {
    this.classService.getAllPeriods().subscribe(periods => {
      this.periods.set(periods);
      const next = periods.find(p => p.id !== this.sourcePeriodId()) ?? periods[0];
      if (next) {
        this.periodId = next.id;
        this.startDate = next.startDate;
        this.endDate = next.endDate;
      }
    });
  }

  protected periodName(): string {
    return this.sourcePeriodName();
  }

  protected onPeriodChange(id: number): void {
    const p = this.periods().find(x => x.id === id);
    if (p) {
      this.startDate = p.startDate;
      this.endDate = p.endDate;
    }
  }

  protected confirm(): void {
    this.facade.duplicateClass({
      sourceClassId: this.classId(),
      periodId: this.periodId,
      startDate: this.startDate,
      endDate: this.endDate,
    });
    this.duplicated.emit(this.classId());
  }
}
