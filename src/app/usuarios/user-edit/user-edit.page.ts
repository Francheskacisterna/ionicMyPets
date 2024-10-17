import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';  
import { UserService, Usuario } from '../user.service';
import { AlertController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { Network } from '@capacitor/network';  // Importar Network

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.page.html',
  styleUrls: ['./user-edit.page.scss'],
})
export class UserEditPage implements OnInit {
  userForm: FormGroup;
  usuarioId: number = 0;  // Inicializar usuarioId con un valor por defecto
  originalUsuario: Usuario = { nombre: '', contrasena: '', rol: '' };  // Inicializar con un objeto vacío
  usuario: Usuario = { nombre: '', contrasena: '', rol: '' };  // Definir usuario

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private userService: UserService,  // Corregir nombre del servicio
    private router: Router,
    private alertController: AlertController
  ) {
    this.userForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.usuarioId = Number(this.route.snapshot.paramMap.get('id'));  // Obtener el ID del usuario desde la URL
    console.log('Usuario ID:', this.usuarioId);  // Verifica si el usuarioId se obtiene correctamente
    this.loadUser(this.usuarioId);  // Pasar usuarioId como argumento
  }
  
  
// Cargar usuario desde SQLite o la API
async loadUser(id: number) {
  try {
    const status = await Network.getStatus();
    
    if (status.connected) {
      // Intentar obtener el usuario desde la API si hay conexión
      console.log('Conexión a internet disponible, intentando cargar desde la API...');
      const usuario = await firstValueFrom(this.userService.getUsuarioByIdAPI(id));

      if (usuario && usuario.id) {
        console.log('Usuario obtenido de la API:', usuario);

        // Asignar los datos obtenidos al formulario
        this.userForm.patchValue({
          nombre: usuario.nombre,
          contrasena: usuario.contrasena,
          rol: usuario.rol
        });

        console.log('Formulario después de patchValue (API):', this.userForm.value);
        return;  // Salir de la función si se obtiene el usuario de la API
      } else {
        console.error('Usuario no encontrado en la API con ID:', id);
      }
    } else {
      console.log('No hay conexión a internet, cargando desde SQLite...');
    }
  } catch (error) {
    console.error('Error al obtener el usuario desde la API:', error);
  }

  // Si no se pudo cargar desde la API, intentar cargar desde SQLite
  try {
    const usuarios = await this.userService.getUsuariosSQLite();
    console.log('Usuarios obtenidos de SQLite:', usuarios);
    
    const usuario = usuarios.find(u => u.id === id);
    
    if (usuario) {
      console.log('Usuario encontrado en SQLite:', usuario);

      // Asignar los datos obtenidos al formulario
      this.userForm.patchValue({
        nombre: usuario.nombre,
        contrasena: usuario.contrasena,
        rol: usuario.rol
      });

      console.log('Formulario después de patchValue (SQLite):', this.userForm.value);
    } else {
      console.error('Usuario no encontrado en SQLite con ID:', id);
    }
  } catch (error) {
    console.error('Error al obtener el usuario desde SQLite:', error);
  }
}
  
  // Función para guardar los cambios
  async saveChanges() {
    if (this.userForm.valid) {
      const updatedUser: Usuario = {
        id: this.usuarioId,
        ...this.userForm.value
      };

      try {
        // Actualizar en SQLite
        await this.userService.updateUsuarioSQLite(updatedUser);
        console.log(`Usuario con ID ${this.usuarioId} actualizado en SQLite`);

        // Intentar actualizar en la API si hay conexión
        if (navigator.onLine) {
          await firstValueFrom(this.userService.updateUsuarioAPI(updatedUser));
          console.log(`Usuario con ID ${this.usuarioId} actualizado en la API`);
        }

        // Mostrar alerta de éxito y volver a la lista de usuarios
        const alert = await this.alertController.create({
          header: 'Éxito',
          message: 'Usuario actualizado correctamente.',
          buttons: ['OK']
        });
        await alert.present();

        this.router.navigate(['/usuarios/user-list']);  // Volver a la lista de usuarios
      } catch (error) {
        console.error('Error al actualizar usuario:', error);
      }
    } else {
      console.log('Formulario inválido');
    }
  }

  // Función para cancelar los cambios y volver a la lista
  cancelChanges() {
    this.userForm.patchValue(this.originalUsuario);  // Restaurar los datos originales
    this.router.navigate(['/usuarios/user-all']);  // Volver a la lista de usuarios
  }
}
