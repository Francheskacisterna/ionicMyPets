import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CarritoDetailPage } from './carrito-detail.page';

const routes: Routes = [
  {
    path: '',
    component: CarritoDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CarritoDetailPageRoutingModule {}
