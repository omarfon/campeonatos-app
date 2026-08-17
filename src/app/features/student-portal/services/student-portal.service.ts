import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { StudentSessionService } from './student-session.service';

@Injectable({ providedIn: 'root' })
export class StudentPortalService {
  private readonly sessionService = inject(StudentSessionService);

  getCurrentStudentId(): number {
    return this.sessionService.requireStudentId();
  }

  getGreeting(): Observable<string> {
    const hour = new Date().getHours();
    let greeting = 'Buenos días';
    if (hour >= 12 && hour < 19) greeting = 'Buenas tardes';
    else if (hour >= 19 || hour < 5) greeting = 'Buenas noches';
    return new Observable(observer => {
      observer.next(greeting);
      observer.complete();
    });
  }
}
