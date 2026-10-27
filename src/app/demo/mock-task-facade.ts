import { Injectable, computed, signal } from '@angular/core';
import {
  BoardColumn,
  BoardColumnStatusType,
  CreateTaskInput,
  Holiday,
  SyncBoardColumnPayload,
  Task,
  TaskUser,
  TaskWorkspaceFacade,
  dateKey,
  defaultColumnsForSpace,
  defaultTodoColumnId,
} from 'task-workspace';

@Injectable()
export class MockTaskFacade extends TaskWorkspaceFacade {
  private readonly _users: TaskUser[] = [
    { id: 'u1', name: 'Alex Nguyen', avatar: 'AN' },
    { id: 'u2', name: 'Mina Tran', avatar: 'MT' },
  ];

  private readonly _columns = signal<BoardColumn[]>([
    ...defaultColumnsForSpace('space-1'),
    ...defaultColumnsForSpace('space-2'),
  ]);

  private readonly _tasks = signal<Task[]>(this.seedTasks());
  private readonly _selectedTaskId = signal<string | null>(null);
  private readonly _holidays = signal<Holiday[]>([
    { id: 'h1', name: 'Demo Holiday', date: dateKey(new Date()), recurring: false },
  ]);

  readonly selectedTaskId = this._selectedTaskId.asReadonly();
  readonly tasks = this._tasks.asReadonly();
  readonly spaces = [
    { id: 'space-1', name: 'Product' },
    { id: 'space-2', name: 'Marketing' },
  ];

  tasksForSpace = (spaceId: string) =>
    computed(() => this._tasks().filter((t) => t.spaceId === spaceId));

  columnsForSpace(spaceId: string): BoardColumn[] {
    return this._columns()
      .filter((c) => c.spaceId === spaceId)
      .sort((a, b) => a.order - b.order);
  }

  userById(id: string): TaskUser | undefined {
    return this._users.find((u) => u.id === id);
  }

  currentUserId(): string {
    return 'u1';
  }

  isDoneColumn(columnId: string): boolean {
    return this._columns().find((c) => c.id === columnId)?.statusType === 'done';
  }

  dateKey(d: Date): string {
    return dateKey(d);
  }

  isHoliday(date: Date): Holiday | undefined {
    const key = dateKey(date);
    return this._holidays().find((h) => h.date === key);
  }

  openTask(id: string | null): void {
    this._selectedTaskId.set(id);
  }

  createTask(input: CreateTaskInput): Task {
    const columnId = input.columnId ?? defaultTodoColumnId(input.spaceId, this._columns());
    const now = new Date().toISOString();
    const task: Task = {
      id: `task-${Date.now()}`,
      spaceId: input.spaceId,
      title: input.title,
      description: input.description ?? '',
      columnId,
      priority: input.priority ?? 'medium',
      assigneeIds: input.assigneeIds ?? [this.currentUserId()],
      reporterId: input.reporterId ?? this.currentUserId(),
      dueDate: input.dueDate ?? null,
      scheduleStart: input.scheduleStart ?? input.dueDate ?? null,
      scheduleEnd: input.scheduleEnd ?? input.dueDate ?? null,
      favorite: input.favorite ?? false,
      pinned: input.pinned ?? false,
      tags: input.tags ?? [],
      checklist: input.checklist ?? [],
      comments: input.comments ?? [],
      attachments: input.attachments ?? [],
      order:
        input.order ??
        this._tasks().filter((t) => t.spaceId === input.spaceId && t.columnId === columnId).length,
      createdAt: now,
      updatedAt: now,
    };
    this._tasks.update((list) => [...list, task]);
    return task;
  }

  updateTask(id: string, patch: Partial<Task>): void {
    this._tasks.update((list) =>
      list.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t))
    );
  }

  deleteTask(id: string): void {
    this._tasks.update((list) => list.filter((t) => t.id !== id));
    if (this._selectedTaskId() === id) this._selectedTaskId.set(null);
  }

  duplicateTask(id: string): Task | null {
    const src = this._tasks().find((t) => t.id === id);
    if (!src) return null;
    return this.createTask({
      ...src,
      title: `${src.title} (copy)`,
      spaceId: src.spaceId,
    });
  }

  moveTask(id: string, columnId: string, order?: number): void {
    const task = this._tasks().find((t) => t.id === id);
    if (!task) return;
    const columnTasks = this._tasks().filter(
      (t) => t.id !== id && t.columnId === columnId && t.spaceId === task.spaceId
    );
    const newOrder = order ?? columnTasks.length;
    this.updateTask(id, { columnId, order: newOrder });
  }

  syncBoardColumns(
    spaceId: string,
    columns: SyncBoardColumnPayload[],
    _moved?: { taskId: string; toColumnId: string }
  ): void {
    const nextById = new Map<string, { columnId: string; order: number }>();
    for (const col of columns) {
      col.orderedIds.forEach((id, order) => nextById.set(id, { columnId: col.columnId, order }));
    }
    if (!nextById.size) return;
    const now = new Date().toISOString();
    this._tasks.update((list) =>
      list.map((t) => {
        if (t.spaceId !== spaceId) return t;
        const next = nextById.get(t.id);
        if (!next) return t;
        return { ...t, columnId: next.columnId, order: next.order, updatedAt: now };
      })
    );
  }

  reorderColumns(spaceId: string, orderedIds: string[]): void {
    this._columns.update((list) => {
      const others = list.filter((c) => c.spaceId !== spaceId);
      const byId = new Map(list.filter((c) => c.spaceId === spaceId).map((c) => [c.id, c]));
      const reordered = orderedIds
        .map((id, order) => {
          const col = byId.get(id);
          return col ? { ...col, order } : null;
        })
        .filter((c): c is BoardColumn => !!c);
      return [...others, ...reordered];
    });
  }

  addColumn(spaceId: string, title: string, statusType?: BoardColumnStatusType): BoardColumn {
    const existing = this.columnsForSpace(spaceId);
    const col: BoardColumn = {
      id: `${spaceId}-col${Date.now()}`,
      spaceId,
      title: title.trim() || 'Untitled',
      order: existing.length,
      statusType,
    };
    this._columns.update((list) => [...list, col]);
    return col;
  }

  removeColumn(id: string, moveToColumnId?: string): boolean {
    const col = this._columns().find((c) => c.id === id);
    if (!col) return false;
    const siblings = this.columnsForSpace(col.spaceId).filter((c) => c.id !== id);
    if (!siblings.length) return false;
    const target =
      moveToColumnId && siblings.some((c) => c.id === moveToColumnId) ? moveToColumnId : siblings[0].id;
    const cards = this._tasks().filter((t) => t.columnId === id);
    for (const t of cards) this.moveTask(t.id, target);
    this._columns.update((list) => list.filter((c) => c.id !== id));
    return true;
  }

  toggleFavorite(id: string): void {
    const t = this._tasks().find((x) => x.id === id);
    if (t) this.updateTask(id, { favorite: !t.favorite });
  }

  togglePinned(id: string): void {
    const t = this._tasks().find((x) => x.id === id);
    if (t) this.updateTask(id, { pinned: !t.pinned });
  }

  taskById(id: string): Task | undefined {
    return this._tasks().find((t) => t.id === id);
  }

  private seedTasks(): Task[] {
    const now = new Date().toISOString();
    const due = new Date();
    due.setDate(due.getDate() + 2);
    return [
      {
        id: 't1',
        spaceId: 'space-1',
        title: 'Design task board lib API',
        description: 'Space-scoped inputs + facade',
        columnId: 'space-1-todo',
        priority: 'high',
        assigneeIds: ['u1'],
        reporterId: 'u1',
        dueDate: due.toISOString(),
        scheduleStart: due.toISOString(),
        scheduleEnd: due.toISOString(),
        favorite: true,
        pinned: false,
        tags: ['lib'],
        checklist: [
          { id: 'c1', text: 'Models', done: true },
          { id: 'c2', text: 'Board port', done: false },
        ],
        comments: [],
        attachments: [],
        order: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 't2',
        spaceId: 'space-1',
        title: 'Port scheduler calendar',
        description: '',
        columnId: 'space-1-in_progress',
        priority: 'medium',
        assigneeIds: ['u2'],
        reporterId: 'u1',
        dueDate: new Date().toISOString(),
        scheduleStart: new Date().toISOString(),
        scheduleEnd: new Date().toISOString(),
        favorite: false,
        pinned: true,
        tags: [],
        checklist: [],
        comments: [],
        attachments: [],
        order: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 't3',
        spaceId: 'space-2',
        title: 'Campaign brief',
        description: 'Marketing space task',
        columnId: 'space-2-todo',
        priority: 'low',
        assigneeIds: ['u2'],
        reporterId: 'u1',
        dueDate: null,
        scheduleStart: null,
        scheduleEnd: null,
        favorite: false,
        pinned: false,
        tags: ['marketing'],
        checklist: [],
        comments: [],
        attachments: [],
        order: 0,
        createdAt: now,
        updatedAt: now,
      },
    ];
  }
}
