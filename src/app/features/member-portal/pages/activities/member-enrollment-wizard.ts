import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MemberEnrollmentFacade } from '../../facades/member-enrollment.facade';
import { ParticipantSelectorComponent } from '../../components/participant-selector/participant-selector';
import { MemberScheduleCardComponent } from '../../components/member-schedule-card/member-schedule-card';
import { MEMBER_PORTAL_ROUTE_PREFIX } from '../../member-portal.constants';

@Component({
  selector: 'app-member-enrollment-wizard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MemberEnrollmentFacade],
  imports: [RouterLink, FormsModule, ParticipantSelectorComponent, MemberScheduleCardComponent],
  template: `
    <div class="space-y-6">
      <nav class="text-sm text-slate-500">
        <a [routerLink]="activitiesRoute" class="hover:text-brand">Actividades</a>
        <span class="mx-2">/</span>
        <span class="text-slate-800 font-medium">Inscripción</span>
      </nav>

      <h1 class="mp-page-title">Inscripción a actividad</h1>

      @if (facade.activity(); as act) {
        <div class="mp-card p-4 border-l-4 border-amber-500 bg-amber-50/40">
          <p class="font-bold text-slate-900">{{ act.name }}</p>
          <p class="text-sm text-slate-600">{{ act.discipline }} · {{ act.level }}</p>
        </div>
      }

      @if (facade.error(); as err) {
        <div class="mp-card p-4 border-l-4 border-rose-500 bg-rose-50 text-rose-800 text-sm" role="alert">{{ err }}</div>
      }

      <nav aria-label="Pasos de inscripción" class="flex gap-2 overflow-x-auto pb-1">
        @for (s of facade.steps; track s.id) {
          <span class="text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap"
            [class]="facade.currentStep() === s.id ? 'text-white' : 'bg-slate-100 text-slate-600'"
            [style.background]="facade.currentStep() === s.id ? 'linear-gradient(135deg, #1A3263, #b45309)' : null">
            {{ s.order }}. {{ s.label }}
          </span>
        }
      </nav>

      @if (facade.loading() && facade.currentStep() !== 'confirmation') {
        <div class="mp-card p-8 text-center text-slate-500 animate-pulse">Procesando...</div>
      } @else {
        @switch (facade.currentStep()) {
          @case ('participant') {
            <app-participant-selector
              label="¿Para quién es la inscripción?"
              (participantSelected)="facade.selectParticipant($event)" />
            @if (facade.selectedParticipant(); as p) {
              <p class="text-sm text-slate-600">Inscribiendo a: <strong>{{ p.fullName }}</strong></p>
            }
          }
          @case ('benefits') {
            <div class="mp-card p-5 space-y-4">
              <h2 class="text-lg font-bold text-slate-900">Beneficios y convenios</h2>
              <p class="text-sm text-slate-500">Selecciona un beneficio aplicable o continúa con tarifa regular.</p>
              <div class="space-y-2">
                <label class="flex items-start gap-3 p-3 rounded-xl border cursor-pointer hover:bg-slate-50">
                  <input type="radio" name="agreement" class="mt-1"
                    [checked]="facade.selectedAgreementId() === null && facade.agreementChosen()"
                    (change)="facade.selectAgreement(null)" />
                  <span>
                    <span class="font-semibold text-slate-900">Sin beneficio</span>
                    <span class="block text-xs text-slate-500">Tarifa regular</span>
                  </span>
                </label>
                @for (ag of facade.agreements(); track ag.id) {
                  <label class="flex items-start gap-3 p-3 rounded-xl border cursor-pointer hover:bg-slate-50">
                    <input type="radio" name="agreement" class="mt-1"
                      [checked]="facade.selectedAgreementId() === ag.id"
                      (change)="facade.selectAgreement(ag.id)" />
                    <span>
                      <span class="font-semibold text-slate-900">{{ ag.name }}</span>
                      <span class="block text-xs text-amber-700">{{ ag.discountPercent }}% de beneficio</span>
                      <span class="block text-xs text-slate-500 mt-0.5">{{ ag.description }}</span>
                    </span>
                  </label>
                }
              </div>
            </div>
          }
          @case ('schedule') {
            <div class="space-y-4">
              <h2 class="text-lg font-bold text-slate-900">Selecciona un horario</h2>
              @if (facade.availableSchedules().length === 0) {
                <p class="text-sm text-slate-500">No hay horarios con cupos para esta actividad.</p>
              } @else {
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  @for (s of facade.schedules(); track s.id) {
                    <app-member-schedule-card
                      [schedule]="s"
                      [selected]="facade.selectedSchedule()?.id === s.id"
                      (scheduleSelect)="facade.selectSchedule($event)" />
                  }
                </div>
              }
            </div>
          }
          @case ('summary') {
            @if (facade.calculation(); as calc) {
              <div class="mp-card p-5 space-y-4">
                <h2 class="text-lg font-bold text-slate-900">Resumen</h2>
                @if (facade.selectedParticipant(); as p) {
                  <p class="text-sm text-slate-600">Participante: <strong>{{ p.fullName }}</strong></p>
                }
                @if (facade.selectedSchedule(); as sch) {
                  <p class="text-sm text-slate-600">Horario: {{ sch.days }} · {{ sch.timeStart }} – {{ sch.timeEnd }}</p>
                }
                <ul class="space-y-2 border-t border-slate-100 pt-4">
                  @for (line of calc.lines; track line.conceptName) {
                    <li class="flex justify-between text-sm">
                      <span [class.text-emerald-700]="line.isDiscount">{{ line.conceptName }}</span>
                      <span class="font-medium">S/ {{ line.amount.toFixed(2) }}</span>
                    </li>
                  }
                </ul>
                <div class="flex justify-between font-bold text-lg border-t border-slate-200 pt-3">
                  <span>TOTAL</span>
                  <span>S/ {{ calc.total.toFixed(2) }}</span>
                </div>
                @if (calc.fullyCovered || calc.total === 0) {
                  <p class="text-sm text-emerald-700 font-semibold">Inscripción cubierta por beneficio — sin pago requerido.</p>
                }
              </div>
            }
          }
          @case ('payment') {
            @if (facade.isFullyCovered()) {
              <div class="mp-card p-5 text-center">
                <p class="font-semibold text-emerald-700">No necesitas realizar un pago.</p>
                <button type="button" class="btn-primary mt-4" (click)="facade.confirm()">Confirmar inscripción</button>
              </div>
            } @else {
              <div class="mp-card p-5 space-y-4">
                <h2 class="text-lg font-bold text-slate-900">Método de pago</h2>
                <p class="text-sm text-slate-500">Procesamiento simulado — no se realizará un cargo real.</p>
                <select class="input-modern w-full max-w-xs" [ngModel]="facade.paymentMethod()"
                  (ngModelChange)="facade.paymentMethod.set($event)">
                  <option value="card">Tarjeta Visa / Mastercard</option>
                  <option value="transfer">Transferencia</option>
                  <option value="cash">Pago en ventanilla</option>
                </select>
              </div>
            }
          }
          @case ('confirmation') {
            @if (facade.result(); as res) {
              <div class="mp-card p-8 text-center space-y-4">
                <p class="text-4xl" aria-hidden="true">✅</p>
                <h2 class="text-xl font-extrabold text-slate-900">¡Inscripción confirmada!</h2>
                <p class="text-sm text-slate-600">Código: <span class="font-mono font-bold">{{ res.enrollment.code }}</span></p>
                <p class="text-sm text-slate-600">{{ res.enrollment.activityName }} — {{ res.enrollment.participantName }}</p>
                @if (res.paymentReference) {
                  <p class="text-xs text-slate-500">Referencia de pago: {{ res.paymentReference }}</p>
                }
                <div class="flex flex-wrap justify-center gap-3 pt-2">
                  <a [routerLink]="myActivitiesRoute" class="btn-primary !text-sm">Ver mis actividades</a>
                  <a [routerLink]="activitiesRoute" class="btn-secondary !text-sm">Explorar más actividades</a>
                </div>
              </div>
            }
          }
        }

        @if (facade.currentStep() !== 'confirmation') {
          <div class="flex flex-wrap gap-3 pt-2">
            @if (facade.currentStep() !== 'participant') {
              <button type="button" class="btn-secondary" (click)="facade.prevStep()">Anterior</button>
            }
            @if (facade.currentStep() === 'payment') {
              <button type="button" class="btn-primary" [disabled]="!facade.canContinue() || facade.loading()"
                (click)="facade.confirm()">
                Confirmar y pagar
              </button>
            } @else if (facade.currentStep() !== 'confirmation') {
              <button type="button" class="btn-primary" [disabled]="!facade.canContinue() || facade.loading()"
                (click)="facade.nextStep()">
                Continuar
              </button>
            }
          </div>
        }
      }
    </div>
  `,
})
export class MemberEnrollmentWizardPageComponent implements OnInit {
  protected readonly facade = inject(MemberEnrollmentFacade);
  private readonly route = inject(ActivatedRoute);

  protected readonly activitiesRoute = `${MEMBER_PORTAL_ROUTE_PREFIX}/actividades`;
  protected readonly myActivitiesRoute = `${MEMBER_PORTAL_ROUTE_PREFIX}/mis-actividades`;

  ngOnInit(): void {
    const activityId = Number(this.route.snapshot.queryParamMap.get('actividad'));
    const participantId = Number(this.route.snapshot.queryParamMap.get('participante'));
    this.facade.init({
      activityId: activityId && !Number.isNaN(activityId) ? activityId : undefined,
      participantPersonId: participantId && !Number.isNaN(participantId) ? participantId : undefined,
    });
  }
}
