import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { RouteReuseStrategy } from '@angular/router';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Importa Angular Material Toolbar
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Importa Ionic Storage Module
import { IonicStorageModule } from '@ionic/storage-angular';  // Asegura la importación del módulo de Storage

// Importa HttpClientModule (este es el módulo faltante)
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    MatToolbarModule,  // Importa el módulo de Material Toolbar
    MatIconModule,  // Para los íconos de Material
    MatButtonModule, // Para los botones de Material
    IonicStorageModule.forRoot(),  // Inicializamos el Storage Module aquí
    HttpClientModule  // Asegúrate de que esté importado aquí
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent]
})
export class AppModule {}
