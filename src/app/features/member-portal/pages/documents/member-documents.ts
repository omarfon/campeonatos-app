import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MemberDocumentService } from '../../services/member-document.service';
import { MemberDocument } from '../../models/member-portal.model';
import { MemberEmptyStateComponent } from '../../components/empty-state/member-empty-state';

type DocumentCategory = MemberDocument['category'] | 'all';

const CATEGORY_LABELS: Record<MemberDocument['category'], string> = {
  constancia: 'Constancias',
  comprobante: 'Comprobantes',
  contrato: 'Contratos',
  otro: 'Otros',
};

@Component({
  selector: 'app-member-documents',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MemberEmptyStateComponent],
  template: `
    <div class="space-y-6">
      <header>
        <h1 class="mp-page-title">Documentos</h1>
        <p class="mp-page-subtitle">Descarga constancias, comprobantes y contratos de tu familia.</p>
      </header>

      <div class="flex flex-wrap gap-2" role="tablist" aria-label="Categorías de documentos">
        <button type="button" role="tab" class="mp-tab"
          [class.mp-tab-active]="category() === 'all'"
          [attr.aria-selected]="category() === 'all'"
          (click)="category.set('all')">Todos</button>
        @for (cat of categories; track cat) {
          <button type="button" role="tab" class="mp-tab"
            [class.mp-tab-active]="category() === cat"
            [attr.aria-selected]="category() === cat"
            (click)="category.set(cat)">
            {{ categoryLabel(cat) }}
          </button>
        }
      </div>

      @if (loading()) {
        <div class="space-y-3 animate-pulse">
          @for (i of [1, 2, 3]; track i) {
            <div class="h-16 bg-slate-200/80 rounded-2xl"></div>
          }
        </div>
      } @else if (filtered().length === 0) {
        <app-member-empty-state
          title="Sin documentos"
          description="No hay documentos en esta categoría."
          icon="📄"
        />
      } @else {
        @if (category() === 'all') {
          @for (group of grouped(); track group.category) {
            <section>
              <h2 class="text-sm font-bold uppercase tracking-wide text-slate-500 mb-3">
                {{ categoryLabel(group.category) }}
              </h2>
              <div class="mp-card !p-0 overflow-hidden">
                @for (doc of group.documents; track doc.id) {
                  <div class="p-4 border-b border-slate-100 last:border-0 flex flex-wrap items-center justify-between gap-3">
                    <div class="min-w-0">
                      <p class="font-semibold text-slate-900">{{ doc.title }}</p>
                      <p class="text-sm text-slate-500 mt-0.5">
                        {{ doc.type }}
                        @if (doc.number) { · {{ doc.number }} }
                        · {{ formatDate(doc.date) }}
                      </p>
                      @if (doc.participantName) {
                        <p class="text-xs text-brand mt-1">{{ doc.participantName }}</p>
                      }
                      @if (doc.amount) {
                        <p class="text-sm font-semibold text-slate-700 mt-1">S/ {{ doc.amount.toFixed(2) }}</p>
                      }
                    </div>
                    <button type="button" class="btn-secondary !text-xs !py-2 shrink-0" (click)="download(doc)">
                      Descargar
                    </button>
                  </div>
                }
              </div>
            </section>
          }
        } @else {
          <div class="mp-card !p-0 overflow-hidden">
            @for (doc of filtered(); track doc.id) {
              <div class="p-4 border-b border-slate-100 last:border-0 flex flex-wrap items-center justify-between gap-3">
                <div class="min-w-0">
                  <p class="font-semibold text-slate-900">{{ doc.title }}</p>
                  <p class="text-sm text-slate-500 mt-0.5">
                    {{ doc.type }}
                    @if (doc.number) { · {{ doc.number }} }
                    · {{ formatDate(doc.date) }}
                  </p>
                  @if (doc.participantName) {
                    <p class="text-xs text-brand mt-1">{{ doc.participantName }}</p>
                  }
                  @if (doc.amount) {
                    <p class="text-sm font-semibold text-slate-700 mt-1">S/ {{ doc.amount.toFixed(2) }}</p>
                  }
                </div>
                <button type="button" class="btn-secondary !text-xs !py-2 shrink-0" (click)="download(doc)">
                  Descargar
                </button>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
})
export class MemberDocumentsPageComponent implements OnInit {
  private readonly documentService = inject(MemberDocumentService);

  protected readonly documents = signal<MemberDocument[]>([]);
  protected readonly loading = signal(true);
  protected readonly category = signal<DocumentCategory>('all');
  protected readonly categories: MemberDocument['category'][] = ['constancia', 'comprobante', 'contrato', 'otro'];

  protected readonly filtered = computed(() => {
    const cat = this.category();
    const list = this.documents();
    if (cat === 'all') return list;
    return list.filter(d => d.category === cat);
  });

  protected readonly grouped = computed(() => {
    const groups: { category: MemberDocument['category']; documents: MemberDocument[] }[] = [];
    for (const cat of this.categories) {
      const docs = this.documents().filter(d => d.category === cat);
      if (docs.length > 0) groups.push({ category: cat, documents: docs });
    }
    return groups;
  });

  ngOnInit(): void {
    this.documentService.getDocuments().subscribe({
      next: list => { this.documents.set(list); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  protected categoryLabel(cat: MemberDocument['category']): string {
    return CATEGORY_LABELS[cat];
  }

  protected formatDate(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  protected download(doc: MemberDocument): void {
    if (doc.downloadUrl) {
      window.open(doc.downloadUrl, '_blank', 'noopener');
    }
  }
}
