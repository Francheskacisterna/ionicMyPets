import { Component } from '@angular/core';
import { ModalController, AlertController, AnimationController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;

  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private animationCtrl: AnimationController // Inyectamos el AnimationController
  ) {
    this.resetPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  // Aplicar animación al abrir el modal directamente en el ciclo de vida
  ionViewWillEnter() {
    this.animateModalEntrance();
  }

  // Animación para la entrada del modal
  private animateModalEntrance() {
    const modalElement = document.querySelector('.modal-content');
    if (modalElement) {
      const enterAnimation = this.animationCtrl
        .create()
        .addElement(modalElement)
        .duration(400) // Cambiamos la duración a 400ms para que sea más rápida
        .easing('ease-out')
        .fromTo('transform', 'translateY(100%)', 'translateY(0%)')
        .fromTo('opacity', 0, 1);

      enterAnimation.play();
    }
  }

  dismissModal() {
    const modalElement = document.querySelector('.modal-content');
    if (modalElement) {
      const exitAnimation = this.animationCtrl
        .create()
        .addElement(modalElement)
        .duration(400) // La animación de salida tiene la misma duración que la de entrada
        .easing('ease-in')
        .fromTo('transform', 'translateY(0%)', 'translateY(100%)')
        .fromTo('opacity', 1, 0);

      // Espera a que la animación termine antes de cerrar el modal
      exitAnimation.play().then(() => {
        this.modalCtrl.dismiss();
      });
    }
  }

  async recoverPassword() {
    const email = this.resetPasswordForm.get('email')?.value ?? '';
    if (email) {
      console.log('Correo para recuperación:', email);
      // Aquí va la lógica para enviar el correo

      this.dismissModal();
      await this.presentSuccessAlert();
    } else {
      alert('Por favor, revisa los datos ingresados.');
    }
  }

  async presentSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'La recuperación de contraseña ha sido enviada a su correo.',
      buttons: ['OK']
    });

    await alert.present();
  }
}
