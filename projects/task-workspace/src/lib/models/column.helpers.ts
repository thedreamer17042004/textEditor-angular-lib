import { BoardColumn } from './task.models';

export function defaultColumnsForSpace(spaceId: string): BoardColumn[] {
  return [
    { id: `${spaceId}-todo`, spaceId, title: 'To do', order: 0, wipLimit: 12, statusType: 'todo' },
    {
      id: `${spaceId}-in_progress`,
      spaceId,
      title: 'In progress',
      order: 1,
      wipLimit: 5,
      statusType: 'in_progress',
    },
    { id: `${spaceId}-review`, spaceId, title: 'Review', order: 2, wipLimit: 4, statusType: 'review' },
    { id: `${spaceId}-done`, spaceId, title: 'Done', order: 3, statusType: 'done' },
  ];
}

export function defaultTodoColumnId(spaceId: string, columns: BoardColumn[]): string {
  const cols = columns.filter((c) => c.spaceId === spaceId).sort((a, b) => a.order - b.order);
  return cols.find((c) => c.statusType === 'todo')?.id ?? cols[0]?.id ?? `${spaceId}-todo`;
}

export function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}
