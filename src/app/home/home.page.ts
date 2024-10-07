import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  data: any = {}; // Inicializar como un objeto vacío

  constructor(
    private router: Router,
    private activeroute: ActivatedRoute
  ) {
    this.activeroute.queryParams.subscribe(params => {
      const navigation = this.router.getCurrentNavigation();
      if (navigation && navigation.extras.state && navigation.extras.state) {
        this.data = navigation.extras.state;

        // Validar que el usuario y la contraseña existan
        if (this.data.user && this.data.user.usuario && this.data.user.password) {
          console.log(this.data.user); // Usuario completo
          console.log(this.data.user.usuario); // Nombre de usuario
          console.log(this.data.user.password); // Contraseña
        } else {
          console.log('Datos de usuario no válidos o incompletos');
        }
      }
    });
  }

  ngOnInit() {}
}
