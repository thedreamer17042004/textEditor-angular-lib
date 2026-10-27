import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { updatePrimaryPalette } from '@primeng/themes';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import {
  TaskBoardComponent,
  TaskDialogHostComponent,
  TaskSchedulerComponent,
  dateKey,
} from 'task-workspace';
import { MockTaskFacade } from './mock-task-facade';

type PrimaryHue = 'emerald' | 'violet' | 'blue' | 'orange';

function primaryPalette(hue: PrimaryHue) {
  return {
    50: `{${hue}.50}`,
    100: `{${hue}.100}`,
    200: `{${hue}.200}`,
    300: `{${hue}.300}`,
    400: `{${hue}.400}`,
    500: `{${hue}.500}`,
    600: `{${hue}.600}`,
    700: `{${hue}.700}`,
    800: `{${hue}.800}`,
    900: `{${hue}.900}`,
    950: `{${hue}.950}`,
  };
}

@Component({
  selector: 'app-tasks-demo-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    SelectModule,
    ButtonModule,
    TaskBoardComponent,
    TaskSchedulerComponent,
    TaskDialogHostComponent,
  ],
  template: `
    <div class="demo-shell">
      <header class="demo-header">
        <div>
          <a routerLink="/">← Editor demo</a>
          <h1>task-workspace demo</h1>
          <p>
            Host passes <code>spaceId</code>; change primary via
            <code>updatePrimaryPalette</code> — board follows without lib rebuild.
          </p>
        </div>
        <div class="demo-controls">
          <label>
            Space
            <p-select
              [options]="facade.spaces"
              optionLabel="name"
              optionValue="id"
              [ngModel]="spaceId()"
              (ngModelChange)="spaceId.set($event)"
              [style]="{ minWidth: '10rem' }"
            />
          </label>
          <label>
            Primary
            <p-select
              [options]="primaryOptions"
              optionLabel="label"
              optionValue="value"
              [ngModel]="primary()"
              (ngModelChange)="setPrimary($event)"
              [style]="{ minWidth: '9rem' }"
            />
          </label>
          <div class="demo-view-toggle">
            <button
              type="button"
              pButton
              [outlined]="view() !== 'board'"
              label="Board"
              (click)="view.set('board')"
            ></button>
            <button
              type="button"
              pButton
              [outlined]="view() !== 'scheduler'"
              label="Scheduler"
              (click)="view.set('scheduler')"
            ></button>
          </div>
        </div>
      </header>

      <main class="demo-main">
        @if (view() === 'board') {
          <tw-task-board
            [spaceId]="spaceId()"
            [spaceName]="spaceName()"
            [tasks]="tasks()"
            (taskOpen)="onOpen($event)"
          />
        } @else {
          <tw-task-scheduler
            [spaceId]="spaceId()"
            [tasks]="tasks()"
            (taskOpen)="onOpen($event)"
            (createAt)="onCreateAt($event)"
          />
        }
      </main>

      <tw-task-dialog-host />
    </div>
  `,
  styles: `
    .demo-shell {
      display: flex;
      flex-direction: column;
      height: 100vh;
      min-height: 0;
      background: var(--p-surface-50, #f8fafc);
      color: var(--p-text-color, #0f172a);
    }
    .demo-header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--p-content-border-color, #e2e8f0);
      background: var(--p-surface-0, #fff);
    }
    .demo-header h1 {
      margin: 0.35rem 0 0.15rem;
      font-size: 1.25rem;
    }
    .demo-header p {
      margin: 0;
      color: var(--p-text-muted-color, #64748b);
      font-size: 0.875rem;
    }
    .demo-header a {
      color: var(--p-primary-color, #0f766e);
      text-decoration: none;
      font-size: 0.8rem;
    }
    .demo-controls {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: 1rem;
    }
    .demo-controls label {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--p-text-muted-color, #64748b);
    }
    .demo-view-toggle {
      display: flex;
      gap: 0.35rem;
    }
    .demo-main {
      flex: 1 1 auto;
      min-height: 0;
      padding: 0.75rem;
    }
    code {
      font-size: 0.85em;
      background: var(--p-primary-50, #ecfeff);
      padding: 0.05rem 0.3rem;
      border-radius: 0.25rem;
    }
  `,
})
export class TasksDemoPage {
  readonly facade = inject(MockTaskFacade);
  readonly spaceId = signal('space-1');
  readonly view = signal<'board' | 'scheduler'>('board');
  readonly primary = signal<PrimaryHue>('emerald');

  readonly primaryOptions: { label: string; value: PrimaryHue }[] = [
    { label: 'Emerald', value: 'emerald' },
    { label: 'Violet', value: 'violet' },
    { label: 'Blue', value: 'blue' },
    { label: 'Orange', value: 'orange' },
  ];

  readonly spaceName = computed(
    () => this.facade.spaces.find((s) => s.id === this.spaceId())?.name ?? 'Board'
  );

  readonly tasks = computed(() => this.facade.tasks().filter((t) => t.spaceId === this.spaceId()));

  setPrimary(hue: PrimaryHue): void {
    this.primary.set(hue);
    updatePrimaryPalette(primaryPalette(hue));
  }

  onOpen(id: string): void {
    this.facade.openTask(id);
  }

  onCreateAt(date: Date): void {
    const iso = date.toISOString();
    const task = this.facade.createTask({
      spaceId: this.spaceId(),
      title: `Task on ${dateKey(date)}`,
      dueDate: iso,
      scheduleStart: iso,
      scheduleEnd: iso,
    });
    this.facade.openTask(task.id);
  }
}
