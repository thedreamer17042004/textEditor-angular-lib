import Quill from 'quill';
import { QuillTableModule } from './types';
import { setupQuillFormats } from './quill-formats';

export interface CreateQuillOptions {
  placeholder: string;
  readOnly: boolean;
}

/** Factory for the editor engine — keep Quill wiring here, not in the component. */
export function createQuill(host: HTMLElement, options: CreateQuillOptions): Quill {
  setupQuillFormats();

  return new Quill(host, {
    theme: 'snow',
    placeholder: options.placeholder,
    readOnly: options.readOnly,
    modules: {
      toolbar: false,
      table: true,
      history: {
        delay: 800,
        maxStack: 120,
        userOnly: true,
      },
      clipboard: {
        matchVisual: false,
      },
    },
  });
}

export function getTableModule(quill: Quill | null): QuillTableModule | null {
  if (!quill) return null;
  return (quill.getModule('table') as QuillTableModule | null) ?? null;
}
