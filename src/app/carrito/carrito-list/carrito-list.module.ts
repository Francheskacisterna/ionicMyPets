import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CarritoListPageRoutingModule } from './carrito-list-routing.module';

import { CarritoListPage } from './carrito-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CarritoListPageRoutingModule
  ],
  declarations: [CarritoListPage]
})
export class CarritoListPageModule {}
