import { Component, AfterViewInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AnimationController } from '@ionic/angular'; // Importamos el AnimationController

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements AfterViewInit {

  constructor(private navCtrl: NavController, private animationCtrl: AnimationController) {}

  // Animación para el botón de "INICIAR"
  ngAfterViewInit() {
    const loginButton = document.querySelector('.login-button'); // Seleccionamos el botón
    if (loginButton) {
      const loginButtonAnimation = this.animationCtrl
        .create()
        .addElement(loginButton) // Solo aplica la animación si el botón existe
        .duration(1000) // Duración de la animación
        .fromTo('transform', 'translateY(100px)', 'translateY(0px)') // Movimiento de abajo hacia arriba
        .fromTo('opacity', '0', '1'); // Cambiamos la opacidad de 0 a 1

      loginButtonAnimation.play(); // Reproducimos la animación
    }
  }

  // Métodos para la navegación
  navigateToLogin() {
    this.navCtrl.navigateForward('/login');
  }

  navigateToHome() {
    this.navCtrl.navigateForward('/home');
  }
}
