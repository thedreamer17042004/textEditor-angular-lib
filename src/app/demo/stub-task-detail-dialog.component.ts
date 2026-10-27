import { Component, computed, inject } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { MockTaskFacade } from './mock-task-facade';

/** Host-owned modal — registered via provideTaskDetailDialog. */
@Component({
  selector: 'app-stub-task-detail-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule],
  template: `
    <p-dialog
      [header]="task()?.title ?? 'Task'"
      [visible]="visible()"
      [modal]="true"
      [style]="{ width: '28rem' }"
      (visibleChange)="onVisible($event)"
    >
      @if (task(); as t) {
        <p><strong>Space:</strong> {{ t.spaceId }}</p>
        <p>{{ t.description || 'No description' }}</p>
        <p><strong>Priority:</strong> {{ t.priority }}</p>
      }
      <ng-template pTemplate="footer">
        <button type="button" pButton label="Close" class="p-button-text" (click)="close()"></button>
      </ng-template>
    </p-dialog>
  `,
})
export class StubTaskDetailDialogComponent {
  private readonly facade = inject(MockTaskFacade);

  readonly visible = computed(() => !!this.facade.selectedTaskId());
  readonly task = computed(() => {
    const id = this.facade.selectedTaskId();
    return id ? this.facade.taskById(id) : undefined;
  });

  onVisible(open: boolean): void {
    if (!open) this.close();
  }

  close(): void {
    this.facade.openTask(null);
  }
}
