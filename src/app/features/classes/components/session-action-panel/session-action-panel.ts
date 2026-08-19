import { Component, ChangeDetectionStrategy, inject, input, output, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClassSession } from '../../models/class.model';
import { ClassSessionStatus, CLASS_SESSION_STATUS_LABELS } from '../../enums/class-session-status.enum';
import { ClassesFacade } from '../../facades/classes.facade';
import { MOCK_ROOMS, MOCK_TEACHERS } from '../../mocks/classes.mock';

export type SessionActionMode = 'detail' | 'reschedule' | 'cancel' | 'teacher' | 'room';

@Component({
  selector: 'app-session-action-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    @if (session(); as s) {
      <div
        class="fixed inset-0 z-40 flex justify-end"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="'Sesión ' + formatDate(s.date)"
      >
        <button type="button" class="flex-1 bg-black/30" aria-label="Cerrar panel" (click)="close.emit()"></button>
        <div class="w-full max-w-md bg-white shadow-xl h-full overflow-y-auto p-6 space-y-4">
          <div class="flex items-start justify-between gap-2">
            <h2 class="text-lg font-bold text-slate-900">Sesión</h2>
            <button type="button" class="p-1 rounded hover:bg-slate-100" aria-label="Cerrar" (click)="close.emit()">✕</button>
          </div>

          @if (mode() === 'detail') {
            <dl class="text-sm space-y-2">
              <div><dt class="text-slate-500">Fecha</dt><dd class="font-semibold">{{ formatDateLong(s.date) }}</dd></div>
              <div><dt class="text-slate-500">Horario</dt><dd>{{ s.startTime }} - {{ s.endTime }}</dd></div>
              <div><dt class="text-slate-500">Profesor</dt><dd>{{ teacherName(s.teacherId) }}</dd></div>
              <div><dt class="text-slate-500">Ambiente</dt><dd>{{ roomName(s.roomId) }}</dd></div>
              <div><dt class="text-slate-500">Estado</dt><dd>{{ statusLabel(s.status) }}</dd></div>
            </dl>
            @if (s.status !== ClassSessionStatus.COMPLETED && s.status !== ClassSessionStatus.CANCELLED) {
              <div class="flex flex-col gap-2 pt-2">
                <button type="button" class="btn-secondary !text-sm" (click)="mode.set('reschedule')">Reprogramar</button>
                <button type="button" class="btn-secondary !text-sm" (click)="mode.set('cancel')">Cancelar sesión</button>
                <button type="button" class="btn-secondary !text-sm" (click)="mode.set('teacher')">Cambiar profesor</button>
                <button type="button" class="btn-secondary !text-sm" (click)="mode.set('room')">Cambiar ambiente</button>
              </div>
            }
          }

          @if (mode() === 'reschedule') {
            <h3 class="font-semibold">Reprogramar sesión</h3>
            <p class="text-sm text-slate-500">Fecha actual: {{ s.date }}</p>
            <div class="space-y-3">
              <div>
                <label for="new-date" class="block text-sm font-medium mb-1">Nueva fecha</label>
                <input id="new-date" type="date" class="input-modern w-full" [(ngModel)]="newDate" />
              </div>
              <div class="flex gap-2">
                <div class="flex-1">
                  <label for="new-start" class="block text-sm font-medium mb-1">Inicio</label>
                  <input id="new-start" type="time" class="input-modern w-full" [(ngModel)]="newStartTime" />
                </div>
                <div class="flex-1">
                  <label for="new-end" class="block text-sm font-medium mb-1">Fin</label>
                  <input id="new-end" type="time" class="input-modern w-full" [(ngModel)]="newEndTime" />
                </div>
              </div>
              <div>
                <label for="reason-r" class="block text-sm font-medium mb-1">Motivo</label>
                <input id="reason-r" type="text" class="input-modern w-full" [(ngModel)]="reason" />
              </div>
              <button type="button" class="btn-primary w-full" [disabled]="facade.actionLoading()" (click)="confirmReschedule()">
                Confirmar reprogramación
              </button>
            </div>
          }

          @if (mode() === 'cancel') {
            <h3 class="font-semibold">Cancelar sesión</h3>
            <div class="space-y-3">
              <div>
                <label for="reason-c" class="block text-sm font-medium mb-1">Motivo *</label>
                <input id="reason-c" type="text" class="input-modern w-full" [(ngModel)]="reason" />
              </div>
              <label class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="requiresRecovery" />
                <span class="text-sm">¿Requiere recuperación?</span>
              </label>
              <button type="button" class="btn-primary w-full" [disabled]="!reason.trim() || facade.actionLoading()" (click)="confirmCancel()">
                Confirmar cancelación
              </button>
            </div>
          }

          @if (mode() === 'teacher') {
            <h3 class="font-semibold">Cambiar profesor</h3>
            <p class="text-sm text-slate-500">Actual: {{ teacherName(s.teacherId) }}</p>
            <select class="input-modern w-full" [(ngModel)]="newTeacherId">
              @for (t of teachers; track t.id) {
                <option [ngValue]="t.id">{{ t.firstName }} {{ t.lastName }}</option>
              }
            </select>
            <fieldset class="space-y-2 text-sm">
              <legend class="font-medium mb-1">Aplicar a</legend>
              <label class="flex gap-2"><input type="radio" name="t-scope" value="session" [(ngModel)]="teacherScope" /> Esta sesión</label>
              <label class="flex gap-2"><input type="radio" name="t-scope" value="from_date" [(ngModel)]="teacherScope" /> Desde esta fecha</label>
              <label class="flex gap-2"><input type="radio" name="t-scope" value="future" [(ngModel)]="teacherScope" /> Todas las sesiones futuras</label>
            </fieldset>
            <button type="button" class="btn-primary w-full" [disabled]="facade.actionLoading()" (click)="confirmTeacher()">
              Aplicar cambio
            </button>
          }

          @if (mode() === 'room') {
            <h3 class="font-semibold">Cambiar ambiente</h3>
            <p class="text-sm text-slate-500">Actual: {{ roomName(s.roomId) }}</p>
            <select class="input-modern w-full" [(ngModel)]="newRoomId">
              @for (r of rooms; track r.id) {
                <option [ngValue]="r.id">{{ r.name }}</option>
              }
            </select>
            <fieldset class="space-y-2 text-sm">
              <legend class="font-medium mb-1">Aplicar a</legend>
              <label class="flex gap-2"><input type="radio" name="r-scope" value="session" [(ngModel)]="roomScope" /> Esta sesión</label>
              <label class="flex gap-2"><input type="radio" name="r-scope" value="future" [(ngModel)]="roomScope" /> Sesiones futuras</label>
            </fieldset>
            <button type="button" class="btn-primary w-full" [disabled]="facade.actionLoading()" (click)="confirmRoom()">
              Aplicar cambio
            </button>
          }
        </div>
      </div>
    }
  `,
})
export class SessionActionPanelComponent {
  readonly session = input<ClassSession | null>(null);
  readonly close = output<void>();

  protected readonly facade = inject(ClassesFacade);
  protected readonly ClassSessionStatus = ClassSessionStatus;
  protected readonly teachers = MOCK_TEACHERS;
  protected readonly rooms = MOCK_ROOMS;

  protected readonly mode = signal<SessionActionMode>('detail');
  protected newDate = '';
  protected newStartTime = '';
  protected newEndTime = '';
  protected reason = '';
  protected requiresRecovery = false;
  protected newTeacherId = 0;
  protected teacherScope: 'session' | 'from_date' | 'future' = 'session';
  protected newRoomId = 0;
  protected roomScope: 'session' | 'future' = 'session';

  constructor() {
    effect(() => {
      const s = this.session();
      if (s) {
        this.mode.set('detail');
        this.newDate = s.date;
        this.newStartTime = s.startTime;
        this.newEndTime = s.endTime;
        this.newTeacherId = s.teacherId;
        this.newRoomId = s.roomId ?? 0;
        this.reason = '';
      }
    });
  }

  protected formatDate(date: string): string {
    return new Date(date + 'T12:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
  }

  protected formatDateLong(date: string): string {
    return new Date(date + 'T12:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  protected teacherName(id: number): string {
    const t = MOCK_TEACHERS.find(x => x.id === id);
    return t ? `${t.firstName} ${t.lastName}` : '—';
  }

  protected roomName(id?: number): string {
    return MOCK_ROOMS.find(r => r.id === id)?.name ?? '—';
  }

  protected statusLabel(status: ClassSessionStatus): string {
    return CLASS_SESSION_STATUS_LABELS[status];
  }

  protected confirmReschedule(): void {
    const s = this.session();
    if (!s?.id) return;
    this.facade.rescheduleSession({
      sessionId: s.id,
      newDate: this.newDate,
      newStartTime: this.newStartTime,
      newEndTime: this.newEndTime,
      reason: this.reason,
    });
  }

  protected confirmCancel(): void {
    const s = this.session();
    if (!s?.id || !this.reason.trim()) return;
    this.facade.cancelSession({
      sessionId: s.id,
      reason: this.reason.trim(),
      requiresRecovery: this.requiresRecovery,
    });
  }

  protected confirmTeacher(): void {
    const s = this.session();
    if (!s?.id) return;
    this.facade.changeSessionTeacher({
      sessionId: s.id,
      newTeacherId: this.newTeacherId,
      scope: this.teacherScope,
      fromDate: s.date,
    });
  }

  protected confirmRoom(): void {
    const s = this.session();
    if (!s?.id) return;
    this.facade.changeSessionRoom({
      sessionId: s.id,
      newRoomId: this.newRoomId,
      scope: this.roomScope,
    });
  }
}
