import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, firstValueFrom} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { UserService, Usuario } from './usuarios/user.service'; 


export interface User {
  id?: string;
  nombre: string;
  rol: string;
  correo: string;
}

@Injectable({
  providedIn: 'root',
})
export class AutenticacionService {
  private _isAuthenticated = new BehaviorSubject<boolean>(this.checkStoredToken());
  private apiUrl = 'http://10.0.2.2:3000/usuarios'; // URL de la API

  constructor(private http: HttpClient, private userService: UserService) {}

  async login(email: string, password: string): Promise<boolean> {
    try {
      // Primero intenta autenticar desde SQLite
      const userSQLite = await this.userService.getUserByCredentials(email, password);
      if (userSQLite) {
        // Si el usuario está en SQLite, establece el token y el rol en localStorage
        this.setAuthSession(userSQLite);
        this._isAuthenticated.next(true);
        return true;
      }

      // Si el usuario no se encuentra en SQLite, intenta autenticar desde la API
      return await this.authenticateFromAPI(email, password);
    } catch (error) {
      console.error('Error en el proceso de autenticación:', error);
      return false;
    }
  }

  private async authenticateFromAPI(email: string, password: string): Promise<boolean> {
    try {
      const users = await firstValueFrom(
        this.http.get<User[]>(`${this.apiUrl}?correo=${email}&contrasena=${password}`).pipe(
          catchError((error) => {
            console.error('Error al autenticar con la API:', error);
            return of([]); // Retorna un array vacío en caso de error
          })
        )
      );
  
      if (users.length > 0) {
        const user = users[0];
        this.setAuthSession(user); // Guarda el token y el rol en localStorage
        this._isAuthenticated.next(true);
        return true;
      } else {
        this._isAuthenticated.next(false);
        return false;
      }
    } catch (error) {
      console.error('Error inesperado en authenticateFromAPI:', error);
      this._isAuthenticated.next(false);
      return false;
    }
  }
  
  
  private setAuthSession(user: User): void {
    localStorage.setItem('userToken', 'your-token-here'); // Guarda un token simulado en localStorage
    localStorage.setItem('userRole', user.rol); // Guarda el rol del usuario
    localStorage.setItem('userName', user.nombre); // Guarda el nombre del usuario
  }

  // Método para obtener el rol del usuario
  getUserRole(): string | null {
    return localStorage.getItem('userRole'); // Obtiene el rol almacenado
  }

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): Observable<boolean> {
    return this._isAuthenticated.asObservable();
  }

  recoverPassword(email: string): Observable<boolean> {
    // Endpoint de la API que contiene la lista de usuarios, cambiar si es necesario
    const url = `${this.apiUrl}`; 
  
    // Simulación de búsqueda en la API
    return new Observable<boolean>((observer) => {
      this.http.get<Usuario[]>(url).pipe(
        map((usuarios) => {
          // Verificar si el correo existe en la lista de usuarios
          const usuarioEncontrado = usuarios.some(user => user.correo === email);
  
          if (usuarioEncontrado) {
            observer.next(true); // Usuario encontrado: Simulación de "correo enviado"
          } else {
            observer.next(false); // Usuario no encontrado: Simulación de "correo no registrado"
          }
          observer.complete();
        }),
        catchError(async (error) => {
          console.error('Error al intentar acceder a la API:', error);
  
          // Simulación: Si la API falla, intenta buscar en SQLite
          try {
            const userSQLite = await this.userService.getUserByEmailSQLite(email);
            if (userSQLite) {
              observer.next(true); // Usuario encontrado en SQLite, simular "correo enviado"
            } else {
              observer.next(false); // Usuario no encontrado en SQLite, simular "correo no registrado"
            }
          } catch (sqliteError) {
            console.error('Error al buscar en SQLite:', sqliteError);
            observer.next(false);
          }
  
          observer.complete();
          return of(false);
        })
      ).subscribe();
    });
  }
  


  logout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    this._isAuthenticated.next(false);
  }

  private checkStoredToken(): boolean {
    return !!localStorage.getItem('userToken');
  }
}