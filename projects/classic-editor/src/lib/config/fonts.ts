/** Font options applied via Quill StyleAttributor (`font-family`). Edit here to extend. */
export const EDITOR_FONTS = [
  { label: 'Default', value: false as const, css: '' },
  { label: 'Inter', value: 'Inter', css: 'Inter, system-ui, sans-serif' },
  { label: 'Georgia', value: 'Georgia', css: 'Georgia, serif' },
  { label: 'Times New Roman', value: 'Times New Roman', css: '"Times New Roman", Times, serif' },
  { label: 'Arial', value: 'Arial', css: 'Arial, Helvetica, sans-serif' },
  { label: 'Verdana', value: 'Verdana', css: 'Verdana, Geneva, sans-serif' },
  { label: 'Courier New', value: 'Courier New', css: '"Courier New", Courier, monospace' },
  { label: 'JetBrains Mono', value: 'JetBrains Mono', css: '"JetBrains Mono", ui-monospace, monospace' },
] as const;

export type EditorFontValue = (typeof EDITOR_FONTS)[number]['value'];

/** Load once in the host app `<head>` so picker fonts render correctly. */
export const CLASSIC_EDITOR_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap';

export function fontWhitelist(): string[] {
  return EDITOR_FONTS.map((f) => f.value).filter((v): v is Exclude<EditorFontValue, false> => v !== false);
}

export function fontLabelOf(value: unknown): string {
  if (typeof value !== 'string' || !value) return 'Default';
  return EDITOR_FONTS.find((f) => f.value === value)?.label ?? value;
}

export function fontPreviewCss(value: EditorFontValue): string {
  return EDITOR_FONTS.find((f) => f.value === value)?.css || 'inherit';
}
