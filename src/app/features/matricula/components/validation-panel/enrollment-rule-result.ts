import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { EnrollmentRuleResult } from '../../models/enrollment.model';

@Component({
  selector: 'app-enrollment-rule-result',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-start gap-2 text-sm py-1">
      <span class="font-bold w-5 shrink-0"
        [class]="result().status === 'PASSED' ? 'text-green-600' : result().status === 'WARNING' ? 'text-amber-600' : 'text-red-600'"
        aria-hidden="true">
        {{ result().status === 'PASSED' ? '✓' : result().status === 'WARNING' ? '⚠' : '✕' }}
      </span>
      <div>
        <p class="font-medium text-slate-800">{{ result().ruleName }}</p>
        <p class="text-slate-600">{{ result().message }}</p>
      </div>
    </div>
  `,
})
export class EnrollmentRuleResultComponent {
  readonly result = input.required<EnrollmentRuleResult>();
}
