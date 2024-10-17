import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, Usuario } from '../user.service';

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
    private router: Router
  ) {
    // Inicializamos el formulario con validadores
    this.userForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['', Validators.required],  // Selector de rol
    });
  }

  // Guardar el usuario en la base de datos local (SQLite) o la API si está conectado
  async addUser() {
    if (this.userForm.valid) {
      const userData: Usuario = {
        ...this.userForm.value,
        synced: 0  // Por defecto, marcamos el usuario como no sincronizado
      };

      try {
        // Añadir el usuario al servicio (SQLite o API según disponibilidad)
        await this.userService.addUsuario(userData); // Cambiado para usar addUsuario
        console.log('Usuario añadido con éxito.');
        this.router.navigate(['/usuarios/user-all']);  // Redirigir al usuario a la lista de usuarios
        this.resetForm();  // Limpiar el formulario después de agregar el usuario
      } catch (error) {
        console.error('Error al agregar el usuario:', error);
      }
    } else {
      console.log('Formulario inválido');
    }
  }

  // Función para limpiar el formulario después de agregar un usuario
  resetForm() {
    this.userForm.reset({
      nombre: '',
      contrasena: '',
      rol: ''  // Aseguramos que el rol también se restablezca
    });
  }

  // Función para redirigir a la lista de usuarios
  goToUserAll() {
    this.router.navigate(['/usuarios/user-all']);
  }
}
