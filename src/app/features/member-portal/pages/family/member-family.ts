import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MemberFamilyFacade } from '../../facades/member-family.facade';
import { ParticipantContextService } from '../../services/participant-context.service';
import { FamilyMember, FamilyMemberDetail } from '../../models/member-portal.model';
import { MOCK_FAMILY_MEMBER_DETAILS } from '../../mocks/member-portal.mock';
import { FamilyMemberCardComponent } from '../../components/family-member-card/family-member-card';
import { FamilyMemberDetailPanelComponent } from '../../components/family-member-detail-panel/family-member-detail-panel';
import { MemberEmptyStateComponent } from '../../components/empty-state/member-empty-state';
import { MEMBER_PORTAL_ROUTE_PREFIX } from '../../member-portal.constants';

@Component({
  selector: 'app-member-family',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    FamilyMemberCardComponent,
    FamilyMemberDetailPanelComponent,
    MemberEmptyStateComponent,
  ],
  template: `
    <div class="space-y-6">
      <header class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 class="mp-page-title">Mi Familia</h1>
          <p class="mp-page-subtitle">Selecciona un integrante para ver su información.</p>
        </div>
        <a [routerLink]="profileRoute" class="btn-secondary text-center shrink-0 self-start sm:self-center">
          Mi perfil
        </a>
      </header>

      @if (loading()) {
        <div class="grid grid-cols-2 gap-3 sm:gap-4 animate-pulse">
          @for (i of [1, 2, 3]; track i) {
            <div class="h-36 bg-slate-200/80 rounded-3xl"></div>
          }
        </div>
      } @else if (members().length === 0) {
        <app-member-empty-state
          title="Sin integrantes"
          description="No encontramos familiares asociados a tu cuenta."
          icon="👨‍👩‍👧"
        />
      } @else {
        <div class="grid grid-cols-2 gap-3 sm:gap-4">
          @for (m of members(); track m.personId) {
            <app-family-member-card
              [member]="m"
              [selected]="selectedPersonId() === m.personId"
              (memberSelected)="selectMember($event)" />
          }
        </div>
      }
    </div>

    <app-family-member-detail-panel
      [open]="drawerOpen()"
      [member]="selectedDetail()"
      [error]="detailError()"
      (closed)="closePanel()"
      (enroll)="selectForEnrollment($event)" />
  `,
  host: {
    class: 'block',
    '(document:keydown.escape)': 'onEscape($event)',
  },
})
export class MemberFamilyPageComponent implements OnInit {
  private readonly facade = inject(MemberFamilyFacade);
  private readonly participantService = inject(ParticipantContextService);

  protected readonly loading = signal(true);
  protected readonly members = signal<FamilyMember[]>([]);
  protected readonly drawerOpen = signal(false);
  protected readonly selectedPersonId = signal<number | null>(null);
  protected readonly selectedDetail = signal<FamilyMemberDetail | null>(null);
  protected readonly detailError = signal<string | null>(null);
  protected readonly profileRoute = `${MEMBER_PORTAL_ROUTE_PREFIX}/perfil`;

  private readonly detailCache = new Map<number, FamilyMemberDetail>();

  ngOnInit(): void {
    this.facade.loadFamily().subscribe({
      next: list => {
        this.members.set(list);
        this.seedDetailCache(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private seedDetailCache(members: FamilyMember[]): void {
    for (const member of members) {
      const detail = MOCK_FAMILY_MEMBER_DETAILS[member.personId];
      if (detail) {
        this.detailCache.set(member.personId, {
          ...detail,
          activities: [...detail.activities],
          upcomingEvents: [...detail.upcomingEvents],
        });
      }
    }
  }

  protected selectMember(member: FamilyMember): void {
    const cached = this.detailCache.get(member.personId);
    if (!cached) {
      this.detailError.set('No pudimos cargar el detalle del familiar.');
      return;
    }

    this.selectedPersonId.set(member.personId);
    this.selectedDetail.set(cached);
    this.detailError.set(null);
    this.drawerOpen.set(true);
  }

  protected closePanel(): void {
    this.drawerOpen.set(false);
    this.selectedPersonId.set(null);
    this.selectedDetail.set(null);
    this.detailError.set(null);
  }

  protected onEscape(event: Event): void {
    if (this.drawerOpen()) {
      event.preventDefault();
      this.closePanel();
    }
  }

  protected selectForEnrollment(personId: number): void {
    try {
      this.participantService.selectParticipantById(personId);
    } catch {
      // La página de actividades usará el contexto en fase 5
    }
  }
}
