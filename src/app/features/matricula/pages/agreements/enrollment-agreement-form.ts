import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EnrollmentAgreementService } from '../../services/enrollment-agreement.service';
import { EnrollmentCourseService } from '../../services/enrollment-course.service';
import { EnrollmentAgreement, EnrollmentCourse } from '../../models/enrollment.model';

@Component({
  selector: 'app-enrollment-agreement-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="flex flex-col h-full">
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <div>
          <h2 class="text-lg font-semibold text-slate-800">{{ isEdit() ? 'Editar convenio' : 'Nuevo convenio' }}</h2>
          <p class="text-xs text-slate-500">Registro de convenio para matrícula</p>
        </div>
        <button type="button" class="text-slate-400 hover:text-slate-600" (click)="cancel()" aria-label="Cerrar panel">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="save()" class="flex-1 overflow-y-auto p-6 space-y-4" id="enrollment-agreement-form">
        <div>
          <label for="agr-name" class="block text-sm font-medium text-slate-700 mb-1">Nombre del convenio *</label>
          <input id="agr-name" type="text" formControlName="name" class="input-modern w-full" />
        </div>
        <div>
          <label for="agr-company" class="block text-sm font-medium text-slate-700 mb-1">Empresa / institución *</label>
          <input id="agr-company" type="text" formControlName="company" class="input-modern w-full" />
        </div>
        <div>
          <label for="agr-desc" class="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
          <textarea id="agr-desc" formControlName="description" rows="2" class="input-modern w-full resize-none"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="agr-from" class="block text-sm font-medium text-slate-700 mb-1">Vigencia desde *</label>
            <input id="agr-from" type="date" formControlName="validFrom" class="input-modern w-full" />
          </div>
          <div>
            <label for="agr-to" class="block text-sm font-medium text-slate-700 mb-1">Vigencia hasta *</label>
            <input id="agr-to" type="date" formControlName="validTo" class="input-modern w-full" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="agr-coverage" class="block text-sm font-medium text-slate-700 mb-1">Cobertura (%) *</label>
            <input id="agr-coverage" type="number" min="0" max="100" formControlName="coveragePercentage" class="input-modern w-full" />
          </div>
          <div>
            <label for="agr-status" class="block text-sm font-medium text-slate-700 mb-1">Estado *</label>
            <select id="agr-status" formControlName="status" class="input-modern w-full">
              <option value="active">Activo</option>
              <option value="suspended">Inactivo / Suspendido</option>
              <option value="expired">Vencido</option>
            </select>
          </div>
        </div>
        <div>
          <label for="agr-conditions" class="block text-sm font-medium text-slate-700 mb-1">Condiciones</label>
          <input id="agr-conditions" type="text" formControlName="conditions" class="input-modern w-full" />
        </div>

        <fieldset class="space-y-2">
          <legend class="text-sm font-medium text-slate-700">Modalidades permitidas *</legend>
          @for (m of modalities; track m) {
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" [checked]="selectedModalities().includes(m)"
                (change)="toggleModality(m, $event)" class="rounded border-slate-300" />
              {{ m }}
            </label>
          }
        </fieldset>

        <fieldset class="space-y-2">
          <legend class="text-sm font-medium text-slate-700">Sedes permitidas *</legend>
          @for (c of campuses; track c) {
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" [checked]="selectedCampuses().includes(c)"
                (change)="toggleCampus(c, $event)" class="rounded border-slate-300" />
              {{ c }}
            </label>
          }
        </fieldset>

        <fieldset class="space-y-2">
          <legend class="text-sm font-medium text-slate-700">Cursos aplicables</legend>
          <div class="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-3 space-y-1">
            @for (c of courses(); track c.id) {
              <label class="flex items-center gap-2 text-sm">
                <input type="checkbox" [checked]="selectedCourseIds().includes(c.id)"
                  (change)="toggleCourse(c.id, $event)" class="rounded border-slate-300" />
                {{ c.name }}
              </label>
            }
          </div>
        </fieldset>
      </form>

      <div class="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
        <button type="button" class="btn-ghost" (click)="cancel()">Cancelar</button>
        <button type="submit" form="enrollment-agreement-form" class="btn-primary"
          [disabled]="form.invalid || !canSave()">
          {{ isEdit() ? 'Guardar cambios' : 'Crear convenio' }}
        </button>
      </div>
    </div>
  `,
})
export class EnrollmentAgreementFormComponent implements OnInit {
  private readonly agreementService = inject(EnrollmentAgreementService);
  private readonly courseService = inject(EnrollmentCourseService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  protected readonly isEdit = signal(false);
  private agreementId: number | null = null;

  protected readonly courses = signal<EnrollmentCourse[]>([]);
  protected readonly selectedModalities = signal<string[]>(['Presencial']);
  protected readonly selectedCampuses = signal<string[]>(['AELU Principal']);
  protected readonly selectedCourseIds = signal<number[]>([]);

  protected readonly modalities = ['Presencial', 'Virtual'];
  protected readonly campuses = ['AELU Principal', 'AELU Sede Norte', 'AELU Virtual'];

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    company: ['', Validators.required],
    description: [''],
    validFrom: ['', Validators.required],
    validTo: ['', Validators.required],
    coveragePercentage: [20, [Validators.required, Validators.min(0), Validators.max(100)]],
    status: ['active' as EnrollmentAgreement['status'], Validators.required],
    conditions: [''],
  });

  ngOnInit(): void {
    this.courseService.getCourses().subscribe(list => this.courses.set(list));
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit.set(true);
      this.agreementId = Number(idParam);
      this.agreementService.getById(this.agreementId).subscribe(a => {
        if (a) this.patchFromAgreement(a);
      });
    }
  }

  private patchFromAgreement(a: EnrollmentAgreement): void {
    this.form.patchValue({
      name: a.name,
      company: a.company,
      description: a.description,
      validFrom: a.validFrom,
      validTo: a.validTo,
      coveragePercentage: a.coveragePercentage,
      status: a.status,
      conditions: a.conditions,
    });
    this.selectedModalities.set([...a.allowedModalities]);
    this.selectedCampuses.set([...a.allowedCampuses]);
    this.selectedCourseIds.set([...a.allowedCourseIds]);
  }

  protected toggleModality(value: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedModalities.update(list =>
      checked ? [...list, value] : list.filter(v => v !== value),
    );
  }

  protected toggleCampus(value: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedCampuses.update(list =>
      checked ? [...list, value] : list.filter(v => v !== value),
    );
  }

  protected toggleCourse(id: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedCourseIds.update(list =>
      checked ? [...list, id] : list.filter(v => v !== id),
    );
  }

  protected canSave(): boolean {
    return this.selectedModalities().length > 0 && this.selectedCampuses().length > 0;
  }

  protected save(): void {
    if (this.form.invalid || !this.canSave()) return;
    const v = this.form.getRawValue();
    const payload = {
      name: v.name,
      company: v.company,
      description: v.description,
      validFrom: v.validFrom,
      validTo: v.validTo,
      coveragePercentage: v.coveragePercentage,
      status: v.status,
      conditions: v.conditions || 'Sin condiciones adicionales',
      allowedModalities: this.selectedModalities(),
      allowedCampuses: this.selectedCampuses(),
      allowedCourseIds: this.selectedCourseIds(),
    };
    const req$ = this.isEdit() && this.agreementId
      ? this.agreementService.update(this.agreementId, payload)
      : this.agreementService.create(payload);
    req$.subscribe(() => this.router.navigate(['/', { outlets: { panel: null } }]));
  }

  protected cancel(): void {
    this.router.navigate(['/', { outlets: { panel: null } }]);
  }
}
