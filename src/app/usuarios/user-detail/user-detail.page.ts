import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from '../user.service';  // Importa la interfaz Usuario

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.page.html',
  styleUrls: ['./user-detail.page.scss'],
})
export class UserDetailPage implements OnInit {
  usuario: Usuario | undefined;  // Aquí se almacena el usuario que recibes

  constructor(private router: Router) {
    // Obtener los datos del usuario desde el estado de navegación
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.usuario = navigation.extras.state['user'];  // Recibir el objeto usuario
    }
  }

  ngOnInit() {
    if (this.usuario) {
      console.log('Usuario recibido:', this.usuario);
    } else {
      console.error('No se recibieron datos del usuario.');
    }
  }

  // Función para regresar a la lista de usuarios
  goBackToList() {
    this.router.navigate(['/usuarios/user-list']);  // Regresar a la lista de usuarios
  }
}
