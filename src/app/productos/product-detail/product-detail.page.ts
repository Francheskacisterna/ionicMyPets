import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // Importar Router
import { ProductService, Product } from '../product-service.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
})
export class ProductDetailPage implements OnInit {
  product: Product | undefined;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router // Inyectar el Router para navegación
  ) {}

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id'); // Obtener el ID de la URL
    if (productId) {
      this.loadProduct(parseInt(productId));
    }
  }

  async loadProduct(id: number) {
    const products = await this.productService.getProductsSQLite(); // Obtener los productos desde SQLite
    this.product = products.find(product => product.id === id); // Buscar el producto por ID
  }

  // Función para regresar a la lista de productos
  goBackToList() {
    this.router.navigate(['/productos/product-list']); // Navegar a la lista de productos
  }
}
