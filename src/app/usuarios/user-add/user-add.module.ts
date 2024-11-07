import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';  // Importar ReactiveFormsModule
import { IonicModule } from '@ionic/angular';

import { UserAddPageRoutingModule } from './user-add-routing.module';

import { UserAddPage } from './user-add.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,  // Asegurarse de importar ReactiveFormsModule
    IonicModule,
    UserAddPageRoutingModule
  ],
  declarations: [UserAddPage]
})
export class UserAddPageModule {}
