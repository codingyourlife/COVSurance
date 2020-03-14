import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { InvestComponent } from './invest.component'
import { Routes, RouterModule } from '@angular/router'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { FlexLayoutModule } from '@angular/flex-layout'
import { SharedMaterialModule } from 'app/shared/shared-material.module'
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar'

const InvestRoutes: Routes = [
  {
    path: '',
    component: InvestComponent,
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
    RouterModule.forChild(InvestRoutes),
  ],
})
export class InvestModule {}
