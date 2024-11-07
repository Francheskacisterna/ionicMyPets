import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartItem } from '../cart.service';  // Importa la interfaz CartItem

@Component({
  selector: 'app-carrito-detail',
  templateUrl: './carrito-detail.page.html',
  styleUrls: ['./carrito-detail.page.scss'],
})
export class CarritoDetailPage implements OnInit {
  cartItem: CartItem | undefined;  // Aquí se almacena el producto que recibes

  constructor(private router: Router) {
    // Obtener los datos del producto desde el estado de navegación
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.cartItem = navigation.extras.state['cartItem'];  // Recibir el objeto cartItem
    }
  }

  ngOnInit() {
    if (this.cartItem) {
      console.log('Producto en el carrito recibido:', this.cartItem);
    } else {
      console.error('No se recibieron datos del producto en el carrito.');
    }
  }

  // Función para regresar a la lista del carrito
  goBackToList() {
    this.router.navigate(['/carrito/carrito-list']);  // Regresar a la lista del carrito
  }
}
