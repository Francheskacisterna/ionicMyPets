import { Component, OnInit, NgZone } from '@angular/core';
import { UserService, Usuario } from '../user.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.page.html',
  styleUrls: ['./user-list.page.scss'],
})
export class UserListPage implements OnInit {
  usuarios: Usuario[] = [];
  filteredUsuarios: Usuario[] = [];  // Definir la lista filtrada
  filterTerm: string = '';  // Definir el término de búsqueda

  constructor(
    private userService: UserService,
    private router: Router,
    private alertController: AlertController,
    private ngZone: NgZone  // Inyectar NgZone aquí
  ) { }

  ngOnInit() {
    // Este método queda vacío si la carga se maneja en ionViewWillEnter
  }

  ionViewWillEnter() {
    this.loadUsuarios(); // Asegurarse de cargar usuarios cada vez que se entra a la vista
  }

  async loadUsuarios() {
    try {
      const localUsuarios = await this.userService.getUsuariosSQLite();
      console.log('Usuarios locales obtenidos de SQLite:', localUsuarios);
  
      this.ngZone.run(() => {
        this.usuarios = localUsuarios;
        this.filteredUsuarios = localUsuarios;  // Asegúrate de que filteredUsuarios también se inicialice
      });
  
      if (navigator.onLine) {
        this.userService.getUsuariosAPI().subscribe(
          apiUsuarios => {
            this.ngZone.run(() => {
              if (apiUsuarios && apiUsuarios.length > 0) {
                this.usuarios = [...localUsuarios, ...apiUsuarios];
                this.filteredUsuarios = this.usuarios;  // También actualiza filteredUsuarios
                console.log('Usuarios combinados:', this.usuarios);
              } else {
                this.usuarios = localUsuarios;
                this.filteredUsuarios = localUsuarios;
                console.log('Solo mostrando usuarios locales:', this.usuarios);
              }
            });
          },
          error => {
            console.error('Error obteniendo usuarios de la API:', error);
            this.ngZone.run(() => {
              this.usuarios = localUsuarios;
              this.filteredUsuarios = localUsuarios;  // También aquí, asegúrate de actualizar filteredUsuarios
            });
          }
        );
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  }
  
    // Función para filtrar los usuarios
    filterUsers(event: any) {
      const searchTerm = event.target.value?.toLowerCase();
      if (searchTerm && searchTerm.trim() !== '') {
        this.filteredUsuarios = this.usuarios.filter(usuario =>
          usuario.nombre.toLowerCase().includes(searchTerm)
        );
      } else {
        this.filteredUsuarios = this.usuarios;  // Mostrar todos si no hay filtro
      }
    }

  // Función para eliminar un usuario
  async deleteUser(id: number | undefined) {
    if (id === undefined) {
      console.error('El ID del usuario es indefinido.');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que deseas eliminar este usuario?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Eliminación cancelada');
          },
        },
        {
          text: 'Eliminar',
          handler: async () => {
            try {
              // Verificar estado de la red antes de intentar eliminar en la API
              if (navigator.onLine) {
                const result = await firstValueFrom(this.userService.deleteUsuarioAPI(id));
                if (!result) {
                  throw new Error('Falló la eliminación en la API');
                }
                console.log(`Usuario con ID ${id} eliminado de la API`);
              } else {
                console.log('No hay conexión a la red, no se puede eliminar de la API');
              }

              // Proceder a eliminar el usuario de SQLite
              await this.userService.deleteUsuarioSQLite(id);
              console.log(`Usuario con ID ${id} eliminado de SQLite`);

              // Recargar la lista de usuarios
              this.loadUsuarios();
            } catch (error) {
              console.error('Error al eliminar usuario:', error);
            }
          },
        },
      ],
    });

    await alert.present();
  }


  // Función para navegar a la página de edición de usuario
  editUser(userId: number | undefined) {
    if (userId === undefined) {
      console.error('El ID del usuario es indefinido.');
      return;
    }
    this.router.navigate(['/usuarios/user-edit', userId]);
  }

  // Función para navegar a los detalles del usuario
  goToUserDetail(id: number) {
    this.router.navigate(['/usuarios/user-detail', id]);  // Navegar a la página de detalles del usuario
  }

    // Función para redirigir a la página 'user-all'
    goToUserAll() {
      this.router.navigate(['/usuarios/user-all']);
    }
  

}
