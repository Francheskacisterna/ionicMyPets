import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'welcome',
    loadChildren: () => import('./welcome/welcome.module').then(m => m.WelcomePageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'registro',
    loadChildren: () => import('./registro/registro.module').then( m => m.RegistroPageModule)
  },
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full'
  },
  {
    path: 'gato',
    loadChildren: () => import('./gato/gato.module').then( m => m.GatoPageModule)
  },
  {
    path: 'perro',
    loadChildren: () => import('./perro/perro.module').then( m => m.PerroPageModule)
  },
  {
    path: 'ave',
    loadChildren: () => import('./ave/ave.module').then(m => m.AvePageModule)
  },
  {
    path: 'productos/product-add',
    loadChildren: () => import('./productos/product-add/product-add.module').then( m => m.ProductAddPageModule)
  },
  {
    path: 'productos/product-list',
    loadChildren: () => import('./productos/product-list/product-list.module').then( m => m.ProductListPageModule)
  },
  {
    path: 'productos/product-detail/:id',
    loadChildren: () => import('./productos/product-detail/product-detail.module').then( m => m.ProductDetailPageModule)
  },
  {
    path: 'productos/product-edit/:id',
    loadChildren: () => import('./productos/product-edit/product-edit.module').then(m => m.ProductEditPageModule)
  },
  {
    path: 'user-add',
    loadChildren: () => import('./user-add/user-add.module').then( m => m.UserAddPageModule)
  },
  {
    path: 'user-list',
    loadChildren: () => import('./user-list/user-list.module').then( m => m.UserListPageModule)
  }
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
