# classic-editor

CKEditor Classic–inspired rich text editor for **Angular 19**, powered by **Quill 2**.

## Architecture

```
src/lib/
  classic-editor.component.*   # UI shell only (CVA + toolbar bindings)
  config/                      # Extend options here (fonts, sizes, colors, headings)
  core/                        # Quill factory, formats, shared types
  features/                    # Print, table helpers, HTML I/O, stats
  styles/                      # Optional SCSS tokens (component SCSS stays colocated)
```

| Want to… | Edit |
|----------|------|
| Add a font | `config/fonts.ts` |
| Change sizes / colors / headings | `config/toolbar-options.ts` |
| Change Quill modules / formats | `core/create-quill.ts`, `core/quill-formats.ts` |
| Add print / table / HTML behavior | `features/*` |
| Change toolbar layout / icons | `classic-editor.component.html` + `.scss` |

Keep the component thin: new capabilities go into `config` or `features`, then wire a small method in the component.

## Install

```bash
npm install classic-editor quill
```

Peers: `@angular/core` ^19, `@angular/common` ^19, `@angular/forms` ^19, `quill` ^2.

## Setup

```scss
@import 'quill/dist/quill.snow.css';
```

```html
<link rel="stylesheet" [href]="fontsUrl" />
```

```ts
import { CLASSIC_EDITOR_FONTS_URL } from 'classic-editor';
// fontsUrl = CLASSIC_EDITOR_FONTS_URL
```

## Usage

```ts
import { ClassicEditorComponent } from 'classic-editor';

@Component({
  standalone: true,
  imports: [FormsModule, ClassicEditorComponent],
  template: `<ce-editor [(ngModel)]="html" placeholder="Start writing…" />`,
})
export class PageComponent {
  html = '<p>Hello</p>';
}
```

### Inputs / outputs

| API | Type | Description |
|-----|------|-------------|
| `placeholder` | `string` | Empty-state hint |
| `readonly` | `boolean` | Read-only mode |
| `styleClass` | `string` | Extra CSS class on root |
| `contentChange` | `output<string>` | Emits HTML on change |
| `ngModel` | CVA | Two-way HTML binding |

## Build / publish

```bash
ng build classic-editor
cd dist/classic-editor && npm publish
# or: npm run pack:lib
```
