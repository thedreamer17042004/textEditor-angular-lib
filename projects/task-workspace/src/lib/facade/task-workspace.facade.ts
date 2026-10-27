import { Signal } from '@angular/core';
import {
  BoardColumn,
  BoardColumnStatusType,
  CreateTaskInput,
  Holiday,
  SyncBoardColumnPayload,
  Task,
  TaskUser,
} from '../models/task.models';

/**
 * Host app implements this (HTTP, store, etc.).
 * Board / scheduler never touch a concrete store.
 */
export abstract class TaskWorkspaceFacade {
  abstract readonly selectedTaskId: Signal<string | null>;

  abstract columnsForSpace(spaceId: string): BoardColumn[];
  abstract userById(id: string): TaskUser | undefined;
  abstract currentUserId(): string;
  abstract isDoneColumn(columnId: string): boolean;
  abstract dateKey(date: Date): string;
  abstract isHoliday(date: Date): Holiday | undefined;

  abstract openTask(id: string | null): void;
  abstract createTask(input: CreateTaskInput): Task;
  abstract updateTask(id: string, patch: Partial<Task>): void;
  abstract deleteTask(id: string): void;
  abstract duplicateTask(id: string): Task | null;
  abstract moveTask(id: string, columnId: string, order?: number): void;
  abstract syncBoardColumns(
    spaceId: string,
    columns: SyncBoardColumnPayload[],
    moved?: { taskId: string; toColumnId: string }
  ): void;
  abstract reorderColumns(spaceId: string, orderedIds: string[]): void;
  abstract addColumn(spaceId: string, title: string, statusType?: BoardColumnStatusType): BoardColumn;
  /** Deletes a list; cards move to `moveToColumnId` or the first remaining sibling. Last list cannot be removed. */
  abstract removeColumn(id: string, moveToColumnId?: string): boolean;
  abstract toggleFavorite(id: string): void;
  abstract togglePinned(id: string): void;
}
