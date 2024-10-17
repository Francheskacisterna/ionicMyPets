import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product, WeightOption } from '../product-service.service';
import { AlertController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';  // Para manejar la imagen en el almacenamiento
import { Network } from '@capacitor/network';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.page.html',
  styleUrls: ['./product-edit.page.scss'],
})
export class ProductEditPage implements OnInit {
  product: Product | undefined = undefined;  // Producto actual para editar
  originalProduct: Product | undefined = undefined;  // Copia del producto original para restaurar si se cancela
  weightOptions: WeightOption[] = [];  // Opciones de peso del producto
  productImagePath: string | undefined = '';  // Para almacenar el path de la imagen en el sistema de archivos

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router,
    private alertController: AlertController  // Para mostrar alertas al guardar
  ) { }

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(parseInt(productId));
    }
  }

// Cargar producto desde SQLite o la API
async loadProduct(id: number) {
  const status = await Network.getStatus();
  if (status.connected) {
    // Si hay conexión, cargar el producto desde la API
    try {
      this.product = await firstValueFrom(this.productService.getProductByIdAPI(id));
      if (this.product) {
        this.originalProduct = JSON.parse(JSON.stringify(this.product));  // Guardar copia del producto original

        // Cargar las opciones de peso desde la API
        const options = await firstValueFrom(this.productService.getWeightOptionsByProductIdAPI(id));
        console.log('Opciones de peso cargadas desde API:', options);
        this.weightOptions = options || [];  // Asegúrate de que no esté vacío o indefinido
        this.product.weightOptions = this.weightOptions;
        this.productImagePath = this.product.imagen;  // Asignar la imagen si ya está almacenada
      } else {
        console.error('No se encontró el producto en la API');
      }
    } catch (error) {
      console.error('Error al cargar el producto desde la API:', error);
    }
  } else {
    // Si no hay conexión, cargar el producto desde SQLite
    const products = await this.productService.getProductsSQLite();
    this.product = products.find(p => p.id === id);
    if (this.product) {
      this.originalProduct = JSON.parse(JSON.stringify(this.product));
    } else {
      console.error('Producto no encontrado en SQLite');
    }
  }
}



  // Cambiar la imagen del producto utilizando la cámara o galería y guardarla en el sistema de archivos local
  async changeImage() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,  // Permitir elegir desde la galería
    });

    if (this.product && image.webPath) {
      // Guardar la imagen en el sistema de archivos del dispositivo
      const fileName = `product-image-${this.product.id}.jpeg`;  // Definir un nombre único para la imagen
      const savedImage = await this.saveImageToFilesystem(image.webPath, fileName);

      if (savedImage) {
        // Asignar la ruta de la imagen guardada al producto
        this.product.imagen = savedImage;
        this.productImagePath = savedImage;  // Actualizar la ruta de la imagen
      }
    }
  }

  // Función para guardar la imagen en el sistema de archivos
  async saveImageToFilesystem(webPath: string, fileName: string): Promise<string | null> {
    try {
      // Obtener la imagen como un blob (binary large object)
      const response = await fetch(webPath);
      const blob = await response.blob();

      // Leer el blob como base64
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(',')[1];  // Obtener solo los datos base64
          try {
            // Guardar la imagen en el sistema de archivos
            await Filesystem.writeFile({
              path: fileName,
              data: base64Data,
              directory: Directory.Data,
            });
            const fileUri = await Filesystem.getUri({
              path: fileName,
              directory: Directory.Data,
            });
            resolve(fileUri.uri);  // Retornar la URI donde se guardó la imagen
          } catch (error) {
            console.error('Error al guardar la imagen:', error);
            reject(null);
          }
        };
        reader.onerror = () => {
          console.error('Error al leer el archivo de imagen');
          reject(null);
        };
        reader.readAsDataURL(blob);  // Convertir el blob a base64 para almacenamiento
      });
    } catch (error) {
      console.error('Error al guardar la imagen en el sistema de archivos:', error);
      return null;
    }
  }

  // Guardar cambios en el producto
  async saveProduct() {
    if (this.product) {
      try {
        // Verifica que el producto tenga un ID válido
        if (!this.product.id) {
          console.error('Error: El producto no tiene un ID válido');
          return;
        }
  
        // Asignar las opciones de peso actualizadas al producto
        this.product.weightOptions = this.weightOptions;
  
        // Verificar la conexión a la red
        const status = await Network.getStatus();
        if (status.connected) {
          // Actualizar en la API
          await this.productService.updateProductAPI(this.product).toPromise();
  
          // Actualizar las opciones de peso en la API
          for (const option of this.weightOptions) {
            if (option.id) {
              await this.productService.updateWeightOptionAPI(option).toPromise();
            } else {
              // Si no tiene ID, añadirla a la API
              await this.productService.addWeightOptionAPI(option).toPromise();
            }
          }
  
          // Actualizar también en SQLite
          await this.productService.updateProductSQLite(this.product);
        } else {
          // Solo actualizar en SQLite si no hay conexión
          await this.productService.updateProductSQLite(this.product);
  
          // Actualizar también las opciones de peso en SQLite
          for (const option of this.weightOptions) {
            if (option.id) {
              await this.productService.updateWeightOptionSQLite(option);
            } else {
              // Si no tiene ID, añadirla en SQLite
              await this.productService.addWeightOptionSQLite(option);
            }
          }
        }
  
        // Mostrar un mensaje de éxito
        const alert = await this.alertController.create({
          header: 'Éxito',
          message: 'Producto actualizado correctamente.',
          buttons: ['OK'],
        });
        await alert.present();
  
        // Navegar de vuelta a la lista de productos
        this.router.navigate(['/productos']);
      } catch (error) {
        console.error('Error al actualizar producto:', error);
  
        // Mostrar un mensaje de error
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Ocurrió un error al actualizar el producto.',
          buttons: ['OK'],
        });
        await alert.present();
      }
    }
  }
  

  // Restablecer los cambios realizados restaurando el producto original
  resetChanges() {
    if (this.originalProduct) {
      this.product = JSON.parse(JSON.stringify(this.originalProduct));  // Restaurar el producto original
      this.weightOptions = this.originalProduct.weightOptions || [];  // Restaurar las opciones de peso originales

      // Verificar que 'this.product' no sea undefined antes de asignar la imagen
      if (this.product) {
        this.productImagePath = this.product.imagen;  // Restaurar la imagen original
      }
    }
  }

  // Función para volver a la lista de productos
  backToList() {
    this.router.navigate(['/productos/product-list']);
  }

  // Seleccionar categoría
  async selectCategory() {
    const alert = await this.alertController.create({
      header: 'Selecciona Categoría',
      inputs: [
        {
          name: 'Perro',
          type: 'radio',
          label: 'Perro',
          value: 'Perro',
          checked: this.product?.categoria === 'Perro',
        },
        {
          name: 'Gato',
          type: 'radio',
          label: 'Gato',
          value: 'Gato',
          checked: this.product?.categoria === 'Gato',
        },
        {
          name: 'Aves',
          type: 'radio',
          label: 'Aves',
          value: 'Aves',
          checked: this.product?.categoria === 'Aves',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'OK',
          handler: (data: string) => {
            if (this.product) {
              this.product.categoria = data;
            }
          },
        },
      ],
    });

    await alert.present();
  }

  // Eliminar la imagen del producto
  async deleteImage() {
    if (this.product) {
      this.product.imagen = '';  // Eliminar la imagen asignada
      this.productImagePath = '';  // Restablecer la ruta de la imagen
    }
  }
}
