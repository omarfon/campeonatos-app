import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { StudentSessionService } from '../../services/student-session.service';
import { StudentContentManagerService } from '../../services/student-content-manager.service';
import { StudentProfileService } from '../../services/student-profile.service';
import { StudentPortalBrandComponent } from '../portal-brand/student-portal-brand';
import { STUDENT_PORTAL_ROUTE_PREFIX, MAIN_PORTAL_HOME_ROUTE, MAIN_PORTAL_LABEL } from '../../student-portal.constants';
import { StudentComunicado, StudentProfile } from '../../models/student-portal.model';

@Component({
  selector: 'app-student-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, StudentPortalBrandComponent],
  template: `
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/60">
      <div class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand/20 to-transparent" aria-hidden="true"></div>
      <div class="flex items-center gap-3 max-w-[90rem] mx-auto px-4 sm:px-6 py-3.5">
        <app-student-portal-brand [compact]="true" />

        <a [routerLink]="mainPortalRoute"
          class="btn-secondary !py-2 !px-3.5 !text-xs sm:!text-sm !rounded-xl shrink-0">
          {{ mainPortalLabel }}
        </a>

        <div class="flex-1 max-w-sm hidden md:block ml-2">
          <label for="portal-alumno-search" class="sr-only">Buscar en Portal Alumno</label>
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input id="portal-alumno-search" type="search" placeholder="Buscar cursos, pagos..."
              class="input-modern !py-2.5 !pl-10 !text-sm w-full !rounded-2xl !border-slate-200/80 !bg-slate-50/50 focus:!bg-white" />
          </div>
        </div>

        <div class="flex items-center gap-1.5 ml-auto">
          <div class="relative">
            <button type="button" class="relative p-2.5 rounded-2xl hover:bg-slate-100/80 transition-colors"
              [attr.aria-expanded]="drawerOpen()"
              aria-label="Comunicados"
              (click)="toggleComunicados()">
              <svg class="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/>
              </svg>
            </button>
            @if (drawerOpen()) {
              <div class="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] sp-card z-50 overflow-hidden !p-0"
                role="dialog" aria-label="Comunicados recientes">
                <div class="px-4 py-3.5 flex justify-between items-center bg-gradient-to-r from-slate-50 to-sky-50/50 border-b border-slate-100">
                  <h2 class="font-bold text-slate-900 text-sm">Comunicados</h2>
                </div>
                <div class="max-h-80 overflow-y-auto">
                  @for (c of comunicados(); track c.id) {
                    <a [routerLink]="comunicadosRoute"
                      class="block p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors"
                      (click)="closePanels()">
                      <p class="text-xs font-semibold uppercase text-slate-500">{{ c.relativeDate }}</p>
                      <p class="font-semibold text-slate-900 mt-0.5 text-sm">{{ c.title }}</p>
                      <p class="text-xs text-slate-600 mt-1 line-clamp-2">{{ c.summary }}</p>
                    </a>
                  } @empty {
                    <p class="p-6 text-sm text-slate-400 text-center">No hay comunicados publicados.</p>
                  }
                </div>
                <a [routerLink]="comunicadosRoute" class="block text-center py-3.5 text-sm font-semibold text-brand hover:bg-slate-50 border-t border-slate-100"
                  (click)="closePanels()">
                  Ver todos
                </a>
              </div>
            }
          </div>

          <div class="relative">
            <button type="button"
              class="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
              [attr.aria-expanded]="profileOpen()"
              aria-haspopup="menu"
              aria-label="Mi perfil"
              (click)="toggleProfile()">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>

            @if (profileOpen()) {
              <div class="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] sp-card z-50 overflow-hidden !p-0"
                role="menu" aria-label="Menú de perfil">
                <div class="px-4 py-4 border-b border-slate-100"
                  style="background: linear-gradient(135deg, rgba(26,50,99,0.06) 0%, rgba(13,148,136,0.08) 100%)">
                  <div class="flex items-center gap-3">
                    <span class="w-12 h-12 rounded-2xl text-white font-bold flex items-center justify-center shrink-0 shadow-lg"
                      style="background: linear-gradient(135deg, #1A3263, #0d9488)"
                      aria-hidden="true">
                      {{ initials() }}
                    </span>
                    <div class="min-w-0">
                      <p class="font-bold text-slate-900 truncate">{{ session()?.fullName }}</p>
                      @if (profile(); as p) {
                        <p class="text-xs text-slate-500 font-mono mt-0.5">{{ p.code }}</p>
                        <p class="text-xs font-medium text-teal-700 mt-1">{{ p.program }} · {{ p.level }}</p>
                      }
                    </div>
                  </div>
                </div>

                @if (profile(); as p) {
                  <div class="px-4 py-3 space-y-2.5 text-sm">
                    <div class="flex justify-between gap-2 py-1">
                      <span class="text-slate-500">Documento</span>
                      <span class="font-medium text-slate-800 text-right">{{ p.documentType }} {{ p.documentNumber }}</span>
                    </div>
                    <div class="flex justify-between gap-2 py-1">
                      <span class="text-slate-500">Correo</span>
                      <span class="font-medium text-slate-800 truncate max-w-[9rem] text-right">{{ p.email }}</span>
                    </div>
                    <div class="flex justify-between gap-2 py-1">
                      <span class="text-slate-500">Teléfono</span>
                      <span class="font-medium text-slate-800 text-right">{{ p.phone }}</span>
                    </div>
                  </div>
                } @else if (profileLoading()) {
                  <div class="px-4 py-4 animate-pulse space-y-2">
                    <div class="h-3 bg-slate-200 rounded-full w-3/4"></div>
                    <div class="h-3 bg-slate-200 rounded-full w-1/2"></div>
                  </div>
                } @else if (session(); as s) {
                  <div class="px-4 py-3 space-y-2 text-sm">
                    <div class="flex justify-between gap-2 py-1">
                      <span class="text-slate-500">Código</span>
                      <span class="font-medium text-slate-800 font-mono">{{ s.studentCode }}</span>
                    </div>
                    <div class="flex justify-between gap-2 py-1">
                      <span class="text-slate-500">Correo</span>
                      <span class="font-medium text-slate-800 truncate max-w-[9rem] text-right">{{ s.email }}</span>
                    </div>
                  </div>
                }

                <div class="border-t border-slate-100 py-1">
                  <button type="button" role="menuitem"
                    class="w-[calc(100%-0.5rem)] mx-1 flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                    (click)="logout()">
                    Cerrar sesión
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </header>
  `,
  host: {
    class: 'block',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class StudentHeaderComponent implements OnInit {
  private readonly sessionService = inject(StudentSessionService);
  private readonly contentManager = inject(StudentContentManagerService);
  private readonly profileService = inject(StudentProfileService);
  private readonly router = inject(Router);

  protected readonly session = this.sessionService.session;
  protected readonly profile = signal<StudentProfile | null>(null);
  protected readonly profileLoading = signal(false);
  protected readonly drawerOpen = signal(false);
  protected readonly profileOpen = signal(false);
  protected readonly comunicados = signal<StudentComunicado[]>([]);
  protected readonly comunicadosRoute = [`${STUDENT_PORTAL_ROUTE_PREFIX}/comunicados`];
  protected readonly mainPortalRoute = MAIN_PORTAL_HOME_ROUTE;
  protected readonly mainPortalLabel = MAIN_PORTAL_LABEL;

  ngOnInit(): void {
    this.contentManager.getPublishedComunicados().subscribe(list => {
      this.comunicados.set(list.slice(0, 4));
    });
    this.loadProfile();
  }

  protected initials(): string {
    const name = this.session()?.fullName ?? '';
    return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }

  protected toggleComunicados(): void {
    this.profileOpen.set(false);
    this.drawerOpen.update(v => !v);
  }

  protected toggleProfile(): void {
    this.drawerOpen.set(false);
    this.profileOpen.update(v => !v);
    if (this.profileOpen() && !this.profile()) this.loadProfile();
  }

  protected closePanels(): void {
    this.drawerOpen.set(false);
    this.profileOpen.set(false);
  }

  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('app-student-header')) this.closePanels();
  }

  protected logout(): void {
    this.sessionService.logout();
    this.closePanels();
    this.router.navigate(['/portal-alumno/login']);
  }

  private loadProfile(): void {
    if (this.profile()) return;
    this.profileLoading.set(true);
    this.profileService.getProfile().subscribe({
      next: p => { this.profile.set(p); this.profileLoading.set(false); },
      error: () => this.profileLoading.set(false),
    });
  }
}
