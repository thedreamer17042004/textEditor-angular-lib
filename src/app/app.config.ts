import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { provideTaskDetailDialog, provideTaskWorkspace } from 'task-workspace';
import { routes } from './app.routes';
import { MockTaskFacade } from './demo/mock-task-facade';
import { StubTaskDetailDialogComponent } from './demo/stub-task-detail-dialog.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.tw-never-dark',
          cssLayer: false,
        },
      },
      ripple: true,
    }),
    MockTaskFacade,
    provideTaskWorkspace({ useExisting: MockTaskFacade }),
    provideTaskDetailDialog(StubTaskDetailDialogComponent),
  ],
};
