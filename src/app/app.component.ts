import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AutenticacionService } from './autenticacion.service'; 
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  showMenu: boolean = true;
  isAuthenticated: boolean = false; // Mantén un estado local para el menú
  isSearchBarVisible: boolean = false; // Controla la visibilidad de la barra de búsqueda
  searchQuery: string = ''; // Término de búsqueda actual
  items: string[] = ['Gatos', 'Perros', 'Aves', 'Comida para perros', 'Juguetes para gatos']; // Lista de productos
  filteredItems: string[] = []; // Elementos filtrados que se muestran al buscar

  private authSubscription: Subscription;

  constructor(
    private navCtrl: NavController,
    private autenticacionService: AutenticacionService,
    private router: Router
  ) {
    this.authSubscription = this.autenticacionService.isAuthenticated().subscribe(auth => {
      this.isAuthenticated = auth;
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateMenuVisibility(event.url);
      }
    });

    // Inicializa los ítems filtrados para que coincidan con todos los productos
    this.filteredItems = [...this.items];
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
