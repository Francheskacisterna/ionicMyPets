import { Component, OnInit } from '@angular/core';
import { ProductService, Product, WeightOption } from '../productos/product-service.service';

@Component({
  selector: 'app-ave',
  templateUrl: './ave.page.html',
  styleUrls: ['./ave.page.scss'],
})
export class AvePage implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  weightOptionsMap: { [productId: string]: WeightOption[] } = {};
  selectedCategory: string = '';

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.products$.subscribe((products) => {
      this.products = products;
      this.filteredProducts = [...this.products];
      this.loadWeightOptionsForProducts();
    });
  }

  ionViewWillEnter() {
    this.productService.loadProductsByCategory('aves'); // Actualiza los productos cada vez que se entra a la vista
  }

  private async loadWeightOptionsForProducts() {
    for (const product of this.products) {
      this.weightOptionsMap[product.id || ''] = [];
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
          console.log(`Opciones de peso obtenidas de la API para el producto ${product.id}:`, weightOptions);
        } catch (error) {
          console.error('Error al obtener opciones de peso desde la API:', error);
        }
      }

      if (!weightOptions.length) {
        weightOptions = await this.productService.getWeightOptionsByProductIdSQLite(product.id) || [];
        console.log(`Opciones de peso obtenidas de SQLite para el producto ${product.id}:`, weightOptions);
      }

      this.weightOptionsMap[product.id] = weightOptions || [];
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

  addToCart(product: Product) {
    console.log('Producto agregado al carrito:', product);
    // Aquí puedes añadir la lógica para agregar al carrito
  }
}
