import { Component, OnInit } from '@angular/core';
import { ProductService, Product, WeightOption } from '../productos/product-service.service';
import { CartService } from '../carrito/cart.service';

@Component({
  selector: 'app-ave',
  templateUrl: './ave.page.html',
  styleUrls: ['./ave.page.scss'],
})
export class AvePage implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  weightOptionsMap: { [productId: string]: WeightOption[] } = {};

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.productService.products$.subscribe((products) => {
      this.products = products;
      this.filteredProducts = [...this.products];
      this.loadWeightOptionsForProducts();
    });
  }

  ionViewWillEnter() {
    this.productService.loadProductsByCategory('aves');
  }

  private async loadWeightOptionsForProducts() {
    for (const product of this.products) {
      await this.loadWeightOptions(product);
    }
  }

  private async loadWeightOptions(product: Product) {
    if (product.id) {
      const apiAvailable = await this.productService.isApiAvailable();
      let weightOptions: WeightOption[] = [];

      if (apiAvailable) {
        try {
          weightOptions = await this.productService.getWeightOptionsByProductIdAPI(product.id).toPromise() || [];
        } catch (error) {
          console.error('Error al obtener opciones de peso desde la API:', error);
        }
      }

      if (!weightOptions.length) {
        weightOptions = await this.productService.getWeightOptionsByProductIdSQLite(product.id) || [];
      }

      this.weightOptionsMap[product.id] = weightOptions;
    }
  }

  sortProducts(event: any) {
    const sortValue = event.detail.value;
    if (sortValue === 'price-asc') {
      this.filteredProducts.sort((a, b) => a.precio - b.precio);
    } else if (sortValue === 'price-desc') {
      this.filteredProducts.sort((a, b) => b.precio - a.precio);
    }
  }

  selectWeight(product: Product, weight: WeightOption) {
    product.selectedWeight = weight;
  }

  isSelected(product: Product, weight: WeightOption) {
    return product.selectedWeight === weight;
  }

  async addToCart(product: Product) {
    if (product.selectedWeight) {
      try {
        await this.cartService.addToCart(product, 1, product.selectedWeight);
      } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
      }
    } else {
      console.log('Selecciona un peso antes de agregar al carrito.');
    }
  }
}
