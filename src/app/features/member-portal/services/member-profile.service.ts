import { Injectable, inject } from '@angular/core';
import { delay, map, Observable, of } from 'rxjs';
import { MemberProfile, MemberProfileField } from '../models/member-portal.model';
import { MOCK_MEMBER_ACCOUNT } from '../mocks/member-portal.mock';
import { MemberSessionService } from './member-session.service';

@Injectable({ providedIn: 'root' })
export class MemberProfileService {
  private readonly sessionService = inject(MemberSessionService);
  private profileData = this.buildProfileFromAccount(MOCK_MEMBER_ACCOUNT);

  getProfile(): Observable<MemberProfile> {
    this.sessionService.requireMemberId();
    return of({ ...this.profileData }).pipe(delay(200));
  }

  getProfileFields(): Observable<MemberProfileField[]> {
    return this.getProfile().pipe(map(p => this.getEditableFields(p)));
  }

  getEditableFields(profile: MemberProfile): MemberProfileField[] {
    return [
      { key: 'documentNumber', label: 'Documento', value: `${profile.documentType} ${profile.documentNumber}`, editable: false },
      { key: 'email', label: 'Correo', value: profile.email, editable: profile.editableFields.includes('email') },
      { key: 'phone', label: 'Teléfono', value: profile.phone, editable: profile.editableFields.includes('phone') },
      { key: 'address', label: 'Dirección', value: profile.address, editable: profile.editableFields.includes('address') },
      { key: 'district', label: 'Distrito', value: profile.district, editable: profile.editableFields.includes('district') },
      { key: 'code', label: 'Código socio', value: profile.code, editable: false },
      { key: 'category', label: 'Categoría', value: profile.category, editable: false },
    ];
  }

  updateProfile(data: Partial<Pick<MemberProfile, 'email' | 'phone' | 'address' | 'district'>>): Observable<MemberProfile> {
    this.sessionService.requireMemberId();
    this.profileData = { ...this.profileData, ...data };
    MOCK_MEMBER_ACCOUNT.phone = this.profileData.phone;
    if (data.email) MOCK_MEMBER_ACCOUNT.email = data.email;
    if (data.address) MOCK_MEMBER_ACCOUNT.address = data.address;
    if (data.district) MOCK_MEMBER_ACCOUNT.district = data.district;
    return of({ ...this.profileData }).pipe(delay(300));
  }

  private buildProfileFromAccount(account: typeof MOCK_MEMBER_ACCOUNT): MemberProfile {
    return {
      ...account.profile,
      documentType: account.documentType,
      documentNumber: account.documentNumber,
      email: account.email,
      phone: account.phone,
      address: account.address,
      district: account.district,
      editableFields: account.editableFields,
    };
  }
}
