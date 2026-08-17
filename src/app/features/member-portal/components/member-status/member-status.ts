import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { MemberAccountStatus, MEMBER_ACCOUNT_STATUS_LABELS } from '../../enums/member-status.enum';

@Component({
  selector: 'app-member-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="statusClass()" [attr.aria-label]="'Estado: ' + label()">
      {{ label() }}
    </span>
  `,
})
export class MemberStatusComponent {
  readonly status = input.required<MemberAccountStatus>();
  readonly uppercase = input(true);

  protected label(): string {
    const text = MEMBER_ACCOUNT_STATUS_LABELS[this.status()];
    return this.uppercase() ? text.toUpperCase() : text;
  }

  protected statusClass(): string {
    switch (this.status()) {
      case MemberAccountStatus.ENABLED: return 'mp-status-enabled';
      case MemberAccountStatus.RESTRICTED: return 'mp-status-restricted';
      case MemberAccountStatus.SUSPENDED: return 'mp-status-suspended';
    }
  }
}
