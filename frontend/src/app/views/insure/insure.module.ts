import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { InsureComponent } from './insure.component'
import { Routes, RouterModule } from '@angular/router'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { SharedMaterialModule } from 'app/shared/shared-material.module'
import { FlexLayoutModule } from '@angular/flex-layout'
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar'
import { NgxDatatableModule } from '@swimlane/ngx-datatable'

const InsureRoutes: Routes = [
  {
    path: '',
    component: InsureComponent,
  },
]

@NgModule({
  declarations: [InsureComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedMaterialModule,
    FlexLayoutModule,
    PerfectScrollbarModule,
    NgxDatatableModule,
    RouterModule.forChild(InsureRoutes),
  ],
})
export class InsureModule {}
