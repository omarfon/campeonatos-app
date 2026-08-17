import { Injectable, computed, inject, signal } from '@angular/core';
import { MemberActivitiesService } from '../services/member-activities.service';
import { ParticipantContextService } from '../services/participant-context.service';
import {
  MEMBER_ENROLLMENT_WIZARD_STEPS,
  MemberEnrollmentWizardStep,
} from '../enums/member-enrollment-wizard-step.enum';
import {
  MemberActivity,
  MemberActivitySchedule,
  MemberActivityAgreement,
  MemberEnrollmentCalculation,
  MemberEnrollmentResult,
  ParticipantContext,
} from '../models/member-portal.model';
import { MemberScheduleAvailability } from '../enums/member-schedule-availability.enum';

@Injectable()
export class MemberEnrollmentFacade {
  private readonly activitiesService = inject(MemberActivitiesService);
  private readonly participantService = inject(ParticipantContextService);

  readonly currentStep = signal<MemberEnrollmentWizardStep>('participant');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly activity = signal<MemberActivity | null>(null);
  readonly schedules = signal<MemberActivitySchedule[]>([]);
  readonly agreements = signal<MemberActivityAgreement[]>([]);
  readonly selectedAgreementId = signal<number | null>(null);
  readonly agreementChosen = signal(false);
  readonly selectedSchedule = signal<MemberActivitySchedule | null>(null);
  readonly calculation = signal<MemberEnrollmentCalculation | null>(null);
  readonly result = signal<MemberEnrollmentResult | null>(null);
  readonly paymentMethod = signal<'card' | 'transfer' | 'cash'>('card');

  readonly steps = MEMBER_ENROLLMENT_WIZARD_STEPS;

  readonly selectedParticipant = computed(() => this.participantService.selectedParticipant());
  readonly isFullyCovered = computed(() => this.calculation()?.fullyCovered ?? false);

  readonly availableSchedules = computed(() =>
    this.schedules().filter(s => s.availability !== MemberScheduleAvailability.FULL),
  );

  init(options?: { activityId?: number; participantPersonId?: number }): void {
    this.error.set(null);
    if (options?.participantPersonId) {
      try {
        this.participantService.selectParticipantById(options.participantPersonId);
      } catch {
        /* se elige en wizard */
      }
    }
    if (options?.activityId) {
      this.loading.set(true);
      this.activitiesService.getActivity(options.activityId).subscribe({
        next: act => {
          this.activity.set(act ?? null);
          if (act) this.loadSchedules(act.id);
          else this.loading.set(false);
        },
        error: () => {
          this.error.set('No pudimos cargar la actividad seleccionada.');
          this.loading.set(false);
        },
      });
    }
    if (this.selectedParticipant() && options?.activityId) {
      this.currentStep.set('benefits');
      this.loadAgreements();
    } else if (this.selectedParticipant()) {
      this.currentStep.set('benefits');
      this.loadAgreements();
    }
  }

  selectParticipant(participant: ParticipantContext): void {
    if (this.selectedParticipant()?.personId !== participant.personId) {
      this.invalidateFrom('participant');
    }
    this.participantService.selectParticipant(participant);
    this.loadAgreements();
  }

  selectAgreement(id: number | null): void {
    this.invalidateFrom('benefits');
    this.selectedAgreementId.set(id);
    this.agreementChosen.set(true);
  }

  selectSchedule(schedule: MemberActivitySchedule): void {
    if (schedule.availability === MemberScheduleAvailability.FULL) return;
    this.selectedSchedule.set(schedule);
    this.calculation.set(null);
  }

  loadSchedules(activityId: number): void {
    const personId = this.selectedParticipant()?.personId;
    this.loading.set(true);
    this.activitiesService.getSchedules(activityId, personId).subscribe({
      next: list => {
        this.schedules.set(list);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  loadAgreements(): void {
    const personId = this.selectedParticipant()?.personId;
    if (!personId) return;
    this.activitiesService.getAgreements(personId).subscribe({
      next: list => this.agreements.set(list),
    });
  }

  calculate(): void {
    const participant = this.selectedParticipant();
    const act = this.activity();
    const schedule = this.selectedSchedule();
    if (!participant || !act || !schedule) return;
    this.loading.set(true);
    this.error.set(null);
    this.activitiesService.calculateEnrollment(
      participant.personId,
      act.id,
      schedule.id,
      this.selectedAgreementId(),
    ).subscribe({
      next: calc => {
        this.calculation.set(calc);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  confirm(): void {
    const participant = this.selectedParticipant();
    const act = this.activity();
    const schedule = this.selectedSchedule();
    const calc = this.calculation();
    if (!participant || !act || !schedule || !calc) return;

    const runConfirm = () => {
      this.loading.set(true);
      this.activitiesService.confirmEnrollment({
        participantPersonId: participant.personId,
        activityId: act.id,
        scheduleId: schedule.id,
        agreementId: this.selectedAgreementId(),
        paymentMethod: calc.total > 0 ? this.paymentMethod() : undefined,
      }).subscribe({
        next: res => {
          this.result.set(res);
          this.currentStep.set('confirmation');
          this.loading.set(false);
        },
        error: (err: Error) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
    };

    if (calc.total > 0) {
      this.activitiesService.processPayment(calc.total).subscribe({
        next: () => runConfirm(),
        error: () => this.error.set('No pudimos procesar el pago. Intenta nuevamente.'),
      });
    } else {
      runConfirm();
    }
  }

  nextStep(): void {
    const order = this.steps.map(s => s.id);
    const idx = order.indexOf(this.currentStep());
    if (idx >= order.length - 1) return;
    const next = order[idx + 1];
    this.currentStep.set(next);
    this.onEnterStep(next);
  }

  prevStep(): void {
    const order = this.steps.map(s => s.id);
    const idx = order.indexOf(this.currentStep());
    if (idx > 0) this.currentStep.set(order[idx - 1]);
  }

  canContinue(): boolean {
    switch (this.currentStep()) {
      case 'participant': return !!this.selectedParticipant();
      case 'benefits': return this.agreementChosen() || this.agreements().length === 0;
      case 'schedule': return !!this.selectedSchedule();
      case 'summary': return !!this.calculation();
      case 'payment': return this.isFullyCovered() || !!this.paymentMethod();
      default: return false;
    }
  }

  private onEnterStep(step: MemberEnrollmentWizardStep): void {
    if (step === 'schedule' && this.activity()) {
      this.loadSchedules(this.activity()!.id);
    }
    if (step === 'summary' && !this.calculation()) {
      this.calculate();
    }
  }

  private invalidateFrom(from: 'participant' | 'benefits'): void {
    if (from === 'participant') {
      this.selectedAgreementId.set(null);
      this.agreementChosen.set(false);
      this.agreements.set([]);
      this.selectedSchedule.set(null);
      this.schedules.set([]);
    }
    if (from === 'participant' || from === 'benefits') {
      this.selectedSchedule.set(null);
      this.calculation.set(null);
      this.result.set(null);
    }
  }
}
