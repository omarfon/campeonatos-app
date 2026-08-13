import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkshopConfig } from '../../models/event.model';

@Component({
  selector: 'app-workshop-event-config',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1">Nombre del taller</label>
        <input class="input-modern !py-1.5 !text-sm w-full" [ngModel]="config().name" (ngModelChange)="patch({ name: $event })" [disabled]="disabled()" />
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1">Responsable</label>
        <input class="input-modern !py-1.5 !text-sm w-full" [ngModel]="config().responsible" (ngModelChange)="patch({ responsible: $event })" [disabled]="disabled()" />
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1">Instructor</label>
        <input class="input-modern !py-1.5 !text-sm w-full" [ngModel]="config().instructor" (ngModelChange)="patch({ instructor: $event })" [disabled]="disabled()" />
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1">Cupo del taller</label>
        <input type="number" class="input-modern !py-1.5 !text-sm w-full" [ngModel]="config().quota" (ngModelChange)="patch({ quota: +$event })" [disabled]="disabled()" />
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-500 mb-1">Precio S/</label>
        <input type="number" class="input-modern !py-1.5 !text-sm w-full" [ngModel]="config().price" (ngModelChange)="patch({ price: +$event })" [disabled]="disabled()" />
      </div>
    </div>
  `,
})
export class WorkshopEventConfigComponent {
  readonly config = input.required<WorkshopConfig>();
  readonly disabled = input(false);
  readonly configChange = output<WorkshopConfig>();

  protected patch(partial: Partial<WorkshopConfig>): void {
    this.configChange.emit({ ...this.config(), ...partial });
  }
}
