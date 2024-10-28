import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService, Product, WeightOption } from '../product-service.service';  // Importar Product y WeightOption desde el servicio

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
})
export class ProductDetailPage implements OnInit {
  product: Product | undefined;
  weightOptions: WeightOption[] = [];  // Almacena las opciones de peso

  constructor(
    private router: Router,
    private productService: ProductService  // Inyectar el ProductService para obtener las opciones de peso
  ) {}

  ngOnInit() {
    // Obtener el producto desde el estado de navegación
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['product']) {
      this.product = navigation.extras.state['product'];
      this.loadWeightOptions();  // Cargar las opciones de peso para el producto
    } else {
      console.error('No se encontraron datos del producto en el estado de navegación');
    }
  }

  // Cargar las opciones de peso del producto desde SQLite o la API
  async loadWeightOptions() {
    if (this.product?.id) {
      // Obtener las opciones de peso desde SQLite
      this.weightOptions = await this.productService.getWeightOptionsByProductIdSQLite(this.product.id);
      console.log('Opciones de peso obtenidas:', this.weightOptions);
    }
  }

  // Función para regresar a la lista de productos
  goBackToList() {
    this.router.navigate(['/productos/product-list']);
  }
}
