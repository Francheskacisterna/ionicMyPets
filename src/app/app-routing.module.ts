import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { RoleGuard } from './guards/role.guard';
import { Error405Component } from './error405/error405.component';

const routes: Routes = [
  // Rutas principales
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
    loadChildren: () => import('./registro/registro.module').then(m => m.RegistroPageModule)
  },

  // Rutas de categorías (acceso para usuario)
  {
    path: 'gato',
    loadChildren: () => import('./gato/gato.module').then(m => m.GatoPageModule),
    canActivate: [RoleGuard],
    data: { expectedRole: 'usuario' }
  },
  {
    path: 'perro',
    loadChildren: () => import('./perro/perro.module').then(m => m.PerroPageModule),
    canActivate: [RoleGuard],
    data: { expectedRole: 'usuario' }
  },
  {
    path: 'ave',
    loadChildren: () => import('./ave/ave.module').then(m => m.AvePageModule),
    canActivate: [RoleGuard],
    data: { expectedRole: 'usuario' }
  },

  // Rutas de productos (acceso para administrador y empleado)
  {
    path: 'productos/product-add',
    loadChildren: () => import('./productos/product-add/product-add.module').then(m => m.ProductAddPageModule),
    canActivate: [RoleGuard],
    data: { expectedRole: ['administrador', 'empleado'] }
  },
  {
    path: 'productos/product-list',
    loadChildren: () => import('./productos/product-list/product-list.module').then(m => m.ProductListPageModule),
    canActivate: [RoleGuard],
    data: { expectedRole: ['administrador', 'empleado'] }
  },
  {
    path: 'productos/product-detail',
    loadChildren: () => import('./productos/product-detail/product-detail.module').then(m => m.ProductDetailPageModule),
    canActivate: [RoleGuard],
    data: { expectedRole: ['administrador', 'empleado'] }
  },
  {
    path: 'productos/product-edit',
    loadChildren: () => import('./productos/product-edit/product-edit.module').then(m => m.ProductEditPageModule),
    canActivate: [RoleGuard],
    data: { expectedRole: ['administrador', 'empleado'] }
  },
  {
    path: 'productos/product-all',
    loadChildren: () => import('./productos/product-all/product-all.module').then(m => m.ProductAllPageModule),
    canActivate: [RoleGuard],
    data: { expectedRole: ['administrador', 'empleado'] }
  },

  // Rutas de usuarios (solo para administrador)
  {
    path: 'usuarios/user-add',
    loadChildren: () => import('./usuarios/user-add/user-add.module').then(m => m.UserAddPageModule),
    canActivate: [RoleGuard],
    data: { expectedRole: 'administrador' }
  },
  {
    path: 'usuarios/user-list',
    loadChildren: () => import('./usuarios/user-list/user-list.module').then(m => m.UserListPageModule),
    canActivate: [RoleGuard],
    data: { expectedRole: 'administrador' }
  },
  {
    path: 'usuarios/user-detail',
    loadChildren: () => import('./usuarios/user-detail/user-detail.module').then(m => m.UserDetailPageModule),
    canActivate: [RoleGuard],
    data: { expectedRole: 'administrador' }
  },
  {
    path: 'usuarios/user-edit',
    loadChildren: () => import('./usuarios/user-edit/user-edit.module').then(m => m.UserEditPageModule),
    canActivate: [RoleGuard],
    data: { expectedRole: 'administrador' }
  },
  {
    path: 'usuarios/user-all',
    loadChildren: () => import('./usuarios/user-all/user-all.module').then(m => m.UserAllPageModule),
    canActivate: [RoleGuard],
    data: { expectedRole: 'administrador' }
  },

  // Rutas de carrito
  {
    path: 'carrito/carrito-detail',
    loadChildren: () => import('./carrito/carrito-detail/carrito-detail.module').then(m => m.CarritoDetailPageModule)
  },
  {
    path: 'carrito/carrito-list',
    loadChildren: () => import('./carrito/carrito-list/carrito-list.module').then(m => m.CarritoListPageModule)
  },

  // Rutas de errores y redirección
  {
    path: 'error-405',
    component: Error405Component
  },
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/error-405'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
