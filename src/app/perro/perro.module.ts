import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PerroPageRoutingModule } from './perro-routing.module';

import { PerroPage } from './perro.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PerroPageRoutingModule
  ],
  declarations: [PerroPage]
})
export class PerroPageModule {}
