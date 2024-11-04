import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CarritoListPage } from './carrito-list.page';

const routes: Routes = [
  {
    path: '',
    component: CarritoListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CarritoListPageRoutingModule {}
