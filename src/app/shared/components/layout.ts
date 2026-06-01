import { Component, signal, ChangeDetectionStrategy, inject, DestroyRef } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd, UrlSegmentGroup } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  outlet?: string;
}

interface NavGroup {
  label: string;
  icon: string;
  children: NavItem[];
}

type NavEntry = NavItem | NavGroup;

function isGroup(entry: NavEntry): entry is NavGroup {
  return 'children' in entry;
}

const ICON_PATHS: Record<string, string> = {
  star: 'M12 2l2.4 6.8 7.1.1-5.8 4.2 2 7-5.7-3.8-5.7 3.8 2-7-5.8-4.2 7.1-.1L12 2z',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  'chart-bar': 'M18 20V10M12 20V4M6 20v-6',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  trending: 'M22 7l-8.5 8.5-5-5L2 17M22 7h-6M22 7v6',
  book: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
  bolt: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  building: 'M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01',
  'map-pin': 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  'graduation-cap': 'M22 10l-10-5-10 5 10 5 10-5zM6 12v5c3 3 9 3 12 0v-5',
  folder: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
  pencil: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  clipboard: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 2h6v4H9V2z',
  'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  'credit-card': 'M1 4h22v16H1zM1 10h22',
  'user-check': 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM17 11l2 2 4-4',
  cube: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12',
  tag: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01',
  briefcase: 'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2',
  'clipboard-check': 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 2h6v4H9V2zM9 12l2 2 4-4',
  'shield-key': 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM8 11h8M12 8v6',
  'id-card': 'M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5zM8 10a2 2 0 1 0 4 0 2 2 0 0 0-4 0M6 18c0-2 2-3 4-3s4 1 4 3M14 9h4M14 13h3',
  'document-check': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 15l2 2 4-4',
};

const NAV_ENTRIES: NavEntry[] = [
  {
    label: 'Gestión de Competencias',
    icon: 'star',
    children: [
      { path: '/gestion/competencias', label: 'Competencias', icon: 'star' },
      { path: '/gestion/encuentros', label: 'Encuentros', icon: 'calendar' },
      { path: '/gestion/resultados', label: 'Resultados', icon: 'chart-bar' },
      { path: '/gestion/sanciones', label: 'Sanciones', icon: 'shield' },
      { path: '/gestion/estadisticas', label: 'Estadísticas', icon: 'trending' },
    ],
  },
  {
    label: 'Estructura Académica',
    icon: 'graduation-cap',
    children: [
      { path: '/academia/estructura', label: 'Rubros y Categorías', icon: 'folder' },
    ],
  },
  {
    label: 'Matrícula',
    icon: 'file-text',
    children: [
      { path: '/matricula', label: 'Matrículas', icon: 'file-text' },
      { path: '/matricula/dashboard', label: 'Dashboard visual', icon: 'chart-bar' },
      { path: '/matricula/nueva', label: 'Nueva matrícula', icon: 'pencil', outlet: 'panel' },
    ],
  },
  {
    label: 'Operaciones',
    icon: 'credit-card',
    children: [
      { path: '/operaciones/recuperaciones', label: 'Recuperación de Clases', icon: 'user-check' },
      { path: '/operaciones/retiros', label: 'Anulaciones y Retiros', icon: 'shield' },
      { path: '/operaciones/notas-credito', label: 'Notas de Crédito', icon: 'file-text' },
    ],
  },
  {
    label: 'Comercial',
    icon: 'tag',
    children: [
      { path: '/comercial/tarifas', label: 'Motor de Precios', icon: 'tag' },
      { path: '/comercial/convenios', label: 'Convenios', icon: 'briefcase' },
    ],
  },
  {
    label: 'Control Académico',
    icon: 'clipboard-check',
    children: [
      { path: '/asistencia', label: 'Asistencia a Clases', icon: 'clipboard-check' },
      { path: '/acceso', label: 'Control de Acceso', icon: 'shield-key' },
      { path: '/acceso/penalidades', label: 'Penalidades', icon: 'shield' },
    ],
  },
  {
    label: 'Socios y Membresías',
    icon: 'id-card',
    children: [
      { path: '/maestros/socios', label: 'Socios', icon: 'user' },
      { path: '/maestros/socios/solicitudes', label: 'Solicitudes Societarias', icon: 'document-check' },
      { path: '/maestros/socios/cuotas', label: 'Cuotas y Cobros', icon: 'credit-card' },
    ],
  },
  {
    label: 'Trámites',
    icon: 'clipboard-check',
    children: [
      { path: '/maestros/socios/solicitudes', label: 'Trámites del Asociado', icon: 'id-card' },
      { path: '/tramites', label: 'Trámites del Alumno', icon: 'graduation-cap' },
    ],
  },
  { path: '/reportes', label: 'Reportes', icon: 'clipboard' },
  {
    label: 'Maestros',
    icon: 'book',
    children: [
      { path: '/maestros/disciplinas', label: 'Disciplinas', icon: 'bolt' },
      { path: '/maestros/equipos', label: 'Equipos', icon: 'users' },
      { path: '/maestros/sedes', label: 'Sedes', icon: 'map-pin' },
      { path: '/maestros/areas', label: 'Áreas', icon: 'grid' },
      { path: '/academia/cursos', label: 'Cursos y Árbol', icon: 'book' },
      { path: '/academia/ambientes', label: 'Ambientes y Zonas', icon: 'building' },
      { path: '/academia/programas', label: 'Programas', icon: 'cube' },
    ],
  },
];

@Component({
  selector: 'app-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen flex" style="background-color: #EBF4F6;">
      <!-- Sidebar -->
      <aside
        class="fixed inset-y-0 left-0 z-30 w-72 bg-gradient-to-b from-brand-900 via-brand-800 to-brand-700 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto"
        [class.-translate-x-full]="!sidebarOpen()"
        [class.translate-x-0]="sidebarOpen()"
      >
        <!-- Logo -->
        <div class="flex items-center justify-between h-20 px-6">
          <a routerLink="/" class="flex items-center gap-3 group">
            <span class="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 shadow-sm shadow-red-500/10 transition-transform duration-200 group-hover:scale-110">
              <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path [attr.d]="iconPaths['star']" />
              </svg>
            </span>
            <div>
              <span class="text-lg font-bold tracking-tight">AELU</span>
              <span class="block text-[10px] font-medium text-brand-200 uppercase tracking-widest">Gestión Integral Deportiva</span>
            </div>
          </a>
          <button
            class="lg:hidden text-slate-400 hover:text-white transition-colors"
            (click)="sidebarOpen.set(false)"
            aria-label="Cerrar menú"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Divider -->
        <div class="mx-5 border-t border-white/10"></div>

        <!-- Navigation -->
        <nav class="mt-6 px-4 space-y-1 overflow-y-auto" aria-label="Navegación principal" style="max-height: calc(100vh - 10rem)">
          @for (entry of navEntries; track entry.label) {
            @if (isGroup(entry)) {
              <!-- Collapsible group -->
              <div>
                <button
                  type="button"
                  class="w-full group flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200"
                  [attr.aria-expanded]="openGroups().has(entry.label)"
                  (click)="toggleGroup(entry.label)"
                >
                  <span class="flex items-center gap-3">
                    <svg class="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path [attr.d]="iconPaths[entry.icon]" />
                    </svg>
                    <span class="text-sm font-medium">{{ entry.label }}</span>
                  </span>
                  <svg class="w-4 h-4 transition-transform duration-200" [class.rotate-90]="openGroups().has(entry.label)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
                @if (openGroups().has(entry.label)) {
                  <div class="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-2">
                    @for (child of entry.children; track child.path) {
                      <a
                        [routerLink]="child.path"
                        routerLinkActive="!bg-brand-400/20 !text-white !shadow-sm"
                        class="group flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-white/5 hover:text-white transition-all duration-200 text-sm"
                        (click)="sidebarOpen.set(false)"
                      >
                        <svg class="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                          <path [attr.d]="iconPaths[child.icon]" />
                        </svg>
                        <span class="font-medium">{{ child.label }}</span>
                      </a>
                    }
                  </div>
                }
              </div>
            } @else {
              <a
                [routerLink]="entry.path"
                routerLinkActive="!bg-brand-400/20 !text-white !shadow-sm"
                class="group flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200"
                (click)="sidebarOpen.set(false)"
              >
                <svg class="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path [attr.d]="iconPaths[entry.icon]" />
                </svg>
                <span class="text-sm font-medium">{{ entry.label }}</span>
              </a>
            }
          }
        </nav>

        <!-- Bottom section -->
        <div class="absolute bottom-0 left-0 right-0 p-4">
          <div class="rounded-xl bg-brand-400/10 border border-brand-400/20 p-4">
            <p class="text-xs text-brand-200 font-medium">Versión 1.0</p>
            <p class="text-[10px] text-slate-500 mt-1">Gestión deportiva integral</p>
          </div>
        </div>
      </aside>

      <!-- Backdrop mobile -->
      @if (sidebarOpen()) {
        <div
          class="fixed inset-0 z-20 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          (click)="sidebarOpen.set(false)"
          aria-hidden="true"
        ></div>
      }

      <!-- Backdrop panel derecho -->
      @if (panelOpen()) {
        <div
          class="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-[1px]"
          (click)="closePanel()"
          aria-hidden="true"
        ></div>
      }

      <!-- Main content -->
      <div class="flex-1 flex flex-col min-w-0">
        <header class="h-12 glass sticky top-0 z-10 flex items-center px-4 lg:px-8 shadow-sm shadow-slate-100">
          <button
            class="lg:hidden mr-4 p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            (click)="sidebarOpen.set(true)"
            aria-label="Abrir menú"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <h1 class="text-base font-semibold text-slate-700 tracking-tight">AELU — Gestión Integral Deportiva</h1>
        </header>
        <main class="flex-1 p-4 lg:p-8 overflow-auto">
          <router-outlet />
        </main>
      </div>

      <!-- Panel lateral derecho -->
      <aside
        class="fixed right-0 top-0 z-40 h-screen w-full max-w-2xl transform border-l border-slate-200 bg-white shadow-md transition-transform duration-300 ease-in-out"
        [class.translate-x-full]="!panelOpen()"
        [class.translate-x-0]="panelOpen()"
        [class.pointer-events-none]="!panelOpen()"
        [class.pointer-events-auto]="panelOpen()"
        [attr.aria-hidden]="!panelOpen()"
      >
        <div class="flex h-14 items-center justify-between border-b border-slate-200 px-4">
          <h2 class="text-sm font-semibold text-slate-700">Nuevo registro</h2>
          <button
            type="button"
            class="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Cerrar panel"
            (click)="closePanel()"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="h-[calc(100vh-3.5rem)] overflow-auto p-4" style="background-color: #EBF4F6;">
          <router-outlet
            name="panel"
            (activate)="panelOpen.set(true)"
            (deactivate)="panelOpen.set(false)"
          />
        </div>
      </aside>
    </div>
  `,
})
export class LayoutComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly sidebarOpen = signal(false);
  protected readonly panelOpen = signal(false);
  protected readonly openGroups = signal(new Set<string>());
  protected readonly navEntries = NAV_ENTRIES;
  protected readonly isGroup = isGroup;
  protected readonly iconPaths = ICON_PATHS;

  constructor() {
    // Expand sidebar group matching the current route on init
    this.expandActiveGroup(this.router.url);

    // Expand sidebar group on every navigation
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(e => this.expandActiveGroup(e.urlAfterRedirects));
  }

  private expandActiveGroup(url: string): void {
    const cleanUrl = url.split('(')[0];
    const next = new Set(this.openGroups());
    let changed = false;
    for (const entry of NAV_ENTRIES) {
      if (isGroup(entry) && !next.has(entry.label) &&
          entry.children.some(c => cleanUrl.startsWith(c.path))) {
        next.add(entry.label);
        changed = true;
      }
    }
    if (changed) this.openGroups.set(next);
  }

  protected toggleGroup(label: string): void {
    this.openGroups.update(groups => {
      const next = new Set(groups);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  protected closePanel(): void {
    const tree = this.router.parseUrl(this.router.url);
    if (this.removePanelOutlet(tree.root)) {
      void this.router.navigateByUrl(tree);
    }
    this.panelOpen.set(false);
  }

  private removePanelOutlet(group: UrlSegmentGroup): boolean {
    if (group.children['panel']) {
      delete group.children['panel'];
      return true;
    }
    for (const child of Object.values(group.children)) {
      if (this.removePanelOutlet(child)) return true;
    }
    return false;
  }
}
