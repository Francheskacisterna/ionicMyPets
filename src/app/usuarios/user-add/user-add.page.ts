import { Component, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, Usuario } from '../user.service';
import { AlertController } from '@ionic/angular';  // Para mostrar mensajes de alerta
import { Network } from '@capacitor/network';  // Importar Network

@Component({
  selector: 'app-user-add',
  templateUrl: './user-add.page.html',
  styleUrls: ['./user-add.page.scss'],
})
export class UserAddPage {
  userForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private alertController: AlertController,  // Para mostrar alertas
    private ngZone: NgZone  // Inyectar NgZone para actualizar la UI de inmediato
  ) {
    // Inicializamos el formulario con validadores
    this.userForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['', Validators.required],  // Selector de rol
    });
  }

  // Guardar el usuario en la base de datos local (SQLite) o la API si está conectado
  async addUser() {
    if (this.userForm.valid) {
      const userData: Usuario = {
        ...this.userForm.value,
        id: undefined,  // Si en algún momento agregas un ID manualmente, asegúrate de que sea string
        synced: 0  // Por defecto, marcamos el usuario como no sincronizado
      };

      try {
        // Obtener el estado de la red
        const status = await Network.getStatus();

        // Añadir el usuario al servicio (SQLite o API según disponibilidad de red)
        if (status.connected) {
          // Si hay conexión, intentar sincronizar inmediatamente con la API
          await this.userService.addUsuario(userData);
          console.log('Usuario añadido y sincronizado con éxito a la API.');
        } else {
          // Si no hay conexión, guardar localmente en SQLite y marcar como no sincronizado
          await this.userService.addUsuarioSQLite(userData);
          console.log('Usuario añadido localmente en SQLite (sin sincronización).');
        }

        // Obtener la lista actualizada de usuarios y actualizar la interfaz antes de navegar
        const usuariosActualizados = await this.userService.getUsuariosSQLite();
        console.log('Usuarios actualizados:', usuariosActualizados);

        // Forzar la recarga manual de la lista de usuarios
        this.router.navigateByUrl('/usuarios/user-list', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/usuarios/user-all']);  // Redirigir a la lista de usuarios
        });

        // Mostrar un mensaje de éxito
        await this.showAlert('Éxito', 'Usuario añadido correctamente.');
        this.resetForm();  // Limpiar el formulario después de agregar el usuario

      } catch (error) {
        console.error('Error al agregar el usuario:', error);
        // Mostrar un mensaje de error
        await this.showAlert('Error', 'Hubo un problema al añadir el usuario.');
      }
    } else {
      console.log('Formulario inválido');
      await this.showAlert('Formulario inválido', 'Por favor, completa todos los campos correctamente.');
    }
  }

  // Función para limpiar el formulario después de agregar un usuario
  resetForm() {
    this.userForm.reset({
      nombre: '',
      contrasena: '',
      rol: ''  // Aseguramos que el rol también se restablezca
    });
  }

  // Función para mostrar una alerta
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Función para redirigir a la lista de usuarios
  goToUserAll() {
    this.router.navigate(['/usuarios/user-all']);
  }
}
