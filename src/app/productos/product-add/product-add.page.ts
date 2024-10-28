import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService, Product, WeightOption } from '../product-service.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-product-add',
  templateUrl: './product-add.page.html',
  styleUrls: ['./product-add.page.scss'],
})
export class ProductAddPage {
  productForm: FormGroup;
  productImage: string | null | undefined = null;

  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private router: Router
  ) {
    this.productForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      categoria: ['', Validators.required],  // Nuevo campo de categoría
      weightOptions: this.formBuilder.array([]),  // Opciones de peso
    });

    this.addWeightOption();  // Inicialmente agregamos una opción de peso
  }

  // Método para obtener el FormArray de las opciones de peso
  get weightOptions(): FormArray {
    return this.productForm.get('weightOptions') as FormArray;
  }

  // Método para obtener el FormGroup en una posición específica del FormArray
  getWeightFormGroup(i: number): FormGroup {
    return this.weightOptions.at(i) as FormGroup;
  }


  addWeightOption() {
    const weightOptionGroup = this.formBuilder.group({
      size: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]]  // Campo adicional para el stock
    });
    this.weightOptions.push(weightOptionGroup);
  }

  removeWeightOption(index: number) {
    this.weightOptions.removeAt(index);
  }

  // Función para capturar imagen desde la cámara o la galería
  async selectImage() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,  // Retornamos la imagen como base64
        source: CameraSource.Prompt  // Permite elegir entre cámara o galería
      });

      this.productImage = image.dataUrl;  // Guardamos la imagen en base64
    } catch (error) {
      console.error('Error al capturar imagen:', error);
    }
  }

  // Función para eliminar la imagen seleccionada
  deleteImage() {
    this.productImage = null;  // Eliminamos la imagen seleccionada
  }

  // Función para generar un ID único en formato string
  generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Guardar el producto y luego las opciones de peso en una tabla separada
  async addProduct() {
    if (this.productForm.valid) {
      const { weightOptions, ...product } = this.productForm.value; // Excluimos weightOptions
  
      const productData: Product = {
        id: this.generateId(),  // Generamos un id como string
        ...product,
        imagen: this.productImage || null,  // Aseguramos que la imagen sea null si no está presente
        categoria: this.productForm.value.categoria
      };
  
      try {
        // Verifica si la API está disponible
        const isAPiAvailable = await this.productService.isApiAvailable();
  
        // Asigna el `producto_id` a cada opción de peso
        const weightOptionsWithProductId = weightOptions.map((option: WeightOption) => ({
          ...option,
          id: this.generateId(),  // Generamos id para cada opción de peso
          producto_id: productData.id  // Asignamos el producto_id como string
        }));
  
        if (isAPiAvailable) {
          // Guarda en la API directamente
          await this.productService.addProductWithWeightsAPI(productData, weightOptionsWithProductId);
          console.log('Producto y opciones de peso añadidas con éxito en la API.');
        } else {
          // Si la API no está disponible, guarda en SQLite
          await this.productService.addProductWithWeightsSQLite(productData, weightOptionsWithProductId);
          console.log('Producto y opciones de peso añadidas en SQLite para sincronizar más tarde.');
        }
  
        // Redirecciona después de guardar el producto
        this.router.navigate(['/productos/product-list']);
        this.resetForm();  // Limpiar el formulario después de agregar el producto
  
      } catch (error) {
        console.error('Error al agregar el producto y las opciones de peso:', error);
      }
    } else {
      console.log('Formulario inválido');
    }
  }
  

  // Función para limpiar el formulario y restablecer las variables
  resetForm() {
    this.productForm.reset({
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      categoria: ''  // Aseguramos que el campo categoría también se restablezca
    });
    this.productImage = null;
    this.weightOptions.clear();
    this.addWeightOption();  // Aseguramos que haya al menos una opción de peso
  }

  // Función para redirigir a la lista de productos
  goToProductAll() {
    this.router.navigate(['/productos/product-all']);
  }
}
