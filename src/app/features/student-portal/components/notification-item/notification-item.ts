import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudentNotification } from '../../models/student-portal.model';
import { STUDENT_NOTIFICATION_TYPE_LABELS } from '../../enums/student-notification-type.enum';

@Component({
  selector: 'app-notification-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (notification(); as n) {
      <article class="p-4 border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50/80"
        [class.bg-teal-50/50]="!n.read">
        <div class="flex gap-3">
          <span class="mt-2 w-2 h-2 rounded-full shrink-0"
            [class.bg-teal-500]="!n.read"
            [class.bg-transparent]="n.read"
            [attr.aria-label]="n.read ? 'Leída' : 'No leída'"></span>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold uppercase text-slate-500">{{ typeLabel(n.type) }}</p>
            <h4 class="font-semibold text-slate-900 mt-0.5">{{ n.title }}</h4>
            <p class="text-sm text-slate-600 mt-1">{{ n.description }}</p>
            <p class="text-xs text-slate-400 mt-2">{{ n.relativeDate }}</p>
            @if (n.actionRoute && n.actionLabel) {
              <a [routerLink]="n.actionRoute" class="inline-block mt-2 text-sm font-semibold text-brand hover:underline"
                (click)="select.emit(n.id)">
                {{ n.actionLabel }}
              </a>
            }
          </div>
        </div>
      </article>
    }
  `,
})
export class NotificationItemComponent {
  readonly notification = input<StudentNotification | null>(null);
  readonly select = output<number>();

  protected typeLabel(type: StudentNotification['type']): string {
    return STUDENT_NOTIFICATION_TYPE_LABELS[type];
  }
}
