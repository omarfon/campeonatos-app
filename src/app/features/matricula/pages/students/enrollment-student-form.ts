import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EnrollmentStudentService } from '../../services/enrollment-student.service';
import { EnrollmentStudent } from '../../models/enrollment.model';

@Component({
  selector: 'app-enrollment-student-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="flex flex-col h-full">
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <div>
          <h2 class="text-lg font-semibold text-slate-800">{{ isEdit() ? 'Editar estudiante' : 'Nuevo estudiante' }}</h2>
          <p class="text-xs text-slate-500">Datos personales y de contacto</p>
        </div>
        <button type="button" class="text-slate-400 hover:text-slate-600" (click)="cancel()" aria-label="Cerrar panel">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="save()" class="flex-1 overflow-y-auto p-6 space-y-5" id="enrollment-student-form">
        @if (!isEdit()) {
          <div class="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
            Se registrará como <strong>Estudiante nuevo</strong>. Tras la primera matrícula confirmada pasará a regular.
          </div>
        }

        <section class="space-y-3">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500">Identificación</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="st-first" class="block text-sm font-medium text-slate-700 mb-1">Nombres *</label>
              <input id="st-first" type="text" formControlName="firstName" class="input-modern w-full" />
            </div>
            <div>
              <label for="st-last" class="block text-sm font-medium text-slate-700 mb-1">Apellidos *</label>
              <input id="st-last" type="text" formControlName="lastName" class="input-modern w-full" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="st-doctype" class="block text-sm font-medium text-slate-700 mb-1">Tipo documento *</label>
              <select id="st-doctype" formControlName="documentType" class="input-modern w-full">
                <option value="DNI">DNI</option>
                <option value="CE">CE</option>
              </select>
            </div>
            <div>
              <label for="st-doc" class="block text-sm font-medium text-slate-700 mb-1">Número documento *</label>
              <input id="st-doc" type="text" formControlName="documentNumber" class="input-modern w-full" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="st-birth" class="block text-sm font-medium text-slate-700 mb-1">Fecha de nacimiento *</label>
              <input id="st-birth" type="date" formControlName="birthDate" class="input-modern w-full" />
            </div>
            <div>
              <label for="st-gender" class="block text-sm font-medium text-slate-700 mb-1">Género</label>
              <select id="st-gender" formControlName="gender" class="input-modern w-full">
                <option value="">— Seleccionar —</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>
            </div>
          </div>
        </section>

        <section class="space-y-3">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500">Contacto</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="st-email" class="block text-sm font-medium text-slate-700 mb-1">Correo electrónico *</label>
              <input id="st-email" type="email" formControlName="email" class="input-modern w-full" />
            </div>
            <div>
              <label for="st-phone" class="block text-sm font-medium text-slate-700 mb-1">Teléfono *</label>
              <input id="st-phone" type="tel" formControlName="phone" class="input-modern w-full" placeholder="9XXXXXXXX" />
            </div>
          </div>
          <div>
            <label for="st-address" class="block text-sm font-medium text-slate-700 mb-1">Dirección *</label>
            <input id="st-address" type="text" formControlName="address" class="input-modern w-full" />
          </div>
          <div>
            <label for="st-district" class="block text-sm font-medium text-slate-700 mb-1">Distrito</label>
            <input id="st-district" type="text" formControlName="district" class="input-modern w-full" />
          </div>
        </section>

        <section class="space-y-3">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500">Contacto de emergencia</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="st-em-name" class="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input id="st-em-name" type="text" formControlName="emergencyContactName" class="input-modern w-full" />
            </div>
            <div>
              <label for="st-em-phone" class="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
              <input id="st-em-phone" type="tel" formControlName="emergencyContactPhone" class="input-modern w-full" />
            </div>
          </div>
        </section>

        <section class="space-y-3">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500">Otros</h3>
          <div>
            <label for="st-condition" class="block text-sm font-medium text-slate-700 mb-1">Condición</label>
            <input id="st-condition" type="text" formControlName="condition" class="input-modern w-full" />
          </div>
          <div>
            <label for="st-notes" class="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
            <textarea id="st-notes" formControlName="notes" rows="2" class="input-modern w-full resize-none"></textarea>
          </div>
        </section>
      </form>

      <div class="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
        <button type="button" class="btn-ghost" (click)="cancel()">Cancelar</button>
        <button type="submit" form="enrollment-student-form" class="btn-primary" [disabled]="form.invalid">
          {{ isEdit() ? 'Guardar cambios' : 'Crear estudiante' }}
        </button>
      </div>
    </div>
  `,
})
export class EnrollmentStudentFormComponent implements OnInit {
  private readonly studentService = inject(EnrollmentStudentService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  protected readonly isEdit = signal(false);
  private studentId: number | null = null;

  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    documentType: ['DNI' as EnrollmentStudent['documentType'], Validators.required],
    documentNumber: ['', [Validators.required, Validators.minLength(6)]],
    birthDate: ['', Validators.required],
    gender: ['' as '' | 'M' | 'F' | 'O'],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(9)]],
    address: ['', Validators.required],
    district: [''],
    emergencyContactName: [''],
    emergencyContactPhone: [''],
    condition: ['Activo'],
    notes: [''],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit.set(true);
      this.studentId = Number(idParam);
      this.studentService.getById(this.studentId).subscribe(s => {
        if (s) this.form.patchValue({
          firstName: s.firstName,
          lastName: s.lastName,
          documentType: s.documentType,
          documentNumber: s.documentNumber,
          birthDate: s.birthDate,
          gender: s.gender ?? '',
          email: s.email,
          phone: s.phone,
          address: s.address,
          district: s.district ?? '',
          emergencyContactName: s.emergencyContactName ?? '',
          emergencyContactPhone: s.emergencyContactPhone ?? '',
          condition: s.condition,
          notes: s.notes ?? '',
        });
      });
    }
  }

  protected save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const payload = {
      firstName: v.firstName,
      lastName: v.lastName,
      documentType: v.documentType,
      documentNumber: v.documentNumber,
      birthDate: v.birthDate,
      gender: v.gender || undefined,
      email: v.email,
      phone: v.phone,
      address: v.address,
      district: v.district || undefined,
      emergencyContactName: v.emergencyContactName || undefined,
      emergencyContactPhone: v.emergencyContactPhone || undefined,
      condition: v.condition,
      notes: v.notes || undefined,
    };
    const req$ = this.isEdit() && this.studentId
      ? this.studentService.update(this.studentId, payload)
      : this.studentService.create(payload);
    req$.subscribe(() => this.router.navigate(['/', { outlets: { panel: null } }]));
  }

  protected cancel(): void {
    this.router.navigate(['/', { outlets: { panel: null } }]);
  }
}
