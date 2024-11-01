import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService, Product, WeightOption } from '../product-service.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
})
export class ProductDetailPage implements OnInit {
  product: Product | undefined;
  weightOptions: WeightOption[] = [];  // Aseguramos que tenga un valor predeterminado

  constructor(
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['product']) {
      this.product = navigation.extras.state['product'];
      this.loadWeightOptions();  // Cargar las opciones de peso para el producto
    } else {
      console.error('No se encontraron datos del producto en el estado de navegación');
    }
  }

  // Cargar las opciones de peso del producto desde la API o SQLite
  async loadWeightOptions() {
    if (this.product?.id) {
      const apiAvailable = await this.productService.isApiAvailable();
      if (apiAvailable) {
        try {
          const weightOptions = await this.productService.getWeightOptionsByProductIdAPI(this.product.id).toPromise();
          this.weightOptions = weightOptions || [];  // Asignar un array vacío si weightOptions es undefined
          console.log('Opciones de peso obtenidas de la API:', this.weightOptions);
        } catch (error) {
          console.error('Error al obtener opciones de peso desde la API:', error);
          await this.loadWeightOptionsFromSQLite();
        }
      } else {
        await this.loadWeightOptionsFromSQLite();
      }
    }
  }

  // Cargar las opciones de peso desde SQLite
  async loadWeightOptionsFromSQLite() {
    if (this.product?.id) {  // Aseguramos que id esté definido
      try {
        const weightOptions = await this.productService.getWeightOptionsByProductIdSQLite(this.product.id);
        this.weightOptions = weightOptions || [];  // Asegurar que weightOptions no sea undefined
        console.log('Opciones de peso obtenidas de SQLite:', this.weightOptions);
      } catch (error) {
        console.error('Error al obtener opciones de peso desde SQLite:', error);
      }
    }
  }

  // Función para regresar a la lista de productos
  goBackToList() {
    this.router.navigate(['/productos/product-list']);
  }
}