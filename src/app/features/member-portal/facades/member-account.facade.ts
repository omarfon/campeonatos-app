import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MemberAccount } from '../models/member-portal.model';
import { MemberAccountService } from '../services/member-family.service';

@Injectable({ providedIn: 'root' })
export class MemberAccountFacade {
  private readonly accountService = inject(MemberAccountService);

  loadAccount(): Observable<MemberAccount> {
    return this.accountService.getAccount();
  }
}
