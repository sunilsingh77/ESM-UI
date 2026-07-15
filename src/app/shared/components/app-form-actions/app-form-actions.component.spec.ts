import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppFormActionsComponent } from './app-form-actions.component';

describe('AppFormActionsComponent', () => {
  let component: AppFormActionsComponent;
  let fixture: ComponentFixture<AppFormActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppFormActionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppFormActionsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
