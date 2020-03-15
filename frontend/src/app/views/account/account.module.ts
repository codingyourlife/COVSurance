import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AccountComponent } from './account.component'
import { Routes, RouterModule } from '@angular/router'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { SharedMaterialModule } from 'app/shared/shared-material.module'
import { FlexLayoutModule } from '@angular/flex-layout'
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar'
import { NgxDatatableModule } from '@swimlane/ngx-datatable'

const AccountRoutes: Routes = [
  {
    path: '',
    component: AccountComponent,
  },
]

@NgModule({
  declarations: [AccountComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedMaterialModule,
    FlexLayoutModule,
    PerfectScrollbarModule,
    NgxDatatableModule,
    RouterModule.forChild(AccountRoutes),
  ],
})
export class AccountModule {}
