import { Component, inject, signal, model, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { Router, RouterLink, ActivatedRoute } from '@angular/router';

import { FormsModule } from '@angular/forms';

import { StudentEnrollmentFacade } from '../../facades/student-enrollment.facade';
import { StudentEnrollmentService } from '../../services/student-enrollment.service';
import { EnrollmentCourseOptionComponent } from '../../components/enrollment-course-option/enrollment-course-option';
import { EnrollmentCourseSearchComponent } from '../../components/enrollment-course-search/enrollment-course-search';
import { StudentCourse } from '../../models/student-portal.model';
import { filterEnrollmentCourses } from '../../utils/enrollment-course-filter';



@Component({

  selector: 'app-student-enrollment-wizard',

  changeDetection: ChangeDetectionStrategy.OnPush,

  providers: [StudentEnrollmentFacade],

  imports: [RouterLink, FormsModule, EnrollmentCourseOptionComponent, EnrollmentCourseSearchComponent],

  template: `

    <div class="space-y-6">

      <nav class="text-sm text-slate-500">

        <a routerLink="/portal-alumno/matricula" class="hover:text-brand">Matrícula</a>

        <span class="mx-2">/</span>

        <span class="text-slate-800 font-medium">Nueva matrícula</span>

      </nav>



      <h1 class="sp-page-title">Nueva matrícula</h1>



      @if (facade.error(); as err) {

        <div class="sp-card p-4 border-l-4 border-red-500 bg-red-50 text-red-800 text-sm" role="alert">

          {{ err }}

        </div>

      }



      <!-- Stepper móvil -->

      <div class="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">

        <nav aria-label="Pasos de matrícula" class="flex gap-2 min-w-max lg:flex-wrap">

          @for (s of facade.steps; track s.id) {

            <span class="text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap"

              [class]="facade.currentStep() === s.id ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'">

              {{ s.order }}. {{ s.label }}

            </span>

          }

        </nav>

      </div>



      @if (facade.loading() && !facade.context()) {

        <div class="sp-card p-8 text-center text-slate-500 animate-pulse">Cargando...</div>

      } @else {

        @switch (facade.currentStep()) {

          @case ('benefits') {

            <div class="sp-card p-5 space-y-4">

              <h2 class="text-lg font-bold text-slate-900">Beneficios y convenios</h2>

              <p class="text-sm text-slate-500">Selecciona un convenio si tienes uno disponible, o continúa sin beneficio.</p>

              @if (facade.agreements().length === 0) {

                <p class="text-sm text-slate-600">No tienes convenios activos. Puedes continuar con tarifa regular.</p>

              } @else {

                <div class="space-y-3">

                  <button type="button" class="w-full text-left sp-card p-4 sp-card-hover border-2 transition-colors"

                    [class.border-brand]="facade.selectedAgreementId() === null && facade.agreementChosen()"

                    [class.border-transparent]="!(facade.selectedAgreementId() === null && facade.agreementChosen())"

                    (click)="facade.selectAgreement(null)">

                    <p class="font-semibold text-slate-900">Sin convenio</p>

                    <p class="text-sm text-slate-500 mt-1">Tarifa regular del curso</p>

                  </button>

                  @for (a of facade.agreements(); track a.id) {

                    <button type="button" class="w-full text-left sp-card p-4 sp-card-hover border-2 transition-colors"

                      [class.border-brand]="facade.selectedAgreementId() === a.id"

                      [class.border-transparent]="facade.selectedAgreementId() !== a.id"

                      (click)="facade.selectAgreement(a.id)">

                      <p class="font-semibold text-slate-900">{{ a.name }}</p>

                      <p class="text-sm text-violet-700 mt-0.5">{{ a.company }}</p>

                      <p class="text-sm text-slate-600 mt-1">{{ a.benefitSummary }}</p>

                      <p class="text-xs text-slate-500 mt-2">Cobertura: {{ a.coveragePercentage }}%</p>

                    </button>

                  }

                </div>

              }

            </div>

          }

          @case ('course') {

            <div class="sp-card p-5 space-y-4">

              <h2 class="text-lg font-bold text-slate-900">Selecciona tu curso</h2>

              @if (facade.selectedCourse(); as selected) {

                <p class="text-sm text-teal-800 bg-teal-50 rounded-2xl px-4 py-3 border border-teal-100">

                  Curso seleccionado: <strong>{{ selected.name }}</strong>. Puedes cambiarlo o continuar.

                </p>

              }

              <div class="sp-card p-4 bg-slate-50/80 border border-slate-200/80">
                <app-enrollment-course-search
                  inputId="wizard-course-search"
                  resultCountId="wizard-course-search-results"
                  [(query)]="courseSearchQuery"
                  [disabled]="facade.loading()"
                  [resultCount]="filteredWizardCourses().length" />
              </div>

              @if (facade.loading()) {

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">

                  @for (i of [1, 2, 3, 4]; track i) {

                    <div class="h-56 bg-slate-200/80 rounded-3xl"></div>

                  }

                </div>

              } @else if (filteredWizardCourses().length === 0) {

                <p class="text-sm text-slate-500 py-4 text-center">

                  No se encontraron cursos para «{{ courseSearchQuery() }}». Prueba con otro término.

                </p>

              } @else {

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  @for (c of filteredWizardCourses(); track c.id) {

                    <app-enrollment-course-option

                      [course]="c"

                      [selectable]="true"

                      [selected]="facade.selectedCourse()?.id === c.id"

                      (courseSelect)="onCourseSelect($event)" />

                  }

                </div>

              }

            </div>

          }

          @case ('modality') {

            <div class="sp-card p-5 space-y-4">

              <h2 class="text-lg font-bold text-slate-900">Modalidad y sede</h2>

              <div>

                <p class="text-sm font-medium text-slate-700 mb-2">Modalidad</p>

                <div class="flex flex-wrap gap-2">

                  @for (m of facade.modalities(); track m) {

                    <button type="button" class="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"

                      [class]="facade.selectedModality() === m ? 'bg-brand text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"

                      (click)="facade.setModality(m)">

                      {{ m }}

                    </button>

                  }

                </div>

              </div>

              @if (facade.selectedModality() && facade.selectedModality() !== 'Virtual') {

                <div>

                  <p class="text-sm font-medium text-slate-700 mb-2">Sede</p>

                  <div class="flex flex-wrap gap-2">

                    @for (campus of facade.campuses(); track campus) {

                      <button type="button" class="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"

                        [class]="facade.selectedCampus() === campus ? 'bg-brand text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"

                        (click)="facade.setCampus(campus)">

                        {{ campus }}

                      </button>

                    }

                  </div>

                </div>

              }

              @if (facade.filteredCourses().length > 0) {

                <p class="text-sm text-slate-500">{{ facade.filteredCourses().length }} curso(s) disponible(s) con esta selección.</p>

              }

            </div>

          }

          @case ('schedule') {

            <div class="sp-card p-5 space-y-4">

              <h2 class="text-lg font-bold text-slate-900">Horario y clase</h2>

              @if (facade.selectedCourse(); as course) {

                <p class="text-sm text-slate-600">Curso: <span class="font-semibold">{{ course.name }}</span></p>

              }

              @if (facade.loading()) {

                <p class="text-sm text-slate-500 animate-pulse">Cargando horarios...</p>

              } @else if (facade.classes().length === 0) {

                <p class="text-sm text-slate-500">No hay clases disponibles. Ajusta modalidad o sede.</p>

              } @else {

                <div class="space-y-3">

                  @for (cls of facade.classes(); track cls.id) {

                    <button type="button" class="w-full text-left sp-card p-4 sp-card-hover border-2 transition-colors"

                      [class.border-brand]="facade.selectedClass()?.id === cls.id"

                      [class.border-transparent]="facade.selectedClass()?.id !== cls.id"

                      (click)="facade.selectClass(cls)">

                      <p class="font-semibold text-slate-900">{{ cls.name }}</p>

                      <p class="text-sm text-slate-600 mt-1">{{ cls.days }} · {{ cls.timeStart }} - {{ cls.timeEnd }}</p>

                      <p class="text-sm text-slate-500 mt-1">{{ cls.campus }} · {{ cls.environment }}</p>

                      <p class="text-xs text-slate-500 mt-2">

                        {{ cls.available }} cupos · Prof. {{ cls.teacher }}

                      </p>

                    </button>

                  }

                </div>

              }

            </div>

          }

          @case ('extras') {

            <div class="sp-card p-5 space-y-4">

              <h2 class="text-lg font-bold text-slate-900">Adicionales (opcional)</h2>

              <div class="space-y-3">

                @for (extra of facade.extras(); track extra.id) {

                  <label class="flex items-start gap-3 sp-card p-4 cursor-pointer sp-card-hover">

                    <input type="checkbox" class="mt-1" [checked]="extra.selected"

                      (change)="facade.toggleExtra(extra.id)" />

                    <div class="flex-1">

                      <p class="font-semibold text-slate-900">{{ extra.name }}</p>

                      <p class="text-sm text-slate-600 mt-0.5">{{ extra.description }}</p>

                      <p class="text-sm font-semibold text-slate-900 mt-1">S/ {{ extra.price.toFixed(2) }}</p>

                    </div>

                  </label>

                }

              </div>

            </div>

          }

          @case ('summary') {

            <div class="sp-card p-5 space-y-4">

              <h2 class="text-lg font-bold text-slate-900">Resumen de matrícula</h2>

              @if (facade.loading()) {

                <p class="text-sm text-slate-500 animate-pulse">Calculando...</p>

              } @else if (facade.calculation(); as calc) {

                @if (facade.selectedCourse(); as course) {

                  <p class="text-sm text-slate-600">Curso: <span class="font-semibold">{{ course.name }}</span></p>

                }

                @if (facade.selectedClass(); as cls) {

                  <p class="text-sm text-slate-600">Clase: {{ cls.name }} · {{ cls.days }}</p>

                }

                <div class="space-y-2 text-sm border-t border-slate-100 pt-3">

                  @for (line of calc.lines; track line.conceptCode) {

                    <div class="flex justify-between gap-2" [class.text-green-700]="line.isDiscount">

                      <span>{{ line.conceptName }}</span>

                      <span class="font-semibold shrink-0">

                        {{ line.isDiscount ? '-' : '' }}S/ {{ Math.abs(line.amount).toFixed(2) }}

                      </span>

                    </div>

                  }

                </div>

                <div class="border-t border-slate-200 pt-3 flex justify-between font-bold text-lg text-slate-900">

                  <span>Total</span>

                  <span>S/ {{ calc.total.toFixed(2) }}</span>

                </div>

                @if (calc.fullyCovered) {

                  <p class="text-sm font-semibold text-green-700">Tu convenio cubre el total de la matrícula.</p>

                }

              }

            </div>

          }

          @case ('payment') {

            <div class="sp-card p-5 space-y-4">

              <h2 class="text-lg font-bold text-slate-900">Pago</h2>

              @if (facade.isFullyCovered()) {

                <p class="text-sm text-green-700 font-semibold">No se requiere pago. Tu convenio cubre el total.</p>

              } @else {

                <p class="text-sm text-slate-600">Selecciona tu método de pago:</p>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">

                  @for (method of paymentMethods; track method.value) {

                    <button type="button" class="sp-card p-4 text-center sp-card-hover border-2 transition-colors"

                      [class.border-brand]="facade.paymentMethod() === method.value"

                      [class.border-transparent]="facade.paymentMethod() !== method.value"

                      (click)="facade.paymentMethod.set(method.value)">

                      <span class="text-2xl" aria-hidden="true">{{ method.icon }}</span>

                      <p class="font-semibold text-slate-900 mt-2 text-sm">{{ method.label }}</p>

                    </button>

                  }

                </div>

                @if (facade.calculation(); as calc) {

                  <p class="text-lg font-bold text-slate-900">Monto a pagar: S/ {{ calc.total.toFixed(2) }}</p>

                }

              }

            </div>

          }

          @case ('confirmation') {

            @if (facade.confirmedEnrollment(); as e) {

              <div class="sp-card p-8 text-center space-y-4">

                <div class="text-5xl" aria-hidden="true">✅</div>

                <h2 class="text-xl font-extrabold text-slate-900">¡Matrícula confirmada!</h2>

                <p class="text-sm text-slate-600">Tu matrícula <span class="font-mono font-semibold">{{ e.code }}</span> ha sido registrada.</p>

                <p class="font-bold text-slate-900">{{ e.courseName }}</p>

                <p class="text-sm text-slate-500">{{ e.className }} · {{ e.period }}</p>

                <div class="flex flex-col sm:flex-row gap-3 justify-center pt-2">

                  <a [routerLink]="['/portal-alumno/matriculas', e.id]" class="btn-primary text-center">Ver matrícula</a>

                  <a routerLink="/portal-alumno/inicio" class="btn-secondary text-center">Ir al inicio</a>

                </div>

              </div>

            }

          }

        }



        @if (facade.currentStep() !== 'confirmation') {

          <div class="flex justify-between gap-3 pt-2">

            <button type="button" class="btn-secondary"

              [disabled]="facade.currentStep() === 'benefits' || facade.loading()"

              (click)="facade.prevStep()">

              Anterior

            </button>

            @if (isLastStep()) {

              <button type="button" class="btn-primary"

                [disabled]="!facade.canContinue() || facade.loading()"

                (click)="facade.confirm()">

                {{ facade.loading() ? 'Confirmando...' : 'Confirmar matrícula' }}

              </button>

            } @else {

              <button type="button" class="btn-primary"

                [disabled]="!facade.canContinue() || facade.loading()"

                (click)="onNext()">

                Continuar

              </button>

            }

          </div>

        }

      }

    </div>

  `,

})

export class StudentEnrollmentWizardComponent implements OnInit {

  protected readonly facade = inject(StudentEnrollmentFacade);
  private readonly enrollmentService = inject(StudentEnrollmentService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);



  protected readonly courseSearchQuery = model('');

  protected readonly filteredWizardCourses = computed(() =>
    filterEnrollmentCourses(this.facade.courses(), this.courseSearchQuery()),
  );

  protected readonly Math = Math;



  protected readonly paymentMethods = [

    { value: 'card' as const, label: 'Tarjeta', icon: '💳' },

    { value: 'transfer' as const, label: 'Transferencia', icon: '🏦' },

    { value: 'cash' as const, label: 'Efectivo', icon: '💵' },

  ];



  ngOnInit(): void {

    const cursoParam = this.route.snapshot.queryParamMap.get('curso');
    const convenioParam = this.route.snapshot.queryParamMap.get('convenio');
    const preselectedCourseId = cursoParam ? Number(cursoParam) : undefined;
    const courseId = preselectedCourseId && !Number.isNaN(preselectedCourseId) ? preselectedCourseId : undefined;
    const preselectedAgreementId = convenioParam ? Number(convenioParam) : undefined;
    const agreementId = preselectedAgreementId && !Number.isNaN(preselectedAgreementId)
      ? preselectedAgreementId
      : undefined;

    this.facade.init({
      preselectedCourseId: courseId,
      preselectedAgreementId: agreementId,
    });

    this.enrollmentService.getEnrollmentContext().subscribe({

      next: ctx => {

        if (!ctx.canEnroll) {

          this.router.navigate(['/portal-alumno/matricula']);

        }

      },

    });

  }



  protected onCourseSelect(course: StudentCourse): void {

    this.facade.selectCourse(course);

  }



  protected isLastStep(): boolean {

    return this.facade.currentStep() === 'payment';

  }



  protected onNext(): void {

    const step = this.facade.currentStep();

    if (step === 'summary' && !this.facade.calculation()) {

      this.facade.calculate();

    }

    if (step === 'summary' && this.facade.isFullyCovered()) {

      this.facade.currentStep.set('payment');

      return;

    }

    this.facade.nextStep();

  }

}

