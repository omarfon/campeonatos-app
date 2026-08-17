import { Component, inject, input, output, ChangeDetectionStrategy, computed } from '@angular/core';
import { ParticipantContext } from '../../models/member-portal.model';
import { ParticipantContextService } from '../../services/participant-context.service';

@Component({
  selector: 'app-participant-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset class="mp-card p-4 sm:p-5 space-y-3">
      <legend class="text-sm font-bold text-slate-900 px-1">{{ label() }}</legend>

      @if (participants().length === 0) {
        <p class="text-sm text-slate-500">No hay participantes disponibles.</p>
      } @else {
        <div class="grid grid-cols-2 gap-3 sm:gap-4" role="radiogroup" [attr.aria-label]="label()">
          @for (p of participants(); track p.personId) {
            <label class="flex items-center gap-2 sm:gap-3 p-3 rounded-xl border cursor-pointer min-h-[4.5rem]"
              [class.border-amber-400]="selectedId() === p.personId"
              [class.bg-amber-50]="selectedId() === p.personId"
              [class.border-slate-200]="selectedId() !== p.personId"
              [class.hover:bg-slate-50]="selectedId() !== p.personId">
              <input type="radio" class="sr-only"
                name="participant-selector"
                [value]="p.personId"
                [checked]="selectedId() === p.personId"
                (change)="onSelect(p)" />
              <span class="w-9 h-9 rounded-xl text-white font-bold text-xs flex items-center justify-center shrink-0"
                style="background: linear-gradient(135deg, #1A3263, #b45309)"
                aria-hidden="true">
                {{ initials(p.fullName) }}
              </span>
              <span class="flex-1 min-w-0">
                <span class="block font-semibold text-slate-900 text-sm leading-tight truncate">{{ p.fullName }}</span>
                <span class="block text-xs text-slate-500 truncate">{{ p.relationship }}</span>
              </span>
              @if (selectedId() === p.personId) {
                <span class="w-2 h-2 rounded-full bg-brand shrink-0" aria-hidden="true"></span>
              }
            </label>
          }
        </div>
      }

      @if (validationError()) {
        <p class="text-sm text-rose-600" role="alert">{{ validationError() }}</p>
      }
    </fieldset>
  `,
})
export class ParticipantSelectorComponent {
  private readonly participantService = inject(ParticipantContextService);

  readonly label = input('¿Para quién?');
  readonly validationError = input<string | null>(null);
  readonly participantSelected = output<ParticipantContext>();

  protected readonly participants = this.participantService.authorizedParticipants;
  protected readonly selectedId = computed(() => this.participantService.selectedParticipant()?.personId ?? null);

  protected onSelect(participant: ParticipantContext): void {
    try {
      this.participantService.selectParticipant(participant);
      this.participantSelected.emit(participant);
    } catch (err) {
      // El padre puede mostrar validationError vía input
    }
  }

  protected initials(name: string): string {
    return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }
}
