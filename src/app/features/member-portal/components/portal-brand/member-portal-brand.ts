import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MEMBER_PORTAL_ROUTE_PREFIX } from '../../member-portal.constants';

@Component({
  selector: 'app-member-portal-brand',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (linkToHome()) {
      <a [routerLink]="homeRoute" class="flex items-center gap-3 group" aria-label="Portal Socio — Ir al inicio">
        <span class="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-extrabold text-sm shadow-md shrink-0"
          style="background: linear-gradient(135deg, #1A3263, #b45309)" aria-hidden="true">A</span>
        @if (!compact()) {
          <div class="min-w-0">
            <p class="font-extrabold text-slate-900 tracking-tight leading-tight">AELU</p>
            <p class="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-700">Portal Socio</p>
          </div>
        }
      </a>
    } @else {
      <div class="flex items-center gap-3">
        <span class="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-extrabold text-sm shadow-md shrink-0"
          style="background: linear-gradient(135deg, #1A3263, #b45309)" aria-hidden="true">A</span>
        @if (!compact()) {
          <div class="min-w-0">
            <p class="font-extrabold text-slate-900 tracking-tight leading-tight">AELU</p>
            <p class="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-700">Portal Socio</p>
          </div>
        }
      </div>
    }
  `,
})
export class MemberPortalBrandComponent {
  readonly compact = input(false);
  readonly linkToHome = input(false);
  protected readonly homeRoute = `${MEMBER_PORTAL_ROUTE_PREFIX}/inicio`;
}
