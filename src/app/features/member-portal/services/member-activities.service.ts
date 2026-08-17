import { Injectable, inject } from '@angular/core';
import { delay, map, Observable, of, switchMap, throwError } from 'rxjs';
import {
  MemberActivity,
  MemberActivitySchedule,
  MemberActivityEnrollment,
  MemberActivityAgreement,
  MemberActivityFilters,
  MemberEnrollmentContext,
  MemberEnrollmentCalculation,
  MemberEnrollmentCalculationLine,
  MemberEnrollmentRequest,
  MemberEnrollmentResult,
} from '../models/member-portal.model';
import { MemberScheduleAvailability } from '../enums/member-schedule-availability.enum';
import { MemberSessionService } from './member-session.service';
import { ParticipantContextService } from './participant-context.service';
import {
  MOCK_MEMBER_ACTIVITIES,
  MOCK_MEMBER_SCHEDULES,
  MOCK_MEMBER_ACTIVITY_ENROLLMENTS,
  MOCK_MEMBER_AGREEMENTS,
} from '../mocks/member-activities.mock';
import { filterMemberActivities, filterSchedulesByDay } from '../utils/member-activity-filter';
import { EnrollmentChargeService } from '../../matricula/services/enrollment-charge.service';
import { EnrollmentCourseService } from '../../matricula/services/enrollment-course.service';
import { EnrollmentStudentService } from '../../matricula/services/enrollment-student.service';
import { EnrollmentAgreementService } from '../../matricula/services/enrollment-agreement.service';
import { MEMBER_PERSON_TO_STUDENT } from '../mocks/member-activities.mock';

@Injectable({ providedIn: 'root' })
export class MemberActivitiesService {
  private readonly sessionService = inject(MemberSessionService);
  private readonly participantService = inject(ParticipantContextService);
  private readonly chargeService = inject(EnrollmentChargeService);
  private readonly courseService = inject(EnrollmentCourseService);
  private readonly studentService = inject(EnrollmentStudentService);
  private readonly agreementService = inject(EnrollmentAgreementService);

  getActivities(filters: MemberActivityFilters = {}): Observable<MemberActivity[]> {
    this.sessionService.requireMemberId();
    const availabilityMap = this.buildAvailabilityMap();
    let list = filterMemberActivities(MOCK_MEMBER_ACTIVITIES, filters, availabilityMap);
    if (filters.day && filters.day !== 'all') {
      const activityIdsWithDay = new Set(
        filterSchedulesByDay(MOCK_MEMBER_SCHEDULES, filters.day).map(s => s.activityId),
      );
      list = list.filter(a => activityIdsWithDay.has(a.id));
    }
    return of(list).pipe(delay(300));
  }

  getActivity(id: number): Observable<MemberActivity | undefined> {
    this.sessionService.requireMemberId();
    return of(MOCK_MEMBER_ACTIVITIES.find(a => a.id === id)).pipe(delay(200));
  }

  getSchedules(activityId: number, participantPersonId?: number): Observable<MemberActivitySchedule[]> {
    this.sessionService.requireMemberId();
    if (participantPersonId != null) {
      return this.participantService.validateParticipant(participantPersonId).pipe(
        switchMap(() => of(MOCK_MEMBER_SCHEDULES.filter(s => s.activityId === activityId))),
        delay(250),
      );
    }
    return of(MOCK_MEMBER_SCHEDULES.filter(s => s.activityId === activityId)).pipe(delay(250));
  }

  getMyEnrollments(participantPersonId?: number | 'all'): Observable<MemberActivityEnrollment[]> {
    this.sessionService.requireMemberId();
    let list = [...MOCK_MEMBER_ACTIVITY_ENROLLMENTS];
    if (participantPersonId != null && participantPersonId !== 'all') {
      list = list.filter(e => e.participantPersonId === participantPersonId);
    }
    return of(list).pipe(delay(300));
  }

  getAgreements(participantPersonId: number): Observable<MemberActivityAgreement[]> {
    return this.participantService.validateParticipant(participantPersonId).pipe(
      switchMap(() => {
        const studentId = MEMBER_PERSON_TO_STUDENT[participantPersonId];
        if (!studentId) return of([...MOCK_MEMBER_AGREEMENTS]);
        return this.agreementService.getAvailableAgreements(studentId).pipe(
          map(list => list.length > 0
            ? list.map(a => ({
                id: a.id,
                name: a.name,
                description: a.description ?? a.benefitSummary,
                discountPercent: a.coveragePercentage,
              }))
            : [...MOCK_MEMBER_AGREEMENTS]),
        );
      }),
      delay(200),
    );
  }

  getEnrollmentContext(participantPersonId: number): Observable<MemberEnrollmentContext> {
    return this.participantService.validateParticipant(participantPersonId).pipe(
      map(() => ({ canEnroll: true } satisfies MemberEnrollmentContext)),
      delay(150),
    );
  }

  calculateEnrollment(
    participantPersonId: number,
    activityId: number,
    scheduleId: number,
    agreementId?: number | null,
  ): Observable<MemberEnrollmentCalculation> {
    return this.participantService.validateParticipant(participantPersonId).pipe(
      switchMap(() => {
        const activity = MOCK_MEMBER_ACTIVITIES.find(a => a.id === activityId);
        const schedule = MOCK_MEMBER_SCHEDULES.find(s => s.id === scheduleId);
        if (!activity || !schedule) {
          return throwError(() => new Error('No pudimos calcular el total. Verifica tu selección.'));
        }
        if (schedule.availability === MemberScheduleAvailability.FULL) {
          return throwError(() => new Error('El horario seleccionado ya no tiene cupos disponibles.'));
        }
        const studentId = MEMBER_PERSON_TO_STUDENT[participantPersonId];
        const agreement = agreementId
          ? MOCK_MEMBER_AGREEMENTS.find(a => a.id === agreementId)
          : undefined;

        if (studentId) {
          return this.tryMatriculaCalculation(studentId, activityId, agreementId).pipe(
            map(calc => calc ?? this.mockCalculation(activity, agreement)),
          );
        }
        return of(this.mockCalculation(activity, agreement));
      }),
      delay(400),
    );
  }

  confirmEnrollment(request: MemberEnrollmentRequest): Observable<MemberEnrollmentResult> {
    return this.calculateEnrollment(
      request.participantPersonId,
      request.activityId,
      request.scheduleId,
      request.agreementId,
    ).pipe(
      switchMap(calc => {
        const participant = this.participantService.authorizedParticipants()
          .find(p => p.personId === request.participantPersonId);
        const activity = MOCK_MEMBER_ACTIVITIES.find(a => a.id === request.activityId)!;
        const schedule = MOCK_MEMBER_SCHEDULES.find(s => s.id === request.scheduleId)!;

        if (calc.total > 0 && !request.paymentMethod) {
          return throwError(() => new Error('Selecciona un método de pago para continuar.'));
        }

        const newId = MOCK_MEMBER_ACTIVITY_ENROLLMENTS.length + 1;
        const enrollment: MemberActivityEnrollment = {
          id: newId,
          code: `ACT-2026-${String(newId).padStart(4, '0')}`,
          participantPersonId: request.participantPersonId,
          participantName: participant?.fullName ?? 'Participante',
          activityName: activity.name,
          schedule: `${schedule.days} ${schedule.timeStart} – ${schedule.timeEnd}`,
          days: schedule.days,
          timeStart: schedule.timeStart,
          timeEnd: schedule.timeEnd,
          venue: schedule.venue,
          status: calc.total > 0 ? 'pending' : 'active',
          period: 'Septiembre 2026',
        };
        MOCK_MEMBER_ACTIVITY_ENROLLMENTS.push(enrollment);

        if (schedule.availableSpots > 0) {
          schedule.availableSpots -= 1;
          if (schedule.availableSpots <= 2 && schedule.availableSpots > 0) {
            schedule.availability = MemberScheduleAvailability.LAST_SPOTS;
          } else if (schedule.availableSpots === 0) {
            schedule.availability = MemberScheduleAvailability.FULL;
          }
        }

        return of({
          enrollment,
          paymentReference: calc.total > 0 ? `TRX-MEM-${Date.now()}` : undefined,
        } satisfies MemberEnrollmentResult);
      }),
      delay(600),
    );
  }

  processPayment(amount: number): Observable<{ success: boolean; reference: string }> {
    this.sessionService.requireMemberId();
    return of({ success: true, reference: `TRX-MEM-${Date.now()}` }).pipe(delay(800));
  }

  private tryMatriculaCalculation(
    studentId: number,
    activityId: number,
    agreementId?: number | null,
  ): Observable<MemberEnrollmentCalculation | null> {
    return this.studentService.getById(studentId).pipe(
      switchMap(student => {
        if (!student) return of(null);
        return this.courseService.getById(activityId).pipe(
          switchMap(course => {
            if (!course) return of(null);
            const agreement$ = agreementId
              ? this.agreementService.getById(agreementId)
              : of(undefined);
            return agreement$.pipe(
              switchMap(agreement =>
                this.chargeService.generateCharges(student, course, agreement ?? undefined).pipe(
                  map(charges => {
                    const totals = this.chargeService.calculateTotals(charges);
                    const fullyCovered = agreement
                      ? this.chargeService.isFullyCoveredByAgreement(charges, agreement)
                      : false;
                    return {
                      lines: charges.map(c => ({
                        conceptName: c.conceptName,
                        amount: c.finalAmount,
                        isDiscount: c.discountAmount > 0,
                      })),
                      subtotal: totals.subtotal,
                      discount: totals.discount,
                      total: fullyCovered ? 0 : totals.total,
                      fullyCovered,
                    } satisfies MemberEnrollmentCalculation;
                  }),
                ),
              ),
            );
          }),
        );
      }),
    );
  }

  private mockCalculation(
    activity: MemberActivity,
    agreement?: MemberActivityAgreement,
  ): MemberEnrollmentCalculation {
    const discount = agreement
      ? Math.round(activity.basePrice * agreement.discountPercent) / 100
      : 0;
    const lines: MemberEnrollmentCalculationLine[] = [
      { conceptName: `Matrícula ${activity.name}`, amount: activity.basePrice },
    ];
    if (discount > 0 && agreement) {
      lines.push({
        conceptName: `Beneficio: ${agreement.name}`,
        amount: -discount,
        isDiscount: true,
      });
    }
    const total = Math.max(0, activity.basePrice - discount);
    return {
      lines,
      subtotal: activity.basePrice,
      discount,
      total,
      fullyCovered: total === 0,
    };
  }

  private buildAvailabilityMap(): Map<number, MemberScheduleAvailability[]> {
    const map = new Map<number, MemberScheduleAvailability[]>();
    for (const s of MOCK_MEMBER_SCHEDULES) {
      const arr = map.get(s.activityId) ?? [];
      arr.push(s.availability);
      map.set(s.activityId, arr);
    }
    return map;
  }
}
