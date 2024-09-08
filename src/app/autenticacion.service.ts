import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AutenticacionService {
  // BehaviorSubject para mantener y emitir el estado de autenticación
  private _isAuthenticated = new BehaviorSubject<boolean>(this.checkStoredToken());

  constructor() {}

  // Método para iniciar sesión y actualizar el estado de autenticación
  login() {
    localStorage.setItem('userToken', 'your-token-here'); // Guarda token en localStorage
    this._isAuthenticated.next(true); // Actualiza el estado de autenticación a verdadero
  }

  // Método para cerrar sesión y actualizar el estado de autenticación
  logout() {
    localStorage.removeItem('userToken'); // Elimina token de localStorage
    this._isAuthenticated.next(false); // Actualiza el estado de autenticación a falso
  }

  // Método para obtener el estado de autenticación como un observable
  isAuthenticated() {
    return this._isAuthenticated.asObservable();
  }

  // Método privado para verificar si el token está almacenado en localStorage
  private checkStoredToken(): boolean {
    return !!localStorage.getItem('userToken');
  }
}
