import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClassCreateWizardFacade } from '../../facades/class-create-wizard.facade';
import {
  getCapacityAvailability,
  CAPACITY_AVAILABILITY_LABELS,
} from '../../models/class.model';

@Component({
  selector: 'app-class-capacity',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="capacity" class="block text-sm font-medium text-slate-700 mb-1">Capacidad máxima *</label>
          <input
            id="capacity"
            type="number"
            min="1"
            class="input-modern w-full"
            [ngModel]="facade.draft().capacity"
            (ngModelChange)="facade.patchDraft({ capacity: +$event || 0 })"
          />
        </div>
        <div>
          <label for="min-cap" class="block text-sm font-medium text-slate-700 mb-1">Cupo mínimo</label>
          <input
            id="min-cap"
            type="number"
            min="0"
            class="input-modern w-full"
            [ngModel]="facade.draft().minimumCapacity"
            (ngModelChange)="facade.patchDraft({ minimumCapacity: +$event || 0 })"
          />
        </div>
        <div>
          <label for="warn-cap" class="block text-sm font-medium text-slate-700 mb-1">Alertar cuando queden</label>
          <input
            id="warn-cap"
            type="number"
            min="0"
            class="input-modern w-full"
            [ngModel]="facade.draft().warningCapacity"
            (ngModelChange)="facade.patchDraft({ warningCapacity: +$event || 0 })"
          />
        </div>
      </div>

      <p class="text-sm text-slate-600">
        Estado de cupo (vista previa):
        <span class="font-semibold">{{ availLabel() }}</span>
        — {{ facade.draft().capacity }} disponibles de {{ facade.draft().capacity }}
      </p>

      <label class="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          class="w-4 h-4 rounded border-slate-300"
          [ngModel]="facade.draft().waitingListEnabled"
          (ngModelChange)="facade.patchDraft({ waitingListEnabled: $event })"
        />
        <span class="text-sm font-medium text-slate-700">Permitir lista de espera</span>
      </label>

      @if (facade.draft().waitingListEnabled) {
        <div>
          <label for="wait-max" class="block text-sm font-medium text-slate-700 mb-1">Máximo lista de espera</label>
          <input
            id="wait-max"
            type="number"
            min="1"
            class="input-modern w-32"
            [ngModel]="facade.draft().waitingListMax"
            (ngModelChange)="facade.patchDraft({ waitingListMax: +$event || 0 })"
          />
        </div>
      }

      <fieldset class="space-y-2">
        <legend class="text-sm font-medium text-slate-700">Sobrecupo</legend>
        <label class="flex items-center gap-2">
          <input
            type="radio"
            name="overbook"
            value="none"
            [ngModel]="facade.draft().overbookingPolicy"
            (ngModelChange)="facade.patchDraft({ overbookingPolicy: 'none' })"
          />
          <span class="text-sm">No permitido</span>
        </label>
        <label class="flex items-center gap-2">
          <input
            type="radio"
            name="overbook"
            value="authorized"
            [ngModel]="facade.draft().overbookingPolicy"
            (ngModelChange)="facade.patchDraft({ overbookingPolicy: 'authorized' })"
          />
          <span class="text-sm">Solo con autorización</span>
        </label>
      </fieldset>
    </div>
  `,
})
export class ClassCapacityComponent {
  protected readonly facade = inject(ClassCreateWizardFacade);

  protected availLabel(): string {
    const d = this.facade.draft();
    return CAPACITY_AVAILABILITY_LABELS[
      getCapacityAvailability(d.capacity, d.capacity, d.warningCapacity)
    ];
  }
}
