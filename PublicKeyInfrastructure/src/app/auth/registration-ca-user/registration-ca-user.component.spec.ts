import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationCaUserComponent } from './registration-ca-user.component';

describe('RegistrationCaUserComponent', () => {
  let component: RegistrationCaUserComponent;
  let fixture: ComponentFixture<RegistrationCaUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationCaUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrationCaUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
