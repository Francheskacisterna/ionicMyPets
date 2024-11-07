import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserAllPage } from './user-all.page';

describe('UserAllPage', () => {
  let component: UserAllPage;
  let fixture: ComponentFixture<UserAllPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAllPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
