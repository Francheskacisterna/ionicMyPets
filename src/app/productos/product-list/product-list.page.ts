import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from '../product-service.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.page.html',
  styleUrls: ['./product-list.page.scss'],
})
export class ProductListPage implements OnInit {
  products: Product[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  async loadProducts() {
    try {
      const localProducts = await this.productService.getProductsSQLite();
      console.log('Productos locales obtenidos de SQLite:', localProducts);  // Muestra los productos obtenidos de SQLite
  
      // Verificar si hay conexión antes de llamar a la API
      if (!navigator.onLine) {
        this.products = localProducts;
        console.log('No hay conexión. Mostrando productos locales:', this.products);  // Log adicional
        return;
      }
  
      // Si hay conexión, intenta obtener los productos de la API
      this.productService.getProductsAPI().subscribe(
        apiProducts => {
          if (apiProducts && apiProducts.length > 0) {
            // Si hay productos de la API, combínalos con los locales
            this.products = [...localProducts, ...apiProducts];
            console.log('Productos combinados:', this.products);  // Log para combinar productos
          } else {
            // Si la API no tiene productos, mostrar solo los locales
            this.products = localProducts;
            console.log('Solo mostrando productos locales:', this.products);  // Log en caso de que solo muestre locales
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
}
