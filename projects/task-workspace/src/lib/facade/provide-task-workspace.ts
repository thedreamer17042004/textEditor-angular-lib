import { Provider, Type } from '@angular/core';
import { TaskWorkspaceFacade } from './task-workspace.facade';

export interface ProvideTaskWorkspaceOptions {
  /** Concrete facade class (providedIn / constructors work as usual). */
  useClass?: Type<TaskWorkspaceFacade>;
  /** Existing injectable that implements TaskWorkspaceFacade. */
  useExisting?: Type<TaskWorkspaceFacade>;
  /** Factory returning a facade instance. */
  useFactory?: (...args: unknown[]) => TaskWorkspaceFacade;
  deps?: unknown[];
}

export function provideTaskWorkspace(options: ProvideTaskWorkspaceOptions): Provider[] {
  if (options.useExisting) {
    return [{ provide: TaskWorkspaceFacade, useExisting: options.useExisting }];
  }
  if (options.useClass) {
    return [{ provide: TaskWorkspaceFacade, useClass: options.useClass }];
  }
  if (options.useFactory) {
    return [
      {
        provide: TaskWorkspaceFacade,
        useFactory: options.useFactory,
        deps: options.deps ?? [],
      },
    ];
  }
  throw new Error(
    'provideTaskWorkspace requires one of: useClass, useExisting, or useFactory'
  );
}
