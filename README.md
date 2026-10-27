# classic-editor (Angular 19)

CKEditor Classic–inspired rich text editor library for Angular 19 (Quill 2).

- **Library:** `projects/classic-editor` → npm package `classic-editor`
- **Demo app:** workspace root
- **Prebuilt package:** [`releases/classic-editor-0.1.0.tgz`](./releases/classic-editor-0.1.0.tgz)

## Install into another Angular 19 app

```bash
npm install quill
npm install https://github.com/thedreamer17042004/textEditor-angular-lib/raw/main/releases/classic-editor-0.1.0.tgz
```

Or after cloning this repo:

```bash
npm install ./path/to/textEditor-angular-lib/releases/classic-editor-0.1.0.tgz
```

Then in the consumer app:

```scss
// styles.scss
@import 'quill/dist/quill.snow.css';
```

```ts
import { ClassicEditorComponent, CLASSIC_EDITOR_FONTS_URL } from 'classic-editor';
// template: <ce-editor [(ngModel)]="html" />
```

Load `CLASSIC_EDITOR_FONTS_URL` once in `index.html` for font-family picker fonts.

Peers required: `@angular/core` ^19, `@angular/common` ^19, `@angular/forms` ^19, `quill` ^2.

## Develop this repo

```bash
npm install
npm start          # build lib + serve demo
npm run build:lib  # → dist/classic-editor
npm run pack:lib   # rebuild releases/*.tgz (move into releases/)
```

## Library layout

```
projects/classic-editor/src/lib/
  config/      # fonts, sizes, colors, headings
  core/        # Quill factory + types
  features/    # print, table, html, stats
  classic-editor.component.*
```

See `projects/classic-editor/README.md` for more consumer docs.
