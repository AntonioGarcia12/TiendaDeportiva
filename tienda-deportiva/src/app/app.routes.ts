import { Routes } from '@angular/router';
import { UserGuard } from './core/guards/user.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'login',
    title: 'Login',
    loadComponent: () => import('./pages/login/login.component')
  },
  {
    path: 'register',
    title: 'Register',
    loadComponent: () => import('./pages/register/register.component')
  },
  {
    path: 'search',
    title: 'Search',
    loadComponent: () => import('./pages/search/search.component')
  },
  {
    path: 'home',
    canActivate: [UserGuard],
    title: 'Home',
    loadComponent: () => import('./pages/home/home.component')
  },
  {
    path: 'admin',
    canActivate: [AdminGuard],
    title: 'Panel of Admin',
    loadComponent: () => import('./pages/dashboard/admin.component')
  },
  {
    path: 'admin/create',
    canActivate: [AdminGuard],
    title: 'Create',
    loadComponent: () => import('./pages/CRUD/admin-create.component')
  },
  {
    path: 'admin/edit/:id',
    canActivate: [AdminGuard],
    title: 'Edit',
    loadComponent: () => import('./pages/CRUD/admi-editar.component')
  },
  {
    path: 'viewCatalog',
    canActivate: [UserGuard],
    title: 'Catálago',
    loadComponent: () => import('./pages/products/view-catalago.component')
  },
  {
    path: 'view-product/:id',
    canActivate: [UserGuard],
    title: 'Producto',
    loadComponent: () => import('./pages/products/view-product.component')
  },
  {
    path: 'cart',
    canActivate: [UserGuard],
    title: 'Carrito',
    loadComponent: () => import('./pages/cart/cart.component')
  },
  {
    path: 'checkout',
    canActivate: [UserGuard],
    title: 'Pago',
    loadComponent: () => import('./pages/checkout/checkout.component')
  },
  {
    path: 'purchase',
    canActivate: [UserGuard],
    title: 'Historial',
    loadComponent: () => import('./pages/purchase/purchase-history.component')
  },
  {
    path: '**',
    title: 'Error 404',
    loadComponent: () => import('./errors/error404.component')
  }
];
