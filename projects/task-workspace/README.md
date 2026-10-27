# task-workspace

Reusable Angular 19 **task board** and **task scheduler** library. Tasks are always space-scoped — the host app must pass `spaceId`. Task detail modal is provided by the host via `provideTaskDetailDialog`.

## Install

```bash
npm i task-workspace @angular/cdk primeng
```

Host should call `providePrimeNG({ theme: { preset: Aura /* or custom */ } })` so design tokens (`--p-*`) exist on `:root`.

## Usage

```ts
provideTaskWorkspace({ useExisting: MyTaskFacade });
provideTaskDetailDialog(MyTaskDetailDialogComponent);
```

```html
<tw-task-board [spaceId]="spaceId" [tasks]="tasks" (taskOpen)="open($event)" />
<tw-task-scheduler [spaceId]="spaceId" [tasks]="tasks" (taskOpen)="open($event)" (createAt)="create($event)" />
<tw-task-dialog-host />
```

## Theming (PrimeNG dynamic UI)

Custom board/scheduler chrome does **not** hard-code the host brand. It maps to aliases that read PrimeNG tokens:

| Alias | Default source |
|-------|----------------|
| `--tw-surface` | `--p-content-background` / `--p-surface-100` |
| `--tw-surface-card` | `--p-surface-0` |
| `--tw-border` | `--p-content-border-color` / `--p-surface-200` |
| `--tw-text` | `--p-text-color` |
| `--tw-muted` | `--p-text-muted-color` |
| `--tw-accent` | `--p-primary-color` |
| `--tw-danger` | `--p-red-500` |
| `--tw-warning` | `--p-orange-500` |

When the host calls `usePreset` / `updatePreset` (or toggles dark mode), `--p-*` changes and the lib UI updates **without rebuilding the library**.

PrimeNG widgets inside the lib (`p-tag`, `p-button`, `p-select`, …) already follow the host theme.

Optional local override (no `@Input` colors needed):

```html
<div style="--tw-accent: #7c3aed">
  <tw-task-board [spaceId]="id" [tasks]="tasks" />
</div>
```

### Drag preview scrollbar

CDK mounts `.taskboard-card-drag-preview` on `document.body`. Host apps should include (once in global styles):

```css
.taskboard-card-drag-preview {
  overflow: hidden !important;
}
```

The demo app and typical host `styles.scss` already ship this rule.
