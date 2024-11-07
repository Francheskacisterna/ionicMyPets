import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProductService, Product, WeightOption } from '../productos/product-service.service';
import { firstValueFrom } from 'rxjs';

export interface CartItem {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  weightSize?: string;
  weightPrice?: number;
  total: number;
  synced?: number;
  selectedWeight?: WeightOption;
  imagen?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  private cartItemCountSubject = new BehaviorSubject<number>(0);
  cartItemCount$ = this.cartItemCountSubject.asObservable();

  constructor(private productService: ProductService) {
    this.loadCartFromLocalStorage(); // Cargar el carrito de localStorage al iniciar
  }

  // Cargar el carrito desde localStorage y restaurar el stock si es necesario
  private async loadCartFromLocalStorage() {
    const savedCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
    if (savedCart.length > 0) {
      for (const item of savedCart) {
        const product = await this.productService.getProductByIdSQLite(item.productId) ||
          await firstValueFrom(this.productService.getProductByIdAPI(item.productId));

        if (product) {
          // Restaurar el stock en caso de productos en el carrito guardado
          await this.restoreStock(product, item.quantity, item.selectedWeight);
        }
      }
      localStorage.removeItem('cartItems'); // Limpiar carrito guardado después de restaurar el stock
    }
  }

  // Guardar el carrito actual en localStorage
  private saveCartToLocalStorage() {
    localStorage.setItem('cartItems', JSON.stringify(this.cartItemsSubject.value));
  }

  // Actualiza el contador de cantidad total de productos en el carrito
  private updateCartItemCount() {
    const totalItems = this.cartItemsSubject.value.reduce((sum, item) => sum + item.quantity, 0);
    console.log('Total de artículos en el carrito:', totalItems); // Agrega este console.log para verificar
    this.cartItemCountSubject.next(totalItems);
  }


  // Función para restaurar el stock de un producto o una opción de peso
  private async restoreStock(product: Product, quantity: number, selectedWeight?: WeightOption) {
    if (selectedWeight) {
      selectedWeight.stock += quantity;
      await this.productService.updateWeightOptionSQLite(selectedWeight);
      console.log(`SQLite: Stock restaurado para la opción de peso con ID ${selectedWeight.id}: ${selectedWeight.stock}`);

      if (await this.productService.isApiAvailable()) {
        await firstValueFrom(this.productService.updateWeightOptionAPI(selectedWeight));
        console.log(`API: Stock restaurado en la API para la opción de peso con ID ${selectedWeight.id}: ${selectedWeight.stock}`);
      }
    } else {
      product.stock += quantity;
      await this.productService.updateProductSQLite(product);
      console.log(`SQLite: Stock restaurado para el producto con ID ${product.id}: ${product.stock}`);

      if (await this.productService.isApiAvailable()) {
        await firstValueFrom(this.productService.updateProductAPI(product));
        console.log(`API: Stock restaurado en la API para el producto con ID ${product.id}: ${product.stock}`);
      }
    }
  }

  async addToCart(product: Product, quantity: number, selectedWeight?: WeightOption) {
    const currentCart = this.cartItemsSubject.value;
    const existingItem = currentCart.find(item => item.productId === product.id && item.selectedWeight?.id === selectedWeight?.id);

    if (selectedWeight && quantity > selectedWeight.stock) {
      console.warn('Cantidad excede el stock disponible para esta opción de peso.');
      return;
    } else if (!selectedWeight && quantity > product.stock) {
      console.warn('Cantidad excede el stock disponible del producto.');
      return;
    }

    if (selectedWeight) {
      selectedWeight.stock -= quantity;
      await this.productService.updateWeightOptionSQLite(selectedWeight);
      if (await this.productService.isApiAvailable()) {
        await firstValueFrom(this.productService.updateWeightOptionAPI(selectedWeight));
      }
    } else {
      product.stock -= quantity;
      await this.productService.updateProductSQLite(product);
      if (await this.productService.isApiAvailable()) {
        await firstValueFrom(this.productService.updateProductAPI(product));
      }
    }

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.total += quantity * (selectedWeight ? selectedWeight.price : product.precio);
    } else {
      const newItem: CartItem = {
        productId: product.id || '',
        productName: product.nombre,
        quantity,
        price: selectedWeight ? selectedWeight.price : product.precio,
        total: quantity * (selectedWeight ? selectedWeight.price : product.precio),
        selectedWeight,
        imagen: product.imagen
      };
      currentCart.push(newItem);
    }

    this.cartItemsSubject.next([...currentCart]);
    this.updateCartItemCount();
    this.saveCartToLocalStorage(); // Guardar en localStorage
  }

  async removeFromCart(itemId: string, selectedWeightId?: string) {
    const currentCart = this.cartItemsSubject.value;
    const itemIndex = currentCart.findIndex(item => item.productId === itemId && item.selectedWeight?.id === selectedWeightId);

    if (itemIndex > -1) {
      const item = currentCart[itemIndex];
      const product = await this.productService.getProductByIdSQLite(item.productId) ||
        await firstValueFrom(this.productService.getProductByIdAPI(item.productId));

      if (product) {
        await this.restoreStock(product, item.quantity, item.selectedWeight);
      }

      currentCart.splice(itemIndex, 1);
      this.cartItemsSubject.next([...currentCart]);
      this.updateCartItemCount();
      this.saveCartToLocalStorage(); // Guardar en localStorage
    }
  }

  async clearCart() {
    const currentCart = this.cartItemsSubject.value;

    for (const item of currentCart) {
      const product = await this.productService.getProductByIdSQLite(item.productId) ||
        await firstValueFrom(this.productService.getProductByIdAPI(item.productId));

      if (product) {
        await this.restoreStock(product, item.quantity, item.selectedWeight);
      }
    }

    this.cartItemsSubject.next([]);
    this.updateCartItemCount();
    localStorage.removeItem('cartItems'); // Limpiar el carrito de localStorage
    console.log("Carrito vaciado y stock restaurado para cada producto.");
  }

  async updateCartItemQuantity(item: CartItem, newQuantity: number) {
    const difference = newQuantity - item.quantity;

    const product = await this.productService.getProductByIdSQLite(item.productId) ||
      await firstValueFrom(this.productService.getProductByIdAPI(item.productId));

    if (product) {
      if (item.selectedWeight) {
        const weightOption = product.weightOptions?.find(w => w.id === item.selectedWeight?.id);
        if (weightOption) {
          if (newQuantity <= weightOption.stock + item.quantity) {
            weightOption.stock -= difference;
            await this.productService.updateWeightOptionSQLite(weightOption);
            if (await this.productService.isApiAvailable()) {
              await firstValueFrom(this.productService.updateWeightOptionAPI(weightOption));
            }
            item.quantity = newQuantity;
            item.total = item.quantity * item.weightPrice!;
          } else {
            console.warn('Cantidad excede el stock disponible para esta opción de peso.');
          }
        }
      } else {
        if (newQuantity <= product.stock + item.quantity) {
          product.stock -= difference;
          await this.productService.updateProductSQLite(product);
          if (await this.productService.isApiAvailable()) {
            await firstValueFrom(this.productService.updateProductAPI(product));
          }
          item.quantity = newQuantity;
          item.total = item.quantity * item.price;
        } else {
          console.warn('Cantidad excede el stock disponible del producto.');
        }
      }
      this.cartItemsSubject.next([...this.cartItemsSubject.value]);
      this.saveCartToLocalStorage(); // Guardar en localStorage después de actualizar la cantidad
    }
  }

  updateCartItem(updatedItem: CartItem) {
    const currentCart = this.cartItemsSubject.value;
    const itemIndex = currentCart.findIndex(item => item.productId === updatedItem.productId && item.selectedWeight?.id === updatedItem.selectedWeight?.id);

    if (itemIndex > -1) {
      currentCart[itemIndex] = updatedItem;
      this.cartItemsSubject.next([...currentCart]);
      this.saveCartToLocalStorage(); // Guardar en localStorage después de actualizar el item
    }
  }
}
