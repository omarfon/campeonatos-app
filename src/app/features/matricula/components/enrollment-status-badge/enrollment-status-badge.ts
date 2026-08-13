import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { EnrollmentStatus, ENROLLMENT_STATUS_LABELS } from '../../enums/enrollment-status.enum';

const STATUS_CLASSES: Record<EnrollmentStatus, string> = {
  [EnrollmentStatus.DRAFT]: 'bg-slate-100 text-slate-700',
  [EnrollmentStatus.VALIDATING]: 'bg-blue-100 text-blue-800',
  [EnrollmentStatus.PENDING_PAYMENT]: 'bg-amber-100 text-amber-800',
  [EnrollmentStatus.CONFIRMED]: 'bg-green-100 text-green-800',
  [EnrollmentStatus.CANCELLED]: 'bg-red-100 text-red-700',
};

@Component({
  selector: 'app-enrollment-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      [class]="STATUS_CLASSES[status()]">
      {{ ENROLLMENT_STATUS_LABELS[status()] }}
    </span>
  `,
})
export class EnrollmentStatusBadgeComponent {
  readonly status = input.required<EnrollmentStatus>();
  protected readonly ENROLLMENT_STATUS_LABELS = ENROLLMENT_STATUS_LABELS;
  protected readonly STATUS_CLASSES = STATUS_CLASSES;
}
