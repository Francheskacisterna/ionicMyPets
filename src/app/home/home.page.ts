import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  nombreUsuario: string = '';

  constructor(private navCtrl: NavController, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params: any) => {
      if (params && params.nombreUsuario) {
        this.nombreUsuario = params.nombreUsuario;
      } else {
        this.nombreUsuario = 'Usuario';
      }
    });
  }
  

  // Métodos para la navegación
  navigateToHome() {
    this.navCtrl.navigateForward('/home');
  }

  navigateToLogin() {
    this.navCtrl.navigateForward('/login');
  }
}
