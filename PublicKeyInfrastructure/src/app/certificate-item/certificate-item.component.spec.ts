import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateItemComponent } from './certificate-item.component';

describe('CertificateItemComponent', () => {
  let component: CertificateItemComponent;
  let fixture: ComponentFixture<CertificateItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificateItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificateItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
