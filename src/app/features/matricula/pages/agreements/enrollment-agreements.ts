import {
  Component, inject, signal, computed, OnInit, ChangeDetectionStrategy,
  DestroyRef, HostListener,
} from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { EnrollmentAgreementService } from '../../services/enrollment-agreement.service';
import { EnrollmentCourseService } from '../../services/enrollment-course.service';
import { confirmDialog } from '../../../../shared/confirm-dialog';
import {
  EnrollmentAgreement,
  EnrollmentCourse,
  AGREEMENT_STATUS_LABELS,
  AgreementFilters,
} from '../../models/enrollment.model';

interface AgreementMenuAction {
  id: string;
  label: string;
  type: 'link' | 'action';
  route?: (string | number)[];
  danger?: boolean;
  disabled?: boolean;
  action?: () => void;
}

@Component({
  selector: 'app-enrollment-agreements-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">Convenios en matrícula</h1>
          <p class="text-sm text-slate-500 mt-0.5">Consulta de convenios aplicables al proceso de matrícula</p>
        </div>
        <a [routerLink]="['/', { outlets: { primary: ['matricula', 'convenios'], panel: ['matricula', 'convenios', 'nuevo'] } }]"
          class="btn-primary shrink-0">
          + Nuevo convenio
        </a>
      </div>

      <div class="section-card p-4 space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="lg:col-span-2">
            <label for="agr-search" class="block text-xs font-semibold text-slate-500 mb-1">Buscar convenio</label>
            <input id="agr-search" type="search" class="input-modern !py-1.5 !text-sm w-full"
              placeholder="Nombre, empresa o beneficio..."
              [(ngModel)]="filterSearch" (ngModelChange)="applyFilters()" />
          </div>
          <div>
            <label for="agr-company" class="block text-xs font-semibold text-slate-500 mb-1">Empresa</label>
            <input id="agr-company" type="search" class="input-modern !py-1.5 !text-sm w-full"
              placeholder="Razón social..."
              [(ngModel)]="filterCompany" (ngModelChange)="applyFilters()" />
          </div>
          <div>
            <label for="agr-status" class="block text-xs font-semibold text-slate-500 mb-1">Estado</label>
            <select id="agr-status" class="input-modern !py-1.5 !text-sm w-full"
              [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()">
              <option value="">Todos</option>
              @for (s of statusOptions; track s) {
                <option [value]="s">{{ statusLabel(s) }}</option>
              }
            </select>
          </div>
          <div>
            <label for="agr-coverage" class="block text-xs font-semibold text-slate-500 mb-1">Cobertura mín. (%)</label>
            <input id="agr-coverage" type="number" min="0" max="100" class="input-modern !py-1.5 !text-sm w-full"
              placeholder="Ej. 20"
              [(ngModel)]="filterCoverageMin" (ngModelChange)="applyFilters()" />
          </div>
          <div>
            <label for="agr-campus" class="block text-xs font-semibold text-slate-500 mb-1">Sede</label>
            <select id="agr-campus" class="input-modern !py-1.5 !text-sm w-full"
              [(ngModel)]="filterCampus" (ngModelChange)="applyFilters()">
              <option value="">Todas</option>
              @for (c of campuses; track c) {
                <option [value]="c">{{ c }}</option>
              }
            </select>
          </div>
          <div>
            <label for="agr-from" class="block text-xs font-semibold text-slate-500 mb-1">Vigencia desde</label>
            <input id="agr-from" type="date" class="input-modern !py-1.5 !text-sm w-full"
              [(ngModel)]="filterValidFrom" (ngModelChange)="applyFilters()" />
          </div>
          <div>
            <label for="agr-to" class="block text-xs font-semibold text-slate-500 mb-1">Vigencia hasta</label>
            <input id="agr-to" type="date" class="input-modern !py-1.5 !text-sm w-full"
              [(ngModel)]="filterValidTo" (ngModelChange)="applyFilters()" />
          </div>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
          <p class="text-xs text-slate-500">{{ filtered().length }} convenio(s) encontrado(s)</p>
          @if (hasFilters()) {
            <button type="button" class="btn-ghost !text-sm" (click)="clearFilters()">Limpiar filtros</button>
          }
        </div>
      </div>

      <div class="section-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 text-left">
                <th class="py-2 px-4 text-xs font-semibold text-slate-500 w-8"></th>
                <th class="py-2 px-4 text-xs font-semibold text-slate-500">Convenio</th>
                <th class="py-2 px-4 text-xs font-semibold text-slate-500">Empresa</th>
                <th class="py-2 px-4 text-xs font-semibold text-slate-500">Vigencia</th>
                <th class="py-2 px-4 text-xs font-semibold text-slate-500 text-right">Cobertura</th>
                <th class="py-2 px-4 text-xs font-semibold text-slate-500">Beneficio</th>
                <th class="py-2 px-4 text-xs font-semibold text-slate-500 text-center">Cursos</th>
                <th class="py-2 px-4 text-xs font-semibold text-slate-500">Estado</th>
                <th class="py-2 px-4 text-xs font-semibold text-slate-500 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (a of filtered(); track a.id) {
                <tr class="border-b border-slate-100 hover:bg-slate-50">
                  <td class="py-2 px-4">
                    <button type="button" class="text-slate-400 hover:text-brand font-bold w-6 h-6"
                      [attr.aria-expanded]="expandedId() === a.id"
                      [attr.aria-label]="expandedId() === a.id ? 'Ocultar detalle' : 'Ver detalle'"
                      (click)="toggleDetail(a.id)">
                      {{ expandedId() === a.id ? '−' : '+' }}
                    </button>
                  </td>
                  <td class="py-2 px-4 font-semibold text-slate-900">{{ a.name }}</td>
                  <td class="py-2 px-4 text-slate-600">{{ a.company }}</td>
                  <td class="py-2 px-4 text-xs whitespace-nowrap">{{ a.validFrom }} — {{ a.validTo }}</td>
                  <td class="py-2 px-4 text-right font-semibold">{{ a.coveragePercentage }}%</td>
                  <td class="py-2 px-4 text-brand font-medium">{{ a.benefitSummary }}</td>
                  <td class="py-2 px-4 text-center">{{ a.allowedCourseIds.length }}</td>
                  <td class="py-2 px-4">
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full" [class]="statusClass(a.status)">
                      {{ statusLabel(a.status) }}
                    </span>
                  </td>
                  <td class="py-2 px-4 text-right">
                    <div class="relative inline-block">
                      <button type="button"
                        class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/80 hover:text-slate-800"
                        [attr.aria-expanded]="openMenuId() === a.id"
                        aria-haspopup="menu"
                        [attr.aria-label]="'Acciones para ' + a.name"
                        (click)="toggleMenu(a.id, $event)">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <circle cx="12" cy="5" r="1.75"/><circle cx="12" cy="12" r="1.75"/><circle cx="12" cy="19" r="1.75"/>
                        </svg>
                      </button>
                      @if (openMenuId() === a.id) {
                        <div class="absolute right-0 top-full mt-1 z-30 min-w-[11rem] py-1 bg-white border border-slate-200 rounded-xl shadow-lg"
                          role="menu" (click)="$event.stopPropagation()">
                          @for (item of menuActions(a); track item.id) {
                            @if (item.type === 'link') {
                              <a [routerLink]="item.route!"
                                class="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50 text-slate-700"
                                role="menuitem"
                                (click)="closeMenu()">
                                {{ item.label }}
                              </a>
                            } @else {
                              <button type="button"
                                class="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                [class]="item.danger ? 'text-red-600' : 'text-slate-700'"
                                role="menuitem"
                                [disabled]="item.disabled"
                                (click)="runMenuAction(item)">
                                {{ item.label }}
                              </button>
                            }
                          }
                        </div>
                      }
                    </div>
                  </td>
                </tr>
                @if (expandedId() === a.id) {
                  <tr class="bg-slate-50">
                    <td colspan="9" class="py-4 px-6">
                      <div class="max-w-4xl space-y-4">
                        <h3 class="text-sm font-bold uppercase tracking-wider text-slate-500">Detalle del convenio</h3>
                        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                          <div><dt class="text-slate-500">Descripción</dt><dd class="font-medium">{{ a.description }}</dd></div>
                          <div><dt class="text-slate-500">Condiciones</dt><dd class="font-medium">{{ a.conditions }}</dd></div>
                          <div><dt class="text-slate-500">Beneficio</dt><dd class="font-medium text-brand">{{ a.benefitSummary }}</dd></div>
                          <div><dt class="text-slate-500">Cobertura</dt><dd class="font-medium">{{ a.coveragePercentage }}%</dd></div>
                        </dl>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p class="text-xs font-semibold uppercase text-slate-500 mb-2">Modalidades permitidas</p>
                            <ul class="space-y-1 text-sm">
                              @for (m of a.allowedModalities; track m) {
                                <li class="flex items-center gap-2"><span class="text-brand" aria-hidden="true">•</span>{{ m }}</li>
                              }
                            </ul>
                          </div>
                          <div>
                            <p class="text-xs font-semibold uppercase text-slate-500 mb-2">Sedes permitidas</p>
                            <ul class="space-y-1 text-sm">
                              @for (c of a.allowedCampuses; track c) {
                                <li class="flex items-center gap-2"><span class="text-brand" aria-hidden="true">•</span>{{ c }}</li>
                              }
                            </ul>
                          </div>
                          <div>
                            <p class="text-xs font-semibold uppercase text-slate-500 mb-2">Cursos aplicables</p>
                            <ul class="space-y-1 text-sm">
                              @for (name of courseNames(a); track name) {
                                <li class="flex items-center gap-2"><span class="text-brand" aria-hidden="true">•</span>{{ name }}</li>
                              } @empty {
                                <li class="text-slate-400">Sin cursos configurados</li>
                              }
                            </ul>
                          </div>
                        </div>

                        <a routerLink="/matricula/reglas" class="inline-block text-sm font-semibold text-brand hover:underline">
                          Ver reglas de matrícula →
                        </a>
                      </div>
                    </td>
                  </tr>
                }
              } @empty {
                <tr>
                  <td colspan="9" class="py-10 text-center text-slate-400">
                    No hay convenios que coincidan con la búsqueda.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class EnrollmentAgreementsPageComponent implements OnInit {
  private readonly service = inject(EnrollmentAgreementService);
  private readonly courseService = inject(EnrollmentCourseService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly items = signal<EnrollmentAgreement[]>([]);
  protected readonly courses = signal<EnrollmentCourse[]>([]);
  protected readonly expandedId = signal<number | null>(null);
  protected readonly openMenuId = signal<number | null>(null);

  protected filterSearch = '';
  protected filterCompany = '';
  protected filterStatus: EnrollmentAgreement['status'] | '' = '';
  protected filterCoverageMin: number | null = null;
  protected filterValidFrom = '';
  protected filterValidTo = '';
  protected filterCampus = '';

  protected readonly campuses = ['AELU Principal', 'AELU Sede Norte', 'AELU Virtual'];
  protected readonly statusOptions: EnrollmentAgreement['status'][] = ['active', 'expired', 'suspended'];

  protected readonly filtered = computed(() => this.items());

  ngOnInit(): void {
    this.courseService.getCourses().subscribe(list => this.courses.set(list));
    this.load();
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(e => {
      if (e.urlAfterRedirects.includes('/matricula/convenios')) {
        this.load();
      }
    });
  }

  protected applyFilters(): void {
    this.expandedId.set(null);
    this.load();
  }

  protected clearFilters(): void {
    this.filterSearch = '';
    this.filterCompany = '';
    this.filterStatus = '';
    this.filterCoverageMin = null;
    this.filterValidFrom = '';
    this.filterValidTo = '';
    this.filterCampus = '';
    this.applyFilters();
  }

  protected hasFilters(): boolean {
    return !!(
      this.filterSearch.trim() ||
      this.filterCompany.trim() ||
      this.filterStatus ||
      (this.filterCoverageMin != null && this.filterCoverageMin > 0) ||
      this.filterValidFrom ||
      this.filterValidTo ||
      this.filterCampus
    );
  }

  protected toggleDetail(id: number): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  @HostListener('document:click')
  protected closeMenuOnOutsideClick(): void {
    this.openMenuId.set(null);
  }

  @HostListener('document:keydown.escape')
  protected closeMenuOnEscape(): void {
    this.openMenuId.set(null);
  }

  protected toggleMenu(id: number, event: MouseEvent): void {
    event.stopPropagation();
    this.openMenuId.update(cur => cur === id ? null : id);
  }

  protected closeMenu(): void {
    this.openMenuId.set(null);
  }

  protected menuActions(a: EnrollmentAgreement): AgreementMenuAction[] {
    const actions: AgreementMenuAction[] = [
      {
        id: 'view',
        label: 'Ver',
        type: 'link',
        route: ['/matricula', 'convenios', a.id],
      },
      {
        id: 'copy',
        label: 'Copiar convenio',
        type: 'action',
        action: () => this.copyAgreement(a),
      },
      {
        id: 'edit',
        label: 'Editar',
        type: 'action',
        action: () => this.router.navigate(['/', {
          outlets: { primary: ['matricula', 'convenios'], panel: ['matricula', 'convenios', a.id, 'editar'] },
        }]),
      },
    ];

    if (a.status === 'active') {
      actions.push({
        id: 'inactivate',
        label: 'Inactivar',
        type: 'action',
        danger: true,
        action: () => this.inactivateAgreement(a),
      });
    } else if (a.status === 'suspended') {
      actions.push({
        id: 'activate',
        label: 'Activar',
        type: 'action',
        action: () => this.activateAgreement(a),
      });
    }

    return actions;
  }

  protected runMenuAction(item: AgreementMenuAction): void {
    if (item.disabled || !item.action) return;
    this.closeMenu();
    item.action();
  }

  protected copyAgreement(a: EnrollmentAgreement): void {
    this.service.copy(a.id).subscribe(copy => {
      if (copy) this.load();
    });
  }

  protected async inactivateAgreement(a: EnrollmentAgreement): Promise<void> {
    const ok = await confirmDialog({
      title: 'Inactivar convenio',
      text: `El convenio "${a.name}" dejará de estar disponible para nuevas matrículas. Podrás reactivarlo desde el menú de acciones.`,
      confirmText: 'Sí, inactivar',
      icon: 'warning',
    });
    if (!ok) return;
    this.service.inactivate(a.id).subscribe(done => {
      if (done) this.load();
    });
  }

  protected async activateAgreement(a: EnrollmentAgreement): Promise<void> {
    const ok = await confirmDialog({
      title: 'Activar convenio',
      text: `El convenio "${a.name}" volverá a estar disponible para nuevas matrículas.`,
      confirmText: 'Sí, activar',
      icon: 'question',
    });
    if (!ok) return;
    this.service.activate(a.id).subscribe(done => {
      if (done) this.load();
    });
  }

  protected statusLabel(s: EnrollmentAgreement['status']): string {
    return AGREEMENT_STATUS_LABELS[s];
  }

  protected statusClass(s: EnrollmentAgreement['status']): string {
    return s === 'active'
      ? 'bg-green-100 text-green-800'
      : s === 'expired'
        ? 'bg-slate-100 text-slate-600'
        : 'bg-amber-100 text-amber-800';
  }

  protected courseNames(a: EnrollmentAgreement): string[] {
    return a.allowedCourseIds
      .map(id => this.courses().find(c => c.id === id)?.name)
      .filter((n): n is string => !!n);
  }

  private load(): void {
    const filters: AgreementFilters = {
      search: this.filterSearch.trim() || undefined,
      company: this.filterCompany.trim() || undefined,
      status: this.filterStatus || undefined,
      coverageMin: this.filterCoverageMin && this.filterCoverageMin > 0 ? this.filterCoverageMin : undefined,
      validFrom: this.filterValidFrom || undefined,
      validTo: this.filterValidTo || undefined,
      campus: this.filterCampus || undefined,
    };
    this.service.getAll(filters).subscribe(list => this.items.set(list));
  }
}
