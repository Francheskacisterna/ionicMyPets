import { Component, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ModalController, AnimationController } from '@ionic/angular';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
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


// Método para iniciar sesión con la API o SQLite
login() {
  if (this.loginForm.valid) {
    const { email, password } = this.loginForm.value;

    this.autenticacionService.login(email, password).then(isAuthenticated => {
      if (isAuthenticated) {
        // Recupera el nombre del usuario de localStorage
        const nombreUsuario = localStorage.getItem('userName') || 'Usuario';
        // Navega a la página de inicio pasando el nombre
        this.navCtrl.navigateForward('/home', {
          state: { nombreUsuario }  // Pasar nombreUsuario mediante Navigation Extras
        });
        this.loginForm.reset();
      } else {
        alert('Credenciales incorrectas. Inténtalo de nuevo.');
      }
    }).catch(error => {
      console.error('Error al iniciar sesión:', error);
      alert('Error al iniciar sesión. Por favor, inténtalo más tarde.');
    });
  } else {
    alert('Por favor, revisa los datos ingresados.');
  }
}


  async presentResetPasswordModal(event: Event) {
    event.preventDefault();
    const modal = await this.modalController.create({
      component: ResetPasswordComponent
    });
    return await modal.present();
  }

  navigateToHome() {
    this.navCtrl.navigateForward('/home');
  }
  

  navigateToRegister(event: Event) {
    event.preventDefault();
    this.navCtrl.navigateForward('/registro');
  }
}