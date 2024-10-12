import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CapacitorSQLite, SQLiteDBConnection, SQLiteConnection } from '@capacitor-community/sqlite';
import { Storage } from '@ionic/storage-angular';
import { Network } from '@capacitor/network';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';


export interface Product {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;  // Precio base
  stock: number;  
  imagen?: string;
  categoria: string;
  weightOptions?: WeightOption[];  // Añadimos las opciones de peso
}

export interface WeightOption {
  id?: number;
  producto_id?: number;
  size: string;  // Peso (ej. 1kg, 5kg)
  price: number; // Precio por este peso
  stock: number; // Stock de este peso
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://10.0.2.2:3000/productos';  // URL de la API
  private weightOptionsUrl = 'http://10.0.2.2:3000/pesos';  // URL para opciones de peso
  productImage: string | undefined; 
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  private sqliteConnection: SQLiteConnection | null = null;
  private db: SQLiteDBConnection | null = null;
  private useSQLite: boolean = false;

  constructor(private http: HttpClient, private storage: Storage) {
    this.initDB();
    this.monitorNetwork();  // Iniciar la monitorización de la red
  }

  async closeDBConnection() {
    if (this.db) {
      console.log('Cerrando la conexión a la base de datos...');
      await this.db.close();
      this.db = null;
    }
  }

  async initDB() {
    await this.storage.create();  // Inicializar LocalStorage
  
    try {
      if (CapacitorSQLite) {
        console.log('Iniciando la conexión con SQLite...');
  
        await this.closeDBConnection();
  
        if (!this.sqliteConnection) {
          this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
        }
  
        if (!this.db) {
          this.db = await this.sqliteConnection.createConnection('dataSQLite.db', false, 'no-encryption', 1, false);
          await this.db.open();
          console.log('SQLite abierto. Creando tablas...');
  
          await this.db.execute(`
            CREATE TABLE IF NOT EXISTS productos (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              nombre TEXT NOT NULL,
              descripcion TEXT NOT NULL,
              precio REAL NOT NULL,
              stock INTEGER NOT NULL,
              imagen TEXT,
              synced INTEGER DEFAULT 0
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
        }
  
        this.useSQLite = true;
        console.log('SQLite está disponible y las tablas fueron creadas.');
  
        await this.syncProductsWithAPI();
  
      } else {
        this.useSQLite = false;
        console.warn('SQLite no está disponible. Usando LocalStorage como fallback.');
      }
    } catch (err) {
      this.useSQLite = false;
      console.error('Error al inicializar SQLite. Usando LocalStorage como fallback:', err);
    }
  }

  // Monitorización de la red
  async monitorNetwork() {
    const status = await Network.getStatus();
    if (status.connected) {
      console.log('Conexión inicial detectada, intentando sincronizar productos...');
      await this.syncProductsWithAPI();
    }

    Network.addListener('networkStatusChange', async (status) => {
      if (status.connected) {
        console.log('Conexión restablecida, intentando sincronizar productos...');
        await this.syncProductsWithAPI();
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

  async getProductsSQLite(): Promise<Product[]> {
    try {
      if (!await this.ensureDBIsOpen()) return [];
  
      // Obtenemos los productos
      const res = await this.db!.query("SELECT * FROM productos");
      const products = res.values as Product[];
  
      // Para cada producto, obtenemos sus opciones de peso
      for (const product of products) {
        const weightOptionsResult = await this.db!.query("SELECT * FROM pesos WHERE producto_id = ?", [product.id]);
        product.weightOptions = weightOptionsResult.values as WeightOption[];
      }
  
      return products;
    } catch (err) {
      console.error('Error al obtener productos y opciones de peso de SQLite:', err);
      return [];
    }
  }
  
  async closeDBAtAppExit() {
    if (this.db) {
      console.log('Cerrando la conexión a la base de datos al salir de la app...');
      await this.db.close();
      this.db = null;
    }
  }

  async getProductsSQLiteNotSynced(): Promise<Product[]> {
    try {
      if (!await this.ensureDBIsOpen()) return [];
      const res = await this.db!.query("SELECT * FROM productos WHERE synced = 0");

      if (res.values && res.values.length > 0) {
        return res.values as Product[];
      } else {
        console.log('No se encontraron productos no sincronizados.');
        return [];
      }
    } catch (err) {
      console.error('Error al obtener productos no sincronizados de SQLite:', err);
      return [];
    }
  }

  async markProductAsSyncedSQLite(productId: number): Promise<void> {
    try {
      if (!await this.ensureDBIsOpen()) return;
      await this.db!.run(`UPDATE productos SET synced = 1 WHERE id = ?`, [productId]);
    } catch (err) {
      console.error('Error al marcar producto como sincronizado:', err);
    }
  }

  async syncProductsWithAPI() {
    try {
      const products = await this.getProductsSQLiteNotSynced();
      if (products.length === 0) {
        console.log('No hay productos para sincronizar.');
        return;
      }

      console.log(`Iniciando sincronización de ${products.length} productos...`);

      for (const product of products) {
        try {
          const addedProduct = await this.addProductAPI(product).toPromise();
          if (addedProduct && addedProduct.id) {
            console.log(`Producto ${product.nombre} sincronizado.`);
            await this.markProductAsSyncedSQLite(product.id!);
            // Eliminar producto de SQLite después de sincronizar
            await this.deleteProductSQLite(product.id!);
          }
        } catch (error) {
          console.error(`Error al sincronizar el producto ${product.nombre}:`, error);
        }
      }

      console.log('Sincronización finalizada.');
    } catch (error) {
      console.error('Error al sincronizar productos:', error);
    }
  }
  // Función para seleccionar una imagen
  async selectImage(): Promise<string | null> {
    try {
      const image = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
        quality: 90
      });
  
      if (image && image.webPath) {
        this.productImage = image.webPath;  // Guardar la URI de la imagen
        console.log('Imagen seleccionada:', this.productImage);
        
        // Convertir la imagen a base64
        const base64Data = await this.readAsBase64(image);
        return base64Data;  // Retornar el base64 para usar en el producto
      }
  
      // Si no hay imagen seleccionada, retornar null
      return null;
  
    } catch (error) {
      console.error('Error al seleccionar la imagen:', error);
      return null;  // Retornar null en caso de error
    }
  }
  

  // Convierte la imagen a base64
  private async readAsBase64(image: any): Promise<string> {
    const response = await fetch(image.webPath);
    const blob = await response.blob();

    return await this.convertBlobToBase64(blob) as string;
  }

  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  // Función para agregar el producto
  async addProduct(product: Product, weightOptions: WeightOption[], imageBase64?: string): Promise<void> {
    if (imageBase64) {
      product.imagen = imageBase64;  // Usar la imagen convertida a base64
    }

    try {
      const status = await Network.getStatus();
      if (status.connected) {
        const addedProduct = await this.addProductAPI(product).toPromise();
        if (addedProduct && addedProduct.id) {
          for (const option of weightOptions) {
            option.producto_id = addedProduct.id;
            await this.addWeightOptionAPI(option).toPromise();
          }
          console.log('Producto añadido a la API:', JSON.stringify(addedProduct));
        } else {
          throw new Error('No se pudo añadir el producto a la API.');
        }
      } else {
        throw new Error('Sin conexión a la red');
      }
    } catch (error) {
      console.error('Error al añadir producto:', error);
      if (this.useSQLite) {
        await this.addProductSQLite(product, weightOptions);
      }
    }
  }


  async addProductSQLite(product: Product, weightOptions: WeightOption[]): Promise<void> {
    try {
      if (!await this.ensureDBIsOpen()) return;
  
      // Incluir la columna `categoria` en la consulta SQL
      const query = `INSERT INTO productos (nombre, descripcion, precio, stock, imagen, categoria, synced) VALUES (?, ?, ?, ?, ?, ?, 0)`;
      
      // Asegurarse de incluir `product.categoria` en los valores
      const values = [product.nombre, product.descripcion, product.precio, product.stock, product.imagen, product.categoria];
      
      const result = await this.db!.run(query, values);
      if (result.changes && result.changes.lastId) {
        console.log('Producto añadido en SQLite con ID:', result.changes.lastId);
        const productId = result.changes.lastId;
  
        for (const option of weightOptions) {
          const weightQuery = `INSERT INTO pesos (producto_id, size, price, stock) VALUES (?, ?, ?, ?)`;
          await this.db!.run(weightQuery, [productId, option.size, option.price, option.stock]);
        }
        console.log('Producto y opciones de peso añadidos en SQLite con éxito.');
      } else {
        console.error('Error al insertar el producto en SQLite.');
      }
    } catch (err) {
      console.error('Error al añadir producto a SQLite:', err);
    }
  }
  

  async deleteProductSQLite(productId: number): Promise<void> {
    try {
      if (!await this.ensureDBIsOpen()) return;

      await this.db!.run(`DELETE FROM productos WHERE id = ?`, [productId]);
      console.log(`Producto con ID ${productId} eliminado de SQLite.`);
    } catch (err) {
      console.error('Error al eliminar producto de SQLite:', err);
    }
  }

  getProductsAPI(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl, this.httpOptions)
      .pipe(
        tap(products => console.log('Productos obtenidos de la API:', products)),
        catchError(this.handleError<Product[]>('getProductsAPI', []))
      );
  }

  addProductAPI(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product, this.httpOptions)
      .pipe(
        tap(newProduct => console.log('Producto añadido a la API:', newProduct)),
        catchError((error) => {
          console.error('Error al añadir producto a la API:', error);
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

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} falló:`, error);
      return of(result as T);
    };
  }
}
