import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';  // Para obtener el ID y navegar
import { UserService, Usuario } from '../user.service';  // Importar el servicio de usuarios
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.page.html',
  styleUrls: ['./user-detail.page.scss'],
})
export class UserDetailPage implements OnInit {
  usuario: Usuario | undefined;  // Definir la variable para almacenar los detalles del usuario

  constructor(
    private route: ActivatedRoute,  // Para obtener el ID de la URL
    private userService: UserService,  // El servicio de usuarios
    private router: Router  // Para navegar a otras páginas
  ) {}

  ngOnInit() {
    const usuarioId = this.route.snapshot.paramMap.get('id');  // Obtener el ID del usuario de la URL
    if (usuarioId) {
      this.loadUser(parseInt(usuarioId));  // Cargar el usuario con el ID obtenido
    }
  }

  // Función para cargar el usuario desde SQLite

  async loadUser(id: number) {
    try {
      // Intentar cargar el usuario desde SQLite primero
      const usuariosSQLite = await this.userService.getUsuariosSQLite();  // Obtener todos los usuarios de SQLite
      this.usuario = usuariosSQLite.find(usuario => usuario.id === id);  // Buscar el usuario por su ID en SQLite
  
      if (this.usuario) {
        console.log(`Usuario encontrado en SQLite:`, this.usuario);
      } else {
        // Si el usuario no se encuentra en SQLite, intentar obtenerlo desde la API
        console.log(`Usuario no encontrado en SQLite, buscando en API...`);
        this.usuario = await firstValueFrom(this.userService.getUsuarioByIdAPI(id));  // Obtener el usuario desde la API
  
        if (this.usuario) {
          console.log(`Usuario encontrado en la API:`, this.usuario);
        } else {
          console.error(`No se encontró el usuario con ID ${id} ni en SQLite ni en la API`);
        }
      }
    } catch (error) {
      console.error(`Error al cargar el usuario con ID ${id}:`, error);
    }
  }
  

  // Función para regresar a la lista de usuarios
  goBackToList() {
    this.router.navigate(['/usuarios/user-all']);  // Navegar a la lista de usuarios
  }
}
