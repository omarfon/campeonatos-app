import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MEMBER_PORTAL_ROUTE_PREFIX } from '../../member-portal.constants';
import { MEMBER_PORTAL_MENU } from '../../member-portal-menu.config';

@Component({
  selector: 'app-member-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav aria-label="Menú del Portal Socio" class="flex-1 space-y-1 p-3">
      @for (item of items; track item.route) {
        <a [routerLink]="item.route" routerLinkActive="nav-active"
          [routerLinkActiveOptions]="{ exact: item.route === homeRoute }"
          class="nav-link group"
          #rla="routerLinkActive"
          [attr.aria-current]="rla.isActive ? 'page' : null">
          <span class="nav-icon" aria-hidden="true">{{ item.icon }}</span>
          <span class="flex-1">{{ item.label }}</span>
          @if (item.badge) {
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">{{ item.badge }}</span>
          }
        </a>
      }
    </nav>
  `,
  styles: `
    .nav-link {
      @apply flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-slate-600 transition-all duration-200;
    }
    .nav-link:not(.nav-active):hover {
      @apply bg-slate-50 text-slate-900;
    }
    .nav-active {
      @apply text-white font-semibold shadow-lg;
      background: linear-gradient(135deg, #1A3263 0%, #2d4a7c 45%, #b45309 100%);
      box-shadow: 0 8px 24px -4px rgba(180, 83, 9, 0.25);
    }
    .nav-icon {
      @apply w-9 h-9 rounded-xl flex items-center justify-center text-base transition-colors;
      @apply bg-slate-100/80 group-hover:bg-white;
    }
    .nav-active .nav-icon {
      @apply bg-white/20;
    }
  `,
})
export class MemberSidebarComponent {
  protected readonly homeRoute = `${MEMBER_PORTAL_ROUTE_PREFIX}/inicio`;
  protected readonly items = MEMBER_PORTAL_MENU;
}
