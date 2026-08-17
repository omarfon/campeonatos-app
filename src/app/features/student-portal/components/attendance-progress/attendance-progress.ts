import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-attendance-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <div class="flex justify-between text-sm mb-1">
        <span class="text-slate-600">{{ label() }}</span>
        <span class="font-bold text-slate-900">{{ percentage() }}%</span>
      </div>
      <div class="h-2 rounded-full bg-slate-100 overflow-hidden" role="progressbar"
        [attr.aria-valuenow]="percentage()" aria-valuemin="0" aria-valuemax="100"
        [attr.aria-label]="label() + ': ' + percentage() + ' por ciento'">
        <div class="h-full rounded-full transition-all duration-500"
          style="background: linear-gradient(90deg, #1A3263, #0d9488)"
          [style.width.%]="percentage()"></div>
      </div>
    </div>
  `,
})
export class StudentAttendanceProgressComponent {
  readonly percentage = input(0);
  readonly label = input('Asistencia');
}
