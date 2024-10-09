import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CapacitorSQLite, SQLiteDBConnection, SQLiteConnection } from '@capacitor-community/sqlite'; // Mantén esta importación
import { Storage } from '@ionic/storage-angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core'; // Usaremos Capacitor para obtener la plataforma

export interface Product {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen?: string;
}

export interface WeightOption {
  id?: number;
  producto_id?: number;
  size: string;
  price: number;
  stock: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://10.0.2.2:3000/productos';  // URL de la API
  private weightOptionsUrl = 'http://10.0.2.2:3000/pesos';  // URL para opciones de peso
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  private sqliteConnection: SQLiteConnection | null = null;
  private db: SQLiteDBConnection | null = null;
  private useSQLite: boolean = false;  // Determina si SQLite está disponible

  constructor(private http: HttpClient, private storage: Storage) {
    this.initDB();
  }

  // Inicializar SQLite y LocalStorage
  async initDB() {
    await this.storage.create();  // Inicializar el LocalStorage
  
    // Comprobar si estamos en una plataforma web
    if (Capacitor.getPlatform() === 'web') {
      const jeepSqlite = document.createElement('jeep-sqlite');
      document.body.appendChild(jeepSqlite);
  
      // Asegurarse de que el componente esté definido
      await customElements.whenDefined('jeep-sqlite');
  
      // Registrar el service worker para SQLite
      const isServiceWorkerAvailable = await (jeepSqlite as any).isServiceWorker();
      if (isServiceWorkerAvailable) {
        await (jeepSqlite as any).initWebStore(); // Iniciar el almacenamiento web para SQLite
        console.log('Almacenamiento SQLite web inicializado.');
      } else {
        console.warn('Service worker no disponible para SQLite en la web.');
      }
    }
  
    try {
      if (CapacitorSQLite) {
        this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
        this.db = await this.sqliteConnection.createConnection('data.db', false, 'no-encryption', 1, false);
        await this.db.open();
  
        // Crear las tablas si no existen
        await this.db.execute(`
          CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            descripcion TEXT NOT NULL,
            precio REAL NOT NULL,
            stock INTEGER NOT NULL,
            imagen TEXT
          );
        `);
  
        await this.db.execute(`
          CREATE TABLE IF NOT EXISTS pesos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            producto_id INTEGER NOT NULL,
            size TEXT NOT NULL,
            price REAL NOT NULL,
            stock INTEGER NOT NULL,
            FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
          );
        `);
  
        await this.db.close();
        this.useSQLite = true;  // Si SQLite se inicializó correctamente, usar SQLite
        console.log('SQLite está disponible y las tablas fueron creadas.');
      } else {
        this.useSQLite = false;
        console.warn('SQLite no está disponible. Usando LocalStorage como fallback.');
      }
    } catch (err) {
      this.useSQLite = false;
      console.warn('Error al inicializar SQLite. Usando LocalStorage como fallback.', err);
    }
  }

  // Método para capturar una foto o seleccionar una imagen de la galería
  async captureImage(): Promise<string | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl, // Para obtener la imagen como base64
        source: CameraSource.Prompt // Permite elegir entre cámara y galería
      });
  
      return image.dataUrl ?? null;  // Asegurarse de que siempre se retorne un valor de tipo string o null
    } catch (error) {
      console.error('Error al capturar la imagen:', error);
      return null;
    }
  }
  
    // Método para agregar productos junto con la imagen capturada
    async addProductWithImage(product: Product, weightOptions: WeightOption[], imageBase64: string | null): Promise<void> {
      if (imageBase64) {
        product.imagen = imageBase64;  // Asignar la imagen base64 al producto
      }
  
      await this.addProduct(product, weightOptions);  // Llamar al método de agregar producto existente
    }

  // Agregar productos a SQLite, LocalStorage o la API según la disponibilidad
  async addProduct(product: Product, weightOptions: WeightOption[]): Promise<void> {
    if (navigator.onLine) {  // Si hay conexión a la red, usar la API
      try {
        const addedProduct = await this.addProductAPI(product).toPromise();
        if (addedProduct && addedProduct.id) {
          for (const option of weightOptions) {
            option.producto_id = addedProduct.id;
            await this.addWeightOptionAPI(option).toPromise();
          }
        }
        console.log('Producto añadido a la API.');
      } catch (error) {
        console.error('Error al añadir producto a la API:', error);
        await this.addProductLocal(product, weightOptions);  // Si falla, usar LocalStorage o SQLite
      }
    } else if (this.useSQLite) {  // Usar SQLite si no hay conexión
      await this.addProductSQLite(product, weightOptions);
    } else {
      await this.addProductLocal(product, weightOptions);  // Usar LocalStorage si SQLite no está disponible
    }
  }

  // Agregar producto a LocalStorage
  async addProductLocal(product: Product, weightOptions: WeightOption[]): Promise<void> {
    const products = await this.storage.get('productos') || [];
    const weights = await this.storage.get('weights') || [];
    products.push(product);
    weights.push(...weightOptions);
    await this.storage.set('productos', products);
    await this.storage.set('weights', weights);
    console.log('Producto añadido en LocalStorage.');
  }

  // Agregar producto a SQLite
  async addProductSQLite(product: Product, weightOptions: WeightOption[]): Promise<void> {
    try {
      if (!this.db) return;
      await this.db.open();
      const query = `INSERT INTO productos (nombre, descripcion, precio, stock, imagen) VALUES (?, ?, ?, ?, ?)`;
      const values = [product.nombre, product.descripcion, product.precio, product.stock, product.imagen];
      const result = await this.db.run(query, values);

      if (!result.changes || !result.changes.lastId) {
        throw new Error('Error al insertar el producto en SQLite.');
      }

      const productId = result.changes.lastId;
      for (const option of weightOptions) {
        const weightQuery = `INSERT INTO pesos (producto_id, size, price, stock) VALUES (?, ?, ?, ?)`;
        await this.db.run(weightQuery, [productId, option.size, option.price, option.stock]);
      }

      await this.db.close();
      console.log('Producto añadido a SQLite.');
    } catch (err) {
      console.error('Error al agregar producto y pesos en SQLite:', err);
      if (this.db) {
        await this.db.close();  // Cerrar la base de datos en caso de error
      }
    }
  }

  // Métodos CRUD con la API
  getProductsAPI(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl, this.httpOptions)
      .pipe(
        tap(products => console.log('Productos obtenidos de la API:', products)),
        catchError(this.handleError<Product[]>('getProductsAPI', []))
      );
  }

  getProductAPI(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`, this.httpOptions)
      .pipe(
        tap(product => console.log('Producto obtenido de la API:', product)),
        catchError(this.handleError<Product>('getProductAPI'))
      );
  }

  addProductAPI(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product, this.httpOptions)
      .pipe(
        tap(newProduct => console.log('Producto añadido a la API:', newProduct)),
        catchError((error) => {
          console.error('Error al añadir producto:', error);
          return of({} as Product);
        })
      );
  }

  addWeightOptionAPI(weightOption: WeightOption): Observable<WeightOption> {
    return this.http.post<WeightOption>(this.weightOptionsUrl, weightOption, this.httpOptions)
      .pipe(
        tap(newWeightOption => console.log('Opción de peso añadida a la API:', newWeightOption)),
        catchError((error) => {
          console.error('Error al añadir opción de peso:', error);
          return of({} as WeightOption);
        })
      );
  }

  updateProductAPI(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product, this.httpOptions)
      .pipe(
        tap(_ => console.log(`Producto actualizado en la API id=${id}`)),
        catchError(this.handleError<any>('updateProductAPI'))
      );
  }

  deleteProductAPI(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.httpOptions)
      .pipe(
        tap(_ => console.log(`Producto eliminado en la API id=${id}`)),
        catchError(this.handleError<void>('deleteProductAPI'))
      );
  }

  // Sincronizar productos entre SQLite y la API cuando vuelva la conexión
  async syncProductsWithAPI() {
    try {
      const products = await this.getProductsSQLite(); // Obtener productos de SQLite
  
      for (const product of products) {
        try {
          const syncedProduct = await this.addProductAPI(product).toPromise();
  
          // Verificamos si syncedProduct no es undefined o null
          if (syncedProduct && syncedProduct.nombre) {
            console.log(`Producto sincronizado con la API: ${syncedProduct.nombre}`);
          } else {
            console.warn('Producto no pudo ser sincronizado o la API no devolvió el producto correctamente.');
          }
        } catch (error) {
          console.error('Error al sincronizar producto con la API:', error);
        }
      }
    } catch (err) {
      console.error('Error durante la sincronización con la API:', err);
    }
  }
  
  

  // Obtener productos desde SQLite
  async getProductsSQLite(): Promise<Product[]> {
    try {
      if (!this.db) return [];
      await this.db.open();
      const res = await this.db.query("SELECT * FROM productos");
      await this.db.close();
      return res.values as Product[];
    } catch (err) {
      console.error('Error al obtener productos de SQLite:', err);
      return [];
    }
  }

  // Manejo de errores
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} falló:`, error);
      return of(result as T);
    };
  }
}