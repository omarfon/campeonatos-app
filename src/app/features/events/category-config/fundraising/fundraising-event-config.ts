import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BingoSerie } from '../../models/event.model';

@Component({
  selector: 'app-fundraising-event-config',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="space-y-4">
      <h4 class="text-sm font-bold text-slate-700">Series de Bingo</h4>
      @if (!disabled()) {
        <button type="button" class="btn-primary !text-xs !py-1 !px-3" (click)="addSerie()">+ Crear serie</button>
      }
      @for (serie of series(); track serie.id) {
        <div class="p-3 border border-slate-200 rounded-lg space-y-2 text-sm">
          <input class="input-modern !py-1 !text-xs w-full" placeholder="Nombre serie" [(ngModel)]="serie.name" [disabled]="disabled()" />
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <input type="number" class="input-modern !py-1 !text-xs" placeholder="Nº inicial" [(ngModel)]="serie.startNumber" [disabled]="disabled()" />
            <input type="number" class="input-modern !py-1 !text-xs" placeholder="Nº final" [(ngModel)]="serie.endNumber" [disabled]="disabled()" />
            <input type="number" class="input-modern !py-1 !text-xs" placeholder="Tarjetas" [(ngModel)]="serie.cardCount" [disabled]="disabled()" />
            <input type="number" class="input-modern !py-1 !text-xs" placeholder="Precio S/" [(ngModel)]="serie.price" [disabled]="disabled()" />
          </div>
          <p class="text-xs text-slate-500 font-mono">{{ pad(serie.startNumber) }} → {{ pad(serie.endNumber) }} · {{ serie.cardCount }} tarjetas</p>
        </div>
      } @empty {
        <p class="text-sm text-slate-400 italic">Configure series, lotes y tarjetas de bingo.</p>
      }
    </div>
  `,
})
export class FundraisingEventConfigComponent {
  readonly series = input.required<BingoSerie[]>();
  readonly disabled = input(false);
  readonly seriesChange = output<BingoSerie[]>();

  protected pad(n: number): string {
    return String(n).padStart(6, '0');
  }

  protected addSerie(): void {
    this.seriesChange.emit([...this.series(), {
      id: crypto.randomUUID(), name: 'Serie ' + String.fromCharCode(65 + this.series().length),
      startNumber: 1, endNumber: 1000, cardCount: 1000, price: 15, status: 'generated',
    }]);
  }
}
