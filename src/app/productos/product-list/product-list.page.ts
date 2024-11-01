import { Component, OnInit, NgZone } from '@angular/core';
import { ProductService, Product } from '../product-service.service';
import { Router, NavigationExtras } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.page.html',
  styleUrls: ['./product-list.page.scss'],
})
export class ProductListPage implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];  // Lista filtrada de productos
  filterTerm: string = '';  // Término de búsqueda

  constructor(
    private productService: ProductService,
    private router: Router,
    private alertController: AlertController,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef 
    
  ) { }

  ngOnInit() {
    // Este método queda vacío si la carga se maneja en ionViewWillEnter
  }

  ionViewWillEnter() {
    this.loadProducts(); // Cargar productos cada vez que se entre a la vista
  }

  async loadProducts() {
    try {
        // Obtener productos locales desde SQLite
        const localProducts = await this.productService.getProductsSQLite();
        for (let product of localProducts) {
            const weightOptions = await this.productService.getWeightOptionsByProductIdSQLite(product.id!);
            product.weightOptions = weightOptions;
        }
        console.log('Productos locales obtenidos de SQLite:', localProducts);

        this.ngZone.run(() => {
            this.products = localProducts;
            this.filteredProducts = localProducts;
        });

        // Verificar si la API está disponible antes de intentar obtener productos de la API
        const apiAvailable = await this.productService.isApiAvailable();
        if (apiAvailable) {
            try {
                const apiProducts = await firstValueFrom(this.productService.getProductsAPI());
                console.log('Productos obtenidos de la API:', apiProducts);

                if (apiProducts && apiProducts.length > 0) {
                    // Eliminar productos duplicados
                    const productosNoDuplicados = apiProducts.filter(apiProduct =>
                        !localProducts.some(localProduct => localProduct.id === apiProduct.id)
                    );

                    // Obtener las opciones de peso para los productos no duplicados
                    for (let product of productosNoDuplicados) {
                        try {
                            const weightOptions = await firstValueFrom(this.productService.getWeightOptionsByProductIdAPI(product.id!));
                            console.log(`Opciones de peso para el producto ${product.id}:`, weightOptions);  // Verificación de los pesos obtenidos
                            product.weightOptions = weightOptions;  // Asignar opciones de peso si existen
                        } catch (error) {
                            console.warn(`Error al obtener opciones de peso para el producto ${product.id}:`, error);
                            product.weightOptions = []; // Si falla, asignamos una lista vacía de opciones de peso
                        }
                    }

                    // Combinar productos locales y los de la API sin duplicados
                    this.ngZone.run(() => {
                        this.products = [...localProducts, ...productosNoDuplicados];
                        this.filteredProducts = this.products;
                        console.log('Productos combinados (sin duplicados):', this.products);
                    });
                }
            } catch (apiError) {
                console.error('Error obteniendo productos de la API:', apiError);
                this.ngZone.run(() => {
                    this.products = localProducts;
                    this.filteredProducts = localProducts;
                });
            }
        } else {
            console.log('API no disponible, mostrando solo productos locales.');
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}


  

  // Función para filtrar los productos
  filterProducts(event: any) {
    const searchTerm = event.target.value?.toLowerCase();
    if (searchTerm && searchTerm.trim() !== '') {
      this.filteredProducts = this.products.filter(product =>
        product.nombre.toLowerCase().includes(searchTerm)
      );
    } else {
      this.filteredProducts = this.products;  // Mostrar todos si no hay filtro
    }
  }

// Función para eliminar un producto
async deleteProduct(id: string | undefined) {
  if (id === undefined) {
    console.error('El ID del producto es indefinido.');
    return;
  }

  const alert = await this.alertController.create({
    header: 'Confirmar',
    message: '¿Estás seguro de que deseas eliminar este producto?',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
        handler: () => {
          console.log('Eliminación cancelada');
        },
      },
      {
        text: 'Eliminar',
        handler: async () => {
          try {
            const productIdString = id.toString();  // Convertimos el id a string

            // Eliminar en SQLite junto con las opciones de peso
            await this.productService.deleteProductWithWeightsSQLite(productIdString);
            console.log(`Producto con ID ${productIdString} eliminado de SQLite`);

            // Verificar si hay conexión para eliminar en la API
            if (navigator.onLine) {
              try {
                // Eliminar en la API junto con las opciones de peso
                await this.productService.deleteProductWithWeightsAPI(productIdString);
                console.log(`Producto con ID ${productIdString} eliminado de la API`);
              } catch (apiError) {
                console.error('Error al eliminar producto de la API:', apiError);
              }
            } else {
              console.log('No hay conexión a la red, no se puede eliminar de la API');
            }

            // Recargar la lista de productos
            this.loadProducts();  
          } catch (error) {
            console.error('Error al eliminar producto:', error);
          }
        },
      },
    ],
  });

  await alert.present();
}


  // Función para navegar a la página de edición de producto
  editProduct(product: Product) {
    if (product.id) {
      this.router.navigate(['/productos/product-edit'], {
        state: { product }  // Pasar el producto completo como estado de navegación
      });
    } else {
      console.error('ID de producto no válido');
    }
  }

  // Función para ver los detalles del producto
  viewProductDetails(product: Product) {
    this.router.navigate(['/productos/product-detail'], {
      state: { product }  // Pasar el producto completo en el estado de navegación
    });
  }

  // Función para navegar a la página de agregar nuevo producto
  addProduct() {
    this.router.navigate(['/productos/product-add']);
  }
}
