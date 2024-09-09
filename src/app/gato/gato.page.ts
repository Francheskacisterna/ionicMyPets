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
  weights: WeightOption[];  // Opciones de peso y precio
  selectedWeight: WeightOption | null;  // Peso seleccionado
  category: string;  
  subcategory: string;  
}

@Component({
  selector: 'app-gato',
  templateUrl: './gato.page.html',
  styleUrls: ['./gato.page.scss'],
})
export class GatoPage implements OnInit {
  products: Product[] = [
// Producto 1: Britcare Cat Sterilized
  {
    img: 'assets/images/gatos/britcare_catsterilized.webp',
    title: 'Britcare Cat Sterilized',
    description: 'Alimento hipoalergénico para gatos esterilizados. Favorece el control del peso y el sistema urinario.',
    weights: [
      { size: '2 kg', price: '$15.990' },
      { size: '5 kg', price: '$39.990' },
      { size: '10 kg', price: '$74.990' }
    ],
    category: 'Alimento',
    subcategory: 'Alimento Seco',
    selectedWeight: null
  },

  // Producto 2: Britcare Haircare Cat
  {
    img: 'assets/images/gatos/britcare-haircare-cat.png',
    title: 'Britcare Haircare Cat',
    description: 'Alimento especializado para el cuidado del pelaje de gatos adultos. Rico en Omega-3 y Omega-6.',
    weights: [
      { size: '1.5 kg', price: '$12.490' },
      { size: '5 kg', price: '$34.990' },
      { size: '10 kg', price: '$69.990' }
    ],
    category: 'Alimento',
    subcategory: 'Alimento Natural',
    selectedWeight: null
  },

  // Producto 3: Acana Adult Cat
  {
    img: 'assets/images/gatos/acana_adultcat.jpg',
    title: 'Acana Adult Cat',
    description: 'Alimento natural para gatos adultos. Hecho con ingredientes frescos, ideal para una dieta equilibrada.',
    weights: [
      { size: '2 kg', price: '$24.990' },
      { size: '6 kg', price: '$68.990' },
      { size: '11.4 kg', price: '$119.990' }
    ],
    category: 'Alimento',
    subcategory: 'Alimento Seco',
    selectedWeight: null
  },

  // Producto 4: Acana Indoor Cat
  {
    img: 'assets/images/gatos/acana_indorcat.jpg',
    title: 'Acana Indoor Cat',
    description: 'Alimento formulado para gatos que viven en interiores. Ayuda a controlar el peso y las bolas de pelo.',
    weights: [
      { size: '1.8 kg', price: '$19.990' },
      { size: '4.5 kg', price: '$49.990' },
      { size: '9 kg', price: '$99.990' }
    ],
    category: 'Alimento',
    subcategory: 'Alimento Seco',
    selectedWeight: null
  },

  // Producto 5: Acana Kitten
  {
    img: 'assets/images/gatos/acana_kitten.jpg',
    title: 'Acana Kitten',
    description: 'Alimento natural para gatitos, diseñado para apoyar su crecimiento saludable con ingredientes frescos.',
    weights: [
      { size: '1.8 kg', price: '$19.990' },
      { size: '4.5 kg', price: '$49.990' },
      { size: '9 kg', price: '$99.990' }
    ],
    category: 'Alimento',
    subcategory: 'Alimento Gatos Cachorros',
    selectedWeight: null
  },

  // Producto 6: Acana Senior Cat
  {
    img: 'assets/images/gatos/acana_seniorcat.jpg',
    title: 'Acana Senior Cat',
    description: 'Alimento natural para gatos mayores. Proporciona los nutrientes necesarios para una vida saludable.',
    weights: [
      { size: '1.8 kg', price: '$19.990' },
      { size: '4.5 kg', price: '$49.990' },
      { size: '9 kg', price: '$99.990' }
    ],
    category: 'Alimento',
    subcategory: 'Alimento Gatos Mayores',
    selectedWeight: null
  },

  // Producto 7: Acana Atlantic Cat
  {
    img: 'assets/images/gatos/acana-atlantic-cat.jpg',
    title: 'Acana Atlantic Cat',
    description: 'Alimento rico en proteínas provenientes del pescado del Atlántico, ideal para gatos adultos.',
    weights: [
      { size: '1.8 kg', price: '$19.990' },
      { size: '4.5 kg', price: '$49.990' },
      { size: '9 kg', price: '$99.990' }
    ],
    category: 'Alimento',
    subcategory: 'Alimento Seco',
    selectedWeight: null
  },

  // Producto 8: Bravery Kitten Chicken
  {
    img: 'assets/images/gatos/bravery_cat__kitten_chicken.png',
    title: 'Bravery Kitten Chicken',
    description: 'Alimento natural para gatitos con sabor a pollo, ideal para un crecimiento saludable.',
    weights: [
      { size: '2 kg', price: '$14.990' },
      { size: '7 kg', price: '$49.990' },
      { size: '12 kg', price: '$79.990' }
    ],
    category: 'Alimento',
    subcategory: 'Alimento Gatos Cachorros',
    selectedWeight: null
  },

  // Producto 9: Bravery Gato Esterilize
  {
    img: 'assets/images/gatos/bravery-gatoesterilize.jpg',
    title: 'Bravery Gato Esterilize',
    description: 'Alimento hipoalergénico para gatos esterilizados. Ayuda a controlar el peso y el sistema digestivo.',
    weights: [
      { size: '2 kg', price: '$14.990' },
      { size: '7 kg', price: '$49.990' },
      { size: '12 kg', price: '$79.990' }
    ],
    category: 'Alimento',
    subcategory: 'Alimento Seco',
    selectedWeight: null
  },

  // Producto 10: Bravery Salmon Adult Cat
  {
    img: 'assets/images/gatos/bravery-salmon-adult-cat.jpg',
    title: 'Bravery Salmon Adult Cat',
    description: 'Alimento para gatos adultos con salmón, rico en proteínas y Omega-3 para una piel y pelaje saludables.',
    weights: [
      { size: '2 kg', price: '$16.990' },
      { size: '7 kg', price: '$54.990' },
      { size: '12 kg', price: '$84.990' }
    ],
    category: 'Alimento',
    subcategory: 'Alimento Seco',
    selectedWeight: null
  },

  // Producto 11: Churu Pollo
  {
    img: 'assets/images/gatos/Churu-pollo-variedades-atun.webp',
    title: 'Churu Pollo',
    description: 'Comida húmeda para gatos con delicioso sabor a pollo, ideal como premio o suplemento alimenticio.',
    weights: [
      { size: '70 g', price: '$2.990' },
      { size: '140 g', price: '$4.990' },
      { size: '210 g', price: '$7.990' }
    ],
    category: 'Premios',
    subcategory: 'Snacks Saludables',
    selectedWeight: null
  },

  // Producto 12: Royal Canin Comida Húmeda
  {
    img: 'assets/images/gatos/comidahumeda-royalcanin.png',
    title: 'Royal Canin Comida Húmeda',
    description: 'Comida húmeda de alta calidad para gatos adultos, que ayuda a mantener una hidratación adecuada.',
    weights: [
      { size: '85 g', price: '$3.490' },
      { size: '170 g', price: '$5.990' },
      { size: '340 g', price: '$9.990' }
    ],
    category: 'Premios',
    subcategory: 'Snacks Saludables',
    selectedWeight: null
  },

  // Producto 13: Royal Canin Kitten Pouch
  {
    img: 'assets/images/gatos/Kitten-Pouch.jpg.webp',
    title: 'Royal Canin Kitten Pouch',
    description: 'Comida húmeda para gatitos, en formato pouch. Rica en nutrientes esenciales para un crecimiento saludable.',
    weights: [
      { size: '85 g', price: '$3.490' },
      { size: '170 g', price: '$5.990' },
      { size: '340 g', price: '$9.990' }
    ],
    category: 'Premios',
    subcategory: 'Snacks Saludables',
    selectedWeight: null
  },

  // Producto 14: Royal Canin Kitten
  {
    img: 'assets/images/gatos/royal-canin-kitten-.webp',
    title: 'Royal Canin Kitten',
    description: 'Alimento seco para gatitos, diseñado para fortalecer su sistema inmunológico y apoyar su desarrollo.',
    weights: [
      { size: '2 kg', price: '$16.990' },
      { size: '4 kg', price: '$32.990' },
      { size: '10 kg', price: '$74.990' }
    ],
    category: 'Alimento',
    subcategory: 'Alimento Gatos Cachorros',
    selectedWeight: null
  },

  // Producto 15: Royal Canin Sensible
  {
    img: 'assets/images/gatos/royal-canin-sensible.jpeg',
    title: 'Royal Canin Sensible',
    description: 'Alimento para gatos con digestión sensible, formulado para mejorar la salud digestiva y el bienestar.',
    weights: [
      { size: '2 kg', price: '$16.990' },
      { size: '4 kg', price: '$32.990' },
      { size: '10 kg', price: '$74.990' }
    ],
    category: 'Alimento',
    subcategory: 'Alimento Especializado',
    selectedWeight: null
  },

  // Producto 16: Royal Canin Urinary
  {
    img: 'assets/images/gatos/royalcanin-urinary.webp',
    title: 'Royal Canin Urinary',
    description: 'Alimento especializado en la salud urinaria de los gatos, ayuda a reducir el riesgo de cálculos urinarios.',
    weights: [
      { size: '2 kg', price: '$18.990' },
      { size: '4 kg', price: '$35.990' },
      { size: '10 kg', price: '$79.990' }
    ],
    category: 'Alimento',
    subcategory: 'Alimento Especializado',
    selectedWeight: null
  }
];

  // Arreglo de productos filtrados para mostrar en la página
  filteredProducts: Product[] = [];

  // Categorías disponibles para filtrar
  categories: string[] = ['Alimento Seco', 'Alimento Natural', 'Premios', 'Alimento Gatos Cachorros', 'Alimento Gatos Mayores'];

  // Variable para la categoría seleccionada
  selectedCategory: string = '';

  constructor() {}

  ngOnInit() {
    this.filteredProducts = [...this.products];  // Inicialmente se muestran todos los productos
  }

  // Método para seleccionar el peso de un producto
  selectWeight(product: Product, weight: WeightOption) {
    product.selectedWeight = weight;  // Establece el peso seleccionado para el producto
  }

  // Método para verificar si un peso está seleccionado
  isSelected(product: Product, weight: WeightOption) {
    return product.selectedWeight === weight;  // Devuelve true si el peso está seleccionado
  }

  // Método para ordenar los productos según el valor seleccionado (precio ascendente/descendente)
  sortProducts(event: any) {
    const sortValue = event.detail.value;
    if (sortValue === 'price-asc') {
      // Ordena los productos por precio ascendente
      this.filteredProducts.sort((a, b) => {
        const priceA = parseFloat(a.weights[0].price.replace('$', '').replace('.', ''));
        const priceB = parseFloat(b.weights[0].price.replace('$', '').replace('.', ''));
        return priceA - priceB;
      });
    } else if (sortValue === 'price-desc') {
      // Ordena los productos por precio descendente
      this.filteredProducts.sort((a, b) => {
        const priceA = parseFloat(a.weights[0].price.replace('$', '').replace('.', ''));
        const priceB = parseFloat(b.weights[0].price.replace('$', '').replace('.', ''));
        return priceB - priceA;
      });
    } else {
      // Restablece el orden original de los productos
      this.filteredProducts = [...this.products];
    }
  }

  // Método para filtrar los productos por categoría
  filterByCategory() {
    if (this.selectedCategory) {
      this.filteredProducts = this.products.filter(product => product.subcategory === this.selectedCategory);
    } else {
      // Si no hay categoría seleccionada, mostrar todos los productos
      this.filteredProducts = [...this.products];
    }
  }

  // Método para abrir el filtro (no implementado)
  openFilter() {
    console.log('Filtrar');
  }
}
