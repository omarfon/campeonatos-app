import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  path: string;
  label: string;
  icon: string;
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

const NAV_ENTRIES: NavEntry[] = [
  {
    label: 'Gestión de Campeonatos',
    icon: '🏆',
    children: [
      { path: '/gestion/campeonatos', label: 'Campeonatos', icon: '🏆' },
      { path: '/gestion/encuentros', label: 'Encuentros', icon: '📅' },
      { path: '/gestion/resultados', label: 'Resultados', icon: '📊' },
      { path: '/gestion/sanciones', label: 'Sanciones', icon: '🟨' },
      { path: '/gestion/estadisticas', label: 'Estadísticas', icon: '📈' },
    ],
  },
  {
    label: 'Maestros',
    icon: '📚',
    children: [
      { path: '/maestros/disciplinas', label: 'Disciplinas', icon: '⚽' },
      { path: '/maestros/equipos', label: 'Equipos', icon: '👥' },
      { path: '/maestros/sedes', label: 'Sedes', icon: '🏟️' },
      { path: '/maestros/socios', label: 'Socios', icon: '🧑‍🤝‍🧑' },
      { path: '/maestros/areas', label: 'Áreas', icon: '📐' },
    ],
  },
  {
    label: 'Estructura Académica',
    icon: '🎓',
    children: [
      { path: '/academia/cursos', label: 'Cursos y Árbol', icon: '📖' },
      { path: '/academia/programas', label: 'Programas', icon: '📦' },
    ],
  },
  { path: '/reportes', label: 'Reportes', icon: '📋' },
];

@Component({
  selector: 'app-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <!-- Sidebar -->
      <aside
        class="fixed inset-y-0 left-0 z-30 w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto"
        [class.-translate-x-full]="!sidebarOpen()"
        [class.translate-x-0]="sidebarOpen()"
      >
        <!-- Logo -->
        <div class="flex items-center justify-between h-20 px-6">
          <a routerLink="/" class="flex items-center gap-3 group">
            <span class="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-lg shadow-lg shadow-indigo-500/30 transition-transform duration-200 group-hover:scale-110">🏆</span>
            <div>
              <span class="text-lg font-bold tracking-tight">Campeonatos</span>
              <span class="block text-[10px] font-medium text-indigo-300 uppercase tracking-widest">Sistema de gestión</span>
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
                    <span class="text-lg transition-transform duration-200 group-hover:scale-110" aria-hidden="true">{{ entry.icon }}</span>
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
                        routerLinkActive="!bg-gradient-to-r !from-indigo-600/90 !to-indigo-500/80 !text-white !shadow-lg !shadow-indigo-500/20"
                        class="group flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-white/5 hover:text-white transition-all duration-200 text-sm"
                        (click)="sidebarOpen.set(false)"
                      >
                        <span class="text-base transition-transform duration-200 group-hover:scale-110" aria-hidden="true">{{ child.icon }}</span>
                        <span class="font-medium">{{ child.label }}</span>
                      </a>
                    }
                  </div>
                }
              </div>
            } @else {
              <a
                [routerLink]="entry.path"
                routerLinkActive="!bg-gradient-to-r !from-indigo-600/90 !to-indigo-500/80 !text-white !shadow-lg !shadow-indigo-500/20"
                class="group flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200"
                (click)="sidebarOpen.set(false)"
              >
                <span class="text-lg transition-transform duration-200 group-hover:scale-110" aria-hidden="true">{{ entry.icon }}</span>
                <span class="text-sm font-medium">{{ entry.label }}</span>
              </a>
            }
          }
        </nav>

        <!-- Bottom section -->
        <div class="absolute bottom-0 left-0 right-0 p-4">
          <div class="rounded-xl bg-gradient-to-r from-indigo-600/20 to-indigo-500/20 border border-indigo-500/20 p-4">
            <p class="text-xs text-indigo-300 font-medium">Versión 1.0</p>
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
          <h1 class="text-base font-semibold text-slate-700 tracking-tight">Sistema de Gestión de Campeonatos</h1>
        </header>
        <main class="flex-1 p-4 lg:p-8 overflow-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class LayoutComponent {
  protected readonly sidebarOpen = signal(false);
  protected readonly openGroups = signal(new Set(['Gestión de Campeonatos', 'Maestros', 'Estructura Académica']));
  protected readonly navEntries = NAV_ENTRIES;
  protected readonly isGroup = isGroup;

  protected toggleGroup(label: string): void {
    this.openGroups.update(groups => {
      const next = new Set(groups);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }
}
