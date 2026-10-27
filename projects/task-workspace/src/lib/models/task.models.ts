export type BoardColumnStatusType = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface BoardColumn {
  id: string;
  spaceId: string;
  title: string;
  order: number;
  wipLimit?: number;
  statusType?: BoardColumnStatusType;
}

export interface TaskUser {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

export interface Space {
  id: string;
  name: string;
  description?: string;
  color?: string;
  teamIds?: string[];
  memberIds?: string[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface TaskComment {
  id: string;
  userId: string;
  body: string;
  createdAt: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  size: string;
  url: string;
}

export interface Task {
  id: string;
  spaceId: string;
  teamId?: string;
  title: string;
  description: string;
  columnId: string;
  priority: TaskPriority;
  assigneeIds: string[];
  reporterId: string;
  dueDate: string | null;
  scheduleStart: string | null;
  scheduleEnd: string | null;
  favorite: boolean;
  pinned: boolean;
  tags: string[];
  checklist: ChecklistItem[];
  comments: TaskComment[];
  attachments: TaskAttachment[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  recurring?: boolean;
}

/** Host must always supply spaceId — todos/tasks are space-scoped. */
export type CreateTaskInput = {
  spaceId: string;
  title: string;
  description?: string;
  columnId?: string;
  priority?: TaskPriority;
  assigneeIds?: string[];
  reporterId?: string;
  dueDate?: string | null;
  scheduleStart?: string | null;
  scheduleEnd?: string | null;
  favorite?: boolean;
  pinned?: boolean;
  tags?: string[];
  checklist?: ChecklistItem[];
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  order?: number;
  teamId?: string;
};

export interface SyncBoardColumnPayload {
  columnId: string;
  orderedIds: string[];
}
