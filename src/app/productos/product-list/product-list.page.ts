import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from '../product-service.service';
import { Router } from '@angular/router';  // Importar Router para navegación
import { AlertController } from '@ionic/angular';  // Importar AlertController para confirmación
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.page.html',
  styleUrls: ['./product-list.page.scss'],
})
export class ProductListPage implements OnInit {
  products: Product[] = [];

  constructor(
    private productService: ProductService,
    private router: Router, // Inyectar el Router para navegación
    private alertController: AlertController // Para mostrar alertas
  ) {}

  ngOnInit() {
    // Aquí puedes dejar vacío si quieres, ya que ionViewWillEnter se encarga de cargar los productos
  }

  // ionViewWillEnter se ejecuta cada vez que se entra a la vista
  ionViewWillEnter() {
    this.loadProducts(); // Cargar productos cada vez que se entre a la vista
  }

  async loadProducts() {
    try {
      const localProducts = await this.productService.getProductsSQLite();
      console.log('Productos locales obtenidos de SQLite:', localProducts);
  
      // Verificar si hay conexión antes de llamar a la API
      if (!navigator.onLine) {
        this.products = localProducts;
        console.log('No hay conexión. Mostrando productos locales:', this.products);
        return;
      }
  
      // Si hay conexión, intenta obtener los productos de la API
      this.productService.getProductsAPI().subscribe(
        async apiProducts => {
          if (apiProducts && apiProducts.length > 0) {
            // Procesar los productos de la API
            for (let product of apiProducts) {
              // Verificar que el ID del producto no sea undefined
              if (product.id !== undefined) {
                // Obtener y asignar las opciones de peso de cada producto
                const weightOptions = await firstValueFrom(this.productService.getWeightOptionsByProductIdAPI(product.id));
                product.weightOptions = weightOptions;  // Asignar las opciones de peso al producto
                console.log('Opciones de peso obtenidas para el producto:', product.nombre, weightOptions);
              } else {
                console.warn('El producto no tiene un ID válido:', product);
              }
            }
  
            // Si hay productos de la API, combínalos con los locales
            this.products = [...localProducts, ...apiProducts];
            console.log('Productos combinados:', this.products);
          } else {
            // Si la API no tiene productos, mostrar solo los locales
            this.products = localProducts;
            console.log('Solo mostrando productos locales:', this.products);
          }
        },
        error => {
          console.error('Error obteniendo productos de la API:', error);
          // En caso de error al obtener productos de la API, mostrar solo los locales
          this.products = localProducts;
        }
      );
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  }
  
  

  // Función para eliminar un producto, validando si el id existe
  async deleteProduct(id: number | undefined) {
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
              await this.productService.deleteProductSQLite(id); // Eliminar el producto de SQLite
              this.loadProducts(); // Recargar la lista de productos
              console.log(`Producto con ID ${id} eliminado`);
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
  editProduct(productId: number | undefined) {
    if (productId === undefined) {
      console.error('El ID del producto es indefinido.');
      return;
    }
    this.router.navigate(['/productos/product-edit', productId]);
  }

  // Función para navegar a la página de agregar nuevo producto
  addProduct() {
    this.router.navigate(['/productos/product-add']);
  }
}
