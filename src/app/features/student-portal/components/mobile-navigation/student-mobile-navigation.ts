import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { STUDENT_PORTAL_ROUTE_PREFIX } from '../../student-portal.constants';

@Component({
  selector: 'app-student-mobile-navigation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav aria-label="Navegación móvil — Portal Alumno"
      class="sp-mobile-nav lg:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-3 pt-1">
      <div class="grid grid-cols-5 gap-1 max-w-lg mx-auto bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-100/80 shadow-lg shadow-slate-200/50 p-1">
        @for (item of items; track item.route) {
          <a [routerLink]="item.route" routerLinkActive="mobile-active"
            [routerLinkActiveOptions]="{ exact: item.route === homeRoute }"
            class="mobile-link flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl text-[10px] font-semibold text-slate-500 transition-all">
            <span class="text-xl leading-none transition-transform" aria-hidden="true">{{ item.icon }}</span>
            {{ item.label }}
          </a>
        }
      </div>
    </nav>
  `,
  styles: `
    .mobile-link.mobile-active {
      @apply text-brand bg-brand/5;
    }
    .mobile-active span:first-child {
      transform: scale(1.1);
    }
  `,
  host: { class: 'block lg:hidden' },
})
export class StudentMobileNavigationComponent {
  protected readonly homeRoute = `${STUDENT_PORTAL_ROUTE_PREFIX}/inicio`;
  protected readonly items = [
    { label: 'Inicio', route: `${STUDENT_PORTAL_ROUTE_PREFIX}/inicio`, icon: '🏠' },
    { label: 'Cursos', route: `${STUDENT_PORTAL_ROUTE_PREFIX}/cursos`, icon: '📚' },
    { label: 'Matrícula', route: `${STUDENT_PORTAL_ROUTE_PREFIX}/matricula`, icon: '📝' },
    { label: 'Horario', route: `${STUDENT_PORTAL_ROUTE_PREFIX}/horarios`, icon: '📅' },
    { label: 'Pagos', route: `${STUDENT_PORTAL_ROUTE_PREFIX}/pagos`, icon: '💳' },
  ];
}
