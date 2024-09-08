import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PerroPage } from './perro.page';

const routes: Routes = [
  {
    path: '',
    component: PerroPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerroPageRoutingModule {}
