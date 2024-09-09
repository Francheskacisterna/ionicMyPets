import { Component, AfterViewInit } from '@angular/core';
import { NavController, AlertController, AnimationController } from '@ionic/angular';
import * as $ from 'jquery'; // Importando jQuery

@Component({
  selector: 'app-registro',
  templateUrl: 'registro.page.html',
  styleUrls: ['registro.page.scss'],
})
export class RegistroPage implements AfterViewInit {

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController, // Para el popup de éxito
    private animationCtrl: AnimationController // Para las animaciones
  ) {}

  // Validaciones jQuery después de que la vista ha sido inicializada
  ngAfterViewInit() {
    this.animateFormEntrance(); // Llamada a la animación cuando la vista es inicializada

    $('#registerForm').submit((e: JQuery.Event) => { // Especificar el tipo de `e`
      const fullName = $('#fullName').val();
      const password = $('#password').val();
      const confirmPassword = $('#confirmPassword').val();

      // Validar nombre completo
      if (!this.validateFullName(fullName as string)) {
        alert('Por favor, ingresa un nombre completo válido (nombre y apellido).');
        e.preventDefault(); // Evitar envío del formulario
      }

      // Validar que las contraseñas coincidan
      if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden.');
        e.preventDefault(); // Evitar envío del formulario
      }

      // Validar contraseña según las reglas de negocio
      if (!this.validatePassword(password as string)) {
        alert('La contraseña debe tener al menos 4 números, 3 caracteres alfabéticos y 1 mayúscula.');
        e.preventDefault(); // Evitar envío del formulario
      }

      const email = $('#email').val();
      if (!this.validateEmail(email as string)) {
        alert('Por favor, ingresa un correo electrónico válido.');
        e.preventDefault(); // Evitar envío del formulario
      }

      // Si pasa todas las validaciones, mostrar popup de éxito
      if (this.validateFullName(fullName as string) && this.validatePassword(password as string)) {
        this.showSuccessPopup();
      }
    });
  }

  // Validación del nombre completo (mínimo un nombre y un apellido)
  validateFullName(fullName: string) {
    return fullName.trim().split(' ').length >= 2; // Verifica que haya al menos un espacio
  }

  // Validación de contraseña: mínimo 4 números, 3 letras, 1 mayúscula
  validatePassword(password: string) {
    const numberPattern = /[0-9]{4,}/;
    const letterPattern = /[a-zA-Z]{3,}/;
    const upperCasePattern = /[A-Z]/;

    return numberPattern.test(password) && letterPattern.test(password) && upperCasePattern.test(password);
  }

  // Validación del correo electrónico
  validateEmail(email: string) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
    return re.test(String(email).toLowerCase());
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

  // Método para registrar al usuario
  register() {
    console.log('Formulario enviado correctamente.');
  }

  // Navegación hacia la página de login
  navigateToLogin(event: Event) {
    event.preventDefault();
    this.navCtrl.navigateForward('/login');
  }
  
  navigateToHome() {
    this.navCtrl.navigateForward('/home');
  }
}