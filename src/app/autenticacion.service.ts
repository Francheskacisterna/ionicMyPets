import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, firstValueFrom} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { UserService } from './usuarios/user.service'; 


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
    const url = `${this.apiUrl}`;
  
    // Intenta buscar en la API primero
    return new Observable<boolean>((observer) => {
      this.http.post(url, { email }).pipe(
        map(() => {
          observer.next(true); // Éxito en la API
          observer.complete();
        }),
        catchError(async (error) => {
          console.error('Error en recoverPassword (API):', error);
  
          // Si falla la API, intenta buscar en SQLite
          try {
            const userSQLite = await this.userService.getUserByEmailSQLite(email);
            if (userSQLite) {
              observer.next(true); // Usuario encontrado en SQLite
            } else {
              observer.next(false); // No encontrado en SQLite
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