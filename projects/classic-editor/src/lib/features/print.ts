const PRINT_CSS = `
  @page { margin: 16mm; }
      body {
        font-family: Inter, 'Segoe UI', system-ui, sans-serif;
        padding: 0;
        margin: 0;
        line-height: 1.6;
        color: #18181b;
        font-size: 16px;
      }
      h1, h2, h3, h4 { letter-spacing: -0.02em; font-weight: 700; color: #18181b; }
      blockquote {
        border-left: 4px solid #10b981;
        padding: 0.5rem 0 0.5rem 1rem;
        color: #71717a;
        font-style: italic;
      }
  pre {
    background: #1c2434;
    color: #e2e8f0;
    padding: 14px;
    border-radius: 8px;
    font-family: ui-monospace, Menlo, monospace;
    font-size: 13px;
    white-space: pre-wrap;
  }
      code {
        background: #f4f4f5;
        color: #be185d;
        padding: 0.1em 0.35em;
        border-radius: 4px;
      }
      table { border-collapse: collapse; width: 100%; font-size: 14px; }
      th, td { border: 1px solid #e4e4e7; padding: 8px; vertical-align: top; }
      th { background: #fafafa; text-align: left; }
      img { max-width: 100%; }
      a { color: #059669; }
`;

/** Print HTML via a hidden iframe (avoids popup blockers / noopener null window). */
export function printHtml(bodyHtml: string, title = 'Print'): void {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('title', title);
  iframe.setAttribute('aria-hidden', 'true');
  Object.assign(iframe.style, {
    position: 'fixed',
    right: '0',
    bottom: '0',
    width: '0',
    height: '0',
    border: '0',
    opacity: '0',
    pointerEvents: 'none',
  });
  document.body.appendChild(iframe);

  const frameDoc = iframe.contentDocument ?? iframe.contentWindow?.document;
  if (!frameDoc) {
    iframe.remove();
    return;
  }

  frameDoc.open();
  frameDoc.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
    <style>${PRINT_CSS}</style></head><body>${bodyHtml}</body></html>`);
  frameDoc.close();

  let printed = false;
  const triggerPrint = (): void => {
    if (printed) return;
    printed = true;
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      window.setTimeout(() => iframe.remove(), 1000);
    }
  };

  window.setTimeout(triggerPrint, 250);
}
