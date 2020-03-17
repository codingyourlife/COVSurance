import { Routes } from '@angular/router'

import { NotFoundComponent } from './not-found/not-found.component'

export const SessionsRoutes: Routes = [
  {
    path: '',
    component: NotFoundComponent,
    data: { title: 'Not Found' },
  },
]
