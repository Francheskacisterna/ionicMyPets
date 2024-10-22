import { TestBed } from '@angular/core/testing';

import { ProductService } from './product-service.service';  // Cambia a ProductService

describe('ProductService', () => {  // Cambia el nombre aquí también
  let service: ProductService;  // Usa ProductService

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductService);  // Inyecta ProductService
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
