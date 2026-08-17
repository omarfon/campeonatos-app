import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MemberActivity } from '../../models/member-portal.model';
import { MEMBER_PORTAL_ROUTE_PREFIX } from '../../member-portal.constants';

@Component({
  selector: 'app-member-activity-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (activity(); as a) {
      <article class="mp-card mp-card-hover flex flex-col h-full overflow-hidden group">
        <div class="h-1.5 w-full shrink-0 discipline-bar" [attr.data-discipline]="a.discipline" aria-hidden="true"></div>
        <div class="p-4 sm:p-5 flex flex-col flex-1">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ a.discipline }}</p>
              <h3 class="font-bold text-slate-900 mt-0.5 leading-snug">{{ a.name }}</h3>
              <p class="text-xs text-slate-500 mt-1">{{ a.level }} · {{ a.modality }}</p>
            </div>
            @if (a.recommended) {
              <span class="shrink-0 text-[10px] font-bold uppercase px-2 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-100">
                Recomendado
              </span>
            }
          </div>
          @if (a.description) {
            <p class="text-sm text-slate-600 mt-3 line-clamp-2">{{ a.description }}</p>
          }
          <dl class="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            <div>
              <dt class="text-xs text-slate-400">Sede</dt>
              <dd class="font-medium text-slate-700 truncate">{{ a.campus }}</dd>
            </div>
            <div>
              <dt class="text-xs text-slate-400">Desde</dt>
              <dd class="font-bold text-slate-900">S/ {{ a.basePrice.toFixed(2) }}</dd>
            </div>
            <div class="col-span-2">
              <dt class="text-xs text-slate-400">Horarios disponibles</dt>
              <dd class="font-medium text-slate-700">{{ a.availableScheduleCount }} de {{ a.scheduleCount }}</dd>
            </div>
          </dl>
          <div class="mt-auto pt-4">
            <a [routerLink]="detailLink()"
              class="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
              style="background: linear-gradient(135deg, #1A3263, #b45309)">
              Ver horarios
            </a>
          </div>
        </div>
      </article>
    }
  `,
  styles: `
    .discipline-bar { background: linear-gradient(90deg, #1A3263, #b45309); }
    .discipline-bar[data-discipline='Natación'] { background: linear-gradient(90deg, #0ea5e9, #06b6d4); }
    .discipline-bar[data-discipline='Karate'] { background: linear-gradient(90deg, #6366f1, #8b5cf6); }
    .discipline-bar[data-discipline='Danza'] { background: linear-gradient(90deg, #ec4899, #f43f5e); }
    .discipline-bar[data-discipline='Tenis'] { background: linear-gradient(90deg, #22c55e, #14b8a6); }
    .discipline-bar[data-discipline='Gimnasio'] { background: linear-gradient(90deg, #f59e0b, #ef4444); }
  `,
})
export class MemberActivityCardComponent {
  readonly activity = input.required<MemberActivity>();

  protected detailLink(): string[] {
    return [`${MEMBER_PORTAL_ROUTE_PREFIX}/actividades`, String(this.activity().id)];
  }
}
