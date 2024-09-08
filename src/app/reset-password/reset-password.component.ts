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

