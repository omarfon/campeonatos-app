import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClassCreateWizardFacade } from '../../facades/class-create-wizard.facade';
import { ClassPublicationChannels } from '../../models/class.model';

@Component({
  selector: 'app-class-configuration',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          class="w-4 h-4 rounded border-slate-300"
          [ngModel]="facade.draft().enrollmentEnabled"
          (ngModelChange)="facade.patchDraft({ enrollmentEnabled: $event })"
        />
        <span class="text-sm font-medium text-slate-700">Habilitar matrícula</span>
      </label>

      @if (facade.draft().enrollmentEnabled) {
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="enr-start" class="block text-sm font-medium text-slate-700 mb-1">Inscripciones desde</label>
            <input
              id="enr-start"
              type="date"
              class="input-modern w-full"
              [ngModel]="facade.draft().enrollmentStartDate"
              (ngModelChange)="facade.patchDraft({ enrollmentStartDate: $event })"
            />
          </div>
          <div>
            <label for="enr-end" class="block text-sm font-medium text-slate-700 mb-1">Inscripciones hasta</label>
            <input
              id="enr-end"
              type="date"
              class="input-modern w-full"
              [ngModel]="facade.draft().enrollmentEndDate"
              (ngModelChange)="facade.patchDraft({ enrollmentEndDate: $event })"
            />
          </div>
        </div>
      }

      <div>
        <h3 class="text-sm font-semibold text-slate-700 mb-3">Visible en</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label class="flex items-center gap-2 p-3 rounded-lg border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              [ngModel]="facade.draft().publicationChannels.adminEnrollment"
              (ngModelChange)="updateChannel('adminEnrollment', $event)"
            />
            <span class="text-sm">Matrícula administrativa</span>
          </label>
          <label class="flex items-center gap-2 p-3 rounded-lg border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              [ngModel]="facade.draft().publicationChannels.studentPortal"
              (ngModelChange)="updateChannel('studentPortal', $event)"
            />
            <span class="text-sm">Portal Alumno</span>
          </label>
          <label class="flex items-center gap-2 p-3 rounded-lg border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              [ngModel]="facade.draft().publicationChannels.memberPortal"
              (ngModelChange)="updateChannel('memberPortal', $event)"
            />
            <span class="text-sm">Portal Socio</span>
          </label>
          <label class="flex items-center gap-2 p-3 rounded-lg border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              [ngModel]="facade.draft().publicationChannels.publicWeb"
              (ngModelChange)="updateChannel('publicWeb', $event)"
            />
            <span class="text-sm">Web pública</span>
          </label>
        </div>
      </div>

      @if (facade.selectedCourse(); as course) {
        <div class="rounded-xl bg-slate-50 p-4">
          <h3 class="text-sm font-semibold text-slate-700 mb-2">Restricciones de inscripción</h3>
          <p class="text-sm text-slate-600">Información del curso (referencial):</p>
          <ul class="text-sm text-slate-600 mt-2 space-y-1 list-disc pl-5">
            @if (course.levelName) {
              <li>Nivel: {{ course.levelName }}</li>
            }
            @if (course.requiredRoomType) {
              <li>Requiere ambiente tipo: {{ course.requiredRoomType }}</li>
            }
          </ul>
        </div>
      }
    </div>
  `,
})
export class ClassConfigurationComponent {
  protected readonly facade = inject(ClassCreateWizardFacade);

  protected updateChannel(key: keyof ClassPublicationChannels, value: boolean): void {
    this.facade.patchDraft({
      publicationChannels: {
        ...this.facade.draft().publicationChannels,
        [key]: value,
      },
    });
  }
}
