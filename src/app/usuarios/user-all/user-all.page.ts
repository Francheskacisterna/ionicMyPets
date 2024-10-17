import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-all',
  templateUrl: './user-all.page.html',
  styleUrls: ['./user-all.page.scss'],
})
export class UserAllPage implements OnInit {

  constructor(private router: Router) {}

  ngOnInit() {}

  // Función para redirigir a la lista de usuarios
  goToUserList() {
    this.router.navigate(['/usuarios/user-list']);
  }

  // Función para redirigir a la página de agregar usuario
  addUser() {
    this.router.navigate(['/usuarios/user-add']);
  }
}
