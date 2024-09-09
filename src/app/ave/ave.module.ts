import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AvePageRoutingModule } from './ave-routing.module';

import { AvePage } from './ave.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AvePageRoutingModule
  ],
  declarations: [AvePage]
})
export class AvePageModule {}
