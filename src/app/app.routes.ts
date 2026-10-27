import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./editor-demo.page').then((m) => m.EditorDemoPage),
  },
  {
    path: 'tasks',
    loadComponent: () => import('./demo/tasks-demo.page').then((m) => m.TasksDemoPage),
  },
  { path: '**', redirectTo: '' },
];
