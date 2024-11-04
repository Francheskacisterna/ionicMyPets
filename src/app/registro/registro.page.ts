import { Component, AfterViewInit } from '@angular/core';
import { NavController, AlertController, AnimationController } from '@ionic/angular';
import { UserService, Usuario } from '../usuarios/user.service';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Network } from '@capacitor/network';

@Component({
  selector: 'app-registro',
  templateUrl: 'registro.page.html',
  styleUrls: ['registro.page.scss'],
})
export class RegistroPage implements AfterViewInit {
  registerForm: FormGroup;

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private animationCtrl: AnimationController,
    private userService: UserService,
    private formBuilder: FormBuilder
  ) {
    this.registerForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(6)]],  // Validación de mínimo 6 caracteres
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      fechaNacimiento: ['', [Validators.required, this.ageValidator]],  // Validador de edad
      sexo: ['', Validators.required]
    });
  }

  ngAfterViewInit() {
    this.animateFormEntrance();
  }

  // Validador personalizado para verificar si el usuario tiene al menos 18 años
  ageValidator(control: AbstractControl) {
    const birthDate = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();

    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      return { ageInvalid: true };
    }

    return age >= 18 ? null : { ageInvalid: true };
  }

  async registerUser() {
    if (this.registerForm.valid) {
      const fullName = this.registerForm.value.fullName;
      const password = this.registerForm.value.password;
      const email = this.registerForm.value.email;
      const fechaNacimiento = this.registerForm.value.fechaNacimiento;
      const sexo = this.registerForm.value.sexo;
  
      // Lógica de validación adicional para contraseñas
      if (password !== this.registerForm.value.confirmPassword) {
        await this.showAlert('Error', 'Las contraseñas no coinciden.');
        return;
      }
  
      const userData: Usuario = {
        nombre: fullName,
        contrasena: password,
        correo: email,
        fechaNacimiento: fechaNacimiento,
        sexo: sexo,
        rol: 'usuario', 
        synced: 0
      };

      try {
        // Guardar en SQLite primero
        await this.userService.addUsuarioSQLite(userData);
        console.log('Usuario añadido en SQLite.');
  
        // Verificar si hay conexión para intentar sincronizar con la API
        const status = await Network.getStatus();
        if (status.connected) {
          try {
            // Sincronizar el usuario con la API
            const addedUser = await firstValueFrom(this.userService.addUsuarioAPI(userData));
  
            // Si la API devuelve un ID válido, marcamos al usuario como sincronizado en SQLite
            if (addedUser && addedUser.id) {
              userData.id = addedUser.id.toString();
              userData.synced = 1;  // Marcar el usuario como sincronizado
  
              // Actualizar en SQLite para reflejar que ahora está sincronizado
              await this.userService.updateUsuarioSQLite(userData);
              console.log('Usuario sincronizado con la API y actualizado en SQLite.');
            } else {
              console.log('No se recibió un ID válido de la API.');
            }
          } catch (apiError) {
            console.error('Error al sincronizar con la API, usuario seguirá solo en SQLite:', apiError);
          }
        } else {
          console.log('No hay conexión a la API, el usuario se guardará solo en SQLite.');
        }
  
        // Mostrar el popup de éxito y redirigir
        this.showSuccessPopup();
        this.navigateToLogin();
        this.resetForm();
  
      } catch (error) {
        console.error('Error al registrar el usuario:', error);
        await this.showAlert('Error', 'Hubo un problema al registrar el usuario.');
      }
    } else {
      await this.showAlert('Formulario inválido', 'Por favor, completa todos los campos correctamente.');
    }
  }
  

  // Función para limpiar el formulario después de agregar un usuario
  resetForm() {
    this.registerForm.reset({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      fechaNacimiento: '',
      sexo: ''
    });
  }

  // Navegación a la página de login
  navigateToLogin() {
    this.navCtrl.navigateForward('/login');
  }

  // Navegación a la página de Home (esta es la función que faltaba)
  navigateToHome() {
    this.navCtrl.navigateForward('/home');
  }

  // Mostrar popup de éxito
  async showSuccessPopup() {
    const alert = await this.alertCtrl.create({
      header: 'Registro Exitoso',
      message: '¡Te has registrado correctamente!',
      buttons: ['OK'],
    });
    await alert.present();
  }

  // Mostrar alertas (esta es la función que faltaba)
  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Animación de entrada del formulario
  private animateFormEntrance() {
    const formElement = document.querySelector('.login-card');
    if (formElement) {
      const enterAnimation = this.animationCtrl
        .create()
        .addElement(formElement)
        .duration(500)
        .easing('ease-out')
        .fromTo('transform', 'translateY(100%)', 'translateY(0%)')
        .fromTo('opacity', 0, 1);

      enterAnimation.play();
    }
  }
}
