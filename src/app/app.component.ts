import { Component, OnDestroy } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AutenticacionService } from './autenticacion.service'; 
import { CartService } from './carrito/cart.service'; // Ajusta la ruta correcta al servicio de carrito
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';
import { HttpClient } from '@angular/common/http';
import { ProductService } from './productos/product-service.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnDestroy {
  showMenu: boolean = true;
  isAuthenticated: boolean = false; 
  userRole: string | null = null; // Rol del usuario
  isSearchBarVisible: boolean = false;
  searchQuery: string = ''; 
  items: string[] = ['Gatos', 'Perros', 'Aves', 'Comida para perros', 'Juguetes para gatos'];
  locationName: string = '';
  filteredItems: string[] = [];
  cartItemCount: number = 0;  

  private authSubscription: Subscription;
  private cartSubscription: Subscription; // Declara cartSubscription

  constructor(
    private navCtrl: NavController,
    private autenticacionService: AutenticacionService,
    private cartService: CartService, // Asegura que CartService esté inyectado
    private router: Router,
    private http: HttpClient,
    private productService: ProductService
  ) {
    // Suscribirse al estado de autenticación para obtener el rol del usuario
    this.authSubscription = this.autenticacionService.isAuthenticated().subscribe(auth => {
      this.isAuthenticated = auth;
      this.userRole = this.autenticacionService.getUserRole(); // Obtiene el rol del usuario
    });

    // Suscribirse al contador de artículos en el carrito
    this.cartSubscription = this.cartService.cartItemCount$.subscribe((count: number) => {
      this.cartItemCount = count; // Actualiza el contador en la interfaz
    });

    // Actualizar visibilidad del menú según la ruta
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateMenuVisibility(event.url);
      }
    });

    // Inicializar ítems de búsqueda
    this.filteredItems = [...this.items];
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  // Actualiza la visibilidad del menú basado en la ruta actual
  updateMenuVisibility(url: string) {
    if (url === '/login' || url === '/welcome' || url === '/registro') {
      this.showMenu = false;
    } else {
      this.showMenu = true;
    }
  }

  // Métodos de navegación
  navigateToHome() {
    this.navCtrl.navigateForward('/home');
  }

  navigateToLogin() {
    this.navCtrl.navigateForward('/login');
  }

  navigateToRegister() {
    this.navCtrl.navigateForward('/registro');
  }

  navigateToGato() {
    this.navCtrl.navigateForward('/gato');
  }

  navigateToPerro() {
    this.navCtrl.navigateForward('/perro');
  }

  navigateToAve() {
    this.navCtrl.navigateForward('/ave');
  }

  navigateToCarrito() {
    this.navCtrl.navigateForward('/carrito/carrito-list');
  }

  navigateToCartList() {
    this.router.navigate(['/carrito/carrito-list']);
  }

  
  // Cerrar sesión y restablecer rol
  logout() {
    this.autenticacionService.logout();
    this.navCtrl.navigateRoot('/welcome');
    this.userRole = null;
  }

  // Navegación a "Agregar Productos" basada en rol
  navigateToProductAll() {
    if (this.userRole === 'empleado' || this.userRole === 'administrador') {
      this.navCtrl.navigateForward('/productos/product-all');
    } else {
      alert('Acceso denegado: Se requiere rol de empleado o administrador.');
    }
  }
  
    navigateToProductAdd() {
      if (this.userRole === 'empleado' || this.userRole === 'administrador') {
        this.navCtrl.navigateForward('/productos/product-add');
      } else {
        alert('Acceso denegado: Se requiere rol de empleado o administrador.');
      }
    }
  

  // Navegación a "Lista de Usuarios" basada en rol
  navigateToUserAll() {
    if (this.userRole === 'administrador') {
      this.navCtrl.navigateForward('/usuarios/user-all');
    } else {
      alert('Acceso denegado: Se requiere rol de administrador.');
    }
  }


  // Alterna la visibilidad de la barra de búsqueda
  toggleSearch() {
    this.isSearchBarVisible = !this.isSearchBarVisible;
  }

  // Filtra los ítems de búsqueda
  filterItems(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredItems = searchTerm ? this.items.filter(item => item.toLowerCase().includes(searchTerm)) : [...this.items];
  }

  // Obtiene la ubicación actual
// Convierte coordenadas a dirección usando la API de Google

reverseGeocode(lat: number, lon: number) {
  const apiKey = 'AIzaSyAeNurybimBeUIkl8wlulTalWbuxUmM2io';
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`;
  
  console.log('Haciendo llamada a la API de geocodificación inversa:', url); // Verifica la URL completa
  
  this.http.get(url).subscribe(
    (response: any) => {
      console.log('Respuesta de la API de geocodificación:', response); // Muestra la respuesta de la API
      if (response.status === 'OK' && response.results.length > 0) {
        this.locationName = response.results[0].formatted_address;
        console.log('Dirección encontrada:', this.locationName); // Verifica si locationName se actualiza
        this.mostrarUbicacion(); // Llama a mostrarUbicacion() para mostrar la ubicación en la app
      } else {
        console.error('No se encontró una dirección para estas coordenadas.');
        this.locationName = 'Dirección no disponible';
        this.mostrarUbicacion(); // Llama a mostrarUbicacion() en caso de error
      }
    },
    error => {
      console.error('Error al obtener la dirección:', error);
      this.locationName = 'Dirección no disponible';
      this.mostrarUbicacion(); // Llama a mostrarUbicacion() en caso de error
    }
  );
}

// Obtiene la ubicación actual
async getCurrentPosition() {
  try {
    console.log("Intentando obtener la ubicación...");
    const coordinates = await Geolocation.getCurrentPosition();
    console.log("Coordenadas obtenidas:", JSON.stringify(coordinates, null, 2));
    this.reverseGeocode(coordinates.coords.latitude, coordinates.coords.longitude);
  } catch (error) {
    console.error('Error al obtener la ubicación:', error);
    this.locationName = 'Ubicación no disponible';
  }
}

mostrarUbicacion() {
  if (this.locationName) {
    alert(`Ubicación: ${this.locationName}`);
  } else {
    alert('Ubicación no disponible');
  }
}

  uploadImage(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const timestamp = Date.now();
      const customFileName = `img-${timestamp}.jpg`;  // Nombre más corto con extensión fija
      
      // Crear solo el nombre de archivo
      const formData = new FormData();
      formData.append('image', new File([file], customFileName));
  
      // Guardar solo el nombre del archivo en la API
      this.http.post('http://10.0.2.2:3000/productos', {
        imagen: customFileName,  // Solo el nombre, no el contenido base64
        nombre: "yyyy",
        descripcion: "yyyy",
        precio: 3333,
        stock: 3333,
        categoria: "gato"
      }).subscribe(response => {
        console.log('Nombre de imagen guardado en json-server:', response);
        this.productService.addImageNameToSQLite(customFileName)
          .then(() => {
            console.log('Imagen guardada en SQLite');
          })
          .catch(error => {
            console.error('Error al guardar en SQLite:', error);
          });
      });
    } else {
      console.error('No se seleccionó ningún archivo');
    }
  }
}  
