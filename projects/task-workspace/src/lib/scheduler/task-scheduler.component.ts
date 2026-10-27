import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { SelectModule } from 'primeng/select';
import { TaskWorkspaceFacade } from '../facade/task-workspace.facade';
import { TASK_LABELS, TaskLabels } from '../i18n/task-labels.token';
import { Task } from '../models/task.models';

type CalView = 'month' | 'week' | 'day' | 'agenda';

interface DayCell {
  date: Date;
  dateKey: string;
  inMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  holidayName?: string;
  tasks: Task[];
}

@Component({
  selector: 'tw-task-scheduler',
  standalone: true,
  imports: [DatePipe, FormsModule, ButtonModule, SelectModule, ContextMenuModule, DragDropModule],
  templateUrl: './task-scheduler.component.html',
  styleUrl: './task-scheduler.component.scss',
})
export class TaskSchedulerComponent {
  readonly facade = inject(TaskWorkspaceFacade);
  private readonly labels = inject(TASK_LABELS);

  /** Required — create / mutations stay scoped to the host-declared space. */
  readonly spaceId = input.required<string>();
  readonly tasks = input.required<Task[]>();
  readonly taskOpen = output<string>();
  readonly createAt = output<Date>();

  readonly view = signal<CalView>('month');
  readonly cursor = signal(new Date());
  readonly expandedDayKey = signal<string | null>(null);

  taskMenuItems: MenuItem[] = [];

  readonly weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  readonly viewOptions = computed(() => [
    { label: this.labels.month, value: 'month' as CalView },
    { label: this.labels.week, value: 'week' as CalView },
    { label: this.labels.day, value: 'day' as CalView },
    { label: this.labels.agenda, value: 'agenda' as CalView },
  ]);

  readonly monthWeeks = computed(() => {
    const cells = this.buildMonth(this.cursor(), this.tasks());
    const weeks: DayCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  });

  readonly weekDays = computed(() => this.buildWeek(this.cursor(), this.tasks()));
  readonly dayTasks = computed(() => this.tasksForDate(this.cursor(), this.tasks()));
  readonly agenda = computed(() =>
    [...this.tasks()]
      .filter((t) => t.dueDate)
      .sort((a, b) => +new Date(a.dueDate!) - +new Date(b.dueDate!))
  );

  readonly title = computed(() => {
    const d = this.cursor();
    const v = this.view();
    if (v === 'day') {
      return d.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
    if (v === 'week') {
      const start = new Date(d);
      start.setDate(d.getDate() - d.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  });

  readonly connectedDayLists = computed(() => {
    if (this.view() === 'month') {
      return this.monthWeeks()
        .flat()
        .map((c) => this.dayListId(c.dateKey));
    }
    if (this.view() === 'week') {
      return this.weekDays().map((c) => this.dayListId(c.dateKey));
    }
    return [];
  });

  dayListId(dateKey: string): string {
    return `sched-day-${dateKey}`;
  }

  visibleTasks(cell: DayCell): Task[] {
    if (this.expandedDayKey() === cell.dateKey) return cell.tasks;
    return cell.tasks.slice(0, 3);
  }

  moreCount(cell: DayCell): number {
    if (this.expandedDayKey() === cell.dateKey) return 0;
    return Math.max(0, cell.tasks.length - 3);
  }

  toggleMore(cell: DayCell, event: Event): void {
    event.stopPropagation();
    this.expandedDayKey.update((k) => (k === cell.dateKey ? null : cell.dateKey));
  }

  prev(): void {
    const d = new Date(this.cursor());
    if (this.view() === 'month') d.setMonth(d.getMonth() - 1);
    else if (this.view() === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    this.cursor.set(d);
  }

  next(): void {
    const d = new Date(this.cursor());
    if (this.view() === 'month') d.setMonth(d.getMonth() + 1);
    else if (this.view() === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    this.cursor.set(d);
  }

  today(): void {
    this.cursor.set(new Date());
  }

  setView(value: CalView): void {
    this.view.set(value);
    this.expandedDayKey.set(null);
  }

  openTask(id: string, event?: Event): void {
    event?.stopPropagation();
    this.taskOpen.emit(id);
  }

  addOnDay(date: Date, event?: Event): void {
    event?.stopPropagation();
    this.createAt.emit(date);
  }

  dropTask(event: CdkDragDrop<Task[]>, targetDate: Date): void {
    if (event.previousContainer === event.container) return;
    const task =
      (event.item.data as Task | undefined) ?? event.previousContainer.data[event.previousIndex];
    if (!task) return;
    const iso = this.dateToIsoKeepTime(targetDate, task.dueDate);
    this.facade.updateTask(task.id, {
      dueDate: iso,
      scheduleStart: iso,
      scheduleEnd: iso,
    });
  }

  openTaskMenu(event: MouseEvent, task: Task, menu: ContextMenu): void {
    event.stopPropagation();
    event.preventDefault();
    this.taskMenuItems = [
      {
        label: this.labels.open,
        icon: 'pi pi-eye',
        command: () => this.openTask(task.id),
      },
      {
        label: this.labels.delete,
        icon: 'pi pi-trash',
        command: () => this.facade.deleteTask(task.id),
      },
    ];
    menu.show(event);
  }

  accentFor(task: Task): string {
    const map: Record<string, string> = {
      urgent: 'rgb(220, 38, 38)',
      high: 'rgb(234, 88, 12)',
      medium: 'rgb(37, 99, 235)',
      low: 'rgb(100, 116, 139)',
    };
    return map[task.priority] ?? map['medium'];
  }

  holidayFor(date: Date) {
    return this.facade.isHoliday(date);
  }

  label(key: keyof TaskLabels): string {
    return this.labels[key];
  }

  private dateToIsoKeepTime(day: Date, previousIso: string | null): string {
    const d = new Date(day);
    if (previousIso) {
      const prev = new Date(previousIso);
      d.setHours(prev.getHours(), prev.getMinutes(), prev.getSeconds(), 0);
    } else {
      d.setHours(10, 0, 0, 0);
    }
    return d.toISOString();
  }

  private tasksForDate(date: Date, tasks: Task[]): Task[] {
    const key = this.facade.dateKey(date);
    return tasks.filter((t) => t.dueDate && this.facade.dateKey(new Date(t.dueDate)) === key);
  }

  /** Sunday-first month grid (6 weeks). */
  private buildMonth(cursor: Date, tasks: Task[]): DayCell[] {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    const todayKey = this.facade.dateKey(new Date());
    const cells: DayCell[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      cells.push(this.toCell(date, date.getMonth() === month, todayKey, tasks));
    }
    return cells;
  }

  private buildWeek(cursor: Date, tasks: Task[]): DayCell[] {
    const start = new Date(cursor);
    start.setDate(cursor.getDate() - cursor.getDay());
    const todayKey = this.facade.dateKey(new Date());
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return this.toCell(date, true, todayKey, tasks);
    });
  }

  private toCell(date: Date, inMonth: boolean, todayKey: string, tasks: Task[]): DayCell {
    const holiday = this.facade.isHoliday(date);
    const dow = date.getDay();
    return {
      date,
      dateKey: this.facade.dateKey(date),
      inMonth,
      isToday: this.facade.dateKey(date) === todayKey,
      isWeekend: dow === 0 || dow === 6,
      holidayName: holiday?.name,
      tasks: this.tasksForDate(date, tasks),
    };
  }
}
