import Quill from 'quill';

export function readQuillHtml(quill: Quill | null): string {
  if (!quill) return '';
  const anyQuill = quill as Quill & { getSemanticHTML?: () => string };
  if (typeof anyQuill.getSemanticHTML === 'function') {
    return anyQuill.getSemanticHTML();
  }
  return quill.root.innerHTML;
}

export function writeQuillHtml(quill: Quill, html: string): void {
  const normalized = html?.trim() ? html : '';
  quill.setContents([], 'silent');
  if (normalized) {
    quill.clipboard.dangerouslyPasteHTML(0, normalized, 'silent');
  }
}
