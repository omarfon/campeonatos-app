import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { AcademicClassStatus, ACADEMIC_CLASS_STATUS_LABELS, ACADEMIC_CLASS_STATUS_STYLES } from '../../enums/academic-class-status.enum';

@Component({
  selector: 'app-class-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full"
      [class]="styleClass()"
      [attr.aria-label]="'Estado: ' + label()"
    >
      {{ label() }}
    </span>
  `,
})
export class ClassStatusBadgeComponent {
  readonly status = input.required<AcademicClassStatus>();

  protected label(): string {
    return ACADEMIC_CLASS_STATUS_LABELS[this.status()];
  }

  protected styleClass(): string {
    return ACADEMIC_CLASS_STATUS_STYLES[this.status()];
  }
}
