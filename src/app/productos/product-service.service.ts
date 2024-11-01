import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom, of, throwError, BehaviorSubject  } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CapacitorSQLite, SQLiteDBConnection, SQLiteConnection } from '@capacitor-community/sqlite';
import { Storage } from '@ionic/storage-angular';
import { Network } from '@capacitor/network';


export interface Product {
  id?: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen?: string;
  categoria: string;
  synced?: number;
  weightOptions?: WeightOption[];
  selectedWeight?: WeightOption;
}

export interface WeightOption {
  id?: string;
  producto_id?: string;
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
  private productsSubject: BehaviorSubject<Product[]> = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();  // Observable público
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
      await this.db.close();
      this.db = null;
    }
  }

  

  async initDB() {
    await this.storage.create();

    try {
      if (CapacitorSQLite) {
        await this.closeDBConnection();
        if (!this.sqliteConnection) {
          this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
        }

        if (!this.db) {
          this.db = await this.sqliteConnection.createConnection('productos.db', false, 'no-encryption', 1, false);
          await this.db.open();
          
          await this.db.execute(`
            CREATE TABLE IF NOT EXISTS productos (
              id TEXT PRIMARY KEY,
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
              id TEXT PRIMARY KEY,
              producto_id TEXT NOT NULL,
              size TEXT NOT NULL,
              price REAL NOT NULL,
              stock INTEGER NOT NULL,
              FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
            );
          `);
        }

        this.useSQLite = true;
        await this.syncProductsWithAPI();
      } else {
        this.useSQLite = false;
      }
    } catch (err) {
      this.useSQLite = false;
      console.error('Error al inicializar SQLite:', err);
    }
  }

  async monitorNetwork() {
    const status = await Network.getStatus();
    if (status.connected) {
      await this.syncProductsWithAPI();
    }

    Network.addListener('networkStatusChange', async (status) => {
      if (status.connected) {
        await this.syncProductsWithAPI();
      }
    });
  }

  async isApiAvailable(): Promise<boolean> {
    try {
      const response = await fetch(this.apiUrl);  // Realiza una solicitud para verificar la conexión con la API
      return response.ok;  // Retorna true si la API responde correctamente
    } catch (error) {
      console.error('API no disponible:', error);
      return false;  // Si hay algún error, la API no está disponible
    }
  }

  private async ensureDBIsOpen(): Promise<boolean> {
    if (!this.db) return false;
    const isDBOpen = await this.db.isDBOpen();
    if (!isDBOpen.result) {
      await this.db.open();
    }
    return true;
  }

  // CRUD en SQLite
  generateUUID(): string {
    return 'xxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 4 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(4);
    });
  }

  async clearWeightOptionsSQLite(productId: string): Promise<void> {
    const query = `DELETE FROM pesos WHERE producto_id = ?`;
    try {
      if (this.db) {
        await this.db.run(query, [productId]);
        console.log(`Opciones de peso eliminadas para el producto con ID ${productId} en SQLite`);
      } else {
        console.error("La conexión a la base de datos no está disponible.");
      }
    } catch (error) {
      console.error(`Error al eliminar las opciones de peso en SQLite: ${error}`);
    }
  }
  
  

  clearWeightOptionsAPI(productId: string): Observable<void> {
    const url = `${this.apiUrl}/products/${productId}/weightOptions`;  // Ajusta el endpoint según tu API
    return this.http.delete<void>(url).pipe(
      tap(() => {
        console.log(`Opciones de peso eliminadas para el producto con ID ${productId} en la API`);
      }),
      catchError((error) => {
        console.error(`Error al eliminar opciones de peso en la API: ${error}`);
        return throwError(error);
      })
    );
  }
  
  

// Funciones convinadas SQLite  

  // Añadir producto y peso a SQLite
  async addProductWithWeightsSQLite(product: Product, weightOptions: WeightOption[]): Promise<void> {
    try {
      const productQuery = `INSERT INTO productos (id, nombre, descripcion, precio, stock, imagen, categoria, synced) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`;
      const productValues = [product.id, product.nombre, product.descripcion, product.precio, product.stock, product.imagen, product.categoria];
      await this.db!.run(productQuery, productValues);
      console.log('Producto añadido en SQLite con ID:', product.id);
  
      for (const option of weightOptions) {
        const weightOptionQuery = `INSERT INTO pesos (id, producto_id, size, price, stock) VALUES (?, ?, ?, ?, ?)`;
        const weightOptionValues = [option.id, product.id, option.size, option.price, option.stock];
        await this.db!.run(weightOptionQuery, weightOptionValues);
        console.log(`Opción de peso "${option.size}" añadida en SQLite para el producto con ID ${product.id}`);
      }
    } catch (err) {
      console.error('Error al añadir producto y opciones de peso a SQLite:', err);
    }
  }

  // Método para sincronizar el producto y las opciones de peso con la API
  private async syncProductWithAPI(product: Product, weightOptions: WeightOption[]): Promise<void> {
    try {
      const response = await firstValueFrom(this.addProductAPI(product));
      console.log('Producto sincronizado en la API con éxito:', response);
  
      // Sincroniza cada opción de peso con la API
      for (const option of weightOptions) {
        console.log(`Intentando sincronizar opción de peso con ID: ${option.id} y producto_id: ${option.producto_id}`);
        await firstValueFrom(this.addWeightOptionAPI(option));
        console.log(`Opción de peso "${option.size}" sincronizada en la API para el producto con ID ${product.id}`);
      }
    } catch (error) {
      console.error('Error al sincronizar producto y opciones de peso en la API:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    }
  }

  

    // Actualizar el producto y las opciones de peso en SQLite
    async updateProductWithWeightsSQLite(product: Product, weightOptions: WeightOption[]): Promise<void> {
      if (!this.db) return;
      try {
        // Actualizar el producto
        const query = `UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria = ? WHERE id = ?`;
        const values = [product.nombre, product.descripcion, product.precio, product.stock, product.categoria, product.id];
        await this.db.run(query, values);
  
        // Actualizar las opciones de peso
        for (const option of weightOptions) {
          await this.updateWeightOptionSQLite(option);
        }
  
        console.log('Producto y opciones de peso actualizados en SQLite');
      } catch (err) {
        console.error('Error al actualizar producto y opciones de peso en SQLite:', err);
      }
    }


// En tu servicio de ProductService
async deleteProductWithWeightsSQLite(productId: string): Promise<void> {
  try {
    if (!await this.ensureDBIsOpen()) return;
  
    // Primero eliminamos todas las opciones de peso relacionadas con el producto
    await this.db!.run(`DELETE FROM pesos WHERE producto_id = ?`, [productId]);
    console.log(`Opciones de peso del producto con ID ${productId} eliminadas de SQLite.`);
  
    // Luego eliminamos el producto
    await this.db!.run(`DELETE FROM productos WHERE id = ?`, [productId]);
    console.log(`Producto con ID ${productId} eliminado de SQLite.`);
  } catch (err) {
    console.error('Error al eliminar el producto y sus opciones de peso de SQLite:', err);
  }
}


// Funciones para productos

// Obtener todos los productos de SQLite
async getProductsSQLite(): Promise<Product[]> {
  try {
    if (!await this.ensureDBIsOpen()) return [];

    const res = await this.db!.query("SELECT * FROM productos");
    return res.values as Product[];
  } catch (err) {
    console.error('Error al obtener productos de SQLite:', err);
    return [];
  }
}

// Obtener un producto por ID desde SQLite
async getProductByIdSQLite(productId: string): Promise<Product | null> {
  try {
    if (!await this.ensureDBIsOpen()) return null;

    const res = await this.db!.query("SELECT * FROM productos WHERE id = ?", [productId]);
    if (res.values && res.values.length > 0) {
      return res.values[0] as Product;
    } else {
      console.log('Producto no encontrado en SQLite con ID:', productId);
      return null;
    }
  } catch (err) {
    console.error('Error al obtener producto desde SQLite:', err);
    return null;
  }
}

// Actualizar producto en SQLite
async updateProductSQLite(product: Product) {
  if (!this.db) return;

  const query = `UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria = ?, imagen = ? WHERE id = ?`;
  const values = [product.nombre, product.descripcion, product.precio, product.stock, product.categoria, product.imagen, product.id];

  try {
    await this.db.run(query, values);
    console.log('Producto actualizado en SQLite:', product);
  } catch (error) {
    console.error('Error al actualizar producto en SQLite:', error);
  }
}



// Eliminar producto en SQLite
async deleteProductSQLite(productId: string): Promise<void> {
  try {
    if (!await this.ensureDBIsOpen()) return;
    await this.db!.run(`DELETE FROM productos WHERE id = ?`, [productId]);
    console.log('Producto con ID', productId, 'eliminado de SQLite');
  } catch (err) {
    console.error('Error al eliminar producto de SQLite:', err);
  }
}
// Obtener productos no sincronizados desde SQLite
async getProductsSQLiteNotSynced(): Promise<Product[]> {
  try {
    if (!await this.ensureDBIsOpen()) return [];
  
    const res = await this.db!.query("SELECT * FROM productos WHERE synced = 0");
    return res.values as Product[];
  } catch (err) {
    console.error('Error al obtener productos no sincronizados desde SQLite:', err);
    return [];
  }
}

// Marcar producto como sincronizado en SQLite
async markProductAsSyncedSQLite(productId: string): Promise<void> {
  try {
    if (!await this.ensureDBIsOpen()) return;
    await this.db!.run(`UPDATE productos SET synced = 1 WHERE id = ?`, [productId]);
    console.log('Producto con ID', productId, 'marcado como sincronizado en SQLite');
  } catch (err) {
    console.error('Error al marcar producto como sincronizado en SQLite:', err);
  }
}

// Funciones para opciones de peso (WeightOption)

// Añadir una opción de peso a SQLite
async addWeightOptionSQLite(weightOption: WeightOption): Promise<void> {
  try {
    if (!await this.ensureDBIsOpen()) return;

    if (!weightOption.id) {
      weightOption.id = this.generateUUID(); // Generar un UUID si no tiene ID
    }

    const query = `INSERT INTO pesos (id, producto_id, size, price, stock) VALUES (?, ?, ?, ?, ?)`;
    const values = [weightOption.id, weightOption.producto_id, weightOption.size, weightOption.price, weightOption.stock];
    await this.db!.run(query, values);

    console.log('Opción de peso añadida en SQLite:', weightOption.id);
  } catch (err) {
    console.error('Error al añadir opción de peso en SQLite:', err);
  }
}


// Obtener todas las opciones de peso por producto desde SQLite
async getWeightOptionsByProductIdSQLite(productId: string): Promise<WeightOption[]> {
  try {
    if (!await this.ensureDBIsOpen()) return [];

    const res = await this.db!.query("SELECT * FROM pesos WHERE producto_id = ?", [productId]);
    console.log(`Opciones de peso recuperadas desde SQLite para el producto con ID ${productId}:`, res.values);
    return res.values as WeightOption[];
  } catch (err) {
    console.error('Error al obtener opciones de peso desde SQLite:', err);
    return [];
  }
}


// Actualizar una opción de peso en SQLite
async updateWeightOptionSQLite(weightOption: WeightOption): Promise<void> {
  try {
    if (!await this.ensureDBIsOpen()) return;

    const query = `UPDATE pesos SET size = ?, price = ?, stock = ? WHERE id = ?`;
    const values = [weightOption.size, weightOption.price, weightOption.stock, weightOption.id];
    await this.db!.run(query, values);

    console.log('Opción de peso actualizada en SQLite:', weightOption.id);
  } catch (err) {
    console.error('Error al actualizar opción de peso en SQLite:', err);
  }
}

// Eliminar una opción de peso en SQLite
async deleteWeightOptionSQLite(weightOptionId: string): Promise<void> {
  try {
    if (!await this.ensureDBIsOpen()) return;

    await this.db!.run(`DELETE FROM pesos WHERE id = ?`, [weightOptionId]);
    console.log('Opción de peso con ID', weightOptionId, 'eliminada de SQLite');
  } catch (err) {
    console.error('Error al eliminar opción de peso desde SQLite:', err);
  }
}

// Eliminar todas las opciones de peso por producto desde SQLite
async deleteWeightOptionsByProductIdSQLite(productId: string): Promise<void> {
  try {
    if (!await this.ensureDBIsOpen()) return;

    await this.db!.run(`DELETE FROM pesos WHERE producto_id = ?`, [productId]);
    console.log('Opciones de peso para producto con ID', productId, 'eliminadas de SQLite');
  } catch (err) {
    console.error('Error al eliminar opciones de peso desde SQLite:', err);
  }
}

  // Método para cargar productos por categoría desde la API o SQLite
  async loadProductsByCategory(category: string) {
    const apiAvailable = await this.isApiAvailable();
  
    let products: Product[] = [];
    if (apiAvailable) {
      try {
        const apiProducts = await this.getProductsByCategoryAPI(category).toPromise();
        products = apiProducts || []; // Asigna un array vacío si `apiProducts` es `undefined`
        console.log(`Productos obtenidos de la API (categoría: ${category}):`, products);
      } catch (error) {
        console.error('Error al obtener productos desde la API:', error);
      }
    }
  
    if (!products.length) {
      products = await this.getProductsByCategorySQLite(category);
      console.log(`Productos obtenidos de SQLite (categoría: ${category}):`, products);
    }
  
    // Emite los productos obtenidos
    this.productsSubject.next(products);
  }
  

  getProductsByCategoryAPI(category: string): Observable<Product[]> {
    // Asegúrate de que la URL esté configurada correctamente para tu API
    const apiUrl = `http://10.0.2.2:3000/productos?category=${category}`;
    return this.http.get<Product[]>(apiUrl);
  }


    // Método auxiliar para obtener productos por categoría desde SQLite
    async getProductsByCategorySQLite(category: string): Promise<Product[]> {
      // Asegúrate de implementar y verificar la apertura de la conexión SQLite en ensureDBIsOpen()
      try {
        if (!await this.ensureDBIsOpen()) return [];
        const res = await this.db!.query("SELECT * FROM productos WHERE categoria = ?", [category]);
        return res.values as Product[];
      } catch (err) {
        console.error('Error al obtener productos por categoría desde SQLite:', err);
        return [];
      }
    }
  

// Funciones para productos

// Obtener todos los productos desde la API
getProductsAPI(): Observable<Product[]> {
  console.log('Intentando obtener productos de la API...');
  return this.http.get<Product[]>(this.apiUrl, this.httpOptions).pipe(
    tap((products) => console.log('Productos recibidos de la API:', products)),
    catchError(error => {
      console.error('Error en la API:', error);
      return of([]);  // Retorna un arreglo vacío si hay un error
    })
  );
}

// Obtener un producto específico por ID desde la API
getProductByIdAPI(productId: string): Observable<Product> {
  return this.http.get<Product>(`${this.apiUrl}/${productId}`, this.httpOptions)
    .pipe(
      tap(product => console.log(`Producto con ID ${productId} obtenido de la API:`, product)),
      catchError(this.handleError<Product>(`getProductByIdAPI id=${productId}`))
    );
}

// Añadir un producto a la API
addProductAPI(product: Product): Observable<Product> {
  return this.http.post<Product>(this.apiUrl, product, this.httpOptions)
    .pipe(
      tap(newProduct => console.log('Producto añadido a la API:', newProduct)),
      catchError(this.handleError<Product>('addProductAPI'))
    );
}

// Actualizar un producto en la API
updateProductAPI(product: Product): Observable<any> {
  return this.http.put(`${this.apiUrl}/${product.id}`, product, this.httpOptions)
    .pipe(
      tap(() => console.log(`Producto con ID ${product.id} actualizado en la API`)),
      catchError(this.handleError<any>('updateProductAPI'))
    );
}

// Eliminar un producto en la API
deleteProductAPI(productId: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/${productId}`, this.httpOptions)
    .pipe(
      tap(() => console.log(`Producto con ID ${productId} eliminado de la API`)),
      catchError(this.handleError<any>('deleteProductAPI'))
    );
}

// Funciones para opciones de peso (WeightOption)

// Obtener todas las opciones de peso para un producto por ID desde la API
getWeightOptionsByProductIdAPI(productId: string): Observable<WeightOption[]> {
  return this.http.get<WeightOption[]>(`${this.weightOptionsUrl}?producto_id=${productId}`, this.httpOptions)
    .pipe(
      tap(options => console.log(`Opciones de peso para el producto con ID ${productId} obtenidas de la API:`, options)),
      catchError(this.handleError<WeightOption[]>('getWeightOptionsByProductIdAPI', []))
    );
}

  
async addProductWithWeightsAPI(product: Product, weightOptions: WeightOption[]): Promise<void> {
  try {
    await firstValueFrom(this.addProductAPI(product));
    console.log('Producto añadido en la API con éxito.');

    for (const option of weightOptions) {
      await firstValueFrom(this.addWeightOptionAPI(option));
      console.log(`Opción de peso "${option.size}" añadida en la API para el producto con ID ${product.id}`);
    }
  } catch (error) {
    console.error('Error al sincronizar con la API:', error);
  }
}
 

// Añadir una opción de peso a la API
addWeightOptionAPI(weightOption: WeightOption): Observable<WeightOption> {
  console.log('Sincronizando opción de peso en la API:', JSON.stringify(weightOption, null, 2));
  return this.http.post<WeightOption>(`${this.weightOptionsUrl}`, weightOption, this.httpOptions)
    .pipe(
      tap(newOption => console.log('Opción de peso añadida a la API:', newOption)),
      catchError(error => {
        // Mostrar todos los detalles del error
        console.error('addWeightOptionAPI falló:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        return throwError(error);
      })
    );
}


// Actualizar una opción de peso en la API
updateWeightOptionAPI(weightOption: WeightOption): Observable<any> {
  return this.http.put(`${this.weightOptionsUrl}/${weightOption.id}`, weightOption, this.httpOptions)
    .pipe(
      tap(() => console.log(`Opción de peso con ID ${weightOption.id} actualizada en la API`)),
      catchError(this.handleError<any>('updateWeightOptionAPI'))
    );
}

// Eliminar una opción de peso en la API
deleteWeightOptionAPI(weightOptionId: string): Observable<any> {
  return this.http.delete(`${this.weightOptionsUrl}/${weightOptionId}`, this.httpOptions)
    .pipe(
      tap(() => console.log(`Opción de peso con ID ${weightOptionId} eliminada de la API`)),
      catchError(this.handleError<any>('deleteWeightOptionAPI'))
    );
}

// Eliminar todas las opciones de peso para un producto en la API
deleteWeightOptionsByProductIdAPI(productId: string): Observable<any> {
  return this.http.delete(`${this.weightOptionsUrl}/product/${productId}`, this.httpOptions)
    .pipe(
      tap(() => console.log(`Opciones de peso para el producto con ID ${productId} eliminadas de la API`)),
      catchError(this.handleError<any>('deleteWeightOptionsByProductIdAPI'))
    );
}



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
              // Sincronizar el producto en la API
              const addedProduct = await firstValueFrom(this.addProductAPI(product));
              if (addedProduct && addedProduct.id) {
                  console.log(`Producto "${product.nombre}" sincronizado con éxito, ID API: ${addedProduct.id}`);

                  // Marcar el producto como sincronizado en SQLite
                  await this.markProductAsSyncedSQLite(product.id!);

                  // Cargar opciones de peso desde SQLite y sincronizarlas
                  const weightOptions = await this.getWeightOptionsByProductIdSQLite(product.id!);
                  if (weightOptions.length > 0) {
                      for (const option of weightOptions) {
                          option.producto_id = addedProduct.id;
                          const weightOptionResponse = await firstValueFrom(this.addWeightOptionAPI(option));
                          if (weightOptionResponse && weightOptionResponse.id) {
                              console.log(`Opción de peso "${option.size}" sincronizada con éxito para el producto "${product.nombre}"`);
                          }
                      }
                  } else {
                      console.warn(`No se encontraron opciones de peso para el producto "${product.nombre}".`);
                  }

                  // Eliminar el producto y sus opciones de peso de SQLite
                  await this.deleteProductWithWeightsSQLite(product.id!);
              }
          } catch (error) {
              console.error(`Error al sincronizar el producto "${product.nombre}":`, error);
          }
      }

      console.log('Sincronización de productos finalizada.');
  } catch (error) {
      console.error('Error al sincronizar productos:', error);
  }
}


// Obtener un producto y sus opciones de peso por ID desde la API
async getProductWithWeightsByIdAPI(productId: string): Promise<{ product: Product, weightOptions: WeightOption[] }> {
  const product = await firstValueFrom(this.getProductByIdAPI(productId));
  const weightOptions = await firstValueFrom(this.getWeightOptionsByProductIdAPI(productId));

  return { product, weightOptions };
}

// En tu servicio de ProductService
async deleteProductWithWeightsAPI(productId: string): Promise<void> {
  try {
    // Primero eliminar las opciones de peso relacionadas con el producto en la API
    const weightOptions: WeightOption[] = await firstValueFrom(this.getWeightOptionsByProductIdAPI(productId));
    
    for (const weightOption of weightOptions) {
      await firstValueFrom(this.deleteWeightOptionAPI(weightOption.id!));
    }

    // Luego eliminar el producto en la API
    await firstValueFrom(this.deleteProductAPI(productId));
    console.log(`Producto con ID ${productId} y sus opciones de peso eliminados de la API`);
  } catch (error) {
    console.error(`Error al eliminar el producto con ID ${productId} y sus opciones de peso:`, error);
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
