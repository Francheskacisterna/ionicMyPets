import { Component, OnInit } from '@angular/core';

// Interfaz para las opciones de peso y precio de cada producto
interface WeightOption {
  size: string;
  price: string;
}

// Interfaz para los productos de la página
interface Product {
  img: string;
  title: string;
  description: string;
  weights: WeightOption[];
  selectedWeight: WeightOption | null;
  category: string;
  subcategory: string;
}

@Component({
  selector: 'app-ave',
  templateUrl: './ave.page.html',
  styleUrls: ['./ave.page.scss'],
})
export class AvePage implements OnInit {
  // Arreglo de productos que se mostrará en la página
  products: Product[] = [
    // Producto 1: Vitapol Barras para Inseparables
    {
      img: 'assets/images/aves/vitapol-barras-para-inseparables.jpg',
      title: 'Vitapol Barras para Inseparables',
      description: 'Barras de semillas naturales y frutas para inseparables. Proporciona nutrición balanceada y diversión.',
      weights: [
        { size: '100 g', price: '$3.990' },
        { size: '200 g', price: '$7.990' }
      ],
      category: 'Alimento',
      subcategory: 'Snacks',  // Cambiado para ser más corto
      selectedWeight: null
    },

    // Producto 2: Tropican Mantención Ninfa
    {
      img: 'assets/images/aves/tropican-mantencion-ninfa.jpg',
      title: 'Tropican Mantención Ninfa',
      description: 'Alimento premium para ninfas, enriquecido con vitaminas y minerales. Ideal para el mantenimiento diario.',
      weights: [
        { size: '500 g', price: '$8.990' },
        { size: '1 kg', price: '$15.990' }
      ],
      category: 'Alimento',
      subcategory: 'Ninfas',  // Cambiado para ser más corto
      selectedWeight: null
    },

    // Producto 3: Tropican Mezcla Crianza Aves
    {
      img: 'assets/images/aves/tropican-mezcla-crianza-aves.jpg',
      title: 'Tropican Mezcla Crianza Aves',
      description: 'Mezcla especializada para la cría de aves, rica en nutrientes esenciales para un desarrollo óptimo.',
      weights: [
        { size: '1 kg', price: '$18.990' },
        { size: '2 kg', price: '$34.990' }
      ],
      category: 'Alimento',
      subcategory: 'Cría',  // Cambiado para ser más corto
      selectedWeight: null
    },

    // Producto 4: Tropican High Performance Biscuits Loros
    {
      img: 'assets/images/aves/tropican-high-performance-biscuits-loros.jpg',
      title: 'Tropican High Performance Biscuits Loros',
      description: 'Barras ricas en proteínas para loros en crecimiento o altamente activos. Ayuda a mantener el rendimiento físico.',
      weights: [
        { size: '250 g', price: '$10.990' },
        { size: '500 g', price: '$18.990' }
      ],
      category: 'Alimento',
      subcategory: 'Loros',  // Cambiado para ser más corto
      selectedWeight: null
    },

    // Producto 5: Tropican Mantención Loros
    {
      img: 'assets/images/aves/tropican-mantencion-loros.jpg',
      title: 'Tropican Mantención Loros',
      description: 'Alimento completo para loros, formulado para el mantenimiento diario y balance adecuado de nutrientes.',
      weights: [
        { size: '1 kg', price: '$12.990' },
        { size: '3 kg', price: '$34.990' }
      ],
      category: 'Alimento',
      subcategory: 'Loros',  // Cambiado para ser más corto
      selectedWeight: null
    },

    // Producto 6: Tropican High Performance
    {
      img: 'assets/images/aves/tropican-high-performance.jpg',
      title: 'Tropican High Performance',
      description: 'Alimento alto en energía para aves reproductoras o en crecimiento. Favorece el desarrollo y la vitalidad.',
      weights: [
        { size: '500 g', price: '$9.990' },
        { size: '1.5 kg', price: '$26.990' }
      ],
      category: 'Alimento',
      subcategory: 'Alto Rendimiento',  // Cambiado para ser más corto
      selectedWeight: null
    },

    // Producto 7: Mazuri Large Bird
    {
      img: 'assets/images/aves/mazuri-large-bird.jpg',
      title: 'Mazuri Large Bird',
      description: 'Alimento especializado para aves grandes, proporciona todos los nutrientes esenciales para una dieta completa.',
      weights: [
        { size: '2 kg', price: '$29.990' },
        { size: '5 kg', price: '$59.990' }
      ],
      category: 'Alimento',
      subcategory: 'Aves Grandes',  // Cambiado para ser más corto
      selectedWeight: null
    }
  ];

  filteredProducts: Product[] = [];
  categories: string[] = ['Snacks', 'Ninfas', 'Cría', 'Loros', 'Alto Rendimiento', 'Aves Grandes'];

  selectedCategory: string = '';

  constructor() {}

  ngOnInit() {
    this.filteredProducts = [...this.products];  // Inicialmente se muestran todos los productos
  }

  // Método para seleccionar el peso de un producto
  selectWeight(product: Product, weight: WeightOption) {
    product.selectedWeight = weight;
  }

  // Método para verificar si un peso está seleccionado
  isSelected(product: Product, weight: WeightOption) {
    return product.selectedWeight === weight;
  }

  // Método para ordenar los productos según el valor seleccionado (precio ascendente/descendente)
  sortProducts(event: any) {
    const sortValue = event.detail.value;
    if (sortValue === 'price-asc') {
      this.filteredProducts.sort((a, b) => {
        const priceA = parseFloat(a.weights[0].price.replace('$', '').replace('.', ''));
        const priceB = parseFloat(b.weights[0].price.replace('$', '').replace('.', ''));
        return priceA - priceB;
      });
    } else if (sortValue === 'price-desc') {
      this.filteredProducts.sort((a, b) => {
        const priceA = parseFloat(a.weights[0].price.replace('$', '').replace('.', ''));
        const priceB = parseFloat(b.weights[0].price.replace('$', '').replace('.', ''));
        return priceB - priceA;
      });
    } else {
      this.filteredProducts = [...this.products];
    }
  }

  // Método para filtrar los productos por categoría
  filterByCategory() {
    if (this.selectedCategory) {
      this.filteredProducts = this.products.filter(product => product.subcategory === this.selectedCategory);
    } else {
      this.filteredProducts = [...this.products];
    }
  }

  // Método para abrir el filtro
  openFilter() {
    console.log('Filtrar');
  }
}
