import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AutenticacionService } from './autenticacion.service'; 
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';  // Importar HttpClient
import { Subscription } from 'rxjs';
import { ProductService } from './productos/product-service.service';  // Importar el servicio de productos

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  showMenu: boolean = true;
  isAuthenticated: boolean = false; 
  isSearchBarVisible: boolean = false;
  searchQuery: string = ''; 
  items: string[] = ['Gatos', 'Perros', 'Aves', 'Comida para perros', 'Juguetes para gatos'];
  filteredItems: string[] = []; 

  private authSubscription: Subscription;
  private apiUrl: string = 'http://10.0.2.2:3000';  // URL base de la API

  constructor(
    private navCtrl: NavController,
    private autenticacionService: AutenticacionService,
    private router: Router,
    private productService: ProductService,
    private http: HttpClient  // Inyectar HttpClient
  ) {
    // Suscribirse al estado de autenticación
    this.authSubscription = this.autenticacionService.isAuthenticated().subscribe(auth => {
      this.isAuthenticated = auth;
    });

    // Suscribirse a los eventos de navegación para actualizar la visibilidad del menú
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateMenuVisibility(event.url);
      }
    });

    // Inicializa los ítems filtrados para que coincidan con todos los productos
    this.filteredItems = [...this.items];
  }

  // Método para comprobar el estado de la API
  checkApiStatus(): Promise<boolean> {
    return this.http.get(`${this.apiUrl}/status`, { observe: 'response' })  // Usar la URL base de la API
      .toPromise()
      .then((response: any) => {
        return response.status === 200;  // Si la API responde con 200 OK, está accesible
      })
      .catch((error: any) => {
        console.error('Error al verificar la API:', error);
        return false;
      });
  }

  // Desuscribirse cuando el componente se destruye
  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  // Actualiza la visibilidad del menú basado en la autenticación y la ruta
  updateMenuVisibility(url: string) {
    if (url === '/login' || url === '/welcome' || url === '/registro') {
      this.showMenu = false;
    } else {
      this.showMenu = true;
    }
  }

  // Navegación
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

  logout() {
    this.autenticacionService.logout();
    this.navCtrl.navigateRoot('/welcome');
  }

  navigateToProductAdd() {
    this.navCtrl.navigateForward('/productos/product-add');
  }

  // Funcionalidad de búsqueda
  toggleSearch() {
    this.isSearchBarVisible = !this.isSearchBarVisible; // Alternar visibilidad de la barra de búsqueda
  }

  filterItems(event: any) {
    const searchTerm = event.target.value.toLowerCase();

    if (searchTerm && searchTerm.trim() !== '') {
      this.filteredItems = this.items.filter(item => {
        return item.toLowerCase().includes(searchTerm);
      });
    } else {
      // Si no hay búsqueda, mostrar todos los ítems
      this.filteredItems = [...this.items];
    }
  }
}
