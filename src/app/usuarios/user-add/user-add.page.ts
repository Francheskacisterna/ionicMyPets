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
  today: string;

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
      confirmarContrasena: ['', Validators.required],
      rol: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      fechaNacimiento: ['', [Validators.required, this.ageValidator]],  // Nuevo campo con validador de edad
      sexo: ['', Validators.required]
    }, { validators: this.passwordMatchValidator }); // Agregamos el validador personalizado

    // Configura la fecha de hoy en formato YYYY-MM-DD
    const todayDate = new Date();
    this.today = todayDate.getFullYear() + '-' +
                 String(todayDate.getMonth() + 1).padStart(2, '0') + '-' +
                 String(todayDate.getDate()).padStart(2, '0');
  }

    // Validador personalizado para verificar que las contraseñas coincidan
    passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
      const password = group.get('contrasena')?.value;
      const confirmPassword = group.get('confirmarContrasena')?.value;
      return password === confirmPassword ? null : { passwordMismatch: true };
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
        id: undefined,
        synced: 0
      };

      try {
        const status = await Network.getStatus();
        if (status.connected) {
          await this.userService.addUsuario(userData);
          console.log('Usuario añadido y sincronizado con éxito a la API.');
        } else {
          await this.userService.addUsuarioSQLite(userData);
          console.log('Usuario añadido localmente en SQLite (sin sincronización).');
        }

        await this.showAlert('Éxito', 'Usuario añadido correctamente.');
        this.resetForm();

        // Redirigir directamente a la lista de usuarios
        this.router.navigate(['/usuarios/user-list']);

      } catch (error) {
        console.error('Error al agregar el usuario:', error);
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
      rol: '',
      correo: '',
      fechaNacimiento: new Date().toISOString(),  // Establece la fecha de hoy como valor predeterminado
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
    this.router.navigate(['/usuarios/user-list']);
  }
}
