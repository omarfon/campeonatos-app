import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { StudentCourseService } from '../../services/student-course.service';

import { StudentCourse } from '../../models/student-portal.model';

import { StudentCourseStatus } from '../../enums/student-course-status.enum';

import { CourseCardComponent } from '../../components/course-card/course-card';

import { StudentEmptyStateComponent } from '../../components/empty-state/student-empty-state';



type CourseTab = 'active' | 'completed';



@Component({

  selector: 'app-student-courses',

  changeDetection: ChangeDetectionStrategy.OnPush,

  imports: [CourseCardComponent, StudentEmptyStateComponent],

  template: `

    <div class="space-y-6">

      <div>

        <h1 class="sp-page-title">Mis cursos</h1>

        <p class="sp-page-subtitle">Consulta tus cursos activos y finalizados.</p>
      </div>

      <div class="flex gap-2" role="tablist" aria-label="Filtrar cursos">
        <button type="button" role="tab" [attr.aria-selected]="tab() === 'active'"
          class="sp-tab"
          [class.sp-tab-active]="tab() === 'active'"
          (click)="setTab('active')">
          Activos
        </button>
        <button type="button" role="tab" [attr.aria-selected]="tab() === 'completed'"
          class="sp-tab"
          [class.sp-tab-active]="tab() === 'completed'"
          (click)="setTab('completed')">
          Finalizados
        </button>

      </div>



      @if (loading()) {

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">

          @for (i of [1, 2]; track i) {

            <div class="h-48 bg-slate-200 rounded-2xl"></div>

          }

        </div>

      } @else if (courses().length === 0) {

        <app-student-empty-state

          [title]="tab() === 'active' ? 'Sin cursos activos' : 'Sin cursos finalizados'"

          [description]="tab() === 'active'

            ? 'Matricúlate en un curso para verlo aquí.'

            : 'Aún no tienes cursos finalizados.'"

          icon="📚"

        />

      } @else {

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

          @for (c of courses(); track c.enrollmentId ?? c.id) {

            <app-course-card [course]="c" />

          }

        </div>

      }

    </div>

  `,

})

export class StudentCoursesComponent implements OnInit {

  private readonly courseService = inject(StudentCourseService);



  protected readonly courses = signal<StudentCourse[]>([]);

  protected readonly loading = signal(true);

  protected readonly tab = signal<CourseTab>('active');



  ngOnInit(): void {

    this.load();

  }



  protected setTab(tab: CourseTab): void {

    this.tab.set(tab);

    this.load();

  }



  private load(): void {

    this.loading.set(true);

    const status = this.tab() === 'active'

      ? StudentCourseStatus.ACTIVE

      : StudentCourseStatus.COMPLETED;

    this.courseService.getMyCourses(status).subscribe({

      next: list => {

        this.courses.set(list);

        this.loading.set(false);

      },

      error: () => this.loading.set(false),

    });

  }

}

