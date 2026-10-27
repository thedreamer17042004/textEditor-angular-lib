import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import Quill from 'quill';
import {
  EDITOR_FONTS,
  EditorFontValue,
  HEADING_OPTIONS,
  HIGHLIGHT_COLORS,
  HeadingValue,
  SIZE_OPTIONS,
  TEXT_COLORS,
  fontLabelOf,
  fontPreviewCss,
} from './config';
import { createQuill, QuillFormatMap, QuillWithHistory, TableAction, ToolbarMenu } from './core';
import {
  buildTableGrid,
  insertTableAtSelection,
  isSelectionInTable,
  printHtml,
  readEditorStats,
  readQuillHtml,
  runTableAction,
  tableSizeLabel,
  writeQuillHtml,
} from './features';

/**
 * Classic Quill editor shell.
 * Keep this file thin: UI state + wiring. Engine/options/helpers live under config|core|features.
 */
@Component({
  selector: 'ce-editor',
  standalone: true,
  templateUrl: './classic-editor.component.html',
  styleUrl: './classic-editor.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ClassicEditorComponent),
      multi: true,
    },
  ],
})
export class ClassicEditorComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  readonly placeholder = input('Start writing…');
  readonly readonly = input(false);
  readonly styleClass = input('');
  readonly contentChange = output<string>();

  @ViewChild('editorHost', { static: true })
  private editorHost!: ElementRef<HTMLDivElement>;

  @ViewChild('fileInput')
  private fileInput?: ElementRef<HTMLInputElement>;

  private quill: Quill | null = null;
  private onChangeFn: (value: string) => void = () => undefined;
  private onTouchedFn: () => void = () => undefined;
  private writingValue = false;
  private pendingValue: string | null = null;

  readonly formats = signal<QuillFormatMap>({});
  readonly disabled = signal(false);
  readonly words = signal(0);
  readonly characters = signal(0);
  readonly canUndo = signal(false);
  readonly canRedo = signal(false);
  readonly openMenu = signal<ToolbarMenu | null>(null);
  readonly inTable = signal(false);
  readonly tableHover = signal({ rows: 0, cols: 0 });

  readonly tableGridCells = buildTableGrid();
  readonly headingOptions = HEADING_OPTIONS;
  readonly fontOptions = EDITOR_FONTS;
  readonly sizeOptions = SIZE_OPTIONS;
  readonly textColors = TEXT_COLORS;
  readonly highlightColors = HIGHLIGHT_COLORS;

  readonly headingLabel = computed(() => {
    const header = this.formats()['header'];
    if (!header) return 'Paragraph';
    return `Heading ${header}`;
  });

  readonly sizeLabel = computed(() => {
    const size = this.formats()['size'];
    return typeof size === 'string' && size ? size : '16px';
  });

  readonly fontLabel = computed(() => fontLabelOf(this.formats()['font']));

  ngAfterViewInit(): void {
    this.quill = createQuill(this.editorHost.nativeElement, {
      placeholder: this.placeholder(),
      readOnly: this.readonly() || this.disabled(),
    });

    this.quill.on('text-change', () => {
      this.refreshChrome();
      if (this.writingValue) return;
      const html = readQuillHtml(this.quill);
      this.onChangeFn(html);
      this.contentChange.emit(html);
    });

    this.quill.on('selection-change', () => this.refreshChrome());
    this.quill.root.addEventListener('blur', () => this.onTouchedFn());

    if (this.pendingValue !== null) {
      this.setHtml(this.pendingValue);
      this.pendingValue = null;
    }

    this.refreshChrome();
    document.addEventListener('click', this.onDocClick);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.onDocClick);
    this.quill = null;
  }

  private onDocClick = (): void => this.openMenu.set(null);

  writeValue(value: string | null): void {
    const html = value ?? '';
    if (!this.quill) {
      this.pendingValue = html;
      return;
    }
    this.setHtml(html);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
    this.quill?.enable(!(isDisabled || this.readonly()));
  }

  locked(): boolean {
    return this.disabled() || this.readonly();
  }

  isActive(format: string, value: unknown = true): boolean {
    const current = this.formats()[format];
    if (value === true) return Boolean(current);
    return current === value;
  }

  toggleMenu(menu: ToolbarMenu, event: Event): void {
    event.stopPropagation();
    if (this.locked()) return;
    this.openMenu.update((cur) => (cur === menu ? null : menu));
    if (menu === 'table') this.tableHover.set({ rows: 0, cols: 0 });
  }

  previewTableSize(rows: number, cols: number, event: Event): void {
    event.stopPropagation();
    this.tableHover.set({ rows, cols });
  }

  tableSizeLabel(): string {
    const { rows, cols } = this.tableHover();
    return tableSizeLabel(rows, cols);
  }

  format(name: string, value: unknown = true, event?: Event): void {
    event?.stopPropagation();
    if (!this.quill || this.locked()) return;
    this.quill.focus();

    const current = this.quill.getFormat();
    if (value === true) {
      this.quill.format(name, !current[name]);
    } else if (current[name] === value) {
      this.quill.format(name, false);
    } else {
      this.quill.format(name, value);
    }

    this.openMenu.set(null);
    this.refreshChrome();
    this.onTouchedFn();
  }

  setHeading(value: HeadingValue, event: Event): void {
    event.stopPropagation();
    if (!this.quill || this.locked()) return;
    this.quill.focus();
    this.quill.format('header', value);
    this.openMenu.set(null);
    this.refreshChrome();
  }

  setSize(size: string, event: Event): void {
    this.format('size', size, event);
  }

  setFont(font: EditorFontValue, event: Event): void {
    this.format('font', font, event);
  }

  fontPreviewCss(font: EditorFontValue): string {
    return fontPreviewCss(font);
  }

  setColor(format: 'color' | 'background', color: string, event: Event): void {
    this.format(format, color === 'transparent' ? false : color, event);
  }

  promptLink(event?: Event): void {
    event?.stopPropagation();
    if (!this.quill || this.locked()) return;
    const current = String(this.quill.getFormat()['link'] || 'https://');
    const url = window.prompt('Enter link URL', current)?.trim();
    if (url === undefined) return;
    this.quill.focus();
    this.quill.format('link', url || false);
    this.refreshChrome();
  }

  undo(event?: Event): void {
    event?.stopPropagation();
    (this.quill as QuillWithHistory | null)?.history?.undo();
    this.refreshChrome();
  }

  redo(event?: Event): void {
    event?.stopPropagation();
    (this.quill as QuillWithHistory | null)?.history?.redo();
    this.refreshChrome();
  }

  clean(event?: Event): void {
    event?.stopPropagation();
    if (!this.quill || this.locked()) return;
    this.quill.focus();
    const range = this.quill.getSelection();
    if (range) this.quill.removeFormat(range.index, range.length || 1);
    this.refreshChrome();
  }

  insertHr(event?: Event): void {
    event?.stopPropagation();
    if (!this.quill || this.locked()) return;
    const range = this.quill.getSelection(true);
    const index = range?.index ?? this.quill.getLength();
    this.quill.clipboard.dangerouslyPasteHTML(index, '<p><br></p><hr/><p><br></p>');
    this.quill.setSelection(index + 1, 0);
    this.refreshChrome();
  }

  insertTable(rows: number, cols: number, event?: Event): void {
    event?.stopPropagation();
    if (!this.quill || this.locked()) return;
    insertTableAtSelection(this.quill, rows, cols);
    this.openMenu.set(null);
    this.tableHover.set({ rows: 0, cols: 0 });
    this.refreshChrome();
    this.onTouchedFn();
  }

  tableAction(action: TableAction, event?: Event): void {
    event?.stopPropagation();
    if (!this.quill || this.locked() || !this.inTable()) return;
    runTableAction(this.quill, action);
    this.refreshChrome();
    this.onTouchedFn();
  }

  openImagePicker(event: Event): void {
    event.stopPropagation();
    if (this.locked()) return;
    this.fileInput?.nativeElement.click();
  }

  onImageSelected(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const file = inputEl.files?.[0];
    if (!file || !this.quill) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result || '');
      if (!src || !this.quill) return;
      const range = this.quill.getSelection(true);
      const index = range?.index ?? this.quill.getLength();
      this.quill.insertEmbed(index, 'image', src, 'user');
      this.quill.setSelection(index + 1, 0);
      this.refreshChrome();
    };
    reader.readAsDataURL(file);
    inputEl.value = '';
  }

  insertImageUrl(event: Event): void {
    event.stopPropagation();
    if (!this.quill || this.locked()) return;
    const url = window.prompt('Image URL', 'https://')?.trim();
    if (!url) return;
    const range = this.quill.getSelection(true);
    const index = range?.index ?? this.quill.getLength();
    this.quill.insertEmbed(index, 'image', url, 'user');
    this.quill.setSelection(index + 1, 0);
    this.refreshChrome();
  }

  print(event?: Event): void {
    event?.stopPropagation();
    if (!this.quill) return;
    printHtml(this.quill.root.innerHTML);
  }

  private setHtml(html: string): void {
    if (!this.quill) return;
    this.writingValue = true;
    writeQuillHtml(this.quill, html);
    this.writingValue = false;
    this.refreshChrome();
  }

  private refreshChrome(): void {
    if (!this.quill) return;

    try {
      const selection = this.quill.getSelection();
      this.formats.set(selection ? this.quill.getFormat(selection) : {});
    } catch {
      this.formats.set({});
    }

    this.inTable.set(isSelectionInTable(this.quill));

    const stats = readEditorStats(this.quill);
    this.characters.set(stats.characters);
    this.words.set(stats.words);
    this.canUndo.set(stats.canUndo);
    this.canRedo.set(stats.canRedo);
  }
}
