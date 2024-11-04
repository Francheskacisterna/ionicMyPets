import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ErrorTestPage } from './error-test.page';

const routes: Routes = [
  {
    path: '',
    component: ErrorTestPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ErrorTestPageRoutingModule {}
