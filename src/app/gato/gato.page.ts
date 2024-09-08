import { Component, OnInit } from '@angular/core';

interface WeightOption {
  size: string;
  price: string;
}

interface Product {
  img: string;
  title: string;
  description: string;
  weights: WeightOption[];
  selectedWeight: WeightOption | null;
}

@Component({
  selector: 'app-gato',
  templateUrl: './gato.page.html',
  styleUrls: ['./gato.page.scss'],
})
export class GatoPage implements OnInit {
  products: Product[] = [
    {
      img: 'assets/images/gatos/britcare_catsterilized.webp',
      title: 'Britcare Cat Sterilized',
      description: 'Alimento para gatos esterilizados.',
      weights: [
        { size: '2 kg', price: '$15.990' },
        { size: '5 kg', price: '$39.990' },
        { size: '10 kg', price: '$74.990' }
      ],
      selectedWeight: null
    },
    {
      img: 'assets/images/gatos/britcare-haircare-cat.png',
      title: 'Britcare Haircare Cat',
      description: 'Alimento especializado para el cuidado del pelo.',
      weights: [
        { size: '1.5 kg', price: '$12.490' },
        { size: '5 kg', price: '$34.990' },
        { size: '10 kg', price: '$69.990' }
      ],
      selectedWeight: null
    },
    {
      img: 'assets/images/gatos/acana_adultcat.jpg',
      title: 'Acana Adult Cat',
      description: 'Comida para gatos adultos con ingredientes naturales.',
      weights: [
        { size: '2 kg', price: '$24.990' },
        { size: '6 kg', price: '$68.990' },
        { size: '11.4 kg', price: '$119.990' }
      ],
      selectedWeight: null
    },
    {
      img: 'assets/images/gatos/acana_indorcat.jpg',
      title: 'Acana Indoor Cat',
      description: 'Alimento para gatos que viven en interiores.',
      weights: [
        { size: '1.8 kg', price: '$19.990' },
        { size: '4.5 kg', price: '$49.990' },
        { size: '9 kg', price: '$99.990' }
      ],
      selectedWeight: null
    },
    {
      img: 'assets/images/gatos/acana_kitten.jpg',
      title: 'Acana Kitten',
      description: 'Alimento para gatitos, rico en nutrientes.',
      weights: [
        { size: '1.8 kg', price: '$19.990' },
        { size: '4.5 kg', price: '$49.990' },
        { size: '9 kg', price: '$99.990' }
      ],
      selectedWeight: null
    },
    {
      img: 'assets/images/gatos/acana_seniorcat.jpg',
      title: 'Acana Senior Cat',
      description: 'Comida para gatos mayores con ingredientes balanceados.',
      weights: [
        { size: '1.8 kg', price: '$19.990' },
        { size: '4.5 kg', price: '$49.990' },
        { size: '9 kg', price: '$99.990' }
      ],
      selectedWeight: null
    },
    {
      img: 'assets/images/gatos/acana-atlantic-cat.jpg',
      title: 'Acana Atlantic Cat',
      description: 'Alimento para gatos con pescado del Atlántico.',
      weights: [
        { size: '1.8 kg', price: '$19.990' },
        { size: '4.5 kg', price: '$49.990' },
        { size: '9 kg', price: '$99.990' }
      ],
      selectedWeight: null
    },
    {
      img: 'assets/images/gatos/bravery_cat__kitten_chicken.png',
      title: 'Bravery Kitten Chicken',
      description: 'Alimento para gatitos con sabor a pollo.',
      weights: [
        { size: '2 kg', price: '$14.990' },
        { size: '7 kg', price: '$49.990' },
        { size: '12 kg', price: '$79.990' }
      ],
      selectedWeight: null
    },
    {
      img: 'assets/images/gatos/bravery-gatoesterilize.jpg',
      title: 'Bravery Gato Esterilize',
      description: 'Alimento para gatos esterilizados.',
      weights: [
        { size: '2 kg', price: '$14.990' },
        { size: '7 kg', price: '$49.990' },
        { size: '12 kg', price: '$79.990' }
      ],
      selectedWeight: null
    },
    {
      img: 'assets/images/gatos/bravery-salmon-adult-cat.jpg',
      title: 'Bravery Salmon Adult Cat',
      description: 'Alimento para gatos adultos con salmón.',
      weights: [
        { size: '2 kg', price: '$16.990' },
        { size: '7 kg', price: '$54.990' },
        { size: '12 kg', price: '$84.990' }
      ],
      selectedWeight: null
    },
    {
      img: 'assets/images/gatos/Churu-pollo-variedades-atun.webp',
      title: 'Churu Pollo',
      description: 'Deliciosa comida húmeda para gatos.',
      weights: [
        { size: '70 g', price: '$2.990' },
        { size: '140 g', price: '$4.990' },
        { size: '210 g', price: '$7.990' }
      ],
      selectedWeight: null
    },
    {
      img: 'assets/images/gatos/comidahumeda-royalcanin.png',
      title: 'Royal Canin Comida Húmeda',
      description: 'Comida húmeda para gatos, de alta calidad.',
      weights: [
        { size: '85 g', price: '$3.490' },
        { size: '170 g', price: '$5.990' },
        { size: '340 g', price: '$9.990' }
      ],
      selectedWeight: null
    },
    {
      img: 'assets/images/gatos/Kitten-Pouch.jpg.webp',
      title: 'Royal Canin Kitten Pouch',
      description: 'Comida húmeda para gatitos en formato pouch.',
      weights: [
        { size: '85 g', price: '$3.490' },
        { size: '170 g', price: '$5.990' },
        { size: '340 g', price: '$9.990' }
      ],
      selectedWeight: null
    },
    {
      img: 'assets/images/gatos/royal-canin-kitten-.webp',
      title: 'Royal Canin Kitten',
      description: 'Alimento seco para gatitos.',
      weights: [
        { size: '2 kg', price: '$16.990' },
        { size: '4 kg', price: '$32.990' },
        { size: '10 kg', price: '$74.990' }
      ],
      selectedWeight: null
    },
    {
      img: 'assets/images/gatos/royal-canin-sensible.jpeg',
      title: 'Royal Canin Sensible',
      description: 'Alimento para gatos con digestión sensible.',
      weights: [
        { size: '2 kg', price: '$16.990' },
        { size: '4 kg', price: '$32.990' },
        { size: '10 kg', price: '$74.990' }
      ],
      selectedWeight: null
    },
    {
      img: 'assets/images/gatos/royalcanin-urinary.webp',
      title: 'Royal Canin Urinary',
      description: 'Alimento para la salud urinaria de los gatos.',
      weights: [
        { size: '2 kg', price: '$18.990' },
        { size: '4 kg', price: '$35.990' },
        { size: '10 kg', price: '$79.990' }
      ],
      selectedWeight: null
    }
  ];

  filteredProducts: Product[] = [];

  constructor() {}

  ngOnInit() {
    this.filteredProducts = [...this.products]; // Inicialmente muestra todos los productos
  }

  selectWeight(product: Product, weight: WeightOption) {
    product.selectedWeight = weight;
  }

  isSelected(product: Product, weight: WeightOption) {
    return product.selectedWeight === weight;
  }

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
      this.filteredProducts = [...this.products]; // Resetea a la orden original
    }
  }

  openFilter() {
    console.log('Filtrar');
  }
}
