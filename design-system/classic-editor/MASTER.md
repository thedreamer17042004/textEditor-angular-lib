# Design System Master — Classic Editor (PrimeNG 19 Aura)

Aligned to **PrimeNG v19 Aura** light preset (default emerald primary + zinc surfaces).

## Tokens (Aura-mapped)

| Role | Hex | Maps to |
|------|-----|---------|
| Primary | `#10b981` | `emerald.500` / `--p-primary-color` |
| Primary hover | `#059669` | `emerald.600` |
| Primary soft | `#ecfdf5` | `emerald.50` |
| On primary | `#ffffff` | |
| Surface 0 | `#ffffff` | `--p-surface-0` |
| Surface 50 | `#fafafa` | `--p-surface-50` |
| Surface 100 | `#f4f4f5` | `--p-surface-100` |
| Surface 200 | `#e4e4e7` | `--p-surface-200` |
| Ground | `#f4f4f5` | `--p-surface-ground` |
| Text | `#3f3f46` | zinc-700 |
| Text muted | `#71717a` | zinc-500 |
| Border | `#e4e4e7` | `--p-content-border-color` |
| Focus ring | `0 0 0 0.2rem rgba(16,185,129,.2)` | Aura focus |
| Radius | `6px` | Aura `md` |
| Destructive | `#ef4444` | red-500 |

## Typography

- UI / document: **Inter** (PrimeNG docs default stack feel)
- Mono: ui-monospace / JetBrains Mono for code blocks

## Component cues (Editor)

- Root: surface-0, 1px surface-200 border, radius 6px
- Toolbar: surface-0/50, bottom border, compact icon buttons radius 6px
- Active format: emerald-50 bg + emerald-700 text + soft inset ring
- Content: white paper, readable line-height, no heavy chrome
- Menus/overlays: white + soft elevation (Aura overlay)
