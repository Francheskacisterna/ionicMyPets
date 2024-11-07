import { Component } from '@angular/core';
import { ModalController, AlertController, AnimationController, LoadingController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AutenticacionService } from '../autenticacion.service';

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
    private animationCtrl: AnimationController,
    private authService: AutenticacionService,
    private loadingController: LoadingController
  ) {
    this.resetPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ionViewWillEnter() {
    this.animateModalEntrance();
  }

  private animateModalEntrance() {
    const modalElement = document.querySelector('.modal-content');
    if (modalElement) {
      const enterAnimation = this.animationCtrl
        .create()
        .addElement(modalElement)
        .duration(400)
        .easing('ease-out')
        .fromTo('transform', 'translateY(100%)', 'translateY(0%)')
        .fromTo('opacity', 0, 1);

      enterAnimation.play();
    }
  }

  dismissModal() {
    this.modalCtrl.dismiss();
  }

  async recoverPassword() {
    const email = this.resetPasswordForm.get('email')?.value;
    if (email) {
      // Mostrar un mensaje de carga mientras se procesa la solicitud
      const loading = await this.loadingController.create({
        message: 'Enviando solicitud...',
        spinner: 'crescent'
      });
      await loading.present();

      this.authService.recoverPassword(email).subscribe(async (success) => {
        await loading.dismiss(); // Quitar el mensaje de carga

        if (success) {
          await this.presentSuccessAlert();
          this.dismissModal();
        } else {
          await this.presentErrorAlert('No se encontró ninguna cuenta con el correo ingresado.');
        }
      }, async (error) => {
        // Manejar errores adicionales
        await loading.dismiss();
        await this.presentErrorAlert('Error al enviar solicitud de recuperación. Inténtelo nuevamente.');
        console.error('Error en recoverPassword:', error);
      });
    } else {
      await this.presentErrorAlert('Por favor, ingresa un correo electrónico válido.');
    }
  }

  async presentSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'Se ha enviado un correo para restablecer la contraseña.',
      buttons: ['OK']
    });
    await alert.present();
  }

  async presentErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}