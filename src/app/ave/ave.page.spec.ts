import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvePage } from './ave.page';

describe('AvePage', () => {
  let component: AvePage;
  let fixture: ComponentFixture<AvePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AvePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
