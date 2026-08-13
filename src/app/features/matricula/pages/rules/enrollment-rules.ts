import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { EnrollmentRuleService } from '../../services/enrollment-rule.service';
import { EnrollmentRule } from '../../models/enrollment.model';
import { ENROLLMENT_RULE_TYPE_LABELS } from '../../enums/enrollment-rule-type.enum';

@Component({
  selector: 'app-enrollment-rules-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-extrabold">Reglas de matrícula</h1>
      <p class="text-sm text-slate-500">Configuración MOCK preparada para integración con backend</p>
      <div class="space-y-3">
        @for (r of rules(); track r.id) {
          <div class="section-card p-4">
            <div class="flex justify-between gap-4">
              <div>
                <p class="font-mono text-xs text-slate-500">{{ r.code }}</p>
                <p class="font-bold">{{ r.name }}</p>
                <p class="text-sm text-slate-600 mt-1">{{ r.description }}</p>
              </div>
              <div class="text-right text-sm shrink-0">
                <p class="text-slate-500">TIPO</p>
                <p class="font-semibold">{{ typeLabel(r.type) }}</p>
                <p class="text-xs mt-2">Aplica a: {{ r.appliesTo }}</p>
                <p class="text-xs font-semibold"
                  [class]="r.resultType === 'blocking' ? 'text-red-600' : 'text-amber-600'">
                  {{ r.resultType === 'blocking' ? 'Bloqueante' : 'Advertencia' }}
                </p>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class EnrollmentRulesPageComponent implements OnInit {
  private readonly service = inject(EnrollmentRuleService);
  protected readonly rules = signal<EnrollmentRule[]>([]);

  ngOnInit(): void {
    this.service.getRules().subscribe(list => this.rules.set(list));
  }

  protected typeLabel(t: EnrollmentRule['type']): string {
    return ENROLLMENT_RULE_TYPE_LABELS[t];
  }
}
