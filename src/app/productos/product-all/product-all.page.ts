import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-all',
  templateUrl: './product-all.page.html',
  styleUrls: ['./product-all.page.scss'],
})
export class ProductAllPage implements OnInit {

  constructor(private router: Router) {}

  ngOnInit() {
    // Cargar la página sin mostrar la lista de productos al inicio.
  }

  // Función para redirigir a la lista de productos
  goToProductList() {
    this.router.navigate(['/productos/product-list']);
  }

  // Función para redirigir a la página de agregar producto
  addProduct() {
    this.router.navigate(['/productos/product-add']);
  }
}
