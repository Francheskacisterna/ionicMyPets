import { Component, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ModalController, AnimationController } from '@ionic/angular';
import { ResetPasswordComponent } from '../reset-password/reset-password.component'; // Llamado al componente de reset de contraseña
import { AutenticacionService } from '../autenticacion.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements AfterViewInit {
  loginForm: FormGroup;

  constructor(
    private navCtrl: NavController,
    private formBuilder: FormBuilder,
    private modalController: ModalController, 
    private autenticacionService: AutenticacionService,
    private animationCtrl: AnimationController
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[A-Z]).{8,}$')
      ]]
    });
  }

  // Implementación de animaciones en AfterViewInit
  ngAfterViewInit() {
    this.applyAnimations();
  }

  applyAnimations() {
    const loginCardElement = document.querySelector('.login-card');
    if (loginCardElement) {
      const formAnimation = this.animationCtrl
        .create()
        .addElement(loginCardElement)
        .duration(1000)
        .fromTo('opacity', '0', '1')
        .fromTo('transform', 'translateY(50px)', 'translateY(0px)');
      formAnimation.play();
    }

    const loginButtonElement = document.querySelector('.login-button');
    if (loginButtonElement) {
      const buttonAnimation = this.animationCtrl
        .create()
        .addElement(loginButtonElement)
        .duration(800)
        .fromTo('transform', 'scale(0.8)', 'scale(1)')
        .fromTo('opacity', '0', '1');
      buttonAnimation.play();
    }
  }

  // Método para iniciar sesión
  login() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      console.log('Email:', email);
      console.log('Password:', password);

      if (email === 'fr.cisternap@duocuc.cl' && password === 'Domi.3007') {
        this.autenticacionService.login();
        const nombreUsuario = 'Francheska Cisterna'; 
        this.navCtrl.navigateForward('/home', {
          queryParams: { nombreUsuario } // Pasando el nombre del usuario como parámetro
        });
        this.loginForm.reset();
      } else {
        alert('Credenciales incorrectas. Inténtalo de nuevo.');
      }
    } else {
      alert('Por favor, revisa los datos ingresados.');
    }
  }

  // Método para abrir el modal de reset de contraseña
  async presentResetPasswordModal(event: Event) {
    event.preventDefault(); // Evita el comportamiento por defecto del enlace
    const modal = await this.modalController.create({
      component: ResetPasswordComponent // Llamamos al componente que se usará en el modal
    });
    return await modal.present();
  }

  // Método para ir a la página de registro
  navigateToRegister(event: Event) {
    event.preventDefault(); // Evita el comportamiento por defecto del enlace
    this.navCtrl.navigateForward('/registro'); // Navegación a la página de registro
  }

  // Método para navegar a la página de inicio (home)
  navigateToHome() {
    this.navCtrl.navigateForward('/home'); // Navegación a la página de inicio
  }
}
