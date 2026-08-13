import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EnrollmentWizardFacade } from '../../facades/enrollment-wizard.facade';
import { EnrollmentProgressComponent } from '../../components/enrollment-progress/enrollment-progress';
import { EnrollmentChargeSummaryComponent } from '../../components/charge-summary/enrollment-charge-summary';
import { EnrollmentRuleResultComponent } from '../../components/validation-panel/enrollment-rule-result';
import { EnrollmentStudentService } from '../../services/enrollment-student.service';
import { EnrollmentStudentSummaryComponent } from '../../components/student-summary/enrollment-student-summary';
import {
  EnrollmentStudent,
  STUDENT_TYPE_LABELS,
  AVAILABILITY_LABELS,
  getAvailabilityLabel,
  WizardStep,
} from '../../models/enrollment.model';

@Component({
  selector: 'app-enrollment-wizard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [EnrollmentWizardFacade],
  imports: [
    RouterLink, FormsModule,
    EnrollmentProgressComponent, EnrollmentChargeSummaryComponent, EnrollmentRuleResultComponent,
    EnrollmentStudentSummaryComponent,
  ],
  template: `
    <div class="space-y-6">
      <nav class="text-sm text-slate-500">
        <a routerLink="/matricula" class="hover:text-brand">Matrículas</a>
        <span class="mx-2">/</span>
        <span class="text-slate-800 font-medium">Nueva matrícula</span>
      </nav>

      <h1 class="text-2xl font-extrabold text-slate-900">Nueva matrícula</h1>

      @if (facade.loading()) {
        <div class="section-card p-6 text-center text-slate-500">
          <div class="animate-pulse">{{ facade.loadingMessage() || 'Cargando...' }}</div>
        </div>
      }

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Stepper lateral -->
        <aside class="lg:col-span-1 space-y-4">
          <nav aria-label="Pasos del wizard" class="section-card p-4 space-y-1">
            @for (s of facade.steps; track s.id) {
              <button type="button"
                class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                [class]="facade.currentStep() === s.id ? 'bg-brand text-white font-semibold' : 'text-slate-600 hover:bg-slate-50'"
                (click)="facade.goToStep(s.id)">
                {{ s.order }}. {{ s.label }}
              </button>
            }
          </nav>
          <app-enrollment-progress [items]="facade.progressItems()" />
        </aside>

        <!-- Contenido -->
        <div class="lg:col-span-3 space-y-4">
          @if (facade.student() && facade.currentStep() !== 'student') {
            <app-enrollment-student-summary
              [student]="facade.student()"
              [settlement]="facade.studentSettlement()"
              (changeStudent)="onChangeStudent()" />
          }

          @switch (facade.currentStep()) {
            @case ('student') {
              <div class="section-card p-6 space-y-4">
                <div>
                  <h2 class="text-lg font-bold">Selección del estudiante</h2>
                  <p class="text-sm text-slate-500 mt-1">
                    Busque y seleccione al estudiante. Se verificará si está liquidado antes de continuar.
                  </p>
                </div>
                <input type="search" class="input-modern w-full" placeholder="DNI, CE, código, nombres o apellidos..."
                  [(ngModel)]="studentQuery" (ngModelChange)="searchStudents($event)" />
                @if (studentQuery.trim().length > 0 && studentQuery.trim().length < 2) {
                  <p class="text-xs text-slate-400">Escriba al menos 2 caracteres para buscar</p>
                }
                <div class="section-card overflow-hidden">
                  <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                      <thead>
                        <tr class="border-b border-slate-200 bg-slate-50 text-left">
                          <th class="py-2 px-4 text-xs font-semibold text-slate-500">Código</th>
                          <th class="py-2 px-4 text-xs font-semibold text-slate-500">Estudiante</th>
                          <th class="py-2 px-4 text-xs font-semibold text-slate-500">Documento</th>
                          <th class="py-2 px-4 text-xs font-semibold text-slate-500">Tipo</th>
                          <th class="py-2 px-4 text-xs font-semibold text-slate-500 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (s of searchResults; track s.id) {
                          <tr class="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                            [class.bg-brand/5]="facade.student()?.id === s.id"
                            (click)="facade.selectStudent(s)">
                            <td class="py-2.5 px-4 font-mono text-xs">{{ s.code }}</td>
                            <td class="py-2.5 px-4 font-semibold text-slate-900">{{ s.firstName }} {{ s.lastName }}</td>
                            <td class="py-2.5 px-4 text-slate-600">{{ s.documentType }} {{ s.documentNumber }}</td>
                            <td class="py-2.5 px-4">
                              <span class="text-xs font-semibold px-2 py-0.5 rounded-full"
                                [class]="s.isRegularStudent ? 'bg-brand/10 text-brand' : 'bg-blue-100 text-blue-800'">
                                {{ s.isRegularStudent ? STUDENT_TYPE_LABELS.REGULAR : STUDENT_TYPE_LABELS.NEW }}
                              </span>
                            </td>
                            <td class="py-2.5 px-4 text-right">
                              <span class="text-xs font-semibold text-brand">
                                {{ facade.student()?.id === s.id ? 'Seleccionado' : 'Seleccionar' }}
                              </span>
                            </td>
                          </tr>
                        } @empty {
                          <tr>
                            <td colspan="5" class="py-8 text-center text-slate-400">
                              @if (studentQuery.trim().length >= 2) {
                                No se encontraron estudiantes.
                              } @else {
                                Escriba para buscar o seleccione uno del listado inicial.
                              }
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
                @if (facade.student(); as selected) {
                  <div class="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2">
                    @if (!selected.isRegularStudent) {
                      <span class="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded">PRIMERA MATRÍCULA</span>
                      <p class="text-sm text-slate-600">Se aplicará derecho de registro.</p>
                    } @else {
                      <p class="font-bold text-brand">ESTUDIANTE REGULAR</p>
                      @if (selected.lastCourseName) {
                        <p class="text-sm mt-2">Último curso: {{ selected.lastCourseName }} · {{ selected.lastEnrollmentDate }}</p>
                      }
                    }
                    @if (facade.studentSettlement(); as settlement) {
                      <div class="rounded-lg p-3 text-sm mt-2"
                        [class]="settlement.isSettled ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-amber-50 border border-amber-200 text-amber-900'">
                        <p class="font-semibold">{{ settlement.isSettled ? '✓ Liquidado' : '⚠ Con deuda pendiente' }}</p>
                        <p>{{ settlement.message }}</p>
                      </div>
                    }
                  </div>
                }
              </div>
            }
            @case ('context') {
              <div class="section-card p-6 space-y-4">
                <h2 class="text-lg font-bold">Liquidación de periodo</h2>
                <p class="text-sm text-slate-500">Verifique que el periodo de liquidación esté abierto para registrar matrículas.</p>
                @if (facade.context(); as ctx) {
                  <dl class="grid grid-cols-2 gap-3 text-sm">
                    <div><dt class="text-slate-500">Sede</dt><dd class="font-semibold">{{ ctx.campus }}</dd></div>
                    <div><dt class="text-slate-500">Usuario</dt><dd class="font-semibold">{{ ctx.user }}</dd></div>
                    <div><dt class="text-slate-500">Fecha</dt><dd class="font-semibold">{{ ctx.date }}</dd></div>
                    <div><dt class="text-slate-500">Liquidación</dt><dd class="font-semibold">{{ ctx.settlementOpen ? 'ABIERTA' : 'CERRADA' }}</dd></div>
                  </dl>
                  @if (ctx.settlementOpen) {
                    <div class="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
                      <p class="font-bold">✓ Liquidación abierta</p>
                      <p class="text-sm">Puede continuar con la matrícula.</p>
                    </div>
                  } @else {
                    <div class="rounded-lg bg-amber-50 border border-amber-200 p-4 text-amber-900">
                      <p class="font-bold">⚠ No existe una liquidación abierta</p>
                      <p class="text-sm">Debe realizar la apertura de liquidación antes de continuar.</p>
                      <a routerLink="/comercial/tarifas" class="inline-block mt-2 text-sm font-semibold text-brand">Ir a módulo comercial →</a>
                    </div>
                  }
                }
              </div>
            }
            @case ('agreement') {
              <div class="section-card p-6 space-y-4">
                <h2 class="text-lg font-bold">Convenios disponibles</h2>
                <fieldset class="space-y-3">
                  <label class="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <input type="radio" name="agreement" [checked]="facade.selectedAgreementId() === null" (change)="facade.selectAgreement(null)" class="mt-1" />
                    <span>Continuar sin convenio</span>
                  </label>
                  @for (a of facade.agreements(); track a.id) {
                    <label class="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                      <input type="radio" name="agreement" [checked]="facade.selectedAgreementId() === a.id" (change)="facade.selectAgreement(a.id)" class="mt-1" />
                      <div>
                        <p class="font-bold">{{ a.name }}</p>
                        <p class="text-sm text-slate-600">{{ a.description }}</p>
                        <p class="text-xs text-slate-500">{{ a.validFrom }} - {{ a.validTo }} · {{ a.benefitSummary }}</p>
                      </div>
                    </label>
                  } @empty {
                    <p class="text-slate-500">El estudiante no posee convenios aplicables.</p>
                  }
                </fieldset>
              </div>
            }
            @case ('validation') {
              <div class="section-card p-6 space-y-3">
                <h2 class="text-lg font-bold">Validación de matrícula</h2>
                @if (facade.validationResults(); as val) {
                  @for (r of val.results; track r.ruleId + r.ruleName) {
                    <app-enrollment-rule-result [result]="r" />
                  }
                } @else {
                  <button type="button" class="btn-primary" (click)="facade.runValidation()">Ejecutar validaciones</button>
                }
              </div>
            }
            @case ('course') {
              <div class="section-card p-6 space-y-4">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 class="text-lg font-bold">Selección del curso</h2>
                    <p class="text-sm text-slate-500 mt-1">
                      Elija un curso de la lista para continuar.
                    </p>
                  </div>
                  <button type="button" class="btn-ghost !text-sm shrink-0" (click)="loadCourses()">
                    Actualizar listado
                  </button>
                </div>

                @if (facade.course(); as selected) {
                  <div class="rounded-lg bg-brand/5 border border-brand/20 px-4 py-3 text-sm">
                    <span class="font-semibold text-brand">Curso seleccionado:</span>
                    {{ selected.name }} · S/ {{ selected.basePrice }}
                  </div>
                } @else if (facade.coursesCache().length > 0) {
                  <p class="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                    Haga clic en una fila para seleccionar el curso. El botón Continuar se habilitará al seleccionar.
                  </p>
                }

                <div class="section-card overflow-hidden !shadow-none border border-slate-200">
                  <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                      <thead>
                        <tr class="border-b border-slate-200 bg-slate-50 text-left">
                          <th class="py-2 px-4 text-xs font-semibold text-slate-500">Curso</th>
                          <th class="py-2 px-4 text-xs font-semibold text-slate-500">Nivel</th>
                          <th class="py-2 px-4 text-xs font-semibold text-slate-500">Modalidad</th>
                          <th class="py-2 px-4 text-xs font-semibold text-slate-500">Sede</th>
                          <th class="py-2 px-4 text-xs font-semibold text-slate-500 text-right">Precio</th>
                          <th class="py-2 px-4 text-xs font-semibold text-slate-500 text-right">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (c of facade.coursesCache(); track c.id) {
                          <tr class="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                            [class.bg-brand/5]="facade.course()?.id === c.id"
                            (click)="facade.selectCourse(c)">
                            <td class="py-2.5 px-4 font-semibold text-slate-900">{{ c.name }}</td>
                            <td class="py-2.5 px-4 text-slate-600">{{ c.level }}</td>
                            <td class="py-2.5 px-4 text-slate-600">{{ c.modality }}</td>
                            <td class="py-2.5 px-4 text-slate-600">{{ c.campus }}</td>
                            <td class="py-2.5 px-4 text-right font-semibold text-brand">S/ {{ c.basePrice }}</td>
                            <td class="py-2.5 px-4 text-right">
                              <span class="text-xs font-semibold"
                                [class]="facade.course()?.id === c.id ? 'text-brand' : 'text-slate-400'">
                                {{ facade.course()?.id === c.id ? 'Seleccionado' : 'Seleccionar' }}
                              </span>
                            </td>
                          </tr>
                        } @empty {
                          <tr>
                            <td colspan="6" class="py-8 text-center text-slate-400">
                              @if (facade.loading()) {
                                Cargando cursos...
                              } @else {
                                No hay cursos habilitados para este estudiante o convenio.
                              }
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            }
            @case ('class') {
              <div class="section-card p-6 space-y-4">
                <h2 class="text-lg font-bold">Clase / horario</h2>
                @if (!facade.selectedClass() && facade.classesCache().length > 0) {
                  <p class="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                    Seleccione una clase con cupos disponibles para continuar.
                  </p>
                }
                <div class="section-card overflow-hidden !shadow-none border border-slate-200">
                  <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                      <thead>
                        <tr class="border-b border-slate-200 bg-slate-50 text-left">
                          <th class="py-2 px-4 text-xs font-semibold text-slate-500">Clase</th>
                          <th class="py-2 px-4 text-xs font-semibold text-slate-500">Horario</th>
                          <th class="py-2 px-4 text-xs font-semibold text-slate-500">Docente</th>
                          <th class="py-2 px-4 text-xs font-semibold text-slate-500 text-center">Cupos</th>
                          <th class="py-2 px-4 text-xs font-semibold text-slate-500 text-right">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (c of facade.classesCache(); track c.id) {
                          <tr class="border-b border-slate-100 transition-colors"
                            [class.hover:bg-slate-50]="c.available > 0"
                            [class.cursor-pointer]="c.available > 0"
                            [class.opacity-50]="c.available <= 0"
                            [class.bg-brand/5]="facade.selectedClass()?.id === c.id"
                            (click)="c.available > 0 && facade.selectClass(c)">
                            <td class="py-2.5 px-4 font-semibold">{{ c.name }}</td>
                            <td class="py-2.5 px-4 text-slate-600">{{ c.days }} · {{ c.timeStart }}-{{ c.timeEnd }}</td>
                            <td class="py-2.5 px-4 text-slate-600">{{ c.teacher }}</td>
                            <td class="py-2.5 px-4 text-center text-xs">{{ c.enrolled }}/{{ c.capacity }} ({{ c.available }} libres)</td>
                            <td class="py-2.5 px-4 text-right">
                              <span class="text-xs font-semibold"
                                [class]="facade.selectedClass()?.id === c.id ? 'text-brand' : c.available <= 0 ? 'text-red-500' : 'text-slate-400'">
                                {{ facade.selectedClass()?.id === c.id ? 'Seleccionada' : c.available <= 0 ? 'Completa' : 'Seleccionar' }}
                              </span>
                            </td>
                          </tr>
                        } @empty {
                          <tr>
                            <td colspan="5" class="py-8 text-center text-slate-400">
                              @if (facade.course()) {
                                No hay clases disponibles para el curso seleccionado.
                              } @else {
                                Seleccione un curso en el paso anterior.
                              }
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            }
            @case ('charges') {
              <app-enrollment-charge-summary [charges]="facade.charges()" [agreement]="facade.selectedAgreement()" [fullyCovered]="facade.isFullyCovered()" />
            }
            @case ('payment') {
              <div class="section-card p-6 space-y-4">
                <h2 class="text-lg font-bold">Pago</h2>
                @if (facade.isFullyCovered()) {
                  <button type="button" class="btn-primary" (click)="facade.skipPaymentAndConfirm()">Confirmar sin pago</button>
                } @else {
                  <p class="text-2xl font-extrabold text-brand">S/ {{ facade.totals().total.toFixed(2) }}</p>
                  <select class="input-modern max-w-xs" [(ngModel)]="payMethod">
                    <option value="cash">Efectivo</option>
                    <option value="card">Tarjeta</option>
                    <option value="transfer">Transferencia</option>
                  </select>
                }
              </div>
            }
            @case ('confirmation') {
              <div class="section-card p-8 text-center space-y-4">
                <h2 class="text-2xl font-extrabold text-green-800">✓ MATRÍCULA CONFIRMADA</h2>
                @if (facade.enrollment(); as e) {
                  <p class="font-mono">{{ e.code }}</p>
                }
                @if (facade.becameRegular()) {
                  <p class="text-sm text-brand font-semibold">Estudiante actualizado como REGULAR.</p>
                }
                <a routerLink="/matricula" class="btn-primary inline-block">Ir al listado</a>
              </div>
            }
          }

          @if (facade.currentStep() !== 'confirmation') {
            <div class="flex justify-between pt-4 border-t border-slate-200">
              <button type="button" class="btn-ghost" [disabled]="facade.currentStep() === 'student'" (click)="facade.prevStep()">Anterior</button>
              <div class="flex gap-2">
                @if (facade.currentStep() === 'charges') {
                  <button type="button" class="btn-ghost" (click)="facade.saveDraft()">Guardar borrador</button>
                }
                <button type="button" class="btn-primary" [disabled]="!facade.canContinue()" (click)="onContinue()">
                  {{ continueLabel() }}
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class EnrollmentWizardComponent implements OnInit {
  protected readonly facade = inject(EnrollmentWizardFacade);
  private readonly studentService = inject(EnrollmentStudentService);
  private readonly route = inject(ActivatedRoute);

  protected readonly STUDENT_TYPE_LABELS = STUDENT_TYPE_LABELS;
  protected studentQuery = '';
  protected searchResults: EnrollmentStudent[] = [];
  protected payMethod: 'cash' | 'card' | 'transfer' | 'other' = 'cash';

  ngOnInit(): void {
    this.facade.init();
    this.loadInitialStudents();
    const studentId = this.route.snapshot.queryParamMap.get('estudiante');
    if (studentId) {
      this.studentService.getById(Number(studentId)).subscribe(s => {
        if (s) {
          this.facade.selectStudent(s);
          this.facade.goToStep('student');
        }
      });
    }
  }

  protected loadInitialStudents(): void {
    this.studentService.getAll().subscribe(list => {
      this.searchResults = list.slice(0, 8);
    });
  }

  protected searchStudents(q: string): void {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      this.loadInitialStudents();
      return;
    }
    this.studentService.search(trimmed).subscribe(list => this.searchResults = list);
  }

  protected onChangeStudent(): void {
    this.facade.clearStudent();
    this.studentQuery = '';
    this.loadInitialStudents();
  }

  protected loadCourses(): void {
    this.facade.loadCourses();
  }

  protected onContinue(): void {
    const step = this.facade.currentStep();
    if (step === 'payment') {
      this.processPay();
      return;
    }
    if (step === 'charges') {
      this.facade.nextStep();
      return;
    }
    this.facade.nextStep();
  }

  protected processPay(): void {
    this.facade.processPayment({
      method: this.payMethod,
      amount: this.facade.totals().total,
    });
    this.facade.confirmEnrollment();
  }

  protected continueLabel(): string {
    const step = this.facade.currentStep();
    if (step === 'course' && !this.facade.course()) {
      return 'Seleccione un curso';
    }
    if (step === 'class' && !this.facade.selectedClass()) {
      return 'Seleccione una clase';
    }
    const labels: Partial<Record<WizardStep, string>> = {
      charges: 'Continuar al pago',
      payment: 'Confirmar',
    };
    return labels[step] ?? 'Continuar';
  }

  protected availLabel(c: { available: number; capacity: number }): string {
    return AVAILABILITY_LABELS[getAvailabilityLabel(c.available, c.capacity)];
  }

  protected availClass(c: { available: number; capacity: number }): string {
    const l = getAvailabilityLabel(c.available, c.capacity);
    return l === 'full' ? 'bg-red-100 text-red-700' : l === 'low' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800';
  }
}
