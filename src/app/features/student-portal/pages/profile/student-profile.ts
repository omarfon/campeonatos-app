import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { StudentProfileService } from '../../services/student-profile.service';
import { StudentSessionService } from '../../services/student-session.service';
import { StudentProfile, StudentProfileField } from '../../models/student-portal.model';
import { StudentSummaryCardComponent } from '../../components/summary-card/student-summary-card';

@Component({
  selector: 'app-student-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, StudentSummaryCardComponent],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="sp-page-title">Mi perfil</h1>
        <p class="text-sm text-slate-500 mt-1">Administra tu información personal y seguridad.</p>
      </div>

      @if (loading()) {
        <div class="sp-card p-8 animate-pulse">
          <div class="h-20 bg-slate-200 rounded-2xl"></div>
        </div>
      } @else if (profile(); as p) {
        <app-student-summary-card [profile]="p" />

        <section class="sp-card p-5 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="text-lg font-bold text-slate-900">Datos personales</h2>
            @if (!editing()) {
              <button type="button" class="btn-secondary !text-sm" (click)="startEdit()">Editar</button>
            }
          </div>

          @if (editing()) {
            <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
              @for (field of editableFields(); track field.key) {
                @if (field.editable) {
                  <div>
                    <label [for]="field.key" class="block text-sm font-medium text-slate-700 mb-1">
                      {{ field.label }}
                    </label>
                    <input [id]="field.key" type="text" [formControlName]="field.key" class="input-modern" />
                  </div>
                } @else {
                  <div>
                    <p class="text-sm text-slate-500">{{ field.label }}</p>
                    <p class="font-semibold text-slate-900">{{ field.value }}</p>
                  </div>
                }
              }
              @if (saveMessage()) {
                <p class="text-sm text-green-700" role="status">{{ saveMessage() }}</p>
              }
              @if (saveError()) {
                <p class="text-sm text-red-600" role="alert">{{ saveError() }}</p>
              }
              <div class="flex gap-3">
                <button type="submit" class="btn-primary" [disabled]="saving() || form.invalid">
                  {{ saving() ? 'Guardando...' : 'Guardar cambios' }}
                </button>
                <button type="button" class="btn-secondary" (click)="cancelEdit()">Cancelar</button>
              </div>
            </form>
          } @else {
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              @for (field of fields(); track field.key) {
                <div>
                  <p class="text-sm text-slate-500">{{ field.label }}</p>
                  <p class="font-semibold text-slate-900">{{ field.value }}</p>
                </div>
              }
            </div>
          }
        </section>

        <section class="sp-card p-5 space-y-4">
          <h2 class="text-lg font-bold text-slate-900">Seguridad</h2>
          <p class="text-sm text-slate-600">Cierra tu sesión en este dispositivo.</p>
          <button type="button" class="btn-secondary text-red-700 border-red-200 hover:bg-red-50"
            (click)="logout()">
            Cerrar sesión
          </button>
        </section>
      }
    </div>
  `,
})
export class StudentProfileComponent implements OnInit {
  private readonly profileService = inject(StudentProfileService);
  private readonly sessionService = inject(StudentSessionService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly profile = signal<StudentProfile | null>(null);
  protected readonly fields = signal<StudentProfileField[]>([]);
  protected readonly editableFields = signal<StudentProfileField[]>([]);
  protected readonly loading = signal(true);
  protected readonly editing = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveMessage = signal('');
  protected readonly saveError = signal('');

  protected readonly form = this.fb.group({
    email: [''],
    phone: [''],
    address: [''],
    district: [''],
  });

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: p => {
        this.profile.set(p);
        this.fields.set(this.profileService.getEditableFields(p));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected startEdit(): void {
    const p = this.profile();
    if (!p) return;
    const editable = this.profileService.getEditableFields(p);
    this.editableFields.set(editable);
    this.form.patchValue({
      email: p.email,
      phone: p.phone,
      address: p.address,
      district: p.district ?? '',
    });
    for (const field of editable) {
      if (!field.editable) {
        this.form.get(field.key)?.disable();
      }
    }
    this.editing.set(true);
    this.saveMessage.set('');
    this.saveError.set('');
  }

  protected cancelEdit(): void {
    this.editing.set(false);
    this.form.reset();
  }

  protected save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.saveMessage.set('');
    this.saveError.set('');
    const raw = this.form.getRawValue();
    this.profileService.updateProfile({
      email: raw.email ?? undefined,
      phone: raw.phone ?? undefined,
      address: raw.address ?? undefined,
      district: raw.district || undefined,
    }).subscribe({
      next: p => {
        this.profile.set(p);
        this.fields.set(this.profileService.getEditableFields(p));
        this.editing.set(false);
        this.saveMessage.set('Tus datos se actualizaron correctamente.');
        this.saving.set(false);
      },
      error: () => {
        this.saveError.set('No pudimos guardar los cambios. Intenta nuevamente.');
        this.saving.set(false);
      },
    });
  }

  protected logout(): void {
    this.sessionService.logout();
    this.router.navigate(['/portal-alumno/login']);
  }
}
