import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FoodConsumptionOption } from '../../models/event.model';
import { ConsumptionType, CONSUMPTION_TYPE_LABELS } from '../../enums/consumption-type.enum';

@Component({
  selector: 'app-food-event-config',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-bold text-slate-700">Opciones de consumo</h4>
        @if (!disabled()) {
          <button type="button" class="btn-primary !text-xs !py-1 !px-3" (click)="addOption()">+ Agregar opción</button>
        }
      </div>
      @for (opt of options(); track opt.id) {
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 border border-slate-200 rounded-lg">
          <input class="input-modern !py-1 !text-xs" placeholder="Nombre" [(ngModel)]="opt.name" [disabled]="disabled()" />
          <select class="input-modern !py-1 !text-xs" [(ngModel)]="opt.type" [disabled]="disabled()">
            @for (t of consumptionTypes; track t) {
              <option [value]="t">{{ typeLabels[t] }}</option>
            }
          </select>
          <input type="number" class="input-modern !py-1 !text-xs" placeholder="Precio adicional" [(ngModel)]="opt.additionalPrice" [disabled]="disabled()" />
          <input type="number" class="input-modern !py-1 !text-xs" placeholder="Stock" [(ngModel)]="opt.stock" [disabled]="disabled()" />
          <label class="flex items-center gap-2 text-xs sm:col-span-2">
            <input type="checkbox" [(ngModel)]="opt.required" [disabled]="disabled()" /> Obligatorio
          </label>
        </div>
      } @empty {
        <p class="text-sm text-slate-400 italic">Agregue menús, bebidas, movilidad u otras opciones.</p>
      }
    </div>
  `,
})
export class FoodEventConfigComponent {
  readonly options = input.required<FoodConsumptionOption[]>();
  readonly disabled = input(false);
  readonly optionsChange = output<FoodConsumptionOption[]>();

  protected readonly consumptionTypes = Object.values(ConsumptionType);
  protected readonly typeLabels = CONSUMPTION_TYPE_LABELS;

  protected addOption(): void {
    const next = [...this.options(), {
      id: crypto.randomUUID(), name: '', type: ConsumptionType.MENU,
      description: '', additionalPrice: 0, stock: 50, required: false,
    }];
    this.optionsChange.emit(next);
  }
}
