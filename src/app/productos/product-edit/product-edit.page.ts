import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService, Product, WeightOption } from '../product-service.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AlertController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.page.html',
  styleUrls: ['./product-edit.page.scss'],
})
export class ProductEditPage implements OnInit {
  productForm: FormGroup;
  productImage: string | null | undefined = null;
  product: Product | undefined;
  categories = ['perro', 'gato', 'aves']; // Definir las categorías disponibles en minúsculas

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private productService: ProductService,
    private alertController: AlertController
  ) {
    this.productForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(1)]],
      stock: ['', [Validators.required, Validators.min(1)]],
      categoria: ['', Validators.required],
      imagen: [null],
      weightOptions: this.formBuilder.array([]), // FormArray para opciones de peso
    });

    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['product']) {
      this.product = navigation.extras.state['product'];
    }
  }

  ngOnInit() {
    if (this.product) {
      this.productForm.patchValue({
        nombre: this.product.nombre,
        descripcion: this.product.descripcion,
        precio: this.product.precio,
        stock: this.product.stock,
        categoria: this.product.categoria.toLowerCase(),  // Asegurarse de que esté en minúsculas
        imagen: this.product.imagen,
      });
  
      if (this.product.imagen) {
        this.productImage = this.product.imagen;
      }
  
      this.loadWeightOptions();  // Cargar opciones de peso
    } else {
      console.error('No se encontraron datos del producto en el estado de navegación');
    }
  }
  
  // Función para comparar la categoría seleccionada con las opciones
  compareWith(o1: any, o2: any): boolean {
    return o1 === o2;
  }
  
  // Cargar opciones de peso desde la API o SQLite
  async loadWeightOptions() {
    if (this.product?.id) {
      try {
        let weightOptions: WeightOption[] = [];
  
        // Primero, intenta obtener opciones de peso desde SQLite
        weightOptions = await this.productService.getWeightOptionsByProductIdSQLite(this.product.id);
        console.log('Opciones de peso obtenidas de SQLite:', weightOptions);
  
        // Si no hay opciones en SQLite y hay conexión, intenta cargar desde la API
        if (weightOptions.length === 0 && navigator.onLine) {
          console.log('No se encontraron opciones de peso en SQLite, cargando desde la API...');
          weightOptions = await firstValueFrom(this.productService.getWeightOptionsByProductIdAPI(this.product.id));
          console.log('Opciones de peso obtenidas de la API:', weightOptions);
  
          // Opcional: guardar en SQLite las opciones obtenidas de la API para disponibilidad offline
          if (weightOptions.length > 0) {
            for (const option of weightOptions) {
              option.producto_id = this.product.id;
              await this.productService.addWeightOptionSQLite(option);
            }
            console.log('Opciones de peso sincronizadas en SQLite para uso offline.');
          }
        }
  
        // Asignar las opciones de peso al formulario si se encontraron
        if (weightOptions.length > 0) {
          this.setWeightOptions(weightOptions);
        } else {
          console.warn('No se encontraron opciones de peso ni en SQLite ni en la API.');
        }
      } catch (error) {
        console.error('Error al cargar las opciones de peso:', error);
      }
    }
  }
  

  
  
  setWeightOptions(weightOptions: WeightOption[]) {
    const weightOptionsFormArray = this.productForm.get('weightOptions') as FormArray;
    weightOptionsFormArray.clear();
  
    weightOptions.forEach(option => {
      const weightGroup = this.formBuilder.group({
        id: [option.id],  // Agregamos el campo ID para distinguir entre opciones nuevas y existentes
        size: [option.size, Validators.required],
        price: [option.price, [Validators.required, Validators.min(0)]],
        stock: [option.stock, [Validators.required, Validators.min(0)]],
      });
      weightOptionsFormArray.push(weightGroup);
    });
  }

  addWeightOption() {
    const weightOptionsFormArray = this.productForm.get('weightOptions') as FormArray;
    const newWeightGroup = this.formBuilder.group({
      size: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
    });
    weightOptionsFormArray.push(newWeightGroup);
  }

  removeWeightOption(index: number) {
    const weightOptionsFormArray = this.productForm.get('weightOptions') as FormArray;
    const optionToRemove = weightOptionsFormArray.at(index).value;
  
    // Si la opción de peso tiene un ID, la eliminamos también de la base de datos (API y SQLite)
    if (optionToRemove.id) {
      this.deleteWeightOption(optionToRemove.id);
    }
  
    // Eliminamos la opción de peso del FormArray (de la UI)
    weightOptionsFormArray.removeAt(index);
  }

  async selectImage() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
      });

      this.productImage = image.dataUrl;
      this.productForm.patchValue({ imagen: this.productImage });
    } catch (error) {
      console.error('Error al capturar imagen:', error);
    }
  }

  deleteImage() {
    this.productImage = null;
    this.productForm.patchValue({ imagen: null });
  }

  async saveChanges() {
    if (this.productForm.valid) {
      const updatedProduct: Product = {
        id: this.product?.id,
        nombre: this.productForm.value.nombre,
        descripcion: this.productForm.value.descripcion,
        precio: this.productForm.value.precio,
        stock: this.productForm.value.stock,
        categoria: this.productForm.value.categoria,
        imagen: this.productImage || this.product?.imagen,
      };
  
      // Mapeamos las opciones de peso del formulario
      const weightOptions = this.productForm.value.weightOptions.map((option: any) => ({
        ...option,
        producto_id: updatedProduct.id,  // Aseguramos que el producto_id esté presente
      }));
  
      try {
        // Actualizamos el producto en SQLite
        await this.productService.updateProductSQLite(updatedProduct);
  
        // Sincronizar producto con la API usando firstValueFrom
        const apiProduct = await firstValueFrom(this.productService.updateProductAPI(updatedProduct));
  
        if (apiProduct && apiProduct.id) {
          for (const option of weightOptions) {
            if (option.id) {
              // Si existe un ID, significa que la opción de peso ya existe y debe actualizarse
              await firstValueFrom(this.productService.updateWeightOptionAPI(option));
              console.log(`Opción de peso con ID ${option.id} actualizada en la API`);
            } else {
              // Si no hay ID, es una opción nueva y se debe agregar
              const weightOptionResponse = await firstValueFrom(this.productService.addWeightOptionAPI(option));
              if (weightOptionResponse && weightOptionResponse.id) {
                console.log(`Opción de peso añadida con éxito, ID API: ${weightOptionResponse.id}`);
              }
            }
          }
  
          const alert = await this.alertController.create({
            header: 'Éxito',
            message: 'Producto actualizado correctamente.',
            buttons: ['OK'],
          });
          await alert.present();
  
          this.router.navigate(['/productos/product-list']);  // Redirige a la lista de productos
        } else {
          console.error('Error al sincronizar el producto en la API.');
        }
      } catch (error) {
        console.error('Error al actualizar el producto y las opciones de peso:', error);
      }
    } else {
      console.log('Formulario inválido');
    }
  }

  // Función para eliminar la opción de peso en la base de datos
  async deleteWeightOption(weightOptionId: string) {
    try {
      // Eliminar la opción de peso en SQLite
      await this.productService.deleteWeightOptionSQLite(weightOptionId);
      console.log(`Opción de peso con ID ${weightOptionId} eliminada de SQLite`);
  
      // Verificar si hay conexión para eliminar en la API
      if (navigator.onLine) {
        await firstValueFrom(this.productService.deleteWeightOptionAPI(weightOptionId));
        console.log(`Opción de peso con ID ${weightOptionId} eliminada de la API`);
      } else {
        console.log('No hay conexión a la red, no se puede eliminar de la API');
      }
    } catch (error) {
      console.error('Error al eliminar la opción de peso:', error);
    }
  }
  
  // Getter para acceder a las opciones de peso en el HTML
  get weightOptionsControls() {
    return (this.productForm.get('weightOptions') as FormArray).controls;
  }

  cancelChanges() {
    this.router.navigate(['/productos/product-list']);
  }
}
