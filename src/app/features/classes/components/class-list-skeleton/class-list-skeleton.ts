import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-class-list-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 animate-pulse" aria-hidden="true">
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
        @for (i of placeholders; track i) {
          <div class="section-card p-4 space-y-2">
            <div class="h-3 bg-slate-200 rounded w-2/3"></div>
            <div class="h-8 bg-slate-200 rounded w-1/2"></div>
          </div>
        }
      </div>
      <div class="section-card p-4">
        <div class="h-10 bg-slate-200 rounded"></div>
      </div>
      <div class="section-card overflow-hidden">
        @for (row of tableRows; track row) {
          <div class="flex gap-4 p-4 border-b border-slate-100">
            <div class="h-4 bg-slate-200 rounded flex-1"></div>
            <div class="h-4 bg-slate-200 rounded flex-1"></div>
            <div class="h-4 bg-slate-200 rounded w-24"></div>
          </div>
        }
      </div>
    </div>
  `,
})
export class ClassListSkeletonComponent {
  protected readonly placeholders = [1, 2, 3, 4, 5];
  protected readonly tableRows = [1, 2, 3, 4, 5, 6];
}
