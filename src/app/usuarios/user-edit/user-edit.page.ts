import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';  
import { UserService, Usuario } from '../user.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.page.html',
  styleUrls: ['./user-edit.page.scss'],
})
export class UserEditPage implements OnInit {
  userForm: FormGroup;
  usuario: Usuario | undefined;  // Definir la variable para almacenar el usuario

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private alertController: AlertController
  ) {
    this.userForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['', Validators.required]
    });

    // Obtener el estado de la navegación con los datos del usuario
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['user']) {
      this.usuario = navigation.extras.state['user'];  // Aquí obtenemos los datos del usuario
    }
  }

  ngOnInit() {
    if (this.usuario) {
      // Asignar los datos del usuario al formulario si el usuario existe
      this.userForm.patchValue({
        nombre: this.usuario.nombre,
        contrasena: this.usuario.contrasena,
        rol: this.usuario.rol
      });
    } else {
      console.error('No se encontraron datos de usuario en el estado de navegación');
    }
  }

  // Función para guardar los cambios
  async saveChanges() {
    if (this.userForm.valid) {
      const updatedUser: Usuario = {
        id: this.usuario?.id,  // Mantener el ID del usuario original
        ...this.userForm.value
      };

      try {
        // Actualizar en SQLite
        await this.userService.updateUsuarioSQLite(updatedUser);
        console.log(`Usuario con ID ${this.usuario?.id} actualizado en SQLite`);

        // Intentar actualizar en la API si hay conexión
        if (navigator.onLine) {
          await this.userService.updateUsuarioAPI(updatedUser).toPromise();
          console.log(`Usuario con ID ${this.usuario?.id} actualizado en la API`);
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
    this.router.navigate(['/usuarios/user-all']);  // Volver a la lista de usuarios
  }
}
