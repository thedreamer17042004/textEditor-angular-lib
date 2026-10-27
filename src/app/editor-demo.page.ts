import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClassicEditorComponent } from 'classic-editor';

const DEMO_HTML = `
<h1>PrimeNG Aura TextEditor</h1>
<p>Rich text editing powered by <strong>Quill</strong>, visually aligned with <strong>PrimeNG 19 Aura</strong> — emerald primary, zinc surfaces, familiar Classic toolbar.</p>
<h2>Formatting</h2>
<p>Try <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strikethrough</s>, <code>inline code</code>, H<sub>2</sub>O, and x<sup>2</sup>.</p>
<blockquote>Select text, then apply formats from the toolbar — same mental model as p-editor.</blockquote>
<pre class="ql-syntax" spellcheck="false">const quill = new Quill('#editor', {
  theme: 'snow',
  modules: { toolbar: false }
});</pre>
<h2>Structure &amp; lists</h2>
<ul>
  <li>Headings and paragraph styles</li>
  <li>Bullets, numbers, and checklists</li>
  <li>Quotes, dividers, images, and tables</li>
</ul>
<ol>
  <li>Select the text you care about</li>
  <li>Apply a format from the toolbar</li>
  <li>Undo freely with Ctrl+Z</li>
</ol>
<p>Use <strong>Ctrl+K</strong> for links when you are ready to connect ideas.</p>
`.trim();

@Component({
  selector: 'app-editor-demo-page',
  standalone: true,
  imports: [FormsModule, RouterLink, ClassicEditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class EditorDemoPage {
  readonly html = signal(DEMO_HTML);
  readonly readonlyMode = signal(false);
  readonly showHtml = signal(false);

  onHtmlChange(value: string): void {
    this.html.set(value);
  }
}
