import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClassCreateWizardFacade } from '../../facades/class-create-wizard.facade';
import { ClassModality } from '../../enums/class-modality.enum';
import { ConflictAlertComponent } from '../conflict-alert/conflict-alert';

@Component({
  selector: 'app-teacher-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ConflictAlertComponent],
  template: `
    <div class="space-y-6">
      <div>
        <h3 class="text-sm font-semibold text-slate-700 mb-2">Profesor / instructor *</h3>
        <label for="teacher-search" class="sr-only">Buscar profesor</label>
        <input
          id="teacher-search"
          type="search"
          class="input-modern w-full mb-3"
          placeholder="Buscar profesor..."
          [(ngModel)]="teacherQuery"
        />
        <ul class="space-y-2 max-h-48 overflow-y-auto" role="listbox" aria-label="Lista de profesores">
          @for (t of filteredTeachers(); track t.id) {
            <li>
              <button
                type="button"
                role="option"
                class="w-full text-left p-3 rounded-xl border transition-colors"
                [class.border-brand]="facade.draft().teacherId === t.id"
                [class.bg-brand/5]="facade.draft().teacherId === t.id"
                [class.border-slate-200]="facade.draft().teacherId !== t.id"
                [attr.aria-selected]="facade.draft().teacherId === t.id"
                (click)="selectTeacher(t.id)"
              >
                <span class="font-semibold text-slate-900">{{ t.firstName }} {{ t.lastName }}</span>
                <span class="block text-xs text-slate-500">{{ t.specialties.join(', ') }}</span>
                <span class="text-xs font-medium text-green-700">Disponible</span>
              </button>
            </li>
          }
        </ul>
      </div>

      @if (facade.selectedTeacher(); as teacher) {
        <div class="rounded-xl bg-slate-50 p-4 space-y-2">
          <p class="text-xs font-semibold uppercase text-slate-500">{{ teacher.firstName }} {{ teacher.lastName }}</p>
          <p class="text-sm"><span class="text-slate-500">Especialidad:</span> {{ teacher.specialties.join(', ') }}</p>
          <p class="text-sm text-slate-600">Disponibilidad: L-M-V 07:00-12:00 · L-M-V 17:00-21:00</p>
        </div>
      }

      @if (teacherConflicts().length > 0) {
        <app-conflict-alert [conflicts]="teacherConflicts()" title="Conflicto de horario" />
      }

      <!-- Sede y ambiente -->
      @if (needsLocation()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <label for="campus" class="block text-sm font-medium text-slate-700 mb-1">Sede *</label>
            <select
              id="campus"
              class="input-modern w-full"
              [ngModel]="facade.draft().campusId"
              (ngModelChange)="facade.onCampusChange(+$event || 0)"
            >
              <option [ngValue]="0">Seleccionar...</option>
              @for (c of facade.campuses(); track c.id) {
                <option [ngValue]="c.id">{{ c.name }}</option>
              }
            </select>
          </div>
          <div>
            <label for="room" class="block text-sm font-medium text-slate-700 mb-1">Ambiente *</label>
            <select
              id="room"
              class="input-modern w-full"
              [ngModel]="facade.draft().roomId"
              (ngModelChange)="onRoomChange(+$event || 0)"
            >
              <option [ngValue]="0">Seleccionar...</option>
              @for (r of facade.rooms(); track r.id) {
                <option [ngValue]="r.id">{{ r.name }} ({{ r.type }})</option>
              }
            </select>
          </div>
        </div>
        @if (roomConflicts().length > 0) {
          <app-conflict-alert [conflicts]="roomConflicts()" title="Ambiente no disponible" />
        }
      }

      @if (needsVirtual()) {
        <div class="space-y-4 pt-4 border-t border-slate-100">
          <div>
            <label for="platform" class="block text-sm font-medium text-slate-700 mb-1">Plataforma *</label>
            <input
              id="platform"
              type="text"
              class="input-modern w-full"
              placeholder="Ej: Zoom, Teams"
              [ngModel]="facade.draft().platform"
              (ngModelChange)="facade.patchDraft({ platform: $event })"
            />
          </div>
          <div>
            <label for="access-info" class="block text-sm font-medium text-slate-700 mb-1">Información de acceso</label>
            <textarea
              id="access-info"
              rows="2"
              class="input-modern w-full"
              [ngModel]="facade.draft().accessInfo"
              (ngModelChange)="facade.patchDraft({ accessInfo: $event })"
            ></textarea>
          </div>
        </div>
      }
    </div>
  `,
})
export class TeacherSelectorComponent {
  protected readonly facade = inject(ClassCreateWizardFacade);
  protected teacherQuery = '';

  protected filteredTeachers() {
    const q = this.teacherQuery.trim().toLowerCase();
    const list = this.facade.teachers();
    if (!q) return list;
    return list.filter(t =>
      `${t.firstName} ${t.lastName}`.toLowerCase().includes(q) ||
      t.specialties.some(s => s.toLowerCase().includes(q)),
    );
  }

  protected selectTeacher(id: number): void {
    this.facade.patchDraft({ teacherId: id });
    this.facade.runAvailabilityChecks();
  }

  protected onRoomChange(roomId: number): void {
    this.facade.patchDraft({ roomId });
    this.facade.runAvailabilityChecks();
  }

  protected needsLocation(): boolean {
    const m = this.facade.draft().modality;
    return m === ClassModality.ONSITE || m === ClassModality.HYBRID;
  }

  protected needsVirtual(): boolean {
    const m = this.facade.draft().modality;
    return m === ClassModality.ONLINE || m === ClassModality.HYBRID;
  }

  protected teacherConflicts() {
    return this.facade.conflicts().filter(c => c.type === 'TEACHER');
  }

  protected roomConflicts() {
    return this.facade.conflicts().filter(c => c.type === 'ROOM');
  }
}
