import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorTestPage } from './error-test.page';

describe('ErrorTestPage', () => {
  let component: ErrorTestPage;
  let fixture: ComponentFixture<ErrorTestPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorTestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
