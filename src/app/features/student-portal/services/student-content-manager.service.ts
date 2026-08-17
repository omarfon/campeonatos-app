import { Injectable, inject } from '@angular/core';
import { delay, map, Observable, of } from 'rxjs';
import { StudentComunicado } from '../models/student-portal.model';
import { StudentComunicadoCategory } from '../enums/student-comunicado-category.enum';
import { CmsComunicadoEntry, MOCK_CMS_COMUNICADOS } from '../mocks/student-portal.mock';
import { StudentSessionService } from './student-session.service';

@Injectable({ providedIn: 'root' })
export class StudentContentManagerService {
  private readonly sessionService = inject(StudentSessionService);

  /** Simula la API del gestor de contenidos: solo publicados para alumnos. */
  getPublishedComunicados(filters?: { category?: StudentComunicadoCategory }): Observable<StudentComunicado[]> {
    this.sessionService.requireStudentId();
    let list = MOCK_CMS_COMUNICADOS.filter(
      item => item.status === 'published' && (item.audience === 'students' || item.audience === 'all'),
    );
    if (filters?.category) {
      list = list.filter(item => item.category === filters.category);
    }
    list.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    return of(list.map(item => this.toPublicComunicado(item))).pipe(delay(250));
  }

  getComunicadoBySlug(slug: string): Observable<StudentComunicado | undefined> {
    this.sessionService.requireStudentId();
    const item = MOCK_CMS_COMUNICADOS.find(
      c => c.slug === slug && c.status === 'published' && (c.audience === 'students' || c.audience === 'all'),
    );
    return of(item ? this.toPublicComunicado(item) : undefined).pipe(delay(150));
  }

  getFeaturedComunicados(limit = 3): Observable<StudentComunicado[]> {
    return this.getPublishedComunicados().pipe(
      map(list => list.filter(c => c.featured).slice(0, limit)),
    );
  }

  private toPublicComunicado(item: CmsComunicadoEntry): StudentComunicado {
    const { status: _status, audience: _audience, ...comunicado } = item;
    return comunicado;
  }
}
