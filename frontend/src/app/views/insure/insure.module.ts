import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { InsureComponent } from './insure.component'
import { Routes, RouterModule } from '@angular/router'
import { InvestComponent } from '../invest/invest.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { SharedMaterialModule } from 'app/shared/shared-material.module'
import { FlexLayoutModule } from '@angular/flex-layout'
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar'

const InsureRoutes: Routes = [
  {
    path: '',
    component: InsureComponent,
  },
]

@NgModule({
  declarations: [InvestComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedMaterialModule,
    FlexLayoutModule,
    PerfectScrollbarModule,
    RouterModule.forChild(InsureRoutes),
  ],
})
export class InsureModule {}
