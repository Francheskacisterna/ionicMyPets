import { Component, OnInit } from '@angular/core';
import { ProductService, Product, WeightOption } from '../product-service.service'; // Servicio en la misma carpeta

@Component({
  selector: 'app-product-all',
  templateUrl: './product-all.page.html',
  styleUrls: ['./product-all.page.scss'],
})
export class ProductAllPage implements OnInit {
  productsWithWeights: { product: Product; weights: WeightOption[] }[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadAllProducts();
  }

  async loadAllProducts() {
    // Primero obtenemos todos los productos
    const products = await this.productService.getProductsSQLite();
    this.productsWithWeights = [];

    // Para cada producto, obtenemos sus opciones de peso
    for (const product of products) {
      const { weights } = await this.productService.getProductWithWeightsSQLite(product.id!);
      this.productsWithWeights.push({ product, weights });
    }
  }
}
