import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { AcademicClassStatus } from '../../enums/academic-class-status.enum';
import { ClassesFacade } from '../../facades/classes.facade';
import { ClassStatusBadgeComponent } from '../../components/class-status-badge/class-status-badge';
import { ClassStudentsTableComponent } from '../../components/class-students-table/class-students-table';
import { ClassSessionCalendarComponent } from '../../components/class-session-calendar/class-session-calendar';
import { SessionActionPanelComponent } from '../../components/session-action-panel/session-action-panel';
import { ConflictAlertComponent } from '../../components/conflict-alert/conflict-alert';
import { ClassDuplicateModalComponent } from '../../components/class-duplicate-modal/class-duplicate-modal';
import { CLASS_MODALITY_LABELS } from '../../enums/class-modality.enum';
import {
  ClassSession,
  ClassSummary,
  getCapacityAvailability,
  CAPACITY_AVAILABILITY_LABELS,
  buildScheduleLabel,
} from '../../models/class.model';
import { MOCK_CLASS_COURSES, MOCK_TEACHERS, MOCK_CAMPUSES, MOCK_ROOMS, MOCK_PERIODS } from '../../mocks/classes.mock';
import { ClassSessionStatus } from '../../enums/class-session-status.enum';
import { ClassDetailTabHash, isClassDetailTabHash } from '../../utils/class-url-hash.util';

type DetailTab = ClassDetailTabHash;

@Component({
  selector: 'app-class-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    FormsModule,
    ClassStatusBadgeComponent,
    ClassStudentsTableComponent,
    ClassSessionCalendarComponent,
    SessionActionPanelComponent,
    ConflictAlertComponent,
    ClassDuplicateModalComponent,
  ],
  template: `
    @if (facade.loading()) {
      <div class="space-y-6 animate-pulse" aria-busy="true" aria-label="Cargando clase">
        <div class="h-8 bg-slate-200 rounded w-1/3"></div>
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="section-card p-4 h-20 bg-slate-100"></div>
          }
        </div>
        <div class="section-card p-6 h-48 bg-slate-100"></div>
      </div>
    } @else if (!facade.selectedClass()) {
      <div class="section-card p-8 text-center">
        <p class="text-slate-600">Clase no encontrada.</p>
        <a routerLink="/clases" class="btn-primary mt-4 inline-flex">Volver</a>
      </div>
    } @else {
      <div class="space-y-6">
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <a routerLink="/clases" class="text-sm text-brand-600 hover:underline">← Clases</a>
            <h1 class="text-2xl font-extrabold text-slate-900 mt-2 uppercase">{{ courseName() }}</h1>
            <p class="text-sm font-mono text-slate-500">{{ facade.selectedClass()!.name }}</p>
            <p class="text-xs font-mono text-slate-400">{{ facade.selectedClass()!.code }}</p>
            <div class="mt-2">
              <app-class-status-badge [status]="facade.selectedClass()!.status" />
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            @if (!facade.isReadOnly(facade.selectedClass()!.status)) {
              <a [routerLink]="['/clases', facade.selectedClass()!.id, 'editar']" class="btn-secondary">Editar</a>
            }
            @if (facade.selectedClass()!.status === AcademicClassStatus.DRAFT) {
              <button type="button" class="btn-primary" (click)="openPublishModal()">Publicar</button>
            }
            <div class="relative">
              <button
                type="button"
                class="btn-secondary"
                [attr.aria-expanded]="actionsOpen()"
                aria-haspopup="true"
                (click)="actionsOpen.set(!actionsOpen())"
              >
                Más acciones
              </button>
              @if (actionsOpen()) {
                <div class="absolute right-0 mt-1 w-48 rounded-xl border bg-white shadow-lg py-1 z-20" role="menu">
                  <button type="button" class="w-full text-left px-4 py-2 text-sm hover:bg-slate-50" role="menuitem" (click)="duplicate()">Duplicar clase</button>
                  @if (facade.selectedClass()!.status !== AcademicClassStatus.CANCELLED) {
                    <button type="button" class="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50" role="menuitem" (click)="cancelClass()">Cancelar clase</button>
                  }
                </div>
              }
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div class="section-card p-4">
            <p class="text-xs font-semibold text-slate-500 uppercase">Matriculados</p>
            <p class="text-xl font-bold">{{ summary().enrolled }} / {{ summary().capacity }}</p>
          </div>
          <div class="section-card p-4">
            <p class="text-xs font-semibold text-slate-500 uppercase">Disponibles</p>
            <p class="text-xl font-bold">{{ summary().available }}</p>
          </div>
          <div class="section-card p-4">
            <p class="text-xs font-semibold text-slate-500 uppercase">Sesiones</p>
            <p class="text-xl font-bold">{{ summary().totalSessions }}</p>
          </div>
          <div class="section-card p-4">
            <p class="text-xs font-semibold text-slate-500 uppercase">Realizadas</p>
            <p class="text-xl font-bold">{{ summary().completedSessions }}</p>
          </div>
          <div class="section-card p-4">
            <p class="text-xs font-semibold text-slate-500 uppercase">Asistencia</p>
            <p class="text-xl font-bold">{{ summary().attendancePercentage ?? '—' }}@if (summary().attendancePercentage) { % }</p>
          </div>
        </div>

        <div class="border-b border-slate-200 flex flex-wrap gap-1" role="tablist">
          @for (tab of tabs; track tab.id) {
            <button
              type="button"
              role="tab"
              class="px-4 py-2 text-sm font-semibold rounded-t-lg focus-visible:ring-2 focus-visible:ring-brand-500"
              [class.bg-white]="activeTab() === tab.id"
              [class.text-brand-700]="activeTab() === tab.id"
              [class.border]="activeTab() === tab.id"
              [class.border-b-white]="activeTab() === tab.id"
              [class.text-slate-600]="activeTab() !== tab.id"
              [attr.aria-selected]="activeTab() === tab.id"
              (click)="setTab(tab.id)"
            >
              {{ tab.label }}
            </button>
          }
        </div>

        <div class="section-card p-6" role="tabpanel">
          @switch (activeTab()) {
            @case ('resumen') {
              <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div><dt class="text-slate-500">Curso</dt><dd class="font-semibold">{{ courseName() }}</dd></div>
                <div><dt class="text-slate-500">Periodo</dt><dd class="font-semibold">{{ periodName() }}</dd></div>
                <div><dt class="text-slate-500">Profesor</dt><dd class="font-semibold">{{ teacherName() }}</dd></div>
                <div><dt class="text-slate-500">Modalidad</dt><dd>{{ modalityLabel() }}</dd></div>
                <div><dt class="text-slate-500">Programación</dt><dd class="font-semibold">{{ scheduleLabel() }}</dd></div>
                <div><dt class="text-slate-500">Ubicación</dt><dd class="font-semibold">{{ campusName() }} · {{ roomName() }}</dd></div>
                <div><dt class="text-slate-500">Vigencia</dt><dd class="font-semibold">{{ facade.selectedClass()!.startDate }} — {{ facade.selectedClass()!.endDate }}</dd></div>
                <div><dt class="text-slate-500">Cupos</dt><dd class="font-semibold">{{ availLabel() }}</dd></div>
              </dl>
            }
            @case ('alumnos') {
              <app-class-students-table [students]="facade.enrolledStudents()" />
            }
            @case ('calendario') {
              <app-class-session-calendar
                [sessions]="facade.sessions()"
                [selectedId]="facade.selectedSession()?.id ?? null"
                (selectSession)="onSelectSession($event)"
              />
            }
            @case ('asistencia') {
              <p class="text-sm text-slate-500 mb-4">Asistencia por sesión (mock — integración con módulo de asistencia)</p>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b bg-slate-50 text-left">
                      <th class="py-2 px-4 text-xs font-semibold text-slate-500">Sesión</th>
                      <th class="py-2 px-4 text-xs font-semibold text-slate-500 text-right">Presentes</th>
                      <th class="py-2 px-4 text-xs font-semibold text-slate-500 text-right">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (s of completedSessions(); track s.id) {
                      <tr class="border-b border-slate-50">
                        <td class="py-2 px-4">{{ formatSessionDate(s.date) }}</td>
                        <td class="py-2 px-4 text-right">{{ mockPresent(s) }} / {{ facade.selectedClass()!.enrolled }}</td>
                        <td class="py-2 px-4 text-right font-semibold">91%</td>
                      </tr>
                    }
                  </tbody>
                </table>
                @if (completedSessions().length === 0) {
                  <p class="text-slate-600 mt-4">Aún no hay sesiones realizadas.</p>
                }
              </div>
            }
            @case ('configuracion') {
              <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div><dt class="text-slate-500">Matrícula habilitada</dt><dd>{{ facade.selectedClass()!.enrollmentEnabled ? 'Sí' : 'No' }}</dd></div>
                <div><dt class="text-slate-500">Lista de espera</dt><dd>{{ facade.selectedClass()!.waitingListEnabled ? 'Sí' : 'No' }}</dd></div>
                <div><dt class="text-slate-500">Capacidad máxima</dt><dd>{{ facade.selectedClass()!.capacity }}</dd></div>
                <div><dt class="text-slate-500">Cupo mínimo</dt><dd>{{ facade.selectedClass()!.minimumCapacity ?? '—' }}</dd></div>
                <div><dt class="text-slate-500">Portal Alumno</dt><dd>{{ facade.selectedClass()!.publicationChannels.studentPortal ? 'Visible' : 'Oculto' }}</dd></div>
                <div><dt class="text-slate-500">Portal Socio</dt><dd>{{ facade.selectedClass()!.publicationChannels.memberPortal ? 'Visible' : 'Oculto' }}</dd></div>
              </dl>
            }
            @case ('historial') {
              <ul class="space-y-3 text-sm">
                @for (h of facade.classHistory(); track h.id) {
                  <li>
                    <span class="text-slate-500">{{ h.date }} {{ h.time }}</span>
                    — {{ h.action }}
                    @if (h.detail) { <span class="text-slate-600">({{ h.detail }})</span> }
                  </li>
                }
              </ul>
            }
          }
        </div>
      </div>

      @if (facade.selectedSession()) {
        <app-session-action-panel
          [session]="facade.selectedSession()"
          (close)="facade.selectSession(null)"
        />
      }

      @if (showPublishModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" role="dialog" aria-modal="true">
          <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 class="text-lg font-bold">Validación de publicación</h2>
            <ul class="text-sm space-y-1">
              @for (v of facade.publishValidation(); track v.label) {
                <li [class.text-green-700]="v.valid" [class.text-red-600]="!v.valid">
                  {{ v.valid ? '✓' : '✗' }} {{ v.label }}
                </li>
              }
            </ul>
            @if (facade.conflicts().length > 0) {
              <app-conflict-alert [conflicts]="facade.conflicts()" />
            }
            <div class="flex gap-2 justify-end">
              <button type="button" class="btn-secondary" (click)="showPublishModal.set(false)">Cancelar</button>
              <button
                type="button"
                class="btn-primary"
                [disabled]="!facade.canPublish()"
                (click)="confirmPublish()"
              >
                Publicar
              </button>
            </div>
          </div>
        </div>
      }

      @if (showDuplicateModal()) {
        <app-class-duplicate-modal
          [classId]="facade.selectedClass()!.id"
          [className]="facade.selectedClass()!.name"
          [sourcePeriodId]="facade.selectedClass()!.periodId"
          [sourcePeriodName]="periodName()"
          (cancel)="showDuplicateModal.set(false)"
          (duplicated)="showDuplicateModal.set(false)"
        />
      }
    }
  `,
  host: { '(document:click)': 'actionsOpen.set(false)' },
})
export class ClassDetailPage implements OnInit {
  protected readonly AcademicClassStatus = AcademicClassStatus;
  protected readonly facade = inject(ClassesFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly activeTab = signal<DetailTab>('resumen');
  protected readonly actionsOpen = signal(false);
  protected readonly showPublishModal = signal(false);
  protected readonly showDuplicateModal = signal(false);

  protected readonly tabs: { id: DetailTab; label: string }[] = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'alumnos', label: 'Alumnos' },
    { id: 'calendario', label: 'Calendario' },
    { id: 'asistencia', label: 'Asistencia' },
    { id: 'configuracion', label: 'Configuración' },
    { id: 'historial', label: 'Historial' },
  ];

  protected readonly summary = computed((): ClassSummary => {
    const cls = this.facade.selectedClass();
    const sessions = this.facade.sessions();
    if (!cls) return { enrolled: 0, capacity: 0, available: 0, totalSessions: 0, completedSessions: 0 };
    return {
      enrolled: cls.enrolled,
      capacity: cls.capacity,
      available: cls.capacity - cls.enrolled,
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.status === ClassSessionStatus.COMPLETED).length,
      attendancePercentage: cls.enrolled > 0 ? 91 : undefined,
    };
  });

  protected readonly completedSessions = computed(() =>
    this.facade.sessions().filter(s => s.status === ClassSessionStatus.COMPLETED),
  );

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.facade.loadClass(id);

    this.route.fragment.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(fragment => {
      if (isClassDetailTabHash(fragment)) {
        this.activeTab.set(fragment);
      }
    });

    const legacyTab = this.route.snapshot.queryParamMap.get('tab');
    if (legacyTab === 'alumnos' || legacyTab === 'calendario') {
      this.setTab(legacyTab);
      return;
    }

    const fragment = this.route.snapshot.fragment;
    if (isClassDetailTabHash(fragment)) {
      this.activeTab.set(fragment);
    } else {
      this.setTab('resumen');
    }
  }

  protected setTab(tab: DetailTab): void {
    this.activeTab.set(tab);
    void this.router.navigate([], {
      relativeTo: this.route,
      fragment: tab,
      replaceUrl: true,
    });
  }

  protected onSelectSession(session: ClassSession): void {
    this.facade.selectSession(session);
  }

  protected courseName(): string {
    const cls = this.facade.selectedClass();
    return MOCK_CLASS_COURSES.find(c => c.id === cls?.courseId)?.name ?? '—';
  }

  protected periodName(): string {
    return MOCK_PERIODS.find(p => p.id === this.facade.selectedClass()?.periodId)?.name ?? '—';
  }

  protected teacherName(): string {
    const t = MOCK_TEACHERS.find(x => x.id === this.facade.selectedClass()?.teacherId);
    return t ? `${t.firstName} ${t.lastName}` : '—';
  }

  protected modalityLabel(): string {
    const cls = this.facade.selectedClass();
    return cls ? CLASS_MODALITY_LABELS[cls.modality] : '—';
  }

  protected campusName(): string {
    return MOCK_CAMPUSES.find(c => c.id === this.facade.selectedClass()?.campusId)?.name ?? '—';
  }

  protected roomName(): string {
    return MOCK_ROOMS.find(r => r.id === this.facade.selectedClass()?.roomId)?.name ?? '—';
  }

  protected scheduleLabel(): string {
    const cls = this.facade.selectedClass();
    return cls ? buildScheduleLabel(cls.scheduleRules) : '—';
  }

  protected availLabel(): string {
    const s = this.summary();
    return CAPACITY_AVAILABILITY_LABELS[getCapacityAvailability(s.available, s.capacity)];
  }

  protected formatSessionDate(date: string): string {
    return new Date(date + 'T12:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }).toUpperCase();
  }

  protected mockPresent(session: ClassSession): number {
    const enrolled = this.facade.selectedClass()?.enrolled ?? 0;
    return Math.max(0, enrolled - (session.id ?? 0) % 3);
  }

  protected confirmPublish(): void {
    const id = this.facade.selectedClass()?.id;
    if (id && this.facade.canPublish()) {
      this.facade.publishClass(id);
      this.showPublishModal.set(false);
    }
  }

  protected openPublishModal(): void {
    this.facade.validatePublishReadiness();
    this.showPublishModal.set(true);
  }

  protected duplicate(): void {
    this.actionsOpen.set(false);
    this.showDuplicateModal.set(true);
  }

  protected cancelClass(): void {
    this.actionsOpen.set(false);
    const id = this.facade.selectedClass()?.id;
    if (id) this.facade.cancelClass(id);
  }
}
