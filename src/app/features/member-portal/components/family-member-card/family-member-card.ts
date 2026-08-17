import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { FamilyMember } from '../../models/member-portal.model';
import { MemberStatusComponent } from '../member-status/member-status';

@Component({
  selector: 'app-family-member-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MemberStatusComponent],
  template: `
    <button type="button"
      class="mp-card w-full text-left p-5"
      [class.ring-2]="selected()"
      [class.ring-brand]="selected()"
      [class.border-brand]="selected()"
      [class.mp-card-hover]="!selected()"
      [attr.aria-pressed]="selected()"
      [attr.aria-label]="'Ver datos de ' + member().fullName"
      (click)="memberSelected.emit(member())">
      <div class="flex items-start gap-4">
        <span class="w-14 h-14 rounded-2xl text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-md"
          style="background: linear-gradient(135deg, #1A3263, #b45309)"
          aria-hidden="true">
          {{ initials() }}
        </span>
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 class="font-bold text-slate-900 text-lg leading-tight">{{ member().fullName }}</h2>
              <p class="text-sm text-slate-500 mt-0.5">{{ member().relationship }} · {{ member().age }} años</p>
            </div>
            <app-member-status [status]="member().status" />
          </div>

          @if (member().activeActivities.length > 0) {
            <div class="mt-3">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Actividades</p>
              <p class="text-sm font-medium text-slate-700">{{ member().activeActivities.join(', ') }}</p>
            </div>
          } @else if (member().isHolder) {
            <p class="text-sm text-slate-400 mt-3">Titular de la membresía</p>
          }

          @if (member().nextActivityLabel) {
            <p class="text-xs text-brand font-semibold mt-2">
              Próxima actividad: {{ member().nextActivityLabel }}
            </p>
          }
        </div>
      </div>
    </button>
  `,
})
export class FamilyMemberCardComponent {
  readonly member = input.required<FamilyMember>();
  readonly selected = input(false);

  readonly memberSelected = output<FamilyMember>();

  protected initials(): string {
    return this.member().fullName
      .split(' ')
      .map(p => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
