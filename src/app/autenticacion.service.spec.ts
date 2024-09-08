import { Component } from '@angular/core';
import { AutenticacionService } from './autenticacion.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private autenticacionService: AutenticacionService) {}

  ngOnInit() {
    const isAuthenticated = this.autenticacionService.isAuthenticated();
    console.log('Usuario autenticado:', isAuthenticated);
  }
}
