import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable,firstValueFrom, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { CapacitorSQLite, SQLiteDBConnection, SQLiteConnection } from '@capacitor-community/sqlite';
import { Storage } from '@ionic/storage-angular';
import { Network } from '@capacitor/network';


export interface Product {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen?: string;
  categoria: string;
  weightOptions?: WeightOption[];
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
  private apiUrl = 'http://10.0.2.2:3000/productos';
  private weightOptionsUrl = 'http://10.0.2.2:3000/pesos';
  productImage: string | undefined;
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
              categoria TEXT NOT NULL,
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


  // Marcar un producto como sincronizado en SQLite
  async markProductAsSyncedSQLite(productId: number): Promise<void> {
    try {
      if (!await this.ensureDBIsOpen()) return;
      await this.db!.run(`UPDATE productos SET synced = 1 WHERE id = ?`, [productId]);
      console.log(`Producto con ID ${productId} marcado como sincronizado.`);
    } catch (err) {
      console.error('Error al marcar producto como sincronizado:', err);
    }
  }


  // Función para añadir un producto y sus opciones de peso
  async addProduct(product: Product, weightOptions: WeightOption[], imageBase64?: string): Promise<void> {
    if (imageBase64) {
      product.imagen = imageBase64;  // Usar la imagen convertida a base64
    }

    try {
      const status = await Network.getStatus();
      if (status.connected) {
        const productWithoutWeights = { ...product, weightOptions: [] };
        const addedProduct = await this.addProductAPI(productWithoutWeights).toPromise();
        if (addedProduct && addedProduct.id) {
          console.log('Producto añadido a la API:', JSON.stringify(addedProduct));

          for (const option of weightOptions) {
            option.producto_id = addedProduct.id;
            await this.addWeightOptionAPI(option).toPromise();
            console.log(`Opción de peso "${option.size}" añadida a la API.`);
          }
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
  // Funciones SQLite

  // Obtener todos los productos desde SQLite, incluyendo las opciones de peso
  async getProductsSQLite(): Promise<Product[]> {
    try {
      if (!await this.ensureDBIsOpen()) return [];

      const res = await this.db!.query("SELECT * FROM productos");
      const products = res.values as Product[];

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

  // Obtener productos que no han sido sincronizados aún
  async getProductsSQLiteNotSynced(): Promise<Product[]> {
    try {
      if (!await this.ensureDBIsOpen()) return [];
      const res = await this.db!.query("SELECT * FROM productos WHERE synced = 0");

      if (res.values && res.values.length > 0) {
        for (const product of res.values) {
          const weightOptionsResult = await this.db!.query("SELECT * FROM pesos WHERE producto_id = ?", [product.id]);
          product.weightOptions = weightOptionsResult.values as WeightOption[];
        }
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

  async updateProductSQLite(product: Product): Promise<void> {
    if (!await this.ensureDBIsOpen()) {
      console.error("No se pudo abrir la base de datos.");
      return;
    }

    try {
      // Actualizar el producto
      const productQuery = `UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria = ? WHERE id = ?`;
      const productValues = [product.nombre, product.descripcion, product.precio, product.stock, product.categoria, product.id];
      await this.db!.run(productQuery, productValues);

      // Actualizar las opciones de peso
      for (const option of product.weightOptions || []) {
        if (option.id) {
          // Si la opción de peso ya tiene un ID, actualizarla
          const weightUpdateQuery = `UPDATE pesos SET size = ?, price = ?, stock = ?, producto_id = ? WHERE id = ?`;
          const weightValues = [option.size, option.price, option.stock, product.id, option.id];
          await this.db!.run(weightUpdateQuery, weightValues);
        } else {
          // Si la opción de peso no tiene ID, agregarla como nueva opción
          const weightInsertQuery = `INSERT INTO pesos (producto_id, size, price, stock) VALUES (?, ?, ?, ?)`;
          const weightInsertValues = [product.id, option.size, option.price, option.stock];
          await this.db!.run(weightInsertQuery, weightInsertValues);
        }
      }

      console.log(`Producto con ID ${product.id} actualizado correctamente en SQLite.`);
    } catch (error) {
      console.error('Error al actualizar el producto en SQLite:', error);
    }
  }


  // Función para añadir un producto a SQLite
  async addProductSQLite(product: Product, weightOptions: WeightOption[]): Promise<void> {
    try {
      if (!await this.ensureDBIsOpen()) return;

      const query = `INSERT INTO productos (nombre, descripcion, precio, stock, imagen, categoria, synced) VALUES (?, ?, ?, ?, ?, ?, 0)`;
      const values = [product.nombre, product.descripcion, product.precio, product.stock, product.imagen, product.categoria];

      const result = await this.db!.run(query, values);

      if (result.changes && result.changes.lastId) {
        console.log('Producto añadido en SQLite con ID:', result.changes.lastId);
        const productId = result.changes.lastId;

        for (const option of weightOptions) {
          const weightQuery = `INSERT INTO pesos (producto_id, size, price, stock) VALUES (?, ?, ?, ?)`;
          await this.db!.run(weightQuery, [productId, option.size, option.price, option.stock]);
          console.log(`Opción de peso "${option.size}" añadida en SQLite con producto_id: ${productId}.`);
        }
        console.log('Producto y opciones de peso añadidos en SQLite con éxito.');
      } else {
        console.error('Error al insertar el producto en SQLite.');
      }
    } catch (err) {
      console.error('Error al añadir producto a SQLite:', err);
    }
  }

  // Función para eliminar un producto de SQLite
  async deleteProductSQLite(productId: number): Promise<void> {
    try {
      if (!await this.ensureDBIsOpen()) return;

      await this.db!.run(`DELETE FROM productos WHERE id = ?`, [productId]);
      console.log(`Producto con ID ${productId} eliminado de SQLite.`);
    } catch (err) {
      console.error('Error al eliminar producto de SQLite:', err);
    }
  }

  // Obtener un producto por ID desde SQLite, incluyendo las opciones de peso
  async getProductByIdSQLite(productId: number): Promise<Product | null> {
    try {
      if (!await this.ensureDBIsOpen()) return null;

      const res = await this.db!.query("SELECT * FROM productos WHERE id = ?", [productId]);

      if (res.values && res.values.length > 0) {
        const product = res.values[0] as Product;
        const weightOptionsResult = await this.db!.query("SELECT * FROM pesos WHERE producto_id = ?", [product.id]);
        product.weightOptions = weightOptionsResult.values as WeightOption[];
        return product;
      } else {
        console.log(`Producto con ID ${productId} no encontrado.`);
        return null;
      }
    } catch (err) {
      console.error('Error al obtener el producto desde SQLite:', err);
      return null;
    }
  }


  // Eliminar una opción de peso de SQLite
  async deleteWeightOptionSQLite(weightOptionId: number): Promise<void> {
    try {
      if (!await this.ensureDBIsOpen()) return;

      await this.db!.run(`DELETE FROM pesos WHERE id = ?`, [weightOptionId]);
      console.log(`Opción de peso con ID ${weightOptionId} eliminada de SQLite.`);
    } catch (err) {
      console.error('Error al eliminar la opción de peso desde SQLite:', err);
    }
  }

  // Actualizar una opción de peso en SQLite
  async updateWeightOptionSQLite(weightOption: WeightOption): Promise<void> {
    try {
      if (!await this.ensureDBIsOpen()) return;

      const query = `UPDATE pesos SET size = ?, price = ?, stock = ? WHERE id = ?`;
      const values = [weightOption.size, weightOption.price, weightOption.stock, weightOption.id];

      await this.db!.run(query, values);
      console.log(`Opción de peso con ID ${weightOption.id} actualizada en SQLite.`);
    } catch (err) {
      console.error('Error al actualizar la opción de peso en SQLite:', err);
    }
  }

  // Obtener todas las opciones de peso de un producto específico
  async getWeightOptionsByProductIdSQLite(productId: number): Promise<WeightOption[]> {
    try {
      if (!await this.ensureDBIsOpen()) return [];

      const res = await this.db!.query("SELECT * FROM pesos WHERE producto_id = ?", [productId]);
      return res.values as WeightOption[];
    } catch (err) {
      console.error('Error al obtener las opciones de peso desde SQLite:', err);
      return [];
    }
  }

  // Eliminar todas las opciones de peso de un producto
  async deleteWeightOptionsByProductIdSQLite(productId: number): Promise<void> {
    try {
      if (!await this.ensureDBIsOpen()) return;

      await this.db!.run(`DELETE FROM pesos WHERE producto_id = ?`, [productId]);
      console.log(`Todas las opciones de peso para el producto con ID ${productId} eliminadas de SQLite.`);
    } catch (err) {
      console.error('Error al eliminar las opciones de peso desde SQLite:', err);
    }
  }

  async addWeightOptionSQLite(option: WeightOption): Promise<void> {
    try {
      await this.ensureDBIsOpen();  // Verificar que la DB esté abierta
      if (!this.db) {
        throw new Error('Base de datos no inicializada.');
      }
  
      const query = `INSERT INTO pesos (producto_id, size, price, stock) VALUES (?, ?, ?, ?)`;
      const values = [option.producto_id, option.size, option.price, option.stock];
      await this.db.run(query, values);
      console.log(`Opción de peso "${option.size}" añadida a SQLite para el producto con ID ${option.producto_id}.`);
    } catch (error) {
      console.error('Error al añadir opción de peso a SQLite:', error);
    }
  }
  
  

  // Funciones API

  // Obtener todos los productos desde la API
  getProductsAPI(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl, this.httpOptions)
      .pipe(
        tap(products => console.log('Productos obtenidos de la API:', products)),
        catchError(this.handleError<Product[]>('getProductsAPI', []))
      );
  }

  // Añadir un producto a la API
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

// Añadir un usuario a la API con más registros de depurac
  async updateProduct(product: Product): Promise<void> {
    try {
      if (this.useSQLite) {
        // Actualizar en SQLite
        await this.updateProductSQLite(product);
      } else {
        // Actualizar en la API
        await this.updateProductAPI(product).toPromise();
      }
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      throw error;
    }
  }


  updateProductAPI(product: Product): Observable<any> {
    return this.http.put(`${this.apiUrl}/${product.id}`, product, this.httpOptions)
      .pipe(
        tap(() => console.log(`Producto con ID ${product.id} actualizado en la API`)),
        catchError(this.handleError<any>('updateProductAPI'))
      );
  }


  // Añadir una opción de peso a la API
  addWeightOptionAPI(weightOption: WeightOption): Observable<WeightOption> {
    return this.http.post<WeightOption>(this.weightOptionsUrl, weightOption, this.httpOptions)
      .pipe(
        tap(newWeightOption => console.log('Opción de peso añadida a la API:', newWeightOption)),
        catchError((error) => {
          console.error('Error al añadir opción de peso a la API:', error);
          return of({} as WeightOption);
        })
      );
  }

  // Eliminar una opción de peso en la API
  deleteWeightOptionAPI(weightOptionId: number): Observable<any> {
    return this.http.delete(`${this.weightOptionsUrl}/${weightOptionId}`, this.httpOptions)
      .pipe(
        tap(() => console.log(`Opción de peso con ID ${weightOptionId} eliminada de la API`)),
        catchError((error) => {
          console.error(`Error al eliminar la opción de peso con ID ${weightOptionId} de la API:`, error);
          return of(null);
        })
      );
  }

  // Actualizar una opción de peso en la API
  updateWeightOptionAPI(weightOption: WeightOption): Observable<any> {
    return this.http.put(`${this.weightOptionsUrl}/${weightOption.id}`, weightOption, this.httpOptions)
      .pipe(
        tap(() => console.log(`Opción de peso con ID ${weightOption.id} actualizada en la API`)),
        catchError((error) => {
          console.error(`Error al actualizar la opción de peso con ID ${weightOption.id} en la API:`, error);
          return of(null);
        })
      );
  }

  // Eliminar un producto en la API
  deleteProductAPI(productId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${productId}`, this.httpOptions)
      .pipe(
        tap(() => console.log(`Producto con ID ${productId} eliminado de la API`)),
        catchError((error) => {
          console.error(`Error al eliminar el producto con ID ${productId} de la API:`, error);
          return of(null);
        })
      );
  }

  // Obtener un producto específico desde la API
  getProductByIdAPI(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${productId}`, this.httpOptions)
      .pipe(
        tap(product => console.log(`Producto con ID ${productId} obtenido de la API:`, product)),
        catchError((error) => {
          console.error(`Error al obtener el producto con ID ${productId} desde la API:`, error);
          return of({} as Product);
        })
      );
  }


  // Obtener una opción de peso específica desde la API
  getWeightOptionByIdAPI(weightOptionId: number): Observable<WeightOption> {
    return this.http.get<WeightOption>(`${this.weightOptionsUrl}/${weightOptionId}`, this.httpOptions)
      .pipe(
        tap(weightOption => console.log(`Opción de peso con ID ${weightOptionId} obtenida de la API:`, weightOption)),
        catchError((error) => {
          console.error(`Error al obtener la opción de peso con ID ${weightOptionId} desde la API:`, error);
          return of({} as WeightOption);
        })
      );
  }

// Obtener opciones de peso desde la API
getWeightOptionsByProductIdAPI(productId: number): Observable<WeightOption[]> {
  return this.http.get<{ pesos: WeightOption[] }>(`${this.weightOptionsUrl}/product/${productId}`, this.httpOptions)
    .pipe(
      map((response: { pesos: WeightOption[] }) => {
        console.log('Respuesta completa de la API:', JSON.stringify(response, null, 2));
        return response.pesos;  // Acceder al campo "pesos"
      }),
      catchError(error => {
        console.error(`Error al obtener las opciones de peso para el producto con ID ${productId} desde la API:`, error);
        return of([]);  // En caso de error, devolver un arreglo vacío
      })
    );
}



// Eliminar un producto junto con sus opciones de peso en la API
async deleteProductWithWeightsAPI(productId: number): Promise<void> {
  try {
    // Asegurarse de que el tipo esperado es un array de WeightOption
    const weightOptions: WeightOption[] = await firstValueFrom(this.getWeightOptionsByProductIdAPI(productId));

    // Eliminar cada opción de peso
    for (const weightOption of weightOptions) {
      if (weightOption.id !== undefined) {
        await firstValueFrom(this.deleteWeightOptionAPI(weightOption.id));
      } else {
        console.warn(`Opción de peso sin ID, no se puede eliminar:`, weightOption);
      }
    }

    // Finalmente, eliminar el producto
    await firstValueFrom(this.deleteProductAPI(productId));
    console.log(`Producto con ID ${productId} y sus opciones de peso eliminados de la API`);
  } catch (error) {
    console.error(`Error al eliminar el producto con ID ${productId} y sus opciones de peso:`, error);
  }
}


  // Funciones convinadas

  // Sincronizar productos y sus opciones de peso con la API
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
          // Crear una copia del producto sin `weightOptions` antes de enviarlo a la API
          const productWithoutWeights = { ...product, weightOptions: [] };

          // Sincronizar el producto con la API
          const addedProduct = await this.addProductAPI(productWithoutWeights).toPromise();

          if (addedProduct && addedProduct.id) {
            console.log(`Usuario "${product.nombre}" sincronizado con éxito, ID API: ${addedProduct.id}`);

            // Marcar el producto como sincronizado en SQLite
            await this.markProductAsSyncedSQLite(product.id!);

            // Sincronizar las opciones de peso
            if (product.weightOptions && product.weightOptions.length > 0) {
              console.log(`Opciones de peso encontradas para el producto "${product.nombre}":`, product.weightOptions);

              for (const option of product.weightOptions) {
                // Asignar el nuevo ID del producto de la API
                option.producto_id = addedProduct.id;
                console.log(`Sincronizando opción de peso con producto_id: ${option.producto_id}`, option);

                const weightOptionResponse = await this.addWeightOptionAPI(option).toPromise();

                if (weightOptionResponse && weightOptionResponse.id) {
                  console.log(`Opción de peso "${option.size}" sincronizada con éxito, ID API: ${weightOptionResponse.id}`);
                } else {
                  console.error(`Error al sincronizar la opción de peso "${option.size}" para el producto "${product.nombre}".`);
                }
              }
            } else {
              console.warn(`No se encontraron opciones de peso para el producto "${product.nombre}".`);
            }

            // Eliminar el producto de SQLite después de sincronizarlo
            await this.deleteProductSQLite(product.id!);
          } else {
            console.error(`Error al sincronizar el producto "${product.nombre}".`);
          }
        } catch (error) {
          console.error(`Error al sincronizar el producto "${product.nombre}":`, error);
        }
      }

      console.log('Sincronización finalizada.');
    } catch (error) {
      console.error('Error al sincronizar productos:', error);
    }
  }


  
  // Manejo de errores genérico
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} falló:`, error);
      return of(result as T);
    };
  }
}
