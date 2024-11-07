import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarritoListPage } from './carrito-list.page';

describe('CarritoListPage', () => {
  let component: CarritoListPage;
  let fixture: ComponentFixture<CarritoListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CarritoListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
