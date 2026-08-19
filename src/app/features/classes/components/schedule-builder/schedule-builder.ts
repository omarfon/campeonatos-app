import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClassCreateWizardFacade } from '../../facades/class-create-wizard.facade';
import { ClassScheduleRule, buildFrequencyLabel } from '../../models/class.model';

interface DayConfig {
  dayOfWeek: number;
  label: string;
  enabled: boolean;
  blocks: { startTime: string; endTime: string }[];
}

const DAY_CONFIGS: Omit<DayConfig, 'enabled' | 'blocks'>[] = [
  { dayOfWeek: 1, label: 'Lunes' },
  { dayOfWeek: 2, label: 'Martes' },
  { dayOfWeek: 3, label: 'Miércoles' },
  { dayOfWeek: 4, label: 'Jueves' },
  { dayOfWeek: 5, label: 'Viernes' },
  { dayOfWeek: 6, label: 'Sábado' },
  { dayOfWeek: 0, label: 'Domingo' },
];

@Component({
  selector: 'app-schedule-builder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="start-date" class="block text-sm font-medium text-slate-700 mb-1">Inicio *</label>
          <input
            id="start-date"
            type="date"
            class="input-modern w-full"
            [ngModel]="facade.draft().startDate"
            (ngModelChange)="onDatesChange($event, facade.draft().endDate)"
          />
        </div>
        <div>
          <label for="end-date" class="block text-sm font-medium text-slate-700 mb-1">Fin *</label>
          <input
            id="end-date"
            type="date"
            class="input-modern w-full"
            [ngModel]="facade.draft().endDate"
            (ngModelChange)="onDatesChange(facade.draft().startDate, $event)"
          />
        </div>
      </div>

      <div>
        <h3 class="text-sm font-semibold text-slate-700 mb-3">Programación semanal</h3>
        <div class="space-y-3">
          @for (day of days(); track day.dayOfWeek) {
            <div class="rounded-xl border border-slate-200 p-4" [class.bg-slate-50/50]="!day.enabled">
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  class="w-4 h-4 rounded border-slate-300 text-brand focus:ring-brand"
                  [checked]="day.enabled"
                  (change)="toggleDay(day.dayOfWeek, $event)"
                  [attr.aria-label]="'Activar ' + day.label"
                />
                <span class="font-semibold text-slate-800">{{ day.label }}</span>
              </label>

              @if (day.enabled) {
                <div class="mt-3 ml-7 space-y-2">
                  @for (block of day.blocks; track $index; let bi = $index) {
                    <div class="flex flex-wrap items-center gap-2">
                      <input
                        type="time"
                        class="input-modern !py-1.5 !text-sm w-32"
                        [ngModel]="block.startTime"
                        (ngModelChange)="updateBlock(day.dayOfWeek, bi, 'startTime', $event)"
                        [attr.aria-label]="day.label + ' hora inicio'"
                      />
                      <span class="text-slate-400" aria-hidden="true">→</span>
                      <input
                        type="time"
                        class="input-modern !py-1.5 !text-sm w-32"
                        [ngModel]="block.endTime"
                        (ngModelChange)="updateBlock(day.dayOfWeek, bi, 'endTime', $event)"
                        [attr.aria-label]="day.label + ' hora fin'"
                      />
                      @if (day.blocks.length > 1) {
                        <button
                          type="button"
                          class="text-xs text-red-600 hover:underline"
                          (click)="removeBlock(day.dayOfWeek, bi)"
                        >
                          Eliminar
                        </button>
                      }
                    </div>
                  }
                  <button
                    type="button"
                    class="text-xs font-semibold text-brand-600 hover:underline"
                    (click)="addBlock(day.dayOfWeek)"
                  >
                    + Agregar horario
                  </button>
                </div>
              }
            </div>
          }
        </div>
      </div>

      @if (facade.draft().scheduleRules.length > 0) {
        <p class="text-sm text-slate-600">
          Frecuencia: <span class="font-semibold">{{ frequency() }}</span>
        </p>
      }
    </div>
  `,
})
export class ScheduleBuilderComponent {
  protected readonly facade = inject(ClassCreateWizardFacade);

  protected readonly days = computed(() => this.buildDaysFromRules(this.facade.draft().scheduleRules));

  protected frequency(): string {
    return buildFrequencyLabel(this.facade.draft().scheduleRules);
  }

  protected onDatesChange(start: string, end: string): void {
    this.facade.patchDraft({ startDate: start, endDate: end });
  }

  protected toggleDay(dayOfWeek: number, event: Event): void {
    const enabled = (event.target as HTMLInputElement).checked;
    const rules = [...this.facade.draft().scheduleRules];
    if (enabled) {
      rules.push({ dayOfWeek, startTime: '18:00', endTime: '19:00' });
    } else {
      const filtered = rules.filter(r => r.dayOfWeek !== dayOfWeek);
      this.facade.patchDraft({ scheduleRules: filtered });
      return;
    }
    this.facade.patchDraft({ scheduleRules: rules });
  }

  protected updateBlock(dayOfWeek: number, blockIndex: number, field: 'startTime' | 'endTime', value: string): void {
    const rules = [...this.facade.draft().scheduleRules];
    const dayRules = rules.filter(r => r.dayOfWeek === dayOfWeek);
    if (dayRules[blockIndex]) {
      dayRules[blockIndex] = { ...dayRules[blockIndex], [field]: value };
    }
    const other = rules.filter(r => r.dayOfWeek !== dayOfWeek);
    this.facade.patchDraft({ scheduleRules: [...other, ...dayRules] });
  }

  protected addBlock(dayOfWeek: number): void {
    const rules = [...this.facade.draft().scheduleRules, { dayOfWeek, startTime: '09:00', endTime: '10:00' }];
    this.facade.patchDraft({ scheduleRules: rules });
  }

  protected removeBlock(dayOfWeek: number, blockIndex: number): void {
    const dayRules = this.facade.draft().scheduleRules.filter(r => r.dayOfWeek === dayOfWeek);
    dayRules.splice(blockIndex, 1);
    const other = this.facade.draft().scheduleRules.filter(r => r.dayOfWeek !== dayOfWeek);
    this.facade.patchDraft({ scheduleRules: [...other, ...dayRules] });
  }

  private buildDaysFromRules(rules: ClassScheduleRule[]): DayConfig[] {
    return DAY_CONFIGS.map(d => {
      const blocks = rules
        .filter(r => r.dayOfWeek === d.dayOfWeek)
        .map(r => ({ startTime: r.startTime, endTime: r.endTime }));
      return {
        ...d,
        enabled: blocks.length > 0,
        blocks: blocks.length > 0 ? blocks : [{ startTime: '18:00', endTime: '19:00' }],
      };
    });
  }
}
