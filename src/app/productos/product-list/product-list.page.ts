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
    // Cargar productos locales de SQLite
    const localProducts = await this.productService.getProductsSQLite();
    
    // Cargar productos de la API y combinar con los productos locales
    this.productService.getProductsAPI().subscribe(apiProducts => {
      if (apiProducts && apiProducts.length > 0) {
        this.products = [...localProducts, ...apiProducts];  // Combina productos locales y de la API
      } else {
        this.products = localProducts;  // Si no hay productos en la API, muestra solo los locales
      }
    }, error => {
      console.error('Error obteniendo productos de la API', error);
      this.products = localProducts;  // Si hay un error, muestra solo los productos locales
    });
  }
}
