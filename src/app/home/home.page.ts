// home.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  nombreUsuario: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();

    // Intenta obtener `nombreUsuario` desde `state`
    if (navigation?.extras?.state?.['nombreUsuario']) {
      this.nombreUsuario = navigation.extras.state['nombreUsuario'];
    } else {
      // Si `nombreUsuario` no está en `state`, lo obtenemos de `localStorage`
      this.nombreUsuario = localStorage.getItem('userName') || 'Usuario';
    }
  }
}
