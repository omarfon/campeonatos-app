import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { StudentNotificationService } from '../../services/student-notification.service';
import { StudentNotification } from '../../models/student-portal.model';
import { NotificationItemComponent } from '../../components/notification-item/notification-item';
import { StudentEmptyStateComponent } from '../../components/empty-state/student-empty-state';

@Component({
  selector: 'app-student-notifications',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NotificationItemComponent, StudentEmptyStateComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="sp-page-title">Notificaciones</h1>
          <p class="text-sm text-slate-500 mt-1">Mantente al día con avisos importantes.</p>
        </div>
        @if (unreadCount() > 0) {
          <button type="button" class="btn-secondary !text-sm" (click)="markAllRead()">
            Marcar todas como leídas
          </button>
        }
      </div>

      @if (loading()) {
        <div class="sp-card animate-pulse">
          @for (i of [1, 2, 3]; track i) {
            <div class="p-4 border-b border-slate-100">
              <div class="h-4 bg-slate-200 rounded w-3/4"></div>
            </div>
          }
        </div>
      } @else if (notifications().length === 0) {
        <app-student-empty-state
          title="Sin notificaciones"
          description="No tienes notificaciones por el momento."
          icon="🔔"
        />
      } @else {
        <div class="sp-card !p-0 overflow-hidden">
          @for (n of notifications(); track n.id) {
            <div (click)="markRead(n.id)" (keydown.enter)="markRead(n.id)" tabindex="0" role="button"
              class="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand">
              <app-notification-item [notification]="n" (select)="markRead($event)" />
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class StudentNotificationsComponent implements OnInit {
  private readonly notificationService = inject(StudentNotificationService);

  protected readonly notifications = signal<StudentNotification[]>([]);
  protected readonly loading = signal(true);

  protected readonly unreadCount = signal(0);

  ngOnInit(): void {
    this.load();
  }

  protected markRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe(() => this.load());
  }

  protected markAllRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => this.load());
  }

  private load(): void {
    this.loading.set(true);
    this.notificationService.getNotifications().subscribe({
      next: list => {
        this.notifications.set(list);
        this.unreadCount.set(list.filter(n => !n.read).length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
