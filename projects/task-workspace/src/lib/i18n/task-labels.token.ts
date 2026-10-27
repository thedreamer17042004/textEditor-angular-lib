import { InjectionToken } from '@angular/core';

export interface TaskLabels {
  favorite: string;
  pin: string;
  open: string;
  duplicate: string;
  delete: string;
  addCard: string;
  addList: string;
  deleteList: string;
  newList: string;
  wip: string;
  today: string;
  month: string;
  week: string;
  day: string;
  agenda: string;
  addTask: string;
  noTasks: string;
  actions: string;
}

export const DEFAULT_TASK_LABELS: TaskLabels = {
  favorite: 'Favorite',
  pin: 'Pin',
  open: 'Open',
  duplicate: 'Duplicate',
  delete: 'Delete',
  addCard: 'Add a card',
  addList: 'Add another list',
  deleteList: 'Delete list',
  newList: 'Enter list title…',
  wip: 'WIP',
  today: 'Today',
  month: 'Month',
  week: 'Week',
  day: 'Day',
  agenda: 'Agenda',
  addTask: 'Add task',
  noTasks: 'No tasks',
  actions: 'Actions',
};

export const TASK_LABELS = new InjectionToken<TaskLabels>('TASK_LABELS', {
  providedIn: 'root',
  factory: () => DEFAULT_TASK_LABELS,
});
