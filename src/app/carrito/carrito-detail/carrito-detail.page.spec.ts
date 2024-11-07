import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarritoDetailPage } from './carrito-detail.page';

describe('CarritoDetailPage', () => {
  let component: CarritoDetailPage;
  let fixture: ComponentFixture<CarritoDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CarritoDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
