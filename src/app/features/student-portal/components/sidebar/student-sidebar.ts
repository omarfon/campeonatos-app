import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { STUDENT_PORTAL_ROUTE_PREFIX } from '../../student-portal.constants';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-student-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav aria-label="Menú del Portal Alumno" class="flex-1 space-y-1 p-3">
      @for (item of items; track item.route) {
        <a [routerLink]="item.route" routerLinkActive="nav-active"
          [routerLinkActiveOptions]="{ exact: item.route === homeRoute }"
          class="nav-link group"
          #rla="routerLinkActive"
          [attr.aria-current]="rla.isActive ? 'page' : null">
          <span class="nav-icon" aria-hidden="true">{{ item.icon }}</span>
          <span class="flex-1">{{ item.label }}</span>
          @if (rla.isActive) {
            <span class="w-1.5 h-1.5 rounded-full bg-white/90 shrink-0" aria-hidden="true"></span>
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
      @apply text-white font-semibold shadow-lg shadow-brand/25;
      background: linear-gradient(135deg, #1A3263 0%, #2d4a7c 50%, #0d9488 100%);
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
export class StudentSidebarComponent {
  protected readonly homeRoute = `${STUDENT_PORTAL_ROUTE_PREFIX}/inicio`;
  protected readonly items: NavItem[] = [
    { label: 'Inicio', route: `${STUDENT_PORTAL_ROUTE_PREFIX}/inicio`, icon: '🏠' },
    { label: 'Matrícula', route: `${STUDENT_PORTAL_ROUTE_PREFIX}/matricula`, icon: '📝' },
    { label: 'Mis Cursos', route: `${STUDENT_PORTAL_ROUTE_PREFIX}/cursos`, icon: '📚' },
    { label: 'Horarios', route: `${STUDENT_PORTAL_ROUTE_PREFIX}/horarios`, icon: '📅' },
    { label: 'Asistencia', route: `${STUDENT_PORTAL_ROUTE_PREFIX}/asistencia`, icon: '✓' },
    { label: 'Pagos', route: `${STUDENT_PORTAL_ROUTE_PREFIX}/pagos`, icon: '💳' },
    { label: 'Comunicados', route: `${STUDENT_PORTAL_ROUTE_PREFIX}/comunicados`, icon: '📢' },
  ];
}
