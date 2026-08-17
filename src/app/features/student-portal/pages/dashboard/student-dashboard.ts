import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudentDashboardService } from '../../services/student-dashboard.service';
import { StudentDashboard } from '../../models/student-portal.model';
import { StudentSummaryCardComponent } from '../../components/summary-card/student-summary-card';
import { NextClassCardComponent } from '../../components/next-class/next-class-card';
import { CourseCardComponent } from '../../components/course-card/course-card';
import { StudentComunicadoCardComponent } from '../../components/comunicado-card/student-comunicado-card';
import { StudentComunicadoDetailModalComponent } from '../../components/comunicado-detail-modal/student-comunicado-detail-modal';
import { StudentComunicado } from '../../models/student-portal.model';

@Component({
  selector: 'app-student-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, StudentSummaryCardComponent, NextClassCardComponent, CourseCardComponent, StudentComunicadoCardComponent, StudentComunicadoDetailModalComponent],
  template: `
    @if (loading()) {
      <div class="space-y-6 animate-pulse">
        <div class="h-10 bg-slate-200/80 rounded-2xl w-72"></div>
        <div class="h-40 bg-slate-200/80 rounded-3xl"></div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          @for (i of [1,2,3,4]; track i) {
            <div class="h-28 bg-slate-200/80 rounded-2xl"></div>
          }
        </div>
      </div>
    } @else if (data(); as d) {
      <div class="space-y-8">
        <header class="relative z-10 rounded-2xl overflow-hidden bg-gradient-to-r from-brand via-brand-600 to-teal-600 px-5 py-5 sm:py-6 shadow-lg shadow-brand/10">
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {{ d.greeting }}, {{ d.profile.firstName }} <span aria-hidden="true">👋</span>
          </h1>
          <p class="text-sm text-white/80 mt-1">Aquí tienes un resumen de tu actividad académica.</p>
        </header>

        <app-student-summary-card [profile]="d.profile" />

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <a routerLink="/portal-alumno/cursos" class="sp-stat group">
            <div class="sp-stat-icon bg-violet-100 text-violet-600">📚</div>
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Mis cursos</p>
            <p class="text-3xl font-extrabold text-slate-900 mt-1 tabular-nums">{{ d.activeCourses }}</p>
            <p class="text-xs text-slate-400 mt-0.5">activos</p>
          </a>
          <a routerLink="/portal-alumno/horarios" class="sp-stat group">
            <div class="sp-stat-icon bg-sky-100 text-sky-600">📅</div>
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Próxima clase</p>
            <p class="text-xl font-bold text-slate-900 mt-1">{{ d.nextClass?.isToday ? 'Hoy' : 'Próxima' }}</p>
            <p class="text-sm font-medium text-brand mt-0.5">{{ d.nextClass?.timeStart ?? '—' }}</p>
          </a>
          <a routerLink="/portal-alumno/asistencia" class="sp-stat group">
            <div class="sp-stat-icon bg-teal-100 text-teal-600">✓</div>
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Asistencia</p>
            <p class="text-3xl font-extrabold text-teal-700 mt-1 tabular-nums">{{ d.attendancePercentage }}%</p>
          </a>
          <a routerLink="/portal-alumno/pagos" class="sp-stat group">
            <div class="sp-stat-icon" [class]="d.pendingAmount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'">💳</div>
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Pagos</p>
            <p class="text-lg font-bold mt-1" [class]="d.pendingAmount > 0 ? 'text-amber-700' : 'text-emerald-700'">
              {{ d.paymentStatusLabel }}
            </p>
            @if (d.pendingAmount > 0) {
              <p class="text-xs text-slate-500 mt-0.5">S/ {{ d.pendingAmount.toFixed(2) }}</p>
            }
          </a>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          @if (d.nextClass) {
            <app-next-class-card [nextClass]="d.nextClass" />
          }
          <div class="sp-card p-5 sm:p-6">
            <h2 class="text-sm font-bold text-slate-900 mb-4">¿Qué deseas hacer?</h2>
            <div class="grid grid-cols-2 gap-2 sm:gap-3">
              <a routerLink="/portal-alumno/matricula" class="btn-primary !text-xs !py-2.5 !rounded-2xl text-center">Matricularme</a>
              <a routerLink="/portal-alumno/horarios" class="sp-btn-soft !text-xs !py-2.5 text-center">Ver horarios</a>
              <a routerLink="/portal-alumno/pagos" class="sp-btn-soft !text-xs !py-2.5 text-center">Consultar pagos</a>
              <a routerLink="/portal-alumno/asistencia" class="sp-btn-soft !text-xs !py-2.5 text-center">Ver asistencia</a>
            </div>
          </div>
        </div>

        @if (d.activeCourseCards.length > 0) {
          <section>
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-bold text-slate-900">Mis cursos activos</h2>
              <a routerLink="/portal-alumno/cursos" class="text-sm font-semibold text-teal-700 hover:text-teal-800">Ver todos →</a>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (c of d.activeCourseCards; track c.id) {
                <app-course-card [course]="c" />
              }
            </div>
          </section>
        }

        @if (d.comunicados.length > 0) {
          <section>
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-bold text-slate-900">Comunicados recientes</h2>
              <a routerLink="/portal-alumno/comunicados" class="text-sm font-semibold text-brand hover:underline">Ver todos</a>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (c of d.comunicados; track c.id) {
                <app-student-comunicado-card [comunicado]="c" [compact]="true" (open)="openComunicado($event)" />
              }
            </div>
          </section>
        }

        <app-student-comunicado-detail-modal
          [open]="comunicadoOpen()"
          [comunicado]="selectedComunicado()"
          (close)="closeComunicado()" />
      </div>
    } @else if (error()) {
      <div class="sp-card p-10 text-center space-y-4">
        <p class="text-4xl" aria-hidden="true">😕</p>
        <p class="text-slate-600">{{ error() }}</p>
        <button type="button" class="btn-primary" (click)="load()">Reintentar</button>
      </div>
    }
  `,
})
export class StudentDashboardComponent implements OnInit {
  private readonly dashboardService = inject(StudentDashboardService);

  protected readonly data = signal<StudentDashboard | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly comunicadoOpen = signal(false);
  protected readonly selectedComunicado = signal<StudentComunicado | null>(null);

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set('');
    this.dashboardService.getDashboard().subscribe({
      next: d => { this.data.set(d); this.loading.set(false); },
      error: () => {
        this.error.set('No pudimos cargar tu inicio. Intenta nuevamente.');
        this.loading.set(false);
      },
    });
  }

  protected openComunicado(comunicado: StudentComunicado): void {
    this.selectedComunicado.set(comunicado);
    this.comunicadoOpen.set(true);
  }

  protected closeComunicado(): void {
    this.comunicadoOpen.set(false);
    this.selectedComunicado.set(null);
  }
}
