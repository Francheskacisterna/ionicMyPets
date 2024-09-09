import { Component, OnInit } from '@angular/core';

// Interfaz para las opciones de peso y precio de cada producto

interface WeightOption {
  size: string;  
  price: string; 
}

// Interfaz para los productos de la página
interface Product {
  img: string;  // Ruta de la imagen
  title: string;  // Título del producto
  description: string;  // Descripción del producto
  weights: WeightOption[];  // Opciones de peso y precio
  selectedWeight: WeightOption | null;  // Peso seleccionado
  category: string;  // Nueva propiedad para la categoría del producto
  subcategory: string;  // Nueva propiedad para la subcategoría del producto
}

@Component({
  selector: 'app-perro',  // Nombre del selector de este componente
  templateUrl: './perro.page.html',  
  styleUrls: ['./perro.page.scss'],  
})
export class PerroPage implements OnInit {
  // Arreglo de productos que se mostrará en la página
  products: Product[] = [

    // Producto 1: Bravery Salmon Adult Large Breeds
    {
      img: 'assets/images/perros/bravery-salmon-adult-largemedium-breeds.jpg',
      title: 'Bravery Salmon Adult Large Breeds',
      description: 'Alimento hipoalergénico para perros adultos de razas grandes. Rico en Omega-3, DHA y EPA para la salud de la piel y el pelaje.',
      weights: [
        { size: '2 kg', price: '$18.990' },
        { size: '7 kg', price: '$49.990' },
        { size: '12 kg', price: '$64.990' }
      ],
      category: 'Alimento',
      subcategory: 'Alimento Seco',
      selectedWeight: null
    },

    // Producto 2: Bravery Iberian Pork Adult Large Breeds
    {
      img: 'assets/images/perros/bravery-iberian-pork-adult-large-breeds.jpg',
      title: 'Bravery Iberian Pork Adult Large Breeds',
      description: 'Alimento sin cereales para perros con carne de cerdo ibérico. Proporciona proteínas de alta calidad y es hipoalergénico.',
      weights: [
        { size: '2 kg', price: '$15.990' },
        { size: '7 kg', price: '$49.990' },
        { size: '12 kg', price: '$79.990' }
      ],
      category: 'Alimento',
      subcategory: 'Alimento Seco',
      selectedWeight: null
    },

    // Producto 3: Churu Perro Pollo Queso
    {
      img: 'assets/images/perros/churu-perro-pollo-queso.jpg',
      title: 'Churu Perro Pollo Queso',
      description: 'Comida húmeda para perros con pollo y queso. Rica en humedad para la hidratación del perro.',
      weights: [
        { size: '70 g', price: '$2.990' },
        { size: '140 g', price: '$4.990' },
        { size: '210 g', price: '$7.990' }
      ],
      category: 'Premios',
      subcategory: 'Snacks Saludables',
      selectedWeight: null
    },

    // Producto 4: Churu Perro Pollo
    {
      img: 'assets/images/perros/churu-perro-pollo.webp',
      title: 'Churu Perro Pollo',
      description: 'Comida húmeda para perros con sabor a pollo. Alta en humedad para favorecer la hidratación.',
      weights: [
        { size: '70 g', price: '$2.990' },
        { size: '140 g', price: '$4.990' },
        { size: '210 g', price: '$7.990' }
      ],
      category: 'Premios',
      subcategory: 'Snacks Saludables',
      selectedWeight: null
    },

    // Producto 5: Acana Dog Freshwater Recipe
    {
      img: 'assets/images/perros/acana-dog-freshwater-fish-recipe.jpg',
      title: 'Acana Dog Freshwater Recipe',
      description: 'Alimento natural para perros con ingredientes frescos como pescado. Libre de granos y rico en proteínas.',
      weights: [
        { size: '2 kg', price: '$24.990' },
        { size: '6 kg', price: '$68.990' },
        { size: '11.4 kg', price: '$119.990' }
      ],
      category: 'Alimento',
      subcategory: 'Alimento Natural',
      selectedWeight: null
    },

    // Producto 6: Royal Canin Mini Adult
    {
      img: 'assets/images/perros/maxi-puppy-royal-canin.jpg',
      title: 'Royal Canin Mini Adult',
      description: 'Alimento para perros adultos de razas pequeñas. Formulado para mantener la energía de perros activos.',
      weights: [
        { size: '2 kg', price: '$16.990' },
        { size: '4 kg', price: '$32.990' },
        { size: '10 kg', price: '$74.990' }
      ],
      category: 'Alimento',
      subcategory: 'Alimento Seco',
      selectedWeight: null
    },

    // Producto 7: Royal Canin Urinary Care
    {
      img: 'assets/images/perros/Royal_Canin_Alimento_Urinary_Perro.jpg',
      title: 'Royal Canin Urinary Care',
      description: 'Alimento para perros con problemas urinarios, formulado para mejorar la salud del tracto urinario.',
      weights: [
        { size: '2 kg', price: '$18.990' },
        { size: '4 kg', price: '$35.990' },
        { size: '10 kg', price: '$79.990' }
      ],
      category: 'Alimento',
      subcategory: 'Alimento Especializado',
      selectedWeight: null
    },

    // Producto 8: Churu Perro Pollo Salmón
    {
      img: 'assets/images/perros/churu-perro.pollo-salmon.jpeg',
      title: 'Churu Perro Pollo Salmón',
      description: 'Comida húmeda para perros con sabor a pollo y salmón. Ideal para perros exigentes.',
      weights: [
        { size: '70 g', price: '$2.990' },
        { size: '140 g', price: '$4.990' },
        { size: '210 g', price: '$7.990' }
      ],
      category: 'Premios',
      subcategory: 'Snacks Saludables',
      selectedWeight: null
    },

    // Producto 9: Acana Perro Light
    {
      img: 'assets/images/perros/acana-perro-light.webp',
      title: 'Acana Perro Light',
      description: 'Alimento para perros con sobrepeso o tendencia a ganar peso. Rico en proteínas y bajo en carbohidratos.',
      weights: [
        { size: '2 kg', price: '$19.990' },
        { size: '5 kg', price: '$49.990' },
        { size: '9 kg', price: '$99.990' }
      ],
      category: 'Alimento',
      subcategory: 'Alimento Perros Talla Grande',
      selectedWeight: null
    },

    // Producto 10: Brit Care Puppy Lamb & Rice
    {
      img: 'assets/images/perros/BRITcare-Puppy-Cordero-y-Arroz.webp',
      title: 'Brit Care Puppy Lamb & Rice',
      description: 'Alimento para cachorros con cordero y arroz. Ideal para cachorros con sensibilidades digestivas.',
      weights: [
        { size: '2 kg', price: '$15.990' },
        { size: '5 kg', price: '$39.990' },
        { size: '10 kg', price: '$74.990' }
      ],
      category: 'Alimento',
      subcategory: 'Alimento Perros Cachorros',
      selectedWeight: null
    },

    // Producto 11: Brit Care Adult Small Breed Lamb & Rice
    {
      img: 'assets/images/perros/brit-care-adult-small.jpg',
      title: 'Brit Care Adult Small Breed Lamb & Rice',
      description: 'Comida para perros pequeños con cordero y arroz. Alimento completo y equilibrado.',
      weights: [
        { size: '2 kg', price: '$15.990' },
        { size: '5 kg', price: '$39.990' },
        { size: '10 kg', price: '$74.990' }
      ],
      category: 'Alimento',
      subcategory: 'Alimento Seco',
      selectedWeight: null
    },

    // Producto 12: Brit Care Dog Adult Large Breed Salmon
    {
      img: 'assets/images/perros/brit-adulto-salmon-raza-grande-perro.jpg',
      title: 'Brit Care Dog Adult Large Breed Salmon',
      description: 'Alimento para perros adultos de razas grandes con salmón. Proporciona proteínas de alta calidad.',
      weights: [
        { size: '1.5 kg', price: '$12.490' },
        { size: '5 kg', price: '$34.990' },
        { size: '10 kg', price: '$69.990' }
      ],
      category: 'Alimento',
      subcategory: 'Alimento Seco',
      selectedWeight: null
    },


    // Producto 13: Brit Care Dog Hypoallergenic Puppy
    {
      img: 'assets/images/perros/Brit-Care-Dog-Hypoallergenic-Puppy.jpg',
      title: 'Brit Care Dog Hypoallergenic Puppy',
      description: 'Alimento hipoalergénico para cachorros. Ideal para perros con sensibilidad alimentaria.',
      weights: [
        { size: '1.5 kg', price: '$12.490' },
        { size: '5 kg', price: '$34.990' },
        { size: '10 kg', price: '$69.990' }
      ],
      category: 'Alimento',
      subcategory: 'Alimento Perros Cachorros',
      selectedWeight: null
    },

    // Producto 14: Brit Care Grain Free Puppy Salmon & Potato
    {
      img: 'assets/images/perros/Brit-Care-Puppy-Salmon-Patata.jpg',
      title: 'Brit Care Grain Free Puppy Salmon & Potato',
      description: 'Alimento sin granos para cachorros con salmón y papa, ideal para cachorros con sensibilidades digestivas.',
      weights: [
        { size: '1.5 kg', price: '$12.990' },
        { size: '5 kg', price: '$34.990' },
        { size: '10 kg', price: '$69.990' }
      ],
      category: 'Alimento',
      subcategory: 'Alimento Perros Cachorros',
      selectedWeight: null
    },

    // Producto 15: Royal Canin Adult Poodle
    {
      img: 'assets/images/perros/web-royal-canin-perro-poodle.jpg',
      title: 'Royal Canin Adult Poodle',
      description: 'Alimento formulado especialmente para perros de raza Poodle, mejorando la salud del pelaje y la digestión.',
      weights: [
        { size: '1.5 kg', price: '$13.490' },
        { size: '7 kg', price: '$55.990' },
        { size: '10 kg', price: '$79.990' }
      ],
      category: 'Alimento',
      subcategory: 'Alimento Seco',
      selectedWeight: null
    },

    // Producto 16: Bravery Puppy Chicken
    {
      img: 'assets/images/perros/bravery-chikecnpuppy.jpeg',
      title: 'Bravery Puppy Chicken',
      description: 'Alimento para cachorros con sabor a pollo, rico en proteínas y sin granos, ideal para su crecimiento.',
      weights: [
        { size: '2 kg', price: '$14.990' },
        { size: '7 kg', price: '$49.990' },
        { size: '12 kg', price: '$79.990' }
      ],
      category: 'Alimento',
      subcategory: 'Alimento Perros Cachorros',
      selectedWeight: null
    },

    // Producto 17: Acana Puppy Recipe
    {
      img: 'assets/images/perros/acana-puppy-junior-recipe.jpg',
      title: 'Acana Puppy Recipe',
      description: 'Alimento natural para cachorros, rico en nutrientes esenciales para un crecimiento saludable.',
      weights: [
        { size: '2 kg', price: '$19.990' },
        { size: '5 kg', price: '$49.990' },
        { size: '12 kg', price: '$99.990' }
      ],
      category: 'Alimento',
      subcategory: 'Alimento Perros Cachorros',
      selectedWeight: null
    }

  ];

// Arreglo de productos filtrados para mostrar en la página
  filteredProducts: Product[] = [];
  // Categorías disponibles para filtrar
  categories: string[] = ['Alimento Seco', 'Alimento Natural', 'Premios', 'Alimento Perros Cachorros', 'Alimento Perros Talla Grande'];

  // Variable para la categoría seleccionada
  selectedCategory: string = ''; 

  constructor() { }

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