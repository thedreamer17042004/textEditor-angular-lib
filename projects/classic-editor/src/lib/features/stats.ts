import Quill from 'quill';
import { QuillWithHistory } from '../core/types';

export interface EditorStats {
  words: number;
  characters: number;
  canUndo: boolean;
  canRedo: boolean;
}

export function readEditorStats(quill: Quill): EditorStats {
  const text = quill.getText().replace(/\n$/, '').trim();
  const history = (quill as QuillWithHistory).history;

  return {
    characters: text.length,
    words: text ? text.split(/\s+/).filter(Boolean).length : 0,
    canUndo: (history?.stack?.undo.length ?? 0) > 0,
    canRedo: (history?.stack?.redo.length ?? 0) > 0,
  };
}
