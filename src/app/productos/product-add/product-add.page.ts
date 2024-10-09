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
      weightOptions: this.formBuilder.array([]),  // Aquí se almacenan las opciones de peso
    });

    this.addWeightOption();  // Inicialmente agregamos una opción de peso
  }

  get weightOptions(): FormArray {
    return this.productForm.get('weightOptions') as FormArray;
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

  // Guardar el producto y luego las opciones de peso en una tabla separada
  async addProduct() {
    if (this.productForm.valid) {
      const { weightOptions, ...product } = this.productForm.value; // Excluimos weightOptions

      const productData: Product = {
        ...product,
        imagen: this.productImage || null // Aseguramos que la imagen sea null si no está presente
      };

      try {
        // Primero añadimos el producto y obtenemos su ID
        await this.productService.addProduct(productData, weightOptions);

        console.log('Producto y opciones de peso añadidas con éxito.');
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
    });
    this.productImage = null;
    this.weightOptions.clear();
    this.addWeightOption();  // Aseguramos que haya al menos una opción de peso
  }
}
