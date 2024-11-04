import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-error-test',
  templateUrl: './error-test.page.html',
  styleUrls: ['./error-test.page.scss'],
})
export class ErrorTestPage {

  constructor(private http: HttpClient) {}

  trigger405Error() {
    // Cambia la URL a una que solo permita GET, pero usamos POST para provocar el error
    this.http.post('https://jsonplaceholder.typicode.com/posts/1', {}).subscribe({
      next: (response) => {
        console.log('Respuesta:', response);
      },
      error: (error) => {
        console.error('Error capturado en el componente:', error);
      },
    });
  }
}
