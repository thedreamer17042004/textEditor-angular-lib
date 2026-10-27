import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DatePipe, NgClass } from '@angular/common';
import {
  Component,
  HostBinding,
  OnDestroy,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ContextMenuModule } from 'primeng/contextmenu';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { TaskWorkspaceFacade } from '../facade/task-workspace.facade';
import { TASK_LABELS, TaskLabels } from '../i18n/task-labels.token';
import { BoardColumn, Task, TaskPriority } from '../models/task.models';

@Component({
  selector: 'tw-task-board',
  standalone: true,
  imports: [
    DragDropModule,
    DatePipe,
    NgClass,
    FormsModule,
    AvatarModule,
    TagModule,
    ContextMenuModule,
    TooltipModule,
  ],
  templateUrl: './task-board.component.html',
  styleUrl: './task-board.component.scss',
})
export class TaskBoardComponent implements OnDestroy {
  readonly facade = inject(TaskWorkspaceFacade);
  private readonly labels = inject(TASK_LABELS);

  /** Required — todos/tasks are always scoped to a space declared by the host. */
  readonly spaceId = input.required<string>();
  readonly tasks = input.required<Task[]>();
  /** Optional display name for accessibility. */
  readonly spaceName = input<string>('Board');
  readonly taskOpen = output<string>();

  readonly collapsed = signal(new Set<string>());
  readonly selectedTaskId = signal<string | null>(null);
  readonly addingList = signal(false);
  readonly newListTitle = signal('');
  /** True while a card/column is dragged — locks overflow so no scrollbar flash. */
  readonly dragging = signal(false);

  @HostBinding('class.taskboard-dragging')
  get hostDragging(): boolean {
    return this.dragging();
  }

  contextItems: MenuItem[] = [];
  columnMenuItems: MenuItem[] = [];

  readonly columns = computed(() => this.facade.columnsForSpace(this.spaceId()));

  /** Card drop-lists connect only to each other (not the column list). */
  readonly connectedCardLists = computed(() => this.columns().map((c) => this.cardListId(c.id)));

  readonly columnMap = computed(() => {
    const map = new Map<string, Task[]>();
    for (const col of this.columns()) {
      map.set(col.id, []);
    }
    for (const t of this.tasks()) {
      const list = map.get(t.columnId);
      if (list) list.push(t);
      else map.set(t.columnId, [t]);
    }
    for (const [, list] of map) {
      list.sort((a, b) => a.order - b.order);
    }
    return map;
  });

  tasksInColumn(columnId: string): Task[] {
    return this.columnMap().get(columnId) ?? [];
  }

  cardListId(columnId: string): string {
    return `col-cards-${columnId}`;
  }

  dropColumn(event: CdkDragDrop<BoardColumn[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    const ordered = [...this.columns()];
    moveItemInArray(ordered, event.previousIndex, event.currentIndex);
    this.facade.reorderColumns(
      this.spaceId(),
      ordered.map((c) => c.id)
    );
  }

  drop(event: CdkDragDrop<Task[]>, columnId: string): void {
    const spaceId = this.spaceId();
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.facade.syncBoardColumns(spaceId, [
        { columnId, orderedIds: event.container.data.map((t) => t.id) },
      ]);
      return;
    }

    const moved = event.previousContainer.data[event.previousIndex];
    const fromColumnId = moved.columnId;
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
    this.facade.syncBoardColumns(
      spaceId,
      [
        { columnId: fromColumnId, orderedIds: event.previousContainer.data.map((t) => t.id) },
        { columnId, orderedIds: event.container.data.map((t) => t.id) },
      ],
      { taskId: moved.id, toColumnId: columnId }
    );
  }

  toggleCollapse(columnId: string): void {
    this.collapsed.update((set) => {
      const next = new Set(set);
      if (next.has(columnId)) next.delete(columnId);
      else next.add(columnId);
      return next;
    });
  }

  isCollapsed(columnId: string): boolean {
    return this.collapsed().has(columnId);
  }

  wipExceeded(col: BoardColumn, count: number): boolean {
    return !!col.wipLimit && count > col.wipLimit;
  }

  open(task: Task): void {
    this.selectedTaskId.set(task.id);
    this.taskOpen.emit(task.id);
  }

  onDragStarted(): void {
    this.dragging.set(true);
    document.documentElement.classList.add('tw-taskboard-dnd');
  }

  onDragEnded(): void {
    this.dragging.set(false);
    document.documentElement.classList.remove('tw-taskboard-dnd');
  }

  ngOnDestroy(): void {
    document.documentElement.classList.remove('tw-taskboard-dnd');
  }

  openColumnMenu(event: MouseEvent, col: BoardColumn, menu: { show: (e: Event) => void }): void {
    event.preventDefault();
    event.stopPropagation();
    const canDelete = this.columns().length > 1;
    this.columnMenuItems = [
      {
        label: this.labels.deleteList,
        icon: 'pi pi-trash',
        disabled: !canDelete,
        command: () => this.deleteList(col.id),
      },
    ];
    menu.show(event);
  }

  deleteList(columnId: string): void {
    const ok = this.facade.removeColumn(columnId);
    if (!ok) return;
    this.collapsed.update((set) => {
      if (!set.has(columnId)) return set;
      const next = new Set(set);
      next.delete(columnId);
      return next;
    });
  }

  onContext(event: MouseEvent, task: Task, menu: { show: (e: Event) => void }): void {
    event.preventDefault();
    event.stopPropagation();
    const L = this.labels;
    this.contextItems = [
      {
        label: L.favorite,
        icon: task.favorite ? 'pi pi-star-fill' : 'pi pi-star',
        command: () => this.facade.toggleFavorite(task.id),
      },
      {
        label: L.pin,
        icon: 'pi pi-bookmark',
        command: () => this.facade.togglePinned(task.id),
      },
      {
        label: L.open,
        icon: 'pi pi-eye',
        command: () => this.open(task),
      },
      {
        label: L.duplicate,
        icon: 'pi pi-copy',
        command: () => this.facade.duplicateTask(task.id),
      },
      {
        label: L.delete,
        icon: 'pi pi-trash',
        command: () => this.facade.deleteTask(task.id),
      },
      { separator: true },
      ...this.columns().map((col) => ({
        label: `→ ${col.title}`,
        disabled: col.id === task.columnId,
        command: () => this.facade.moveTask(task.id, col.id),
      })),
    ];
    menu.show(event);
  }

  addCard(columnId: string): void {
    const task = this.facade.createTask({
      spaceId: this.spaceId(),
      title: 'New task',
      description: '',
      columnId,
      priority: 'medium',
      assigneeIds: [this.facade.currentUserId()],
      reporterId: this.facade.currentUserId(),
      dueDate: null,
      scheduleStart: null,
      scheduleEnd: null,
      favorite: false,
      pinned: false,
      tags: [],
    });
    this.taskOpen.emit(task.id);
  }

  startAddList(): void {
    this.addingList.set(true);
    this.newListTitle.set('');
  }

  cancelAddList(): void {
    this.addingList.set(false);
    this.newListTitle.set('');
  }

  confirmAddList(): void {
    const title = this.newListTitle().trim();
    if (!title) return;
    this.facade.addColumn(this.spaceId(), title);
    this.cancelAddList();
  }

  assignees(task: Task) {
    return task.assigneeIds.map((id) => this.facade.userById(id)).filter(Boolean);
  }

  checklistProgress(task: Task): { done: number; total: number } | null {
    if (!task.checklist.length) return null;
    return {
      done: task.checklist.filter((c) => c.done).length,
      total: task.checklist.length,
    };
  }

  hasDescription(task: Task): boolean {
    return !!task.description?.trim();
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || this.facade.isDoneColumn(task.columnId)) return false;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return new Date(task.dueDate) < start;
  }

  priorityLabel(priority: TaskPriority): string {
    const map: Record<TaskPriority, string> = {
      urgent: 'P1',
      high: 'P2',
      medium: 'P3',
      low: 'P4',
    };
    return map[priority];
  }

  columnStatusClass(col: BoardColumn): string {
    const t = col.statusType ?? 'todo';
    if (t === 'done') return 'p-taskboard-column-done';
    if (t === 'in_progress' || t === 'review') return 'p-taskboard-column-in-progress';
    if (t === 'blocked') return 'p-taskboard-column-blocked';
    return 'p-taskboard-column-todo';
  }

  label(key: keyof TaskLabels): string {
    return this.labels[key];
  }
}
