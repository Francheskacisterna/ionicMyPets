import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ErrorTestPageRoutingModule } from './error-test-routing.module';

import { ErrorTestPage } from './error-test.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ErrorTestPageRoutingModule
  ],
  declarations: [ErrorTestPage]
})
export class ErrorTestPageModule {}
