import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { StudentHeaderComponent } from '../components/header/student-header';
import { StudentSidebarComponent } from '../components/sidebar/student-sidebar';
import { StudentMobileNavigationComponent } from '../components/mobile-navigation/student-mobile-navigation';
import { STUDENT_PORTAL_NAME, STUDENT_PORTAL_TAGLINE, MAIN_PORTAL_HOME_ROUTE, MAIN_PORTAL_LABEL } from '../student-portal.constants';

@Component({
  selector: 'app-student-portal-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, StudentHeaderComponent, StudentSidebarComponent, StudentMobileNavigationComponent],
  template: `
    <div class="min-h-screen flex flex-col">
      <app-student-header />
      <div class="flex flex-1 w-full max-w-[90rem] mx-auto px-2 sm:px-4">
        <aside class="hidden lg:flex lg:flex-col w-[17rem] shrink-0 py-4 min-h-0">
          <div class="sp-sidebar flex flex-col h-full min-h-[calc(100vh-7rem)] overflow-hidden">
            <a routerLink="/portal-alumno/inicio"
              class="block shrink-0 px-5 py-5 bg-gradient-to-br from-brand/5 via-sky-50/80 to-teal-50/50 border-b border-slate-100/80 hover:from-brand/10 transition-colors"
              [attr.aria-label]="portalName + ' — Ir al inicio'">
              <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-brand/80">{{ portalName }}</p>
              <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">{{ portalTagline }}</p>
            </a>
            <div class="flex-1 min-h-0 overflow-y-auto">
              <app-student-sidebar />
            </div>
            <div class="p-3 border-t border-slate-100/80 shrink-0 bg-white">
              <a [routerLink]="mainPortalRoute"
                class="btn-secondary w-full text-center block !py-2.5 !text-sm">
                {{ mainPortalLabel }}
              </a>
            </div>
          </div>
        </aside>
        <main class="flex-1 py-4 pb-28 lg:py-6 lg:pb-8 min-w-0">
          <div class="sp-card min-h-[calc(100vh-8rem)] p-4 sm:p-6 lg:p-8 !shadow-none lg:!shadow-[var(--sp-shadow)] border-0 lg:border">
            <router-outlet />
          </div>
        </main>
      </div>
      <app-student-mobile-navigation />
    </div>
  `,
  host: { class: 'block student-portal' },
})
export class StudentPortalLayoutComponent {
  protected readonly portalName = STUDENT_PORTAL_NAME;
  protected readonly portalTagline = STUDENT_PORTAL_TAGLINE;
  protected readonly mainPortalRoute = MAIN_PORTAL_HOME_ROUTE;
  protected readonly mainPortalLabel = MAIN_PORTAL_LABEL;
}
