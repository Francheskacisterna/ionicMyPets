import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CapacitorSQLite, SQLiteDBConnection, SQLiteConnection } from '@capacitor-community/sqlite';
import { Storage } from '@ionic/storage-angular';
import { Network } from '@capacitor/network';

export interface Usuario {
  id?: string;  // Aseguramos que el ID sea numérico para SQLite y API
  nombre: string;
  contrasena: string;
  rol: string;
  synced?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://10.0.2.2:3000/usuarios';
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  private sqliteConnection: SQLiteConnection | null = null;
  private db: SQLiteDBConnection | null = null;
  private useSQLite: boolean = false;

  constructor(private http: HttpClient, private storage: Storage) {
    this.initDB();
    this.monitorNetwork();
  }

  async closeDBConnection() {
    if (this.db) {
      console.log('Cerrando la conexión a la base de datos...');
      await this.db.close();
      this.db = null;
    }
  }

  async initDB() {
    await this.storage.create();

    try {
      if (CapacitorSQLite) {
        console.log('Iniciando la conexión con SQLite...');
        await this.closeDBConnection();

        if (!this.sqliteConnection) {
          this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
        }

        if (!this.db) {
          this.db = await this.sqliteConnection.createConnection('usuarios.db', false, 'no-encryption', 1, false);
          await this.db.open();
          console.log('SQLite abierto. Creando tablas...');

          // No eliminar la tabla cada vez que se carga el programa
          await this.db.execute(`
CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  contrasena TEXT NOT NULL,
  rol TEXT NOT NULL,
  synced INTEGER DEFAULT 0
);

          `);

          console.log('SQLite está disponible y las tablas fueron creadas.');
        }

        this.useSQLite = true;
        await this.syncUsuariosWithAPI();

      } else {
        this.useSQLite = false;
        console.warn('SQLite no está disponible. Usando LocalStorage como fallback.');
      }
    } catch (err) {
      this.useSQLite = false;
      console.error('Error al inicializar SQLite. Usando LocalStorage como fallback:', err);
    }
  }

  async monitorNetwork() {
    const status = await Network.getStatus();
    if (status.connected) {
      console.log('Conexión inicial detectada, intentando sincronizar usuarios...');
      await this.syncUsuariosWithAPI();
    }

    Network.addListener('networkStatusChange', async (status) => {
      if (status.connected) {
        console.log('Conexión restablecida, intentando sincronizar usuarios...');
        await this.syncUsuariosWithAPI();
      } else {
        console.log('Sin conexión a la red.');
      }
    });
  }

  private async ensureDBIsOpen(): Promise<boolean> {
    if (!this.db) return false;
    const isDBOpen = await this.db.isDBOpen();
    if (!isDBOpen.result) {
      await this.db.open();
    }
    return true;
  }

  // CRUD SQLite

  generateUUID(): string {
    return 'xxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }


// Añadir usuario a SQLite
async addUsuarioSQLite(usuario: Usuario): Promise<void> {
  try {
    if (!await this.ensureDBIsOpen()) return;

    // Verificar si el ID es un string antes de insertar en SQLite
    if (usuario.id) {
      usuario.id = usuario.id.toString();  // Convertir a string si es necesario
    } else {
      usuario.id = this.generateUUID();  // Generar un UUID si no hay ID
    }

    const query = `INSERT INTO usuarios (id, nombre, contrasena, rol, synced) VALUES (?, ?, ?, ?, 0)`;
    const values = [usuario.id, usuario.nombre, usuario.contrasena, usuario.rol];

    const result = await this.db!.run(query, values);
    if (result.changes && result.changes.lastId) {
      console.log('Usuario añadido en SQLite con ID:', usuario.id);
    } else {
      console.error('Error al insertar el usuario en SQLite.');
    }
  } catch (err) {
    console.error('Error al añadir usuario a SQLite:', err);
  }
}


  // Obtener todos los usuarios desde SQLite
  async getUsuariosSQLite(): Promise<Usuario[]> {
    try {
      if (!await this.ensureDBIsOpen()) return [];
  
      const res = await this.db!.query("SELECT * FROM usuarios");
  
      // Verificar si res.values está definido antes de mapear
      const usuarios = res.values ? res.values.map(usuario => ({
        ...usuario,
        id: usuario.id.toString()
      })) : [];
  
      return usuarios as Usuario[];
    } catch (err) {
      console.error('Error al obtener usuarios de SQLite:', err);
      return [];
    }
  }
  
  // Método para agregar un usuario con verificación de conexión
  async addUsuario(usuario: Usuario): Promise<void> {
    try {
      // Asegurarse de que el ID es string
      if (!usuario.id) {
        usuario.id = this.generateUUID();  // Generar un ID si no está presente
      } else {
        usuario.id = usuario.id.toString();  // Asegurarse de que el ID existente sea string
      }

      const status = await Network.getStatus();
      if (status.connected) {
        const addedUsuario = await firstValueFrom(this.addUsuarioAPI(usuario));
        if (addedUsuario && addedUsuario.id) {
          console.log('Usuario añadido a la API:', JSON.stringify(addedUsuario));
        } else {
          throw new Error('No se pudo añadir el usuario a la API.');
        }
      } else {
        throw new Error('Sin conexión a la red');
      }
    } catch (error) {
      console.error('Error al añadir usuario:', error);
      if (this.useSQLite) {
        await this.addUsuarioSQLite(usuario);  // Guardar en SQLite en caso de falta de conexión
      }
    }
  }


  // Actualizar usuario en SQLite
  async updateUsuarioSQLite(usuario: Usuario): Promise<void> {
    try {
      if (!await this.ensureDBIsOpen()) return;

      const query = `UPDATE usuarios SET nombre = ?, contrasena = ?, rol = ? WHERE id = ?`;
      const values = [usuario.nombre, usuario.contrasena, usuario.rol, usuario.id!.toString()];
      await this.db!.run(query, values);
      console.log(`Usuario con ID ${usuario.id} actualizado en SQLite.`);
    } catch (err) {
      console.error('Error al actualizar usuario en SQLite:', err);
    }
  }

  // Eliminar usuario de SQLite con id como string
  async deleteUsuarioSQLite(usuarioId: string): Promise<void> {
    try {
      if (!await this.ensureDBIsOpen()) return;
      await this.db!.run(`DELETE FROM usuarios WHERE id = ?`, [usuarioId.toString()]);
      console.log(`Usuario con ID ${usuarioId} eliminado de SQLite.`);
    } catch (err) {
      console.error('Error al eliminar usuario de SQLite:', err);
    }
  }
  // Obtener usuarios no sincronizados desde SQLite
  async getUsuariosSQLiteNotSynced(): Promise<Usuario[]> {
    try {
      if (!await this.ensureDBIsOpen()) return [];
  
      const res = await this.db!.query("SELECT * FROM usuarios WHERE synced = 0");
  
      // Verificar si res.values está definido antes de mapear
      const usuarios = res.values ? res.values.map(usuario => ({
        ...usuario,
        id: usuario.id.toString()
      })) : [];
  
      return usuarios as Usuario[];
    } catch (err) {
      console.error('Error al obtener usuarios no sincronizados de SQLite:', err);
      return [];
    }
  }
  


  // Marcar usuario como sincronizado en SQLite
  async markUsuarioAsSyncedSQLite(usuarioId: string): Promise<void> {
    try {
      if (!await this.ensureDBIsOpen()) return;
      await this.db!.run(`UPDATE usuarios SET synced = 1 WHERE id = ?`, [usuarioId.toString()]);
      console.log(`Usuario con ID ${usuarioId} marcado como sincronizado en SQLite.`);
    } catch (err) {
      console.error('Error al marcar usuario como sincronizado:', err);
    }
  }


  // Funciones API

  // Obtener todos los usuarios desde la API
  getUsuariosAPI(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl, this.httpOptions)
      .pipe(
        tap(usuarios => console.log('Usuarios obtenidos de la API:', usuarios)),
        catchError(this.handleError<Usuario[]>('getUsuariosAPI', []))
      );
  }

  // Añadir un usuario a la API
  addUsuarioAPI(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario, this.httpOptions)
      .pipe(
        tap(newUsuario => console.log('Usuario añadido con éxito en la API:', newUsuario)),
        catchError((error) => {
          console.error('Error al intentar añadir usuario a la API:', error);
          return of({} as Usuario);
        })
      );
  }

  // Actualizar usuario en la API
  updateUsuarioAPI(usuario: Usuario): Observable<any> {
    return this.http.put(`${this.apiUrl}/${usuario.id}`, usuario, this.httpOptions)
      .pipe(
        tap(() => console.log(`Usuario con ID ${usuario.id} actualizado en la API`)),
        catchError(this.handleError<any>('updateUsuarioAPI'))
      );
  }

  // Eliminar usuario en la API
  deleteUsuarioAPI(usuarioId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${usuarioId}`, this.httpOptions)
      .pipe(
        tap(() => console.log(`Usuario con ID ${usuarioId} eliminado de la API`)),
        catchError((error) => {
          console.error(`Error al eliminar el usuario con ID ${usuarioId} de la API:`, error);
          return of(null);
        })
      );
  }

  // Sincronizar usuarios con la API
  async syncUsuariosWithAPI() {
    try {
      const usuarios = await this.getUsuariosSQLiteNotSynced();
      if (usuarios.length === 0) {
        console.log('No hay usuarios para sincronizar.');
        return;
      }

      for (const usuario of usuarios) {
        const addedUsuario = await firstValueFrom(this.addUsuarioAPI(usuario));

        if (addedUsuario && addedUsuario.id) {
          await this.markUsuarioAsSyncedSQLite(usuario.id!);
          await this.deleteUsuarioSQLite(usuario.id!);
        } else {
          console.error(`Error al sincronizar el usuario "${usuario.nombre}".`);
        }
      }
    } catch (error) {
      console.error('Error al sincronizar usuarios:', error);
    }
  }

  // Obtener un usuario específico desde la API por ID
  getUsuarioByIdAPI(usuarioId: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${usuarioId}`, this.httpOptions)
      .pipe(
        tap(usuario => console.log(`Usuario con ID ${usuarioId} obtenido de la API:`, usuario)),
        catchError((error) => {
          console.error(`Error al obtener el usuario con ID ${usuarioId} desde la API:`, error.message || error);
          return of({} as Usuario);
        })
      );
  }

  // Manejo de errores genérico
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} falló:`, error);
      return of(result as T);
    };
  }
}