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
      // Cargar usuarios desde SQLite
      const localUsuarios = await this.userService.getUsuariosSQLite();
      console.log('Usuarios locales obtenidos de SQLite:', localUsuarios);

      this.ngZone.run(() => {
        this.usuarios = localUsuarios;
        this.filteredUsuarios = localUsuarios;  // Asegurarte de que filteredUsuarios también se inicialice
      });

      // Verificar si hay conexión
      if (navigator.onLine) {
        this.userService.getUsuariosAPI().subscribe(
          apiUsuarios => {
            this.ngZone.run(() => {
              if (apiUsuarios && apiUsuarios.length > 0) {
                // Filtrar usuarios de la API que no estén en SQLite para evitar duplicación
                const usuariosNoDuplicados = apiUsuarios.filter(apiUsuario =>
                  !this.usuarios.some(localUsuario => localUsuario.id === apiUsuario.id)
                );

                // Combinar usuarios locales con los de la API sin duplicar
                this.usuarios = [...this.usuarios, ...usuariosNoDuplicados];
                this.filteredUsuarios = this.usuarios;  // Actualiza filteredUsuarios
                console.log('Usuarios combinados (sin duplicados):', this.usuarios);
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
  async deleteUser(id: string | undefined) {  // Cambiamos a string
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
              const userIdString = id.toString();  // Convertimos el id a string

              // Proceder a eliminar el usuario de SQLite primero
              await this.userService.deleteUsuarioSQLite(userIdString);
              console.log(`Usuario con ID ${userIdString} eliminado de SQLite`);

              // Verificar si hay conexión para intentar eliminar de la API
              if (navigator.onLine) {
                try {
                  const result = await firstValueFrom(this.userService.deleteUsuarioAPI(userIdString));
                  if (!result) {
                    throw new Error('Falló la eliminación en la API');
                  }
                  console.log(`Usuario con ID ${userIdString} eliminado de la API`);
                } catch (apiError) {
                  console.error('Error al eliminar usuario de la API:', apiError);
                }
              } else {
                console.log('No hay conexión a la red, no se puede eliminar de la API');
              }

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
  editUser(usuario: Usuario) {
    if (usuario.id) {  // Asegúrate de que usuario.id esté definido
      this.router.navigate(['/usuarios/user-edit'], {
        state: { user: usuario }  // Pasar el objeto usuario completo como estado de navegación
      });
    } else {
      console.error('ID de usuario no válido');
    }
  }


  // Función para navegar a los detalles del usuario usando NavigationExtras
  goToUserDetail(usuario: Usuario) {
    this.router.navigate(['/usuarios/user-detail'], {
      state: { user: usuario }  // Pasar el usuario completo en el estado de navegación
    });
  }

  // Función para navegar a la página de agregar usuario
  goToAddUser() {
    this.router.navigate(['/usuarios/user-add']);
  }



  // Función para redirigir a la página 'user-all'
  goToUserAll() {
    this.router.navigate(['/usuarios/user-all']);
  }
}
