import {
  Component, inject, signal, computed, OnInit, ChangeDetectionStrategy,
  DestroyRef, HostListener,
} from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { EnrollmentStudentService } from '../../services/enrollment-student.service';
import { EnrollmentStudent, STUDENT_TYPE_LABELS, StudentFilters } from '../../models/enrollment.model';

interface StudentMenuAction {
  id: string;
  label: string;
  type: 'link' | 'action';
  route?: (string | number)[];
  queryParams?: Record<string, string | number>;
  danger?: boolean;
  action?: () => void;
}

@Component({
  selector: 'app-enrollment-students-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">Estudiantes</h1>
          <p class="text-sm text-slate-500 mt-0.5">{{ filtered().length }} estudiante(s)</p>
        </div>
        <a [routerLink]="['/', { outlets: { primary: ['matricula', 'estudiantes'], panel: ['matricula', 'estudiantes', 'nuevo'] } }]"
          class="btn-primary shrink-0">
          + Nuevo estudiante
        </a>
      </div>

      <div class="section-card p-4 space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div class="lg:col-span-2">
            <label for="st-search" class="block text-xs font-semibold text-slate-500 mb-1">Buscar estudiante</label>
            <input id="st-search" type="search" class="input-modern !py-1.5 !text-sm w-full"
              placeholder="Nombre, apellido, código, correo..."
              [(ngModel)]="filterSearch" (ngModelChange)="applyFilters()" />
          </div>
          <div>
            <label for="st-doc" class="block text-xs font-semibold text-slate-500 mb-1">Documento</label>
            <input id="st-doc" type="search" class="input-modern !py-1.5 !text-sm w-full"
              placeholder="DNI / CE..."
              [(ngModel)]="filterDocument" (ngModelChange)="applyFilters()" />
          </div>
          <div>
            <label for="st-doctype" class="block text-xs font-semibold text-slate-500 mb-1">Tipo doc.</label>
            <select id="st-doctype" class="input-modern !py-1.5 !text-sm w-full"
              [(ngModel)]="filterDocumentType" (ngModelChange)="applyFilters()">
              <option value="">Todos</option>
              <option value="DNI">DNI</option>
              <option value="CE">CE</option>
            </select>
          </div>
          <div>
            <label for="st-type" class="block text-xs font-semibold text-slate-500 mb-1">Tipo estudiante</label>
            <select id="st-type" class="input-modern !py-1.5 !text-sm w-full"
              [(ngModel)]="filterStudentType" (ngModelChange)="applyFilters()">
              <option value="">Todos</option>
              <option value="NEW">Nuevo</option>
              <option value="REGULAR">Regular</option>
            </select>
          </div>
          <div>
            <label for="st-status" class="block text-xs font-semibold text-slate-500 mb-1">Estado</label>
            <select id="st-status" class="input-modern !py-1.5 !text-sm w-full"
              [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()">
              <option value="">Todos</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="blocked">Bloqueado</option>
            </select>
          </div>
        </div>
        @if (hasFilters()) {
          <div class="flex justify-end">
            <button type="button" class="btn-ghost !text-sm" (click)="clearFilters()">Limpiar filtros</button>
          </div>
        }
      </div>

      <div class="section-card !p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Código</th>
                <th class="py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estudiante</th>
                <th class="py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Documento</th>
                <th class="py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Contacto</th>
                <th class="py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tipo</th>
                <th class="py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                <th class="py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (s of paged(); track s.id) {
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <td class="py-2.5 px-4 font-mono text-xs text-slate-600">{{ s.code }}</td>
                  <td class="py-2.5 px-4">
                    <a [routerLink]="['/matricula', 'estudiantes', s.id]" class="font-semibold text-slate-900 hover:text-brand">
                      {{ s.firstName }} {{ s.lastName }}
                    </a>
                    @if (s.district) {
                      <p class="text-xs text-slate-500 mt-0.5">{{ s.district }}</p>
                    }
                  </td>
                  <td class="py-2.5 px-4 whitespace-nowrap">{{ s.documentType }} {{ s.documentNumber }}</td>
                  <td class="py-2.5 px-4 hidden md:table-cell">
                    <p class="text-xs">{{ s.phone }}</p>
                    <p class="text-xs text-slate-500 truncate max-w-[12rem]">{{ s.email }}</p>
                  </td>
                  <td class="py-2.5 px-4 whitespace-nowrap">
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full"
                      [class]="s.isRegularStudent ? 'bg-brand/10 text-brand' : 'bg-blue-100 text-blue-800'">
                      {{ typeLabel(s) }}
                    </span>
                  </td>
                  <td class="py-2.5 px-4 whitespace-nowrap">
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full" [class]="statusClass(s.status)">
                      {{ statusLabel(s.status) }}
                    </span>
                  </td>
                  <td class="py-2.5 px-4 text-right">
                    <div class="relative inline-block">
                      <button type="button"
                        class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/80 hover:text-slate-800"
                        [attr.aria-expanded]="openMenuId() === s.id"
                        aria-haspopup="menu"
                        [attr.aria-label]="'Acciones para ' + s.firstName"
                        (click)="toggleMenu(s.id, $event)">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <circle cx="12" cy="5" r="1.75"/><circle cx="12" cy="12" r="1.75"/><circle cx="12" cy="19" r="1.75"/>
                        </svg>
                      </button>
                      @if (openMenuId() === s.id) {
                        <div class="absolute right-0 top-full mt-1 z-30 min-w-[11rem] py-1 bg-white border border-slate-200 rounded-xl shadow-lg"
                          role="menu" (click)="$event.stopPropagation()">
                          @for (item of menuActions(s); track item.id) {
                            @if (item.type === 'link') {
                              <a [routerLink]="item.route!"
                                [queryParams]="item.queryParams"
                                class="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                                [class]="item.danger ? 'text-red-600' : 'text-slate-700'"
                                role="menuitem"
                                (click)="closeMenu()">
                                {{ item.label }}
                              </a>
                            } @else {
                              <button type="button"
                                class="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                                [class]="item.danger ? 'text-red-600' : 'text-slate-700'"
                                role="menuitem"
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
              } @empty {
                <tr>
                  <td colspan="7" class="py-10 text-center text-slate-400">
                    No hay estudiantes que coincidan con la búsqueda.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        @if (totalPages() > 1) {
          <div class="px-4 py-3 border-t border-slate-200 flex justify-between items-center">
            <button type="button" class="btn-ghost !text-sm" [disabled]="page() <= 1" (click)="page.set(page() - 1)">Anterior</button>
            <span class="text-sm text-slate-500">Página {{ page() }} de {{ totalPages() }}</span>
            <button type="button" class="btn-ghost !text-sm" [disabled]="page() >= totalPages()" (click)="page.set(page() + 1)">Siguiente</button>
          </div>
        }
      </div>
    </div>
  `,
})
export class EnrollmentStudentsPageComponent implements OnInit {
  private readonly service = inject(EnrollmentStudentService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly items = signal<EnrollmentStudent[]>([]);
  protected readonly openMenuId = signal<number | null>(null);
  protected readonly page = signal(1);
  protected readonly pageSize = 15;

  protected filterSearch = '';
  protected filterDocument = '';
  protected filterDocumentType: EnrollmentStudent['documentType'] | '' = '';
  protected filterStudentType: 'NEW' | 'REGULAR' | '' = '';
  protected filterStatus: EnrollmentStudent['status'] | '' = '';

  protected readonly filtered = computed(() => this.items());
  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize)),
  );
  protected readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.load();
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(e => {
      if (e.urlAfterRedirects.includes('/matricula/estudiantes')) {
        this.load();
      }
    });
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

  protected menuActions(s: EnrollmentStudent): StudentMenuAction[] {
    return [
      { id: 'view', label: 'Ver', type: 'link', route: ['/matricula', 'estudiantes', s.id] },
      {
        id: 'edit', label: 'Editar', type: 'action',
        action: () => this.router.navigate(['/', {
          outlets: { primary: ['matricula', 'estudiantes'], panel: ['matricula', 'estudiantes', s.id, 'editar'] },
        }]),
      },
      {
        id: 'enroll', label: 'Matricular', type: 'link',
        route: ['/matricula', 'nueva'], queryParams: { estudiante: s.id },
      },
      {
        id: 'delete', label: 'Eliminar', type: 'action', danger: true,
        action: () => this.deleteStudent(s),
      },
    ];
  }

  protected runMenuAction(item: StudentMenuAction): void {
    this.closeMenu();
    item.action?.();
  }

  protected deleteStudent(s: EnrollmentStudent): void {
    const msg = `¿Eliminar al estudiante ${s.firstName} ${s.lastName} (${s.code})?`;
    if (!confirm(msg)) return;
    this.service.delete(s.id).subscribe(ok => {
      if (ok) this.load();
    });
  }

  protected applyFilters(): void {
    this.page.set(1);
    this.load();
  }

  protected clearFilters(): void {
    this.filterSearch = '';
    this.filterDocument = '';
    this.filterDocumentType = '';
    this.filterStudentType = '';
    this.filterStatus = '';
    this.applyFilters();
  }

  protected hasFilters(): boolean {
    return !!(
      this.filterSearch.trim() ||
      this.filterDocument.trim() ||
      this.filterDocumentType ||
      this.filterStudentType ||
      this.filterStatus
    );
  }

  protected typeLabel(s: EnrollmentStudent): string {
    return s.isRegularStudent ? STUDENT_TYPE_LABELS.REGULAR : STUDENT_TYPE_LABELS.NEW;
  }

  protected statusLabel(status: EnrollmentStudent['status']): string {
    const labels: Record<EnrollmentStudent['status'], string> = {
      active: 'Activo', inactive: 'Inactivo', blocked: 'Bloqueado',
    };
    return labels[status];
  }

  protected statusClass(status: EnrollmentStudent['status']): string {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : status === 'blocked'
        ? 'bg-red-100 text-red-700'
        : 'bg-slate-100 text-slate-600';
  }

  private load(): void {
    const filters: StudentFilters = {
      search: this.filterSearch.trim() || undefined,
      document: this.filterDocument.trim() || undefined,
      documentType: this.filterDocumentType || undefined,
      studentType: this.filterStudentType || undefined,
      status: this.filterStatus || undefined,
    };
    this.service.getAll(filters).subscribe(list => this.items.set(list));
  }
}
