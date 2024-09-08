import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GatoPageRoutingModule } from './gato-routing.module';

import { GatoPage } from './gato.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GatoPageRoutingModule
  ],
  declarations: [GatoPage]
})
export class GatoPageModule {}
