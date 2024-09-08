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

  logout() {
    this.autenticacionService.logout();
    this.navCtrl.navigateRoot('/welcome');
  }
}
