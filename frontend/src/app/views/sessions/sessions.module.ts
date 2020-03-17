import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { SharedMaterialModule } from 'app/shared/shared-material.module'

import { FlexLayoutModule } from '@angular/flex-layout'

// import { CommonDirectivesModule } from './sdirectives/common/common-directives.module';
import { SessionsRoutes } from './sessions.routing'
import { NotFoundComponent } from './not-found/not-found.component'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedMaterialModule,
    FlexLayoutModule,
    PerfectScrollbarModule,
    RouterModule.forChild(SessionsRoutes),
  ],
  declarations: [NotFoundComponent],
})
export class SessionsModule {}
