import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AutenticacionService } from '../autenticacion.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AutenticacionService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRoles = route.data['expectedRole'];
    const userRole = this.authService.getUserRole(); // Obtener el rol del usuario actual
    // Permitir el acceso a páginas por defecto
    const defaultPages = ['gato', 'perro', 'ave'];
    if (defaultPages.includes(route.routeConfig?.path || '')) {
      return true;
    }

    // Verificar si el rol del usuario coincide con cualquiera de los roles permitidos
    if (expectedRoles && Array.isArray(expectedRoles) && !expectedRoles.includes(userRole)) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }
}
