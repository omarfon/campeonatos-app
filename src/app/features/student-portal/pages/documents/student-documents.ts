import { Component, computed, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { StudentDocumentService } from '../../services/student-document.service';
import { StudentDocument } from '../../models/student-portal.model';
import { StudentEmptyStateComponent } from '../../components/empty-state/student-empty-state';

type DocumentCategory = StudentDocument['category'] | 'all';

const CATEGORY_LABELS: Record<StudentDocument['category'], string> = {
  constancia: 'Constancias',
  comprobante: 'Comprobantes',
  otro: 'Otros documentos',
};

@Component({
  selector: 'app-student-documents',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StudentEmptyStateComponent],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="sp-page-title">Documentos</h1>
        <p class="text-sm text-slate-500 mt-1">Descarga constancias, comprobantes y certificados.</p>
      </div>

      <div class="flex flex-wrap gap-2" role="tablist" aria-label="Categorías de documentos">
        <button type="button" role="tab" [attr.aria-selected]="category() === 'all'"
          class="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          [class]="category() === 'all' ? 'bg-brand text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
          (click)="category.set('all')">
          Todos
        </button>
        @for (cat of categories; track cat) {
          <button type="button" role="tab" [attr.aria-selected]="category() === cat"
            class="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            [class]="category() === cat ? 'bg-brand text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
            (click)="category.set(cat)">
            {{ categoryLabel(cat) }}
          </button>
        }
      </div>

      @if (loading()) {
        <div class="space-y-3 animate-pulse">
          @for (i of [1, 2, 3]; track i) {
            <div class="h-16 bg-slate-200 rounded-2xl"></div>
          }
        </div>
      } @else if (filtered().length === 0) {
        <app-student-empty-state
          title="Sin documentos"
          description="No hay documentos en esta categoría."
          icon="📄"
        />
      } @else {
        @for (group of grouped(); track group.category) {
          @if (category() === 'all') {
            <section>
              <h2 class="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                {{ categoryLabel(group.category) }}
              </h2>
              <div class="sp-card !p-0 overflow-hidden">
                @for (doc of group.documents; track doc.id) {
                  <div class="p-4 border-b border-slate-100 last:border-0 flex flex-wrap items-center justify-between gap-3">
                    <div class="min-w-0">
                      <p class="font-semibold text-slate-900">{{ doc.title }}</p>
                      <p class="text-sm text-slate-500 mt-0.5">
                        {{ doc.type }}
                        @if (doc.number) { · {{ doc.number }} }
                        · {{ doc.date }}
                      </p>
                      @if (doc.amount) {
                        <p class="text-sm font-semibold text-slate-700 mt-1">S/ {{ doc.amount.toFixed(2) }}</p>
                      }
                    </div>
                    <button type="button" class="btn-secondary !text-xs !py-2 shrink-0"
                      (click)="download(doc)">
                      Descargar
                    </button>
                  </div>
                }
              </div>
            </section>
          } @else {
            <div class="sp-card !p-0 overflow-hidden">
              @for (doc of filtered(); track doc.id) {
                <div class="p-4 border-b border-slate-100 last:border-0 flex flex-wrap items-center justify-between gap-3">
                  <div class="min-w-0">
                    <p class="font-semibold text-slate-900">{{ doc.title }}</p>
                    <p class="text-sm text-slate-500 mt-0.5">
                      {{ doc.type }}
                      @if (doc.number) { · {{ doc.number }} }
                      · {{ doc.date }}
                    </p>
                    @if (doc.amount) {
                      <p class="text-sm font-semibold text-slate-700 mt-1">S/ {{ doc.amount.toFixed(2) }}</p>
                    }
                  </div>
                  <button type="button" class="btn-secondary !text-xs !py-2 shrink-0"
                    (click)="download(doc)">
                    Descargar
                  </button>
                </div>
              }
            </div>
          }
        }
      }
    </div>
  `,
})
export class StudentDocumentsComponent implements OnInit {
  private readonly documentService = inject(StudentDocumentService);

  protected readonly documents = signal<StudentDocument[]>([]);
  protected readonly loading = signal(true);
  protected readonly category = signal<DocumentCategory>('all');

  protected readonly categories: StudentDocument['category'][] = ['constancia', 'comprobante', 'otro'];

  protected readonly filtered = computed(() => {
    const cat = this.category();
    const list = this.documents();
    if (cat === 'all') return list;
    return list.filter(d => d.category === cat);
  });

  protected readonly grouped = computed(() => {
    const groups: { category: StudentDocument['category']; documents: StudentDocument[] }[] = [];
    for (const cat of this.categories) {
      const docs = this.documents().filter(d => d.category === cat);
      if (docs.length > 0) groups.push({ category: cat, documents: docs });
    }
    return groups;
  });

  ngOnInit(): void {
    this.documentService.getDocuments().subscribe({
      next: list => {
        this.documents.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected categoryLabel(cat: StudentDocument['category']): string {
    return CATEGORY_LABELS[cat];
  }

  protected download(doc: StudentDocument): void {
    if (doc.downloadUrl) {
      window.open(doc.downloadUrl, '_blank', 'noopener');
    }
  }
}
