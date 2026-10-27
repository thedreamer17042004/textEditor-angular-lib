/*
 * Public API of classic-editor
 * Prefer importing from 'classic-editor' — only export stable surface here.
 */

export { ClassicEditorComponent } from './lib/classic-editor.component';

export {
  CLASSIC_EDITOR_FONTS_URL,
  EDITOR_FONTS,
  HEADING_OPTIONS,
  HIGHLIGHT_COLORS,
  SIZE_OPTIONS,
  TABLE_GRID_MAX,
  TEXT_COLORS,
} from './lib/config';
export type { EditorFontValue, HeadingValue, SizeValue } from './lib/config';

export { createQuill, getTableModule, setupQuillFormats } from './lib/core';
export type { QuillFormatMap, QuillTableModule, TableAction, ToolbarMenu } from './lib/core';

export {
  buildTableGrid,
  printHtml,
  readQuillHtml,
  writeQuillHtml,
} from './lib/features';
