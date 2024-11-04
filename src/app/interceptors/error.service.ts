// src/app/interceptors/error.service.ts
import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Se produjo un error inesperado.';
        if (error.status === 405) {
          errorMessage = 'Oops! Acción no permitida.';
        }
        console.error('Error interceptado:', errorMessage, error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
