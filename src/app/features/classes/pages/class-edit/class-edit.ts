import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClassesFacade } from '../../facades/classes.facade';
import { ACADEMIC_CLASS_STATUS_LABELS } from '../../enums/academic-class-status.enum';
import { ScheduleBuilderComponent } from '../../components/schedule-builder/schedule-builder';
import { TeacherSelectorComponent } from '../../components/teacher-selector/teacher-selector';
import { ClassCapacityComponent } from '../../components/class-capacity/class-capacity';
import { ClassConfigurationComponent } from '../../components/class-configuration/class-configuration';
import { ClassCreateWizardFacade } from '../../facades/class-create-wizard.facade';
import { ClassService } from '../../services/class.service';
import { ClassModel } from '../../models/class.model';

@Component({
  selector: 'app-class-edit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ClassCreateWizardFacade],
  imports: [
    RouterLink,
    FormsModule,
    ScheduleBuilderComponent,
    TeacherSelectorComponent,
    ClassCapacityComponent,
    ClassConfigurationComponent,
  ],
  template: `
    @if (facade.loading()) {
      <div class="section-card p-8 text-center text-slate-500">Cargando...</div>
    } @else if (!facade.selectedClass()) {
      <div class="section-card p-8 text-center">
        <p>Clase no encontrada.</p>
        <a routerLink="/clases" class="btn-primary mt-4 inline-flex">Volver</a>
      </div>
    } @else if (facade.isReadOnly(facade.selectedClass()!.status)) {
      <div class="space-y-4">
        <a [routerLink]="['/clases', classId]" class="text-sm text-brand-600 hover:underline">← Detalle</a>
        <div class="section-card p-8 text-center">
          <p class="text-slate-600">Esta clase está en estado <strong>{{ statusLabel() }}</strong> y no puede editarse.</p>
          <a [routerLink]="['/clases', classId]" class="btn-secondary mt-4 inline-flex">Volver al detalle</a>
        </div>
      </div>
    } @else {
      <div class="space-y-6">
        <div>
          <a [routerLink]="['/clases', classId]" class="text-sm text-brand-600 hover:underline">← Volver al detalle</a>
          <h1 class="text-2xl font-extrabold text-slate-900 mt-2">Editar clase</h1>
          <p class="text-sm text-slate-500 mt-1">
            {{ facade.selectedClass()!.code }} · {{ statusLabel() }} —
            @if (facade.canEditFully(facade.selectedClass()!.status)) {
              Edición completa
            } @else {
              Edición controlada (no puede cambiar periodo, curso ni programación)
            }
          </p>
        </div>

        <div class="section-card p-6 space-y-6">
          @if (permissions().name || permissions().description) {
            <section class="space-y-4">
              <h2 class="text-sm font-semibold text-slate-700 uppercase">Información</h2>
              @if (permissions().name) {
                <div>
                  <label for="edit-name" class="block text-sm font-medium mb-1">Nombre</label>
                  <input id="edit-name" type="text" class="input-modern w-full" [(ngModel)]="form.name" />
                </div>
              }
              @if (permissions().description) {
                <div>
                  <label for="edit-desc" class="block text-sm font-medium mb-1">Descripción</label>
                  <textarea id="edit-desc" rows="2" class="input-modern w-full" [(ngModel)]="form.description"></textarea>
                </div>
              }
            </section>
          }

          @if (permissions().structural) {
            <section>
              <h2 class="text-sm font-semibold text-slate-700 uppercase mb-4">Programación</h2>
              <app-schedule-builder />
            </section>
          }

          @if (permissions().resources) {
            <section>
              <h2 class="text-sm font-semibold text-slate-700 uppercase mb-4">Profesor y ambiente</h2>
              <app-teacher-selector />
            </section>
          }

          @if (permissions().capacity) {
            <section>
              <h2 class="text-sm font-semibold text-slate-700 uppercase mb-4">Capacidad</h2>
              <app-class-capacity />
            </section>
          }

          @if (permissions().enrollment || permissions().publication) {
            <section>
              <h2 class="text-sm font-semibold text-slate-700 uppercase mb-4">Matrícula y publicación</h2>
              <app-class-configuration />
            </section>
          }

          @if (saved()) {
            <p class="text-sm text-green-700 font-medium" role="status">Cambios guardados correctamente.</p>
          }
        </div>

        <div class="flex gap-2 justify-end">
          <a [routerLink]="['/clases', classId]" class="btn-secondary">Cancelar</a>
          <button type="button" class="btn-primary" [disabled]="facade.actionLoading()" (click)="save()">
            Guardar cambios
          </button>
        </div>
      </div>
    }
  `,
})
export class ClassEditPage implements OnInit {
  protected readonly facade = inject(ClassesFacade);
  protected readonly wizard = inject(ClassCreateWizardFacade);
  private readonly classService = inject(ClassService);
  private readonly route = inject(ActivatedRoute);
  protected classId = 0;

  protected form = { name: '', description: '' };
  protected readonly saved = signal(false);

  protected readonly permissions = computed(() => {
    const cls = this.facade.selectedClass();
    return cls ? this.facade.getEditPermissions(cls.status) : {
      name: false, description: false, structural: false, resources: false,
      capacity: false, enrollment: false, publication: false,
    };
  });

  ngOnInit(): void {
    this.classId = Number(this.route.snapshot.paramMap.get('id'));
    this.facade.loadClass(this.classId);
    this.classService.getClass(this.classId).subscribe(cls => {
      if (cls) {
        this.form = { name: cls.name, description: cls.description ?? '' };
        this.wizard.init();
        this.syncWizardFromClass(cls);
      }
    });
  }

  protected statusLabel(): string {
    const cls = this.facade.selectedClass();
    return cls ? ACADEMIC_CLASS_STATUS_LABELS[cls.status] : '—';
  }

  protected save(): void {
    const cls = this.facade.selectedClass();
    if (!cls) return;
    const d = this.wizard.draft();
    const changes: Partial<ClassModel> = {};

    if (this.permissions().name) changes.name = this.form.name.trim() || d.name;
    if (this.permissions().description) changes.description = this.form.description.trim();
    if (this.permissions().structural) {
      changes.startDate = d.startDate;
      changes.endDate = d.endDate;
      changes.scheduleRules = d.scheduleRules;
    }
    if (this.permissions().resources) {
      changes.teacherId = d.teacherId;
      changes.campusId = d.campusId;
      changes.roomId = d.roomId;
      changes.modality = d.modality;
      changes.platform = d.platform;
      changes.accessInfo = d.accessInfo;
    }
    if (this.permissions().capacity) {
      changes.capacity = d.capacity;
      changes.minimumCapacity = d.minimumCapacity;
      changes.warningCapacity = d.warningCapacity;
      changes.waitingListEnabled = d.waitingListEnabled;
      changes.waitingListMax = d.waitingListMax;
      changes.overbookingPolicy = d.overbookingPolicy;
    }
    if (this.permissions().enrollment) {
      changes.enrollmentEnabled = d.enrollmentEnabled;
      changes.enrollmentStartDate = d.enrollmentStartDate;
      changes.enrollmentEndDate = d.enrollmentEndDate;
    }
    if (this.permissions().publication) {
      changes.publicationChannels = d.publicationChannels;
    }

    this.facade.updateClass(cls.id, changes);
    this.saved.set(true);
  }

  private syncWizardFromClass(cls: ClassModel): void {
    this.wizard.patchDraft({
      name: cls.name,
      description: cls.description ?? '',
      periodId: cls.periodId,
      activityId: cls.activityId,
      courseId: cls.courseId,
      teacherId: cls.teacherId,
      modality: cls.modality,
      campusId: cls.campusId ?? 0,
      roomId: cls.roomId ?? 0,
      platform: cls.platform ?? '',
      accessInfo: cls.accessInfo ?? '',
      startDate: cls.startDate,
      endDate: cls.endDate,
      scheduleRules: [...cls.scheduleRules],
      capacity: cls.capacity,
      minimumCapacity: cls.minimumCapacity ?? 5,
      warningCapacity: cls.warningCapacity ?? 3,
      waitingListEnabled: cls.waitingListEnabled,
      waitingListMax: cls.waitingListMax ?? 10,
      overbookingPolicy: cls.overbookingPolicy,
      enrollmentEnabled: cls.enrollmentEnabled,
      enrollmentStartDate: cls.enrollmentStartDate ?? '',
      enrollmentEndDate: cls.enrollmentEndDate ?? '',
      publicationChannels: { ...cls.publicationChannels },
    });
    this.wizard.onActivityChange(cls.activityId);
    if (cls.campusId) this.wizard.onCampusChange(cls.campusId);
  }
}
