import { Injectable, inject } from '@angular/core';
import { delay, map, Observable, of } from 'rxjs';
import { StudentProfile, StudentProfileField } from '../models/student-portal.model';
import { MOCK_PORTAL_PROFILE } from '../mocks/student-portal.mock';
import { StudentSessionService } from './student-session.service';

@Injectable({ providedIn: 'root' })
export class StudentProfileService {
  private readonly sessionService = inject(StudentSessionService);
  private profile = { ...MOCK_PORTAL_PROFILE };

  getProfile(): Observable<StudentProfile> {
    this.sessionService.requireStudentId();
    return of({ ...this.profile }).pipe(delay(200));
  }

  getProfileFields(): Observable<StudentProfileField[]> {
    return this.getProfile().pipe(
      map(profile => this.getEditableFields(profile)),
    );
  }

  getEditableFields(profile: StudentProfile): StudentProfileField[] {
    const fields: StudentProfileField[] = [
      { key: 'documentNumber', label: 'Documento', value: `${profile.documentType} ${profile.documentNumber}`, editable: false },
      { key: 'email', label: 'Correo', value: profile.email, editable: profile.editableFields.includes('email') },
      { key: 'phone', label: 'Teléfono', value: profile.phone, editable: profile.editableFields.includes('phone') },
      { key: 'address', label: 'Dirección', value: profile.address, editable: profile.editableFields.includes('address') },
      { key: 'district', label: 'Distrito', value: profile.district ?? '—', editable: profile.editableFields.includes('district') },
      { key: 'code', label: 'Código', value: profile.code, editable: false },
    ];
    return fields;
  }

  updateProfile(data: Partial<Pick<StudentProfile, 'email' | 'phone' | 'address' | 'district'>>): Observable<StudentProfile> {
    this.sessionService.requireStudentId();
    this.profile = { ...this.profile, ...data };
    return of({ ...this.profile }).pipe(delay(300));
  }
}
