export type QuillFormatMap = Record<string, unknown>;

export type ToolbarMenu = 'heading' | 'font' | 'size' | 'color' | 'highlight' | 'table';

export type TableAction =
  | 'insertRowAbove'
  | 'insertRowBelow'
  | 'insertColumnLeft'
  | 'insertColumnRight'
  | 'deleteRow'
  | 'deleteColumn'
  | 'deleteTable';

export interface QuillTableModule {
  insertTable(rows: number, columns: number): void;
  insertRowAbove(): void;
  insertRowBelow(): void;
  insertColumnLeft(): void;
  insertColumnRight(): void;
  deleteRow(): void;
  deleteColumn(): void;
  deleteTable(): void;
  getTable(range?: { index: number; length: number } | null): [unknown, unknown, unknown, number];
}

export interface QuillHistoryStack {
  undo: unknown[];
  redo: unknown[];
}

export interface QuillWithHistory {
  history?: {
    undo(): void;
    redo(): void;
    stack?: QuillHistoryStack;
  };
}
