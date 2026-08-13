import { Component, input, output, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventRate } from '../../models/event.model';
import { ParticipantType, PARTICIPANT_TYPE_LABELS } from '../../enums/participant-type.enum';
import { confirmDialog } from '../../../../shared/confirm-dialog';

@Component({
  selector: 'app-event-rate-matrix',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-bold text-slate-700">Matriz de tarifas</h4>
        @if (!disabled()) {
          <button type="button" class="btn-primary !text-xs !py-1 !px-3" (click)="addNewRate()">+ Agregar tarifa</button>
        }
      </div>

      @if (localRates().length === 0) {
        <p class="text-sm text-slate-400 italic p-4 border border-dashed border-slate-200 rounded-lg text-center">
          Sin tarifas. Agregue al menos una tarifa para socios, invitados o público.
        </p>
      } @else {
        <div class="space-y-3">
          @for (rate of localRates(); track rate.id) {
            <article class="p-4 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label class="block text-[10px] font-semibold text-slate-400 mb-0.5">Categoría socio</label>
                <input class="input-modern !py-1.5 !text-sm w-full" placeholder="Socio, No socio..."
                  [disabled]="disabled()" [ngModel]="rate.memberCategory"
                  (ngModelChange)="patchRate(rate.id, { memberCategory: $event })" />
              </div>
              <div>
                <label class="block text-[10px] font-semibold text-slate-400 mb-0.5">Condición</label>
                <input class="input-modern !py-1.5 !text-sm w-full" placeholder="Habilitado, Con deuda..."
                  [disabled]="disabled()" [ngModel]="rate.condition"
                  (ngModelChange)="patchRate(rate.id, { condition: $event })" />
              </div>
              <div>
                <label class="block text-[10px] font-semibold text-slate-400 mb-0.5">Tipo participante</label>
                <select class="input-modern !py-1.5 !text-sm w-full" [disabled]="disabled()"
                  [ngModel]="rate.participantType" (ngModelChange)="patchRate(rate.id, { participantType: $event })">
                  @for (pt of participantTypes; track pt) {
                    <option [ngValue]="pt">{{ participantLabels[pt] }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-semibold text-slate-400 mb-0.5">Precio (S/)</label>
                <input type="number" class="input-modern !py-1.5 !text-sm w-full font-semibold" min="0" step="0.01"
                  [disabled]="disabled()" [ngModel]="rate.price"
                  (ngModelChange)="patchRate(rate.id, { price: +$event })" />
              </div>
              <div>
                <label class="block text-[10px] font-semibold text-slate-400 mb-0.5">Vigencia desde</label>
                <input type="date" class="input-modern !py-1.5 !text-xs w-full" [disabled]="disabled()"
                  [ngModel]="rate.validFrom" (ngModelChange)="patchRate(rate.id, { validFrom: $event })" />
              </div>
              <div>
                <label class="block text-[10px] font-semibold text-slate-400 mb-0.5">Vigencia hasta</label>
                <input type="date" class="input-modern !py-1.5 !text-xs w-full" [disabled]="disabled()"
                  [ngModel]="rate.validTo" (ngModelChange)="patchRate(rate.id, { validTo: $event })" />
              </div>
              <div>
                <label class="block text-[10px] font-semibold text-slate-400 mb-0.5">Estado</label>
                <select class="input-modern !py-1.5 !text-xs w-full" [disabled]="disabled()"
                  [ngModel]="rate.status" (ngModelChange)="patchRate(rate.id, { status: $event })">
                  <option value="active">Activa</option>
                  <option value="inactive">Inactiva</option>
                </select>
              </div>
              @if (!disabled()) {
                <div class="flex items-end">
                  <button type="button" class="btn-ghost !text-xs !text-red-600 w-full" (click)="removeRate(rate.id)">
                    Eliminar tarifa
                  </button>
                </div>
              }
            </article>
          }
        </div>
        <p class="text-xs text-slate-500">{{ localRates().length }} tarifa(s) · {{ activeCount() }} activa(s)</p>
      }
    </div>
  `,
})
export class EventRateMatrixComponent {
  readonly rates = input.required<EventRate[]>();
  readonly disabled = input(false);
  readonly ratesChange = output<EventRate[]>();

  protected readonly localRates = signal<EventRate[]>([]);
  protected readonly participantTypes = Object.values(ParticipantType);
  protected readonly participantLabels = PARTICIPANT_TYPE_LABELS;

  protected readonly activeCount = computed(() =>
    this.localRates().filter(r => r.status === 'active').length,
  );

  constructor() {
    effect(() => this.localRates.set(structuredClone(this.rates())));
  }

  protected addNewRate(): void {
    const next = [...this.localRates(), {
      id: crypto.randomUUID(),
      memberCategory: 'Socio',
      condition: 'Habilitado',
      participantType: ParticipantType.MEMBER_HOLDER,
      price: 0,
      currency: 'PEN',
      validFrom: '2026-01-01',
      validTo: '2026-12-31',
      status: 'active' as const,
    }];
    this.commit(next);
  }

  protected patchRate(rateId: string, patch: Partial<EventRate>): void {
    this.commit(this.localRates().map(r => r.id === rateId ? { ...r, ...patch } : r));
  }

  protected async removeRate(rateId: string): Promise<void> {
    const rate = this.localRates().find(r => r.id === rateId);
    const ok = await confirmDialog({
      title: 'Eliminar tarifa',
      text: rate ? `¿Eliminar tarifa ${rate.memberCategory} — ${rate.condition}?` : '¿Eliminar esta tarifa?',
      confirmText: 'Eliminar',
    });
    if (!ok) return;
    this.commit(this.localRates().filter(r => r.id !== rateId));
  }

  private commit(rates: EventRate[]): void {
    this.localRates.set(rates);
    this.ratesChange.emit(structuredClone(rates));
  }
}
