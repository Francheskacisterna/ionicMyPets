import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerroPage } from './perro.page';

describe('PerroPage', () => {
  let component: PerroPage;
  let fixture: ComponentFixture<PerroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PerroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
