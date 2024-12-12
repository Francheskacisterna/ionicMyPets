import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@capacitor/geolocation';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  nombreUsuario: string = '';
  veterinarias: any[] = [];
  veterinariaCercana: any = null;
  showVeterinarias: boolean = false; // Controlar si mostrar/ocultar lista de veterinarias
  hasSearched: boolean = false; // Controlar si se realizó la búsqueda
  weather: any = null; // Información del clima

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['nombreUsuario']) {
      this.nombreUsuario = navigation.extras.state['nombreUsuario'];
    } else {
      this.nombreUsuario = localStorage.getItem('userName') || 'Usuario';
    }
    // Obtener el clima automáticamente al cargar la página
    this.getCurrentPositionAndSearchWeather();
  }

  async getCurrentPositionAndSearchVeterinarias() {
    try {
      console.log('Obteniendo ubicación actual...');
      const position = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      console.log(`Ubicación actual: ${latitude}, ${longitude}`);
      this.searchNearbyVeterinarias(latitude, longitude);
      this.getWeather(latitude, longitude); // Obtiene el clima
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      alert('No se pudo obtener la ubicación. Por favor, verifica los permisos.');
    }
  }

  searchNearbyVeterinarias(lat: number, lon: number) {
    const url = `${environment.apiVeterinarias}/google-places?location=${lat},${lon}&radius=5000&type=veterinary_care`;

    this.http.get(url).subscribe(
      (response: any) => {
        console.log('Resultados de veterinarias cercanas:', response);

        if (response.results && response.results.length > 0) {
          // Mapear resultados, calcular distancia y ordenar por cercanía
          this.veterinarias = response.results
            .map((result: any) => ({
              name: result.name,
              address: result.vicinity,
              distance: this.calculateDistance(lat, lon, result.geometry.location.lat, result.geometry.location.lng),
              isOpen: result.opening_hours?.open_now ?? null, // Estado de apertura
            }))
            .sort((a: { distance: number }, b: { distance: number }) => a.distance - b.distance) // Ordenar por distancia
            .slice(0, 5); // Tomar solo las 5 más cercanas
        } else {
          this.veterinarias = [];
        }

        this.hasSearched = true; // Indicar que se realizó la búsqueda
      },
      (error) => {
        console.error('Error al buscar veterinarias:', error);
        this.hasSearched = true; // Indicar que se intentó buscar
      }
    );
  }


  toggleVeterinarias() {
    this.showVeterinarias = !this.showVeterinarias;
  }

  async getCurrentPositionAndSearchWeather() {
    try {
      const position = await Geolocation.getCurrentPosition();
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      console.log(`Latitud: ${lat}, Longitud: ${lon}`);
      this.getWeather(lat, lon); // Llama a getWeather con coordenadas reales
    } catch (error) {
      console.error('Error al obtener la ubicación:', error);
      alert('No se pudo obtener la ubicación. Por favor, verifica los permisos.');
    }
  }

  getWeather(lat: number, lon: number) {
    const apiKey = '8f774ee842103dd41cfe4fa944952271'; // Clave API de OpenWeather
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${apiKey}`;

    this.http.get(url).subscribe(
      (response: any) => {
        this.weather = {
          city: response.name,
          temperature: response.main.temp,
          description: response.weather[0].description,
          icon: this.mapWeatherIcon(response.weather[0].icon),
        };

        console.log('Clima obtenido:', this.weather);
      },
      (error) => {
        console.error('Error al obtener el clima:', error);
        alert('Hubo un problema al obtener el clima. Por favor, intenta nuevamente.');
        this.weather = null;
      }
    );
  }

  mapWeatherIcon(icon: string): string {
    const iconMap: { [key: string]: string } = {
      '01d': 'sunny-outline',
      '01n': 'moon-outline',
      '02d': 'partly-sunny-outline',
      '02n': 'cloudy-night-outline',
      '03d': 'cloud-outline',
      '03n': 'cloud-outline',
      '04d': 'cloudy-outline',
      '04n': 'cloudy-outline',
      '09d': 'rainy-outline',
      '09n': 'rainy-outline',
      '10d': 'rainy-outline',
      '10n': 'rainy-outline',
      '11d': 'thunderstorm-outline',
      '11n': 'thunderstorm-outline',
      '13d': 'snow-outline',
      '13n': 'snow-outline',
      '50d': 'fog-outline',
      '50n': 'fog-outline',
    };
    return iconMap[icon] || 'help-outline';
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.degToRad(lat2 - lat1);
    const dLon = this.degToRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degToRad(lat1)) * Math.cos(this.degToRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  degToRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
