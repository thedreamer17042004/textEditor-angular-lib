import { NgComponentOutlet } from '@angular/common';
import { Component, Type, effect, inject, signal } from '@angular/core';
import { TaskWorkspaceFacade } from '../facade/task-workspace.facade';
import { TASK_DETAIL_DIALOG } from './task-detail-dialog.token';

/**
 * Keeps the host-provided dialog instance alive after first open so overlays
 * can dispose cleanly instead of being torn down mid-close.
 */
@Component({
  selector: 'tw-task-dialog-host',
  standalone: true,
  imports: [NgComponentOutlet],
  template: `
    @if (dialogType(); as type) {
      <ng-container *ngComponentOutlet="type" />
    }
  `,
})
export class TaskDialogHostComponent {
  private readonly facade = inject(TaskWorkspaceFacade);
  private readonly registered = inject(TASK_DETAIL_DIALOG, { optional: true });

  readonly dialogType = signal<Type<unknown> | null>(null);

  constructor() {
    effect(() => {
      const open = !!this.facade.selectedTaskId();
      if (!open || this.dialogType() || !this.registered) return;
      this.dialogType.set(this.registered);
    });
  }
}
