import { Component, OnInit } from '@angular/core';
import { ProductService, Product, WeightOption } from '../productos/product-service.service';
import { CartService, CartItem } from '../carrito/cart.service';

@Component({
  selector: 'app-gato',
  templateUrl: './gato.page.html',
  styleUrls: ['./gato.page.scss'],
})
export class GatoPage implements OnInit {
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
    this.productService.loadProductsByCategory('gato'); // Actualiza los productos cada vez que se entra a la vista
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

  // Agregar producto al carrito y disminuir el stock
  async addToCart(product: Product) {
    if (product.selectedWeight) {
      try {
        // Llama a la función del servicio de carrito para agregar el producto
        await this.cartService.addToCart(product, 1, product.selectedWeight);

        // Actualizar el stock de forma local
        const apiAvailable = await this.productService.isApiAvailable();
        if (apiAvailable) {
          // Actualizar en la API si está disponible
          await this.productService.updateWeightOptionAPI(product.selectedWeight).toPromise();
        } else {
          // Actualizar en SQLite si la API no está disponible
          await this.productService.updateWeightOptionSQLite(product.selectedWeight);
        }
        
        console.log('Producto agregado al carrito y stock actualizado:', product);
      } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
      }
    } else {
      console.log('Selecciona un peso antes de agregar al carrito.');
    }
  }
}
