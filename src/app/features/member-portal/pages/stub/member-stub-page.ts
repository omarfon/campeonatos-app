import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-member-stub-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <header>
        <h1 class="mp-page-title">{{ pageTitle() }}</h1>
        <p class="mp-page-subtitle">Esta sección se implementará en la siguiente fase del Portal Socio.</p>
      </header>
      <div class="mp-card p-8 text-center text-slate-500 text-sm">
        <p class="text-3xl mb-3" aria-hidden="true">🚧</p>
        <p>Contenido en desarrollo. Navegación y arquitectura base listas.</p>
      </div>
    </div>
  `,
})
export class MemberStubPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  protected readonly pageTitle = signal('Portal Socio');

  ngOnInit(): void {
    const title = this.route.snapshot.data['title'];
    if (typeof title === 'string') this.pageTitle.set(title);
  }
}
