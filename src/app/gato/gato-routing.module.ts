import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GatoPage } from './gato.page';

const routes: Routes = [
  {
    path: '',
    component: GatoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GatoPageRoutingModule {}
