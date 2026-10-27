import Quill from 'quill';
import { TABLE_GRID_MAX } from '../config';
import { getTableModule } from '../core';
import { TableAction } from '../core/types';

export interface TableGridCell {
  row: number;
  col: number;
}

export function buildTableGrid(max = TABLE_GRID_MAX): TableGridCell[] {
  return Array.from({ length: max * max }, (_, i) => ({
    row: Math.floor(i / max) + 1,
    col: (i % max) + 1,
  }));
}

export function isSelectionInTable(quill: Quill | null): boolean {
  if (!quill) return false;
  const table = getTableModule(quill);
  try {
    const selection = quill.getSelection();
    const [tableBlot] = table?.getTable(selection) ?? [null, null, null, -1];
    return tableBlot != null;
  } catch {
    return false;
  }
}

export function insertTableAtSelection(quill: Quill, rows: number, cols: number): void {
  const table = getTableModule(quill);
  if (!table) return;

  quill.focus();
  const selection = quill.getSelection(true);
  if (!selection) {
    quill.setSelection(quill.getLength(), 0, 'silent');
  }
  table.insertTable(Math.max(1, rows), Math.max(1, cols));
}

export function runTableAction(quill: Quill, action: TableAction): void {
  const table = getTableModule(quill);
  if (!table) return;
  quill.focus();
  table[action]();
}

export function tableSizeLabel(rows: number, cols: number): string {
  if (!rows || !cols) return 'Insert table';
  return `${rows} × ${cols}`;
}
