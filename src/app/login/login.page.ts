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

  // Implementación de animaciones en AfterViewInit
  ngAfterViewInit() {
    this.applyAnimations();
  }

  applyAnimations() {
    // Seleccionar el elemento .login-card y verificar si existe
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

    // Seleccionar el elemento .login-button y verificar si existe
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

  login() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      console.log('Email:', email);
      console.log('Password:', password);

      if (email === 'fr.cisternap@duocuc.cl' && password === 'Domi.3007') {
        this.autenticacionService.login(); 
        const nombreUsuario = 'Francheska Cisterna'; 
        this.navCtrl.navigateForward('/home', {
          queryParams: { nombreUsuario }
        });
        this.loginForm.reset();
      } else {
        alert('Credenciales incorrectas. Inténtalo de nuevo.');
      }
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

  navigateToRegister(event: Event) {
    event.preventDefault();
    this.navCtrl.navigateForward('/registro'); 
  }
}
