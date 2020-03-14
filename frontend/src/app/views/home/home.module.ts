import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Routes, RouterModule } from '@angular/router'
import { HomeComponent } from './home.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { SharedMaterialModule } from 'app/shared/shared-material.module'
import { FlexLayoutModule } from '@angular/flex-layout'
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar'

const SessionsRoutes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
]

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
  declarations: [HomeComponent],
})
export class HomeModule {}
