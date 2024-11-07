import { Component, OnInit } from '@angular/core';
import { CartService, CartItem } from '../cart.service';
import { ProductService, Product } from '../../productos/product-service.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';  // Importa el Router para navegación
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-carrito-list',
  templateUrl: './carrito-list.page.html',
  styleUrls: ['./carrito-list.page.scss'],
})
export class CarritoListPage implements OnInit {
  products: Product[] = [];
  cartItems: CartItem[] = [];
  cartTotal: number = 0;

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private alertController: AlertController,
    private router: Router  // Inyecta el Router
  ) { }

  async ngOnInit() {
    const apiAvailable = await this.productService.isApiAvailable();
    if (apiAvailable) {
      this.productService.getProductsAPI().subscribe(products => {
        this.products = products;
      });
    } else {
      this.products = await this.productService.getProductsSQLite();
    }

    // Actualiza el carrito y calcula el total cuando cambia
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.cartTotal = this.calculateTotal(); // Calcula el total al actualizar el carrito
    });
  }

  calculateTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.total, 0);
  }

  async addToCart(product: Product) {
    const alert = await this.alertController.create({
      header: `Añadir ${product.nombre} al carrito`,
      inputs: [
        {
          name: 'quantity',
          type: 'number',
          min: 1,
          max: product.stock,
          placeholder: 'Cantidad',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Añadir',
          handler: async (data) => {
            const quantity = parseInt(data.quantity, 10);
            if (quantity > 0) {
              await this.cartService.addToCart(product, quantity, product.selectedWeight);
            } else {
              console.warn('Cantidad no válida.');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async editCartItemQuantity(item: CartItem) {
    const alert = await this.alertController.create({
      header: `Editar cantidad de ${item.productName}`,
      inputs: [
        {
          name: 'quantity',
          type: 'number',
          value: item.quantity,
          min: 1,
          placeholder: 'Nueva cantidad',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Actualizar',
          handler: async (data) => {
            const newQuantity = parseInt(data.quantity, 10);
            if (newQuantity > 0 && newQuantity !== item.quantity) {
              const difference = newQuantity - item.quantity;

              // Actualiza la cantidad en el carrito y recalcula el total
              item.quantity = newQuantity;
              item.total = newQuantity * item.price;

              // Actualizar el stock en el servicio de carrito (aumenta o disminuye)
              if (item.selectedWeight) {
                item.selectedWeight.stock -= difference;
                await this.productService.updateWeightOptionSQLite(item.selectedWeight);
                await firstValueFrom(this.productService.updateWeightOptionAPI(item.selectedWeight));
              } else {
                const product = await this.productService.getProductByIdSQLite(item.productId);
                if (product) {
                  product.stock -= difference;
                  await this.productService.updateProductSQLite(product);
                  await firstValueFrom(this.productService.updateProductAPI(product));
                }
              }

              // Actualizar el carrito en el servicio
              this.cartService.updateCartItem(item);
              // Llama a updateCartItemCount para actualizar el contador en la cabecera
              this.cartService['updateCartItemCount']();

            }
          },
        },
      ],
    });

    await alert.present();
  }

  async removeFromCart(item: CartItem) {
    await this.cartService.removeFromCart(item.productId, item.selectedWeight?.id);
  }

  async clearCart() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que deseas vaciar el carrito?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Vaciar',
          handler: async () => {
            await this.cartService.clearCart();
          },
        },
      ],
    });

    await alert.present();
  }

  // Función para redirigir a la página de agregar pedido
  goToPedidoAdd() {
    this.router.navigate(['/pedidos/pedido-add']);
  }
}
