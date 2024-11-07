import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserAllPage } from './user-all.page';

const routes: Routes = [
  {
    path: '',
    component: UserAllPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserAllPageRoutingModule {}
