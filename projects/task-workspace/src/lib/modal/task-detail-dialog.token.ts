import { InjectionToken, Provider, Type } from '@angular/core';

/**
 * Host registers its own task-detail dialog component.
 * Core only mounts it via TaskDialogHostComponent.
 */
export const TASK_DETAIL_DIALOG = new InjectionToken<Type<unknown>>('TASK_DETAIL_DIALOG');

export function provideTaskDetailDialog(component: Type<unknown>): Provider {
  return { provide: TASK_DETAIL_DIALOG, useValue: component };
}
