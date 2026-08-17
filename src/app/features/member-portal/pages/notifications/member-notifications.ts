import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MemberNotificationService } from '../../services/member-notification.service';
import { MemberNotification } from '../../models/member-portal.model';
import { MemberNotificationItemComponent } from '../../components/member-notification-item/member-notification-item';
import { MemberEmptyStateComponent } from '../../components/empty-state/member-empty-state';

@Component({
  selector: 'app-member-notifications',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MemberNotificationItemComponent, MemberEmptyStateComponent],
  template: `
    <div class="space-y-6">
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="mp-page-title">Notificaciones</h1>
          <p class="mp-page-subtitle">Avisos de pagos, actividades y tu familia.</p>
        </div>
        @if (unreadCount() > 0) {
          <button type="button" class="btn-secondary !text-sm" (click)="markAllRead()">
            Marcar todas como leídas
          </button>
        }
      </header>

      @if (loading()) {
        <div class="mp-card animate-pulse">
          @for (i of [1, 2, 3]; track i) {
            <div class="p-4 border-b border-slate-100">
              <div class="h-4 bg-slate-200 rounded w-3/4"></div>
            </div>
          }
        </div>
      } @else if (notifications().length === 0) {
        <app-member-empty-state
          title="Sin notificaciones"
          description="No tienes notificaciones por el momento."
          icon="🔔"
        />
      } @else {
        <div class="mp-card !p-0 overflow-hidden">
          @for (n of notifications(); track n.id) {
            <div (click)="markRead(n.id)" (keydown.enter)="markRead(n.id)" tabindex="0" role="button"
              class="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand">
              <app-member-notification-item [notification]="n" />
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class MemberNotificationsPageComponent implements OnInit {
  private readonly notificationService = inject(MemberNotificationService);

  protected readonly notifications = signal<MemberNotification[]>([]);
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
