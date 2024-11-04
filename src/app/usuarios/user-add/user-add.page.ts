import { Component, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, Usuario } from '../user.service';
import { AlertController } from '@ionic/angular';
import { Network } from '@capacitor/network';

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
    private alertController: AlertController,
  ) {
    // Inicializamos el formulario con validadores
    this.userForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(6)]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      fechaNacimiento: ['', [Validators.required, this.ageValidator]],  // Nuevo campo con validador de edad
      sexo: ['', Validators.required]
    });
  }

  // Validación personalizada para verificar si el usuario es mayor de 18 años
  ageValidator(control: AbstractControl): ValidationErrors | null {
    const birthDate = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    // Ajustar edad si la fecha actual es antes del cumpleaños de este año
    const adjustedAge = monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0) ? age : age - 1;

    return adjustedAge >= 18 ? null : { ageInvalid: true };
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
      rol: '',  // Aseguramos que el rol también se restablezca
      correo: '',
      fechaNacimiento: '',
      sexo: ''
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
