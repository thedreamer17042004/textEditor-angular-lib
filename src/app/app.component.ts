import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClassicEditorComponent } from 'classic-editor';

const DEMO_HTML = `
<h1>A calmer classic editor</h1>
<p>Write like a document — not a dashboard. This surface uses <strong>Quill</strong> with a Classic toolbar inspired by CKEditor: clear groups, soft focus, and typography meant for reading.</p>
<h2>Formatting that stays out of the way</h2>
<p>Try <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strikethrough</s>, <code>inline code</code>, H<sub>2</sub>O, and x<sup>2</sup>. Colors and highlights live in compact pickers.</p>
<blockquote>Good editors disappear. You notice the words first — then the tools when you need them.</blockquote>
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
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, ClassicEditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly html = signal(DEMO_HTML);
  readonly readonlyMode = signal(false);
  readonly showHtml = signal(false);

  onHtmlChange(value: string): void {
    this.html.set(value);
  }
}
