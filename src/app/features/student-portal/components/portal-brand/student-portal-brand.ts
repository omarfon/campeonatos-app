import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  STUDENT_PORTAL_NAME,
  STUDENT_PORTAL_ROUTE_PREFIX,
  STUDENT_PORTAL_SHORT,
  STUDENT_PORTAL_TAGLINE,
} from '../../student-portal.constants';

@Component({
  selector: 'app-student-portal-brand',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (linkToHome()) {
      <a [routerLink]="homeRoute" class="group flex items-center gap-3 min-w-0"
        [attr.aria-label]="STUDENT_PORTAL_NAME + ' — Inicio'">
        <div class="brand-icon group-hover:scale-105 transition-transform duration-200" aria-hidden="true">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824 2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
          </svg>
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="font-extrabold text-slate-900 tracking-tight"
              [class]="compact() ? 'text-base' : 'text-lg'">AELU</span>
            <span class="badge-alumno">{{ STUDENT_PORTAL_SHORT }}</span>
          </div>
          @if (!compact()) {
            <p class="text-xs text-slate-500 truncate hidden sm:block">{{ STUDENT_PORTAL_NAME }}</p>
          }
          @if (showTagline()) {
            <p class="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">{{ STUDENT_PORTAL_TAGLINE }}</p>
          }
        </div>
      </a>
    } @else {
      <div class="flex items-center gap-3 min-w-0">
        <div class="brand-icon" aria-hidden="true">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824 2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
          </svg>
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="font-extrabold text-slate-900 tracking-tight text-lg">AELU</span>
            <span class="badge-alumno">{{ STUDENT_PORTAL_SHORT }}</span>
          </div>
          @if (showTagline()) {
            <p class="text-xs text-slate-500 mt-1">{{ STUDENT_PORTAL_TAGLINE }}</p>
          }
        </div>
      </div>
    }
  `,
  styles: `
    .brand-icon {
      @apply w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-brand/15;
      background: linear-gradient(135deg, #1A3263 0%, #2563eb 50%, #0d9488 100%);
    }
    .badge-alumno {
      @apply inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider;
      @apply bg-teal-50 text-teal-800 border border-teal-200/60;
    }
  `,
})
export class StudentPortalBrandComponent {
  readonly compact = input(false);
  readonly linkToHome = input(true);
  readonly showTagline = input(false);

  protected readonly STUDENT_PORTAL_NAME = STUDENT_PORTAL_NAME;
  protected readonly STUDENT_PORTAL_SHORT = STUDENT_PORTAL_SHORT;
  protected readonly STUDENT_PORTAL_TAGLINE = STUDENT_PORTAL_TAGLINE;
  protected readonly homeRoute = [`${STUDENT_PORTAL_ROUTE_PREFIX}/inicio`];
}
