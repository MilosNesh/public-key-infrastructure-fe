import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllCertificatesComponent } from './all-certificates.component';

describe('AllCertificatesComponent', () => {
  let component: AllCertificatesComponent;
  let fixture: ComponentFixture<AllCertificatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllCertificatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllCertificatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
