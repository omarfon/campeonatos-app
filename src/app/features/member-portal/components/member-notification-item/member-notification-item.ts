import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MemberNotification } from '../../models/member-portal.model';
import {
  MemberNotificationType,
  MEMBER_NOTIFICATION_TYPE_LABELS,
} from '../../enums/member-notification-type.enum';

@Component({
  selector: 'app-member-notification-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <a [routerLink]="notification().actionRoute ?? []"
      class="block p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors"
      [class.bg-amber-50/40]="!notification().read">
      <div class="flex items-start gap-3">
        <span class="text-lg shrink-0" aria-hidden="true">{{ typeIcon(notification().type) }}</span>
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <p class="font-semibold text-slate-900 text-sm">{{ notification().title }}</p>
            @if (!notification().read) {
              <span class="w-2 h-2 rounded-full bg-amber-500 shrink-0" aria-label="No leída"></span>
            }
          </div>
          <p class="text-xs text-slate-600 mt-1 line-clamp-2">{{ notification().description }}</p>
          <p class="text-xs text-slate-400 mt-1.5">
            <span class="font-medium text-slate-500">{{ typeLabel(notification().type) }}</span>
            · {{ notification().relativeDate }}
          </p>
        </div>
      </div>
    </a>
  `,
})
export class MemberNotificationItemComponent {
  readonly notification = input.required<MemberNotification>();
  readonly select = output<number>();

  protected typeLabel(type: MemberNotificationType): string {
    return MEMBER_NOTIFICATION_TYPE_LABELS[type];
  }

  protected typeIcon(type: MemberNotificationType): string {
    switch (type) {
      case MemberNotificationType.PAYMENT: return '💳';
      case MemberNotificationType.ACTIVITY: return '🏊';
      case MemberNotificationType.BENEFIT: return '🎁';
      case MemberNotificationType.FAMILY: return '👨‍👩‍👧';
      case MemberNotificationType.EVENT: return '🎭';
      case MemberNotificationType.ACCOUNT: return '👤';
      default: return '🔔';
    }
  }
}
