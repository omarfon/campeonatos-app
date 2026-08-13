import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContestCategory } from '../../models/event.model';

@Component({
  selector: 'app-contest-event-config',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-bold text-slate-700">Categorías de participación</h4>
        @if (!disabled()) {
          <button type="button" class="btn-primary !text-xs !py-1 !px-3" (click)="addCategory()">+ Categoría</button>
        }
      </div>
      @for (cat of categories(); track cat.id) {
        <div class="p-3 border border-slate-200 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
          <input class="input-modern !py-1 !text-xs" placeholder="Nombre" [(ngModel)]="cat.name" [disabled]="disabled()" />
          <input type="number" class="input-modern !py-1 !text-xs" placeholder="Edad mín." [(ngModel)]="cat.minAge" [disabled]="disabled()" />
          <input type="number" class="input-modern !py-1 !text-xs" placeholder="Edad máx." [(ngModel)]="cat.maxAge" [disabled]="disabled()" />
          <input type="number" class="input-modern !py-1 !text-xs" placeholder="Cupo" [(ngModel)]="cat.quota" [disabled]="disabled()" />
          <input type="number" class="input-modern !py-1 !text-xs" placeholder="Tarifa S/" [(ngModel)]="cat.rate" [disabled]="disabled()" />
        </div>
      } @empty {
        <p class="text-sm text-slate-400 italic">Defina categorías con edad, cupo y tarifa propia.</p>
      }
    </div>
  `,
})
export class ContestEventConfigComponent {
  readonly categories = input.required<ContestCategory[]>();
  readonly disabled = input(false);
  readonly categoriesChange = output<ContestCategory[]>();

  protected addCategory(): void {
    this.categoriesChange.emit([...this.categories(), {
      id: crypto.randomUUID(), name: '', description: '', minAge: 0, maxAge: 99,
      quota: 30, registeredCount: 0, rate: 0, status: 'active',
    }]);
  }
}
