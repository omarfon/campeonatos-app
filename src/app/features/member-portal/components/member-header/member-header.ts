import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MemberSessionService } from '../../services/member-session.service';
import { MemberDashboardService } from '../../services/member-dashboard.service';
import { MemberPortalBrandComponent } from '../portal-brand/member-portal-brand';
import {
  MEMBER_PORTAL_ROUTE_PREFIX,
  MAIN_PORTAL_HOME_ROUTE,
  MAIN_PORTAL_LABEL,
  MEMBER_PORTAL_LOGIN_ROUTE,
} from '../../member-portal.constants';
import { MemberNotification } from '../../models/member-portal.model';

@Component({
  selector: 'app-member-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MemberPortalBrandComponent],
  template: `
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/60">
      <div class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" aria-hidden="true"></div>
      <div class="flex items-center gap-3 max-w-[90rem] mx-auto px-4 sm:px-6 py-3.5">
        <app-member-portal-brand [compact]="true" />

        <a [routerLink]="mainPortalRoute"
          class="btn-secondary !py-2 !px-3.5 !text-xs sm:!text-sm !rounded-xl shrink-0">
          {{ mainPortalLabel }}
        </a>

        <div class="flex-1 max-w-sm hidden md:block ml-2">
          <label for="portal-socio-search" class="sr-only">Buscar en Portal Socio</label>
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input id="portal-socio-search" type="search" placeholder="Buscar actividades, eventos..."
              class="input-modern !py-2.5 !pl-10 !text-sm w-full !rounded-2xl !border-slate-200/80 !bg-slate-50/50 focus:!bg-white" />
          </div>
        </div>

        <div class="flex items-center gap-1.5 ml-auto">
          <div class="relative">
            <button type="button" class="relative p-2.5 rounded-2xl hover:bg-slate-100/80 transition-colors"
              [attr.aria-expanded]="notifOpen()"
              aria-label="Notificaciones"
              (click)="toggleNotifications()">
              <svg class="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              @if (unreadCount() > 0) {
                <span class="absolute top-1.5 right-1.5 min-w-[1.125rem] h-[1.125rem] px-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {{ unreadCount() }}
                </span>
              }
            </button>
            @if (notifOpen()) {
              <div class="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] mp-card z-50 overflow-hidden !p-0"
                role="dialog" aria-label="Notificaciones recientes">
                <div class="px-4 py-3.5 flex justify-between items-center bg-gradient-to-r from-slate-50 to-amber-50/50 border-b border-slate-100">
                  <h2 class="font-bold text-slate-900 text-sm">Notificaciones</h2>
                </div>
                <div class="max-h-80 overflow-y-auto">
                  @for (n of notifications(); track n.id) {
                    <a [routerLink]="n.actionRoute ?? notificationsRoute"
                      class="block p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors"
                      (click)="closePanels()">
                      @if (!n.read) {
                        <span class="inline-block w-2 h-2 rounded-full bg-amber-500 mb-1" aria-hidden="true"></span>
                      }
                      <p class="font-semibold text-slate-900 text-sm">{{ n.title }}</p>
                      <p class="text-xs text-slate-600 mt-1 line-clamp-2">{{ n.description }}</p>
                      <p class="text-xs text-slate-400 mt-1">{{ n.relativeDate }}</p>
                    </a>
                  } @empty {
                    <p class="p-6 text-sm text-slate-400 text-center">No tienes notificaciones.</p>
                  }
                </div>
                <a [routerLink]="notificationsRoute" class="block text-center py-3.5 text-sm font-semibold text-brand hover:bg-slate-50 border-t border-slate-100"
                  (click)="closePanels()">
                  Ver todas
                </a>
              </div>
            }
          </div>

          <div class="relative">
            <button type="button"
              class="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
              [attr.aria-expanded]="profileOpen()"
              aria-haspopup="menu"
              aria-label="Mi perfil"
              (click)="toggleProfile()">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
            @if (profileOpen()) {
              <div class="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] mp-card z-50 overflow-hidden !p-0"
                role="menu" aria-label="Menú de perfil">
                <div class="px-4 py-4 border-b border-slate-100"
                  style="background: linear-gradient(135deg, rgba(26,50,99,0.06) 0%, rgba(180,83,9,0.08) 100%)">
                  <div class="flex items-center gap-3">
                    <span class="w-12 h-12 rounded-2xl text-white font-bold flex items-center justify-center shrink-0 shadow-lg"
                      style="background: linear-gradient(135deg, #1A3263, #b45309)"
                      aria-hidden="true">
                      {{ initials() }}
                    </span>
                    <div class="min-w-0">
                      <p class="font-bold text-slate-900 truncate">{{ session()?.fullName }}</p>
                      <p class="text-xs text-slate-500 font-mono mt-0.5">{{ session()?.memberCode }}</p>
                    </div>
                  </div>
                </div>
                <div class="px-4 py-3 space-y-2 text-sm border-b border-slate-100">
                  <div class="flex justify-between gap-2 py-0.5">
                    <span class="text-slate-500">Correo</span>
                    <span class="font-medium text-slate-800 truncate max-w-[10rem] text-right">{{ session()?.email }}</span>
                  </div>
                </div>
                <div class="py-1">
                  <a [routerLink]="profileRoute" role="menuitem"
                    class="block w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    (click)="closePanels()">
                    Mi perfil
                  </a>
                  <button type="button" role="menuitem"
                    class="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                    (click)="logout()">
                    Cerrar sesión
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </header>
  `,
  host: {
    class: 'block',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class MemberHeaderComponent implements OnInit {
  private readonly sessionService = inject(MemberSessionService);
  private readonly dashboardService = inject(MemberDashboardService);
  private readonly router = inject(Router);

  protected readonly session = this.sessionService.session;
  protected readonly notifications = signal<MemberNotification[]>([]);
  protected readonly unreadCount = signal(0);
  protected readonly notifOpen = signal(false);
  protected readonly profileOpen = signal(false);
  protected readonly notificationsRoute = [`${MEMBER_PORTAL_ROUTE_PREFIX}/notificaciones`];
  protected readonly profileRoute = `${MEMBER_PORTAL_ROUTE_PREFIX}/perfil`;
  protected readonly mainPortalRoute = MAIN_PORTAL_HOME_ROUTE;
  protected readonly mainPortalLabel = MAIN_PORTAL_LABEL;

  ngOnInit(): void {
    this.dashboardService.getRecentNotifications().subscribe(list => this.notifications.set(list));
    this.dashboardService.getUnreadCount().subscribe(c => this.unreadCount.set(c));
  }

  protected initials(): string {
    const name = this.session()?.fullName ?? '';
    return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }

  protected toggleNotifications(): void {
    this.profileOpen.set(false);
    this.notifOpen.update(v => !v);
  }

  protected toggleProfile(): void {
    this.notifOpen.set(false);
    this.profileOpen.update(v => !v);
  }

  protected closePanels(): void {
    this.notifOpen.set(false);
    this.profileOpen.set(false);
  }

  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('app-member-header')) this.closePanels();
  }

  protected logout(): void {
    this.sessionService.logout();
    this.closePanels();
    void this.router.navigate([MEMBER_PORTAL_LOGIN_ROUTE]);
  }
}
