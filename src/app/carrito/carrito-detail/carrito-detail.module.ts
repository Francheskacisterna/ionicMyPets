import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CarritoDetailPageRoutingModule } from './carrito-detail-routing.module';

import { CarritoDetailPage } from './carrito-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CarritoDetailPageRoutingModule
  ],
  declarations: [CarritoDetailPage]
})
export class CarritoDetailPageModule {}
