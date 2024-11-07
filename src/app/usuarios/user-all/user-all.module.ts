import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserAllPageRoutingModule } from './user-all-routing.module';

import { UserAllPage } from './user-all.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UserAllPageRoutingModule
  ],
  declarations: [UserAllPage]
})
export class UserAllPageModule {}
