import { Component, OnInit } from '@angular/core';
import { ProductService, Product, WeightOption } from '../productos/product-service.service';
import { CartService, CartItem } from '../carrito/cart.service';

@Component({
  selector: 'app-perro',
  templateUrl: './perro.page.html',
  styleUrls: ['./perro.page.scss'],
})
export class PerroPage implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  weightOptionsMap: { [productId: string]: WeightOption[] } = {};
  selectedCategory: string = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService // Importamos el servicio del carrito
  ) {}
  
  ngOnInit() {
    this.productService.products$.subscribe((products) => {
      this.products = products;
      this.filteredProducts = [...this.products];
      this.loadWeightOptionsForProducts();
    });
  }

  ionViewWillEnter() {
    this.productService.loadProductsByCategory('perro'); // Actualiza los productos cada vez que se entra a la vista
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

  async addToCart(product: Product) {
    if (product.selectedWeight) {
      try {
        // Solo llama a la función del servicio para agregar al carrito
        await this.cartService.addToCart(product, 1, product.selectedWeight);
        console.log('Producto agregado al carrito:', product);
      } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
      }
    } else {
      console.log('Selecciona un peso antes de agregar al carrito.');
    }
  }
}  