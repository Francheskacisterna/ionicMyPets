import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AvePage } from './ave.page';

const routes: Routes = [
  {
    path: '',
    component: AvePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AvePageRoutingModule {}
